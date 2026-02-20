import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        const { resumeText, resumeImage, jobDescription, jdUrl, jdImage } = await JSON.parse(await req.text());

        if (!resumeText && !resumeImage) {
            return NextResponse.json({ error: 'Resume (text or image) is required' }, { status: 400 });
        }

        let finalJobDescription = jobDescription || '';

        // Handle URL with improved logic and safety
        if (jdUrl && !finalJobDescription) {
            try {
                // Check for LinkedIn-style URLs which are usually blocked
                if (jdUrl.includes('linkedin.com') || jdUrl.includes('indeed.com')) {
                    throw new Error('LinkedIn and some job boards block automatic scanning. Please copy and paste the job description text instead.');
                }

                const response = await fetch(jdUrl, { signal: AbortSignal.timeout(5000) });
                const html = await response.text();

                // Better HTML to text conversion
                finalJobDescription = html
                    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '')
                    .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, '')
                    .replace(/<[^>]*>?/gm, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();

            } catch (err: any) {
                console.error('Error fetching JD from URL:', err);
                throw new Error(err.message || 'Failed to scan URL. Please copy/paste the JD text.');
            }
        }

        // Global Input Protection: Prevent token drowning in any mode (Text, URL, or Image)
        // 1. Cap Resume text (10k chars is plenty for any resume)
        let processedResumeText = resumeText || '';
        if (processedResumeText.length > 10000) {
            processedResumeText = processedResumeText.substring(0, 10000) + '... [Resume truncated for token efficiency]';
        }

        // 2. Cap JD text (5k chars is plenty for a job post)
        if (finalJobDescription.length > 5000) {
            finalJobDescription = finalJobDescription.substring(0, 5000) + '... [JD truncated for token efficiency]';
        }

        // Initialize Gemini with deterministic settings and Native JSON Mode
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.1,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 2048,
                responseMimeType: 'application/json',
            }
        });

        const prompt = `
Act as a CRITICAL HR Auditor. Resume vs JD match.
STRICT: Only explicit evidence counts.

Schema:
{
  "score": 0-100,
  "matchLevel": "Poor"|"Fair"|"Good"|"Excellent",
  "summary": "1 sentence",
  "pros": ["bullet"],
  "cons": ["bullet"],
  "missingSkills": ["skill"],
  "improvementSuggestions": ["action"],
  "keywordMatch": { "found": [], "missing": [] }
}

RESUME:
${processedResumeText || '[See image]'}

JD:
${finalJobDescription || '[See image]'}
`;

        const contents: any[] = [prompt];

        if (resumeImage) {
            const imageData = resumeImage.split(',')[1] || resumeImage;
            contents.push({
                inlineData: { data: imageData, mimeType: 'image/jpeg' },
            });
        }

        if (jdImage) {
            const imageData = jdImage.split(',')[1] || jdImage;
            contents.push({
                inlineData: { data: imageData, mimeType: 'image/jpeg' },
            });
        }

        const modelResponse = await model.generateContent(contents);
        const responseText = modelResponse.response.text();

        let analysis;
        try {
            // Native JSON mode should return pure JSON, but we clean it just in case
            const cleanedText = responseText.trim().replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
            analysis = JSON.parse(cleanedText);
        } catch (e) {
            console.error('JSON Parse Fail:', e, 'Raw:', responseText);

            // Fallback: Boundaried Extraction (Find the first { and the last })
            const startIdx = responseText.indexOf('{');
            const endIdx = responseText.lastIndexOf('}');

            if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
                try {
                    const extractedJson = responseText.substring(startIdx, endIdx + 1);
                    analysis = JSON.parse(extractedJson);
                } catch (innerE) {
                    throw new Error(`AI returned malformed JSON structure: ${responseText.slice(0, 100)}...`);
                }
            } else if (startIdx !== -1 && endIdx === -1) {
                // Truncation detected - the opening brace exists but no closing brace
                throw new Error("AI analysis was truncated (response too long). Please try with a shorter JD.");
            } else {
                throw new Error(`AI failed to return a JSON object. RAW: ${responseText.slice(0, 100)}...`);
            }
        }

        // Validate structure before returning
        const validatedAnalysis = {
            score: typeof analysis.score === 'number' ? analysis.score : 0,
            matchLevel: typeof analysis.matchLevel === 'string' ? analysis.matchLevel : 'Fair',
            summary: typeof analysis.summary === 'string' ? analysis.summary : 'Summary unavailable',
            pros: Array.isArray(analysis.pros) ? analysis.pros : [],
            cons: Array.isArray(analysis.cons) ? analysis.cons : [],
            missingSkills: Array.isArray(analysis.missingSkills) ? analysis.missingSkills : [],
            improvementSuggestions: Array.isArray(analysis.improvementSuggestions) ? analysis.improvementSuggestions : [],
            keywordMatch: {
                found: (analysis.keywordMatch && Array.isArray(analysis.keywordMatch.found)) ? analysis.keywordMatch.found : [],
                missing: (analysis.keywordMatch && Array.isArray(analysis.keywordMatch.missing)) ? analysis.keywordMatch.missing : []
            }
        };

        return NextResponse.json(validatedAnalysis);

    } catch (error: any) {
        console.error('AI Analysis Error:', error);
        const errorMsg = error.message || 'Failed to analyze resume';
        const isQuota = errorMsg.includes('429') || errorMsg.toLowerCase().includes('quota');

        return NextResponse.json(
            {
                error: isQuota ? 'AI Quota exceeded.' : (errorMsg || 'Failed to analyze resume'),
                code: isQuota ? 'QUOTA_EXCEEDED' : 'ANALYSIS_ERROR',
                details: error.stack
            },
            { status: isQuota ? 429 : 500 }
        );
    }
}
