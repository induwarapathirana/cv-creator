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
                // Simple text extraction from HTML
                finalJobDescription = html.replace(/<[^>]*>?/gm, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
            } catch (err) {
                console.error('Error fetching JD from URL:', err);
            }
        }

        // Initialize Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        let prompt = `
Act as an expert HR Reviewer and Applicant Tracking System (ATS).
Analyze the provided RESUME against the JOB DESCRIPTION.

RESUME:
${resumeText === 'IMAGE_UPLOADED' ? '[Resume provided as an image below]' : resumeText}

JOB DESCRIPTION:
${finalJobDescription || 'General career review (no specific job provided)'}
${jdImage ? '[Job Description also provided as an image below]' : ''}

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

        // Add Resume Image if present
        if (resumeImage) {
            const imageData = resumeImage.split(',')[1] || resumeImage;
            contents.push({
                inlineData: {
                    data: imageData,
                    mimeType: 'image/jpeg',
                },
            });
        }

        // Add JD Image if present
        if (jdImage) {
            const imageData = jdImage.split(',')[1] || jdImage;
            contents.push({
                inlineData: {
                    data: imageData,
                    mimeType: 'image/jpeg',
                },
            });
        }

        const result = await model.generateContent(contents);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error('Failed to parse AI response as JSON');
        }

        const analysis = JSON.parse(jsonMatch[0]);

        return NextResponse.json(analysis);
    } catch (error: any) {
        console.error('AI Analysis Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to analyze resume' }, { status: 500 });
    }
}
