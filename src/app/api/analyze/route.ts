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

        // Initialize Gemini with deterministic settings
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.1,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 2048,
            }
        });

        let prompt = `
Act as a HIGHLY CRITICAL Senior HR Auditor and ATS specialist. Your goal is to provide a rigorous, objective match analysis. Do not be generous; if evidence for a skill is not explicitly stated in the RESUME, assume it is missing.

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

Provide your analysis in EXACTLY the following JSON format:
{
  "score": number (Calculated strictly based on the rubric above),
  "matchLevel": "Poor" (0-39) | "Fair" (40-59) | "Good" (60-79) | "Excellent" (80-100),
  "summary": "1-2 sentences. Be direct about why the candidate is or isn't a fit.",
  "pros": ["List 3-5 specific strengths found based on JD requirements"],
  "cons": ["List 2-5 SPECIFIC gaps or missing evidence"],
  "missingSkills": ["List high-priority skills from JD not found in resume"],
  "improvementSuggestions": ["List actionable, high-impact steps to bridge the gaps"],
  "keywordMatch": {
    "found": ["Strict keywords matched"],
    "missing": ["Crucial JD keywords missing from resume"]
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
