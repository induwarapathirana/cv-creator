import { Resume, ATSScore, ATSSuggestion } from '@/types/resume';

export function analyzeResume(resume: Resume, jobDescription?: string): ATSScore {
    const suggestions: ATSSuggestion[] = [];
    let matchedKeywords: string[] = [];
    let missingKeywords: string[] = [];

    // Format Score (0-100)
    const formatScore = calculateFormatScore(resume, suggestions);

    // Content Score (0-100)
    const contentScore = calculateContentScore(resume, suggestions);

    // Keywords Score (0-100)
    let keywordsScore = 70; // Default without job description
    if (jobDescription) {
        const keywordResult = calculateKeywordScore(resume, jobDescription, suggestions);
        keywordsScore = keywordResult.score;
        matchedKeywords = keywordResult.matched;
        missingKeywords = keywordResult.missing;
    }

    const overall = Math.round(formatScore * 0.3 + contentScore * 0.4 + keywordsScore * 0.3);

    return {
        overall,
        format: formatScore,
        content: contentScore,
        keywords: keywordsScore,
        suggestions: suggestions.sort((a, b) => {
            const severity = { high: 0, medium: 1, low: 2 };
            return severity[a.severity] - severity[b.severity];
        }),
        matchedKeywords,
        missingKeywords,
    };
}

function calculateFormatScore(resume: Resume, suggestions: ATSSuggestion[]): number {
    let score = 100;

    // Check for essential contact info
    if (!resume.personalInfo.email) {
        score -= 15;
        suggestions.push({
            category: 'format',
            severity: 'high',
            message: 'Email address is missing',
            action: 'Add your email address in Personal Info',
        });
    }

    if (!resume.personalInfo.phone) {
        score -= 10;
        suggestions.push({
            category: 'format',
            severity: 'medium',
            message: 'Phone number is missing',
            action: 'Add your phone number in Personal Info',
        });
    }

    if (!resume.personalInfo.location) {
        score -= 5;
        suggestions.push({
            category: 'format',
            severity: 'low',
            message: 'Location is missing',
            action: 'Add your city and state/country',
        });
    }

    if (!resume.personalInfo.fullName) {
        score -= 20;
        suggestions.push({
            category: 'format',
            severity: 'high',
            message: 'Full name is missing',
            action: 'Add your full name in Personal Info',
        });
    }

    // Check for LinkedIn
    if (!resume.personalInfo.linkedin) {
        score -= 5;
        suggestions.push({
            category: 'format',
            severity: 'low',
            message: 'LinkedIn profile URL is missing',
            action: 'Adding a LinkedIn URL improves ATS parsing',
        });
    }

    // Check template is ATS-friendly
    if (resume.settings.template === 'creative') {
        score -= 10;
        suggestions.push({
            category: 'format',
            severity: 'medium',
            message: 'Creative template may not be fully ATS-compatible',
            action: 'Consider using Modern, Classic, or ATS template for better compatibility',
        });
    }

    return Math.max(0, score);
}

function calculateContentScore(resume: Resume, suggestions: ATSSuggestion[]): number {
    let score = 100;

    // Check summary
    if (!resume.personalInfo.summary || resume.personalInfo.summary.length < 50) {
        score -= 15;
        suggestions.push({
            category: 'content',
            severity: 'high',
            message: 'Professional summary is too short or missing',
            action: 'Write a 2-4 sentence summary highlighting your key qualifications',
        });
    }

    // Check experience
    if (resume.experience.length === 0) {
        score -= 25;
        suggestions.push({
            category: 'content',
            severity: 'high',
            message: 'No work experience listed',
            action: 'Add at least one work experience entry',
        });
    } else {
        // Check for bullet points / highlights
        const expWithoutHighlights = resume.experience.filter(
            (exp) => exp.highlights.length === 0 && !exp.description
        );
        if (expWithoutHighlights.length > 0) {
            score -= 10;
            suggestions.push({
                category: 'content',
                severity: 'medium',
                message: `${expWithoutHighlights.length} experience(s) lack descriptions or highlights`,
                action: 'Add bullet points with quantified achievements',
            });
        }

        // Check for action verbs
        const allText = resume.experience
            .flatMap((exp) => [...exp.highlights, exp.description])
            .join(' ')
            .toLowerCase();

        const actionVerbs = [
            'led', 'developed', 'implemented', 'managed', 'created', 'designed',
            'built', 'improved', 'increased', 'reduced', 'achieved', 'launched',
            'optimized', 'delivered', 'established', 'automated', 'streamlined',
        ];

        const hasActionVerbs = actionVerbs.some((verb) => allText.includes(verb));
        if (!hasActionVerbs && allText.length > 50) {
            score -= 10;
            suggestions.push({
                category: 'content',
                severity: 'medium',
                message: 'Experience descriptions lack strong action verbs',
                action: 'Start bullet points with action verbs like Led, Developed, Implemented',
            });
        }

        // Check for quantified results
        const hasNumbers = /\d+%|\d+\+|\$\d+|\d+x/i.test(allText);
        if (!hasNumbers && allText.length > 100) {
            score -= 10;
            suggestions.push({
                category: 'content',
                severity: 'medium',
                message: 'Consider adding quantified achievements',
                action: 'Include metrics like percentages, dollar amounts, or numerical results',
            });
        }
    }

    // Check education
    if (resume.education.length === 0) {
        score -= 10;
        suggestions.push({
            category: 'content',
            severity: 'medium',
            message: 'No education listed',
            action: 'Add your education background',
        });
    }

    // Check skills
    if (resume.skills.length === 0) {
        score -= 15;
        suggestions.push({
            category: 'content',
            severity: 'high',
            message: 'No skills listed',
            action: 'Add relevant technical and soft skills',
        });
    } else if (resume.skills.length < 5) {
        score -= 5;
        suggestions.push({
            category: 'content',
            severity: 'low',
            message: 'Consider adding more skills',
            action: 'List 6-12 relevant skills for better keyword matching',
        });
    }

    return Math.max(0, score);
}

function calculateKeywordScore(
    resume: Resume,
    jobDescription: string,
    suggestions: ATSSuggestion[]
): { score: number; matched: string[]; missing: string[] } {
    // Extract keywords from job description
    const jdWords = jobDescription.toLowerCase();
    const resumeText = getResumeFullText(resume).toLowerCase();

    // Common tech keywords and skills to look for
    const potentialKeywords = extractKeywords(jdWords);

    const matched: string[] = [];
    const missing: string[] = [];

    potentialKeywords.forEach((keyword) => {
        if (resumeText.includes(keyword.toLowerCase())) {
            matched.push(keyword);
        } else {
            missing.push(keyword);
        }
    });

    const totalKeywords = potentialKeywords.length;
    const score = totalKeywords > 0 ? Math.round((matched.length / totalKeywords) * 100) : 70;

    if (missing.length > 0) {
        suggestions.push({
            category: 'keywords',
            severity: missing.length > 5 ? 'high' : 'medium',
            message: `${missing.length} keywords from the job description are missing`,
            action: `Consider adding: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '...' : ''}`,
        });
    }

    if (matched.length > 0 && matched.length < totalKeywords * 0.5) {
        suggestions.push({
            category: 'keywords',
            severity: 'high',
            message: 'Less than 50% keyword match with the job description',
            action: 'Tailor your resume to include more relevant keywords from the job posting',
        });
    }

    return { score, matched, missing };
}

function extractKeywords(text: string): string[] {
    // Remove common stop words and extract meaningful terms
    const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
        'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
        'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'need',
        'we', 'you', 'your', 'our', 'they', 'this', 'that', 'it', 'its',
        'not', 'no', 'if', 'about', 'all', 'also', 'than', 'then', 'so',
        'such', 'very', 'too', 'just', 'each', 'other', 'into', 'through',
        'up', 'out', 'any', 'only', 'well', 'must', 'able', 'who', 'what',
        'where', 'when', 'how', 'more', 'most', 'some', 'over', 'work',
        'working', 'role', 'position', 'job', 'company', 'team',
    ]);

    // Extract multi-word phrases first (2-3 word combinations)
    const phrases: string[] = [];
    const commonPhrases = [
        'machine learning', 'data science', 'project management', 'full stack',
        'front end', 'back end', 'software engineer', 'product manager',
        'data analysis', 'user experience', 'software development', 'cloud computing',
        'artificial intelligence', 'deep learning', 'natural language processing',
        'ci/cd', 'version control', 'agile methodology', 'scrum master',
        'team leadership', 'cross functional', 'problem solving',
        'communication skills', 'attention to detail',
    ];

    commonPhrases.forEach((phrase) => {
        if (text.includes(phrase)) {
            phrases.push(phrase);
        }
    });

    // Extract individual keywords
    const words = text
        .replace(/[^\w\s+#./]/g, ' ')
        .split(/\s+/)
        .filter((word) => word.length > 2 && !stopWords.has(word))
        .filter((word) => /^[a-zA-Z+#./]/.test(word));

    // Count frequency and keep most frequent
    const freq: Record<string, number> = {};
    words.forEach((word) => {
        freq[word] = (freq[word] || 0) + 1;
    });

    const topWords = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 25)
        .map(([word]) => word);

    return [...new Set([...phrases, ...topWords])];
}

function getResumeFullText(resume: Resume): string {
    const parts: string[] = [
        resume.personalInfo.fullName,
        resume.personalInfo.jobTitle,
        resume.personalInfo.summary,
        ...resume.experience.flatMap((exp) => [
            exp.company, exp.position, exp.description, ...exp.highlights,
        ]),
        ...resume.education.flatMap((edu) => [
            edu.institution, edu.degree, edu.field, edu.description,
        ]),
        ...resume.skills.map((s) => s.name),
        ...resume.projects.flatMap((p) => [
            p.name, p.description, ...p.technologies,
        ]),
        ...resume.certifications.map((c) => `${c.name} ${c.issuer}`),
        ...resume.awards.map((a) => `${a.title} ${a.description}`),
    ];
    return parts.filter(Boolean).join(' ');
}
