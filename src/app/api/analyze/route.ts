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

        // Handle URL
        if (jdUrl && !finalJobDescription) {
            try {
                const response = await fetch(jdUrl);
                const html = await response.text();
                finalJobDescription = html.replace(/<[^>]*>?/gm, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
            } catch (err) {
                console.error('Error fetching JD from URL:', err);
            }
        }

        // Initialize Gemini with deterministic settings and Native JSON Mode
        // Using gemini-2.5-flash as requested
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.1,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 4096, // Increased to prevent truncation
                responseMimeType: 'application/json',
            }
        });

        const prompt = `
Act as a HIGHLY CRITICAL Senior HR Auditor. Auditing RESUME against JOB DESCRIPTION.
STRICTNESS: If evidence for a skill/experience is not EXPLICIT, mark as missing.

RUBRIC:
- Hard Skills (40%): Direct technical/tool match.
- Experience (30%): Years & relevancy.
- Soft Skills (20%): Leadership, comms, etc.
- Format (10%): ATS readability & structure.

Response Schema:
{
  "score": number,
  "matchLevel": "Poor" | "Fair" | "Good" | "Excellent",
  "summary": "string (concise)",
  "pros": ["string"],
  "cons": ["string"],
  "missingSkills": ["string"],
  "improvementSuggestions": ["string"],
  "keywordMatch": { "found": ["string"], "missing": ["string"] }
}

RESUME:
${resumeText || '[See attached image]'}

JD:
${finalJobDescription || '[See attached image]'}
${jdUrl ? `(URL: ${jdUrl})` : ''}
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
