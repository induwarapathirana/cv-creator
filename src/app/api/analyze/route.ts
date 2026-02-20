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

        let prompt = `
Act as a HIGHLY CRITICAL Senior HR Auditor and ATS specialist. Your goal is to provide a rigorous, objective match analysis. 
Do not be generous; if evidence for a skill is not explicitly stated in the RESUME, assume it is missing.

SCORING RUBRIC (Strictly Weighted):
1. **Core Hard Skills (40%)**: Direct match of technical skills, tools, and certifications required in the JD.
2. **Relevant Experience (30%)**: Years of experience in the specific role, industry relevance, and seniority level match.
3. **Soft Skills & Context (20%)**: Behavioral traits and auxiliary requirements mentioned in the JD.
4. **ATS Standards (10%)**: Professionalism of the resume structure, keyword optimization, and clarity.

RESUME CONTENT:
${resumeText || '[See attached image]'}

JOB DESCRIPTION CONTENT:
${finalJobDescription || '[See attached image]'}
${jdUrl ? `(Extracted from URL: ${jdUrl})` : ''}

You must respond with valid JSON that follows this schema exactly:
{
  "score": number,
  "matchLevel": "Poor" | "Fair" | "Good" | "Excellent",
  "summary": "string (1-2 sentences)",
  "pros": ["string"],
  "cons": ["string"],
  "missingSkills": ["string"],
  "improvementSuggestions": ["string"],
  "keywordMatch": {
    "found": ["string"],
    "missing": ["string"]
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

        // In Native JSON mode, response should be pure JSON, but we'll still handle potential edge cases
        let analysis;
        try {
            // Remove potential whitespace or stray characters
            const cleanedText = responseText.trim();
            analysis = JSON.parse(cleanedText);
        } catch (e) {
            console.error('Initial JSON Parse Fail, trying regex fallback:', e);
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    analysis = JSON.parse(jsonMatch[0]);
                } catch (innerE) {
                    console.error('Regex JSON Parse Error:', innerE, 'Raw:', responseText);
                    throw new Error('AI returned malformed JSON even in JSON mode');
                }
            } else {
                throw new Error('AI failed to return valid JSON format');
            }
        }

        // Validate structure before returning
        const validatedAnalysis = {
            score: typeof analysis.score === 'number' ? analysis.score : 0,
            matchLevel: analysis.matchLevel || 'Fair',
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
