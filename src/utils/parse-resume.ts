// pdf.js is loaded dynamically to avoid SSR issues with Promise.withResolvers

export interface ParsedResume {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    github: string;
    jobTitle: string;
    summary: string;
    experience: ParsedExperience[];
    education: ParsedEducation[];
    skills: string[];
    languages: string[];
    certifications: string[];
    rawText: string;
}

export interface ParsedExperience {
    position: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
}

export interface ParsedEducation {
    degree: string;
    institution: string;
    field: string;
    endDate: string;
}

// Extract text from a PDF file
export async function extractTextFromPDF(file: File): Promise<string> {
    // Dynamic import to avoid SSR issues with Promise.withResolvers
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
            .map((item: any) => item.str)
            .join(' ');
        fullText += pageText + '\n';
    }

    return fullText;
}

// Heuristic-based resume parser
export function parseResumeText(text: string): ParsedResume {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    const result: ParsedResume = {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        website: '',
        linkedin: '',
        github: '',
        jobTitle: '',
        summary: '',
        experience: [],
        education: [],
        skills: [],
        languages: [],
        certifications: [],
        rawText: text,
    };

    // Extract email
    const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
    if (emailMatch) result.email = emailMatch[0];

    // Extract phone
    const phoneMatch = text.match(/(\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/);
    if (phoneMatch) result.phone = phoneMatch[0].trim();

    // Extract LinkedIn
    const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
    if (linkedinMatch) result.linkedin = 'https://' + linkedinMatch[0];

    // Extract GitHub
    const githubMatch = text.match(/github\.com\/[\w-]+/i);
    if (githubMatch) result.github = 'https://' + githubMatch[0];

    // Extract website
    const websiteMatch = text.match(/https?:\/\/(?!.*(?:linkedin|github))[\w./\-?=&#]+/i);
    if (websiteMatch) result.website = websiteMatch[0];

    // Name is typically the first prominent line
    if (lines.length > 0) {
        // First non-empty line that doesn't look like an email/phone/URL
        for (const line of lines.slice(0, 5)) {
            if (!line.includes('@') && !line.match(/^\+?\d/) && !line.includes('http') && line.length > 2 && line.length < 60) {
                result.fullName = line;
                break;
            }
        }
    }

    // Try to find job title (usually near the name, before sections)
    const nameIndex = lines.indexOf(result.fullName);
    if (nameIndex >= 0 && nameIndex < lines.length - 1) {
        const nextLine = lines[nameIndex + 1];
        if (nextLine && !nextLine.includes('@') && !nextLine.match(/^\+?\d/) && !nextLine.includes('http') && nextLine.length > 3 && nextLine.length < 80) {
            result.jobTitle = nextLine;
        }
    }

    // Detect section boundaries
    const sectionHeaders = [
        'summary', 'professional summary', 'about', 'about me', 'profile', 'objective',
        'experience', 'work experience', 'employment', 'professional experience', 'work history',
        'education', 'academic background', 'qualifications',
        'skills', 'technical skills', 'core competencies', 'competencies', 'expertise',
        'certifications', 'certificates', 'licenses',
        'languages', 'language',
        'projects', 'personal projects',
        'awards', 'honors', 'achievements',
        'references', 'volunteer', 'interests', 'hobbies',
    ];

    const sectionMap: { [key: string]: { start: number; end: number; lines: string[] } } = {};

    for (let i = 0; i < lines.length; i++) {
        const normalizedLine = lines[i].toLowerCase().replace(/[^a-z\s]/g, '').trim();
        for (const header of sectionHeaders) {
            if (normalizedLine === header || normalizedLine.startsWith(header + ' ') || normalizedLine.endsWith(' ' + header)) {
                sectionMap[header] = { start: i, end: lines.length, lines: [] };
                break;
            }
        }
    }

    // Set end boundaries
    const sortedSections = Object.entries(sectionMap).sort((a, b) => a[1].start - b[1].start);
    for (let i = 0; i < sortedSections.length; i++) {
        const nextStart = i < sortedSections.length - 1 ? sortedSections[i + 1][1].start : lines.length;
        sortedSections[i][1].end = nextStart;
        sortedSections[i][1].lines = lines.slice(sortedSections[i][1].start + 1, nextStart);
    }

    // Parse summary
    const summaryKeys = ['summary', 'professional summary', 'about', 'about me', 'profile', 'objective'];
    for (const key of summaryKeys) {
        if (sectionMap[key]) {
            result.summary = sectionMap[key].lines.join(' ');
            break;
        }
    }

    // Parse experience
    const expKeys = ['experience', 'work experience', 'employment', 'professional experience', 'work history'];
    for (const key of expKeys) {
        if (sectionMap[key]) {
            result.experience = parseExperienceLines(sectionMap[key].lines);
            break;
        }
    }

    // Parse education
    const eduKeys = ['education', 'academic background', 'qualifications'];
    for (const key of eduKeys) {
        if (sectionMap[key]) {
            result.education = parseEducationLines(sectionMap[key].lines);
            break;
        }
    }

    // Parse skills
    const skillKeys = ['skills', 'technical skills', 'core competencies', 'competencies', 'expertise'];
    for (const key of skillKeys) {
        if (sectionMap[key]) {
            result.skills = parseSkillLines(sectionMap[key].lines);
            break;
        }
    }

    // Parse languages
    if (sectionMap['languages'] || sectionMap['language']) {
        const langSection = sectionMap['languages'] || sectionMap['language'];
        result.languages = langSection.lines.filter(l => l.length > 1).map(l => l.replace(/^[•\-–—\*]\s*/, '').trim());
    }

    // Parse certifications
    const certKeys = ['certifications', 'certificates', 'licenses'];
    for (const key of certKeys) {
        if (sectionMap[key]) {
            result.certifications = sectionMap[key].lines.filter(l => l.length > 2).map(l => l.replace(/^[•\-–—\*]\s*/, '').trim());
            break;
        }
    }

    return result;
}

function parseExperienceLines(lines: string[]): ParsedExperience[] {
    const experiences: ParsedExperience[] = [];
    const datePattern = /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s*\.?\s*\d{2,4}|\d{1,2}\/\d{2,4}|\d{4})\s*(?:[-–—to]+)\s*(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s*\.?\s*\d{2,4}|\d{1,2}\/\d{2,4}|\d{4}|Present|Current|Now)/i;

    let current: ParsedExperience | null = null;
    let descriptionLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const dateMatch = line.match(datePattern);

        if (dateMatch) {
            // Save previous
            if (current) {
                current.description = descriptionLines.join('\n');
                experiences.push(current);
                descriptionLines = [];
            }

            // Extract date portion
            const datePart = dateMatch[0];
            const restOfLine = line.replace(datePart, '').trim().replace(/^[|,\-–—]\s*/, '').trim();

            // Look at the previous line for the title/company
            const prevLine = i > 0 ? lines[i - 1] : '';

            current = {
                position: prevLine || restOfLine || 'Unknown Position',
                company: restOfLine || '',
                location: '',
                startDate: dateMatch[1] || '',
                endDate: dateMatch[2] || '',
                description: '',
            };

            // Try to split position and company
            if (current.position.includes(' at ')) {
                const parts = current.position.split(' at ');
                current.position = parts[0].trim();
                current.company = parts.slice(1).join(' at ').trim();
            } else if (current.position.includes(' - ')) {
                const parts = current.position.split(' - ');
                current.position = parts[0].trim();
                current.company = parts.slice(1).join(' - ').trim();
            } else if (current.position.includes(', ')) {
                const parts = current.position.split(', ');
                current.position = parts[0].trim();
                current.company = parts.slice(1).join(', ').trim();
            }
        } else if (current) {
            // Description bullet
            const cleaned = line.replace(/^[•\-–—\*]\s*/, '').trim();
            if (cleaned.length > 2) {
                descriptionLines.push('• ' + cleaned);
            }
        }
    }

    // Push last entry
    if (current) {
        current.description = descriptionLines.join('\n');
        experiences.push(current);
    }

    return experiences;
}

function parseEducationLines(lines: string[]): ParsedEducation[] {
    const educations: ParsedEducation[] = [];
    const degreePatterns = /\b(bachelor|master|phd|doctorate|mba|bsc|msc|ba|ma|b\.s\.|m\.s\.|associate|diploma|certificate|beng|meng)\b/i;

    let i = 0;
    while (i < lines.length) {
        const line = lines[i];

        if (degreePatterns.test(line) || (i < lines.length - 1 && lines[i].length > 3 && !lines[i].startsWith('•'))) {
            const edu: ParsedEducation = {
                degree: '',
                institution: '',
                field: '',
                endDate: '',
            };

            if (degreePatterns.test(line)) {
                edu.degree = line.replace(/^[•\-–—\*]\s*/, '').trim();
                if (i < lines.length - 1) {
                    edu.institution = lines[i + 1].replace(/^[•\-–—\*]\s*/, '').trim();
                    i++;
                }
            } else {
                edu.institution = line.replace(/^[•\-–—\*]\s*/, '').trim();
                if (i < lines.length - 1 && degreePatterns.test(lines[i + 1])) {
                    edu.degree = lines[i + 1].replace(/^[•\-–—\*]\s*/, '').trim();
                    i++;
                }
            }

            // Look for year
            const yearMatch = (edu.degree + ' ' + edu.institution).match(/\b(20\d{2}|19\d{2})\b/);
            if (yearMatch) {
                edu.endDate = yearMatch[1];
                edu.degree = edu.degree.replace(yearMatch[0], '').trim();
                edu.institution = edu.institution.replace(yearMatch[0], '').trim();
            }

            if (edu.degree || edu.institution) {
                educations.push(edu);
            }
        }
        i++;
    }

    return educations;
}

function parseSkillLines(lines: string[]): string[] {
    const skills: string[] = [];

    for (const line of lines) {
        const cleaned = line.replace(/^[•\-–—\*]\s*/, '').trim();
        if (!cleaned) continue;

        // Skills might be comma, pipe, or bullet separated
        if (cleaned.includes(',') || cleaned.includes('|') || cleaned.includes('•')) {
            const parts = cleaned.split(/[,|•]/).map(s => s.trim()).filter(s => s.length > 1);
            skills.push(...parts);
        } else if (cleaned.length < 40) {
            skills.push(cleaned);
        }
    }

    return [...new Set(skills)]; // deduplicate
}
