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

        // Initialize Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        let prompt = `
Act as an expert HR Reviewer and Applicant Tracking System (ATS).
Analyze the provided RESUME against the JOB DESCRIPTION.

RESUME CONTENT:
${resumeText || '[See attached image]'}

JOB DESCRIPTION CONTENT:
${finalJobDescription || '[See attached image]'}
${jdUrl ? `(Extracted from URL: ${jdUrl})` : ''}

Provide your analysis in EXACTLY the following JSON format:
{
  "score": number (0-100),
  "matchLevel": "Poor" | "Fair" | "Good" | "Excellent",
  "summary": "Short 2-3 sentence overview of the match",
  "pros": ["List of 3-5 strengths relative to the JD"],
  "cons": ["List of 2-4 gaps or weaknesses"],
  "missingSkills": ["List of key missing skills mentioned in JD"],
  "improvementSuggestions": ["List of actionable steps to improve the resume for this role"],
  "keywordMatch": {
    "found": ["List of matched keywords"],
    "missing": ["List of important missing keywords"]
  }
}
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

        // Robust JSON extraction using Regex to handle "thinking" text or markdown prefixes
        let analysis;
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            try {
                analysis = JSON.parse(jsonMatch[0]);
            } catch (e) {
                console.error('JSON Parse Error:', e, 'Raw:', responseText);
                throw new Error('AI returned invalid JSON');
            }
        } else {
            throw new Error('AI failed to return valid JSON format');
        }

        // Validate structure before returning to prevent frontend crashes
        const validatedAnalysis = {
            score: typeof analysis.score === 'number' ? analysis.score : 0,
            matchLevel: analysis.matchLevel || 'Unknown',
            summary: analysis.summary || 'Summary unavailable',
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

        // Detailed error reporting back to UI
        const errorMsg = error.message || '';
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
