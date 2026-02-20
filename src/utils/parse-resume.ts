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
    skills: ParsedSkill[];
    languages: string[];
    certifications: string[];
    projects: ParsedProject[];
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
    startDate: string;
    endDate: string;
    gpa: string;
}

export interface ParsedSkill {
    category: string;
    items: string[];
}

export interface ParsedProject {
    name: string;
    description: string;
    technologies: string;
}

// ═══════════════════════════════════
// PDF TEXT EXTRACTION (Improved)
// ═══════════════════════════════════
import Tesseract from 'tesseract.js';

export async function extractTextFromPDF(file: File): Promise<string> {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const items = content.items as any[];
        if (items.length === 0) continue;

        // Sort by Y (descending = top to bottom), then X (left to right)
        const sorted = [...items].sort((a, b) => {
            const yDiff = b.transform[5] - a.transform[5];
            if (Math.abs(yDiff) > 2) return yDiff;
            return a.transform[0] - b.transform[0];
        });

        // Group items into lines based on Y proximity
        const lineGroups: any[][] = [];
        let currentLine: any[] = [sorted[0]];
        let currentY = sorted[0].transform[5];

        for (let j = 1; j < sorted.length; j++) {
            const item = sorted[j];
            const y = item.transform[5];
            if (Math.abs(y - currentY) < 2) {
                currentLine.push(item);
            } else {
                lineGroups.push(currentLine);
                currentLine = [item];
                currentY = y;
            }
        }
        lineGroups.push(currentLine);

        // Convert line groups to text
        for (const group of lineGroups) {
            group.sort((a: any, b: any) => a.transform[0] - b.transform[0]);

            let lineText = '';
            for (let k = 0; k < group.length; k++) {
                const item = group[k];
                const str = item.str;
                if (!str && !item.hasEOL) continue;

                if (k > 0) {
                    const prevItem = group[k - 1];
                    const prevEnd = prevItem.transform[0] + (prevItem.width || 0);
                    const gap = item.transform[0] - prevEnd;
                    if (gap > 10) {
                        lineText += '  |  '; // column separator for multi-column layouts
                    } else if (gap > 2) {
                        lineText += ' ';
                    }
                }
                lineText += str;
            }

            const trimmed = lineText.trim();
            if (trimmed) {
                fullText += trimmed + '\n';
            }
        }
        fullText += '\n---PAGE_BREAK---\n';
    }

    return fullText;
}

export async function extractTextFromImage(fileOrUrl: File | string): Promise<string> {
    const result = await Tesseract.recognize(fileOrUrl, 'eng');
    return result.data.text;
}

// ═══════════════════════════════════
// MAIN PARSER
// ═══════════════════════════════════

export function parseResumeText(text: string): ParsedResume {
    // Clean up page breaks for parsing but keep the text
    const cleanText = text.replace(/---PAGE_BREAK---/g, '\n');
    const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);

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
        projects: [],
        rawText: text,
    };

    // ════════════════════════════════════════
    // 1. CONTACT INFORMATION
    // ════════════════════════════════════════

    // Email (all occurrences, take first real one)
    const emailMatches = cleanText.match(/[\w.+-]+@[\w-]+\.[\w.]+/g);
    if (emailMatches) {
        result.email = emailMatches[0];
    }

    // Phone - multiple patterns
    const phonePatterns = [
        /(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g,
        /\(\d{3}\)\s?\d{3}[\s.-]?\d{4}/g,
    ];
    for (const pattern of phonePatterns) {
        const matches = cleanText.match(pattern);
        if (matches) {
            // Pick the one that looks most like a phone number (7+ digits)
            for (const m of matches) {
                const digits = m.replace(/\D/g, '');
                if (digits.length >= 7 && digits.length <= 15) {
                    result.phone = m.trim();
                    break;
                }
            }
            if (result.phone) break;
        }
    }

    // LinkedIn
    const linkedinMatch = cleanText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i);
    if (linkedinMatch) {
        result.linkedin = linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : 'https://' + linkedinMatch[0];
    }

    // GitHub
    const githubMatch = cleanText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+/i);
    if (githubMatch) {
        result.github = githubMatch[0].startsWith('http') ? githubMatch[0] : 'https://' + githubMatch[0];
    }

    // Website
    const websiteMatch = cleanText.match(/https?:\/\/(?!.*(?:linkedin|github)\.com)[\w./\-?=&#]+/i);
    if (websiteMatch) result.website = websiteMatch[0];

    // ════════════════════════════════════════
    // 2. NAME DETECTION
    // ════════════════════════════════════════

    for (const line of lines.slice(0, 10)) {
        // Skip contact info, URLs, section headers, and column-separated lines
        if (
            line.includes('@') ||
            line.match(/^\+?\d/) ||
            line.includes('http') ||
            line.toLowerCase().includes('linkedin') ||
            line.toLowerCase().includes('github') ||
            line.includes('|') && line.split('|').length > 2 || // likely contact line
            isSectionHeader(line) ||
            line.length <= 2 ||
            line.length > 50
        ) continue;

        // Name heuristic: starts with capital letter, mostly letters, 2-5 words
        if (/^[A-Z\u00C0-\u024F]/.test(line) && line.split(/\s+/).length <= 5) {
            result.fullName = line.replace(/[,|]/g, '').trim();
            break;
        }
    }

    // ════════════════════════════════════════
    // 3. JOB TITLE DETECTION
    // ════════════════════════════════════════

    const nameIndex = lines.indexOf(result.fullName);
    if (nameIndex >= 0) {
        for (let i = nameIndex + 1; i < Math.min(nameIndex + 5, lines.length); i++) {
            const line = lines[i];
            if (
                line &&
                !line.includes('@') &&
                !line.match(/^\+?\d/) &&
                !line.includes('http') &&
                !isSectionHeader(line) &&
                !line.match(/\b\d{5}\b/) &&
                line.length > 3 &&
                line.length < 80 &&
                // Skip lines that look like contact rows (multiple | or • separators)
                !(line.includes('|') && line.split('|').length > 2) &&
                !(line.includes('•') && line.split('•').length > 2)
            ) {
                result.jobTitle = line;
                break;
            }
        }
    }

    // ════════════════════════════════════════
    // 4. LOCATION DETECTION
    // ════════════════════════════════════════

    for (const line of lines.slice(0, 15)) {
        const locationMatch = line.match(/([A-Z][a-zA-Z\s]+),\s*([A-Z]{2}(?:\s+\d{5})?|[A-Z][a-zA-Z\s]+)/);
        if (locationMatch && !line.includes('@') && line.length < 60) {
            result.location = locationMatch[0].trim();
            break;
        }
    }

    // Also try extracting location from contact lines with pipes/bullets
    if (!result.location) {
        for (const line of lines.slice(0, 10)) {
            if (line.includes('|') || line.includes('•')) {
                const parts = line.split(/[|•]/).map(p => p.trim());
                for (const part of parts) {
                    const locMatch = part.match(/([A-Z][a-zA-Z\s]+),\s*([A-Z]{2}|[A-Z][a-zA-Z]+)/);
                    if (locMatch && !part.includes('@') && !part.includes('http')) {
                        result.location = locMatch[0].trim();
                        break;
                    }
                }
                if (result.location) break;
            }
        }
    }

    // ════════════════════════════════════════
    // 5. SECTION DETECTION (ROBUST)
    // ════════════════════════════════════════

    const sectionVariants: Record<string, string[]> = {
        'summary': ['summary', 'professional summary', 'about', 'about me', 'profile', 'objective', 'career objective', 'professional profile', 'executive summary', 'personal statement', 'career summary'],
        'experience': ['experience', 'work experience', 'employment', 'professional experience', 'work history', 'employment history', 'career history', 'relevant experience', 'professional background'],
        'education': ['education', 'academic background', 'qualifications', 'academic qualifications', 'educational background', 'academic history', 'education background'],
        'skills': ['skills', 'technical skills', 'core competencies', 'competencies', 'expertise', 'core skills', 'key skills', 'professional skills', 'areas of expertise', 'technologies', 'tech stack', 'tools & technologies', 'tools and technologies', 'technical competencies', 'skills & expertise', 'technical proficiencies'],
        'certifications': ['certifications', 'certificates', 'licenses', 'professional certifications', 'licenses & certifications', 'certifications & licenses', 'professional development'],
        'languages': ['languages', 'language', 'language skills', 'language proficiency', 'language competencies'],
        'projects': ['projects', 'personal projects', 'key projects', 'notable projects', 'selected projects', 'side projects', 'academic projects'],
        'awards': ['awards', 'honors', 'achievements', 'awards & honors', 'accomplishments', 'recognition'],
        'volunteer': ['volunteer', 'volunteer experience', 'community service', 'volunteering', 'community involvement'],
        'interests': ['interests', 'hobbies', 'hobbies & interests', 'personal interests'],
        'references': ['references', 'professional references'],
        'publications': ['publications', 'research', 'papers', 'research papers'],
    };

    // Flatten for matching, longest first
    const allVariants: { category: string; variant: string }[] = [];
    for (const [cat, variants] of Object.entries(sectionVariants)) {
        for (const v of variants) {
            allVariants.push({ category: cat, variant: v });
        }
    }
    allVariants.sort((a, b) => b.variant.length - a.variant.length);

    interface SectionInfo {
        category: string;
        headerLine: string;
        start: number;
        end: number;
        lines: string[];
    }

    const detectedSections: SectionInfo[] = [];

    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        // Normalize: lowercase, strip non-alpha except & and spaces
        const normalized = raw.toLowerCase().replace(/[^a-z\s&]/g, '').replace(/\s+/g, ' ').trim();

        for (const { category, variant } of allVariants) {
            const match = (
                normalized === variant ||
                normalized.startsWith(variant + ' ') ||
                normalized.endsWith(' ' + variant) ||
                // Handle "SKILLS:" or "Skills -" type headers
                (normalized.length < variant.length + 15 && normalized.includes(variant))
            );
            if (match) {
                // Avoid duplicate category entries — keep first occurrence
                if (!detectedSections.some(s => s.category === category)) {
                    detectedSections.push({ category, headerLine: raw, start: i, end: lines.length, lines: [] });
                }
                break;
            }
        }
    }

    // Sort by position and set boundaries
    detectedSections.sort((a, b) => a.start - b.start);
    for (let i = 0; i < detectedSections.length; i++) {
        const nextStart = i < detectedSections.length - 1 ? detectedSections[i + 1].start : lines.length;
        detectedSections[i].end = nextStart;
        detectedSections[i].lines = lines.slice(detectedSections[i].start + 1, nextStart);
    }

    const sectionByCategory: Record<string, SectionInfo> = {};
    for (const s of detectedSections) {
        sectionByCategory[s.category] = s;
    }

    // ════════════════════════════════════════
    // 6. PARSE EACH SECTION
    // ════════════════════════════════════════

    // Summary
    if (sectionByCategory['summary']) {
        result.summary = sectionByCategory['summary'].lines
            .filter(l => l.length > 2 && !isSectionHeader(l))
            .join(' ')
            .trim();
    }

    // Experience
    if (sectionByCategory['experience']) {
        result.experience = parseExperienceSection(sectionByCategory['experience'].lines);
    }

    // Education
    if (sectionByCategory['education']) {
        result.education = parseEducationSection(sectionByCategory['education'].lines);
    }

    // Skills (with categories)
    if (sectionByCategory['skills']) {
        result.skills = parseSkillsSection(sectionByCategory['skills'].lines);
    }

    // Languages
    if (sectionByCategory['languages']) {
        result.languages = sectionByCategory['languages'].lines
            .filter(l => l.length > 1)
            .map(l => l.replace(/^[•\-–—\*]\s*/, '').trim())
            .filter(Boolean);
    }

    // Certifications
    if (sectionByCategory['certifications']) {
        result.certifications = sectionByCategory['certifications'].lines
            .filter(l => l.length > 2)
            .map(l => l.replace(/^[•\-–—\*]\s*/, '').trim())
            .filter(Boolean);
    }

    // Projects
    if (sectionByCategory['projects']) {
        result.projects = parseProjectsSection(sectionByCategory['projects'].lines);
    }

    // ════════════════════════════════════════
    // 7. FALLBACKS
    // ════════════════════════════════════════

    if (result.experience.length === 0) {
        result.experience = fallbackExperienceParse(lines);
    }

    if (result.skills.length === 0) {
        const foundSkills = fallbackSkillsParse(cleanText);
        if (foundSkills.length > 0) {
            result.skills = [{ category: 'Detected Skills', items: foundSkills }];
        }
    }

    if (result.education.length === 0) {
        result.education = fallbackEducationParse(lines);
    }

    return result;
}

// ═══════════════════════════════════
// SECTION HEADER DETECTION
// ═══════════════════════════════════

const SECTION_KEYWORDS = new Set([
    'summary', 'experience', 'education', 'skills', 'certifications',
    'languages', 'projects', 'awards', 'references', 'volunteer',
    'interests', 'hobbies', 'objective', 'profile', 'competencies',
    'expertise', 'qualifications', 'employment', 'achievements',
    'honors', 'certificates', 'licenses', 'technologies', 'publications',
    'research', 'accomplishments', 'background',
]);

function isSectionHeader(line: string): boolean {
    const normalized = line.toLowerCase().replace(/[^a-z\s]/g, '').trim();
    if (normalized.length > 50) return false;
    if (normalized.length < 3) return false;
    const words = normalized.split(/\s+/);
    // Fewer words → more likely to be a header
    if (words.length > 5) return false;
    return words.some(w => SECTION_KEYWORDS.has(w));
}

// ═══════════════════════════════════
// DATE PATTERNS
// ═══════════════════════════════════

const MONTH_NAMES = '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)';
const DATE_PART = `(?:${MONTH_NAMES}\\s*\\.?\\s*\\d{2,4}|\\d{1,2}\\/\\d{2,4}|\\d{4})`;
const DATE_RANGE_REGEX = new RegExp(`(${DATE_PART})\\s*(?:[-–—]|to)\\s*(${DATE_PART}|Present|Current|Now|Ongoing)`, 'i');
const DATE_RANGE_YEAR = /\b(\d{4})\s*[-–—]\s*(\d{4}|Present|Current|Now|Ongoing)\b/i;
const SINGLE_DATE = new RegExp(`(${MONTH_NAMES}\\s*\\.?\\s*\\d{2,4})`, 'i');

function extractDateRange(line: string): { startDate: string; endDate: string; rest: string } | null {
    let match = line.match(DATE_RANGE_REGEX);
    if (match) {
        return {
            startDate: match[1].trim(),
            endDate: match[2].trim(),
            rest: line.replace(match[0], '').trim(),
        };
    }
    match = line.match(DATE_RANGE_YEAR);
    if (match) {
        return {
            startDate: match[1],
            endDate: match[2],
            rest: line.replace(match[0], '').trim(),
        };
    }
    return null;
}

function hasDateRange(line: string): boolean {
    return DATE_RANGE_REGEX.test(line) || DATE_RANGE_YEAR.test(line);
}

// ═══════════════════════════════════
// EXPERIENCE PARSER
// ═══════════════════════════════════

function parseExperienceSection(lines: string[]): ParsedExperience[] {
    const experiences: ParsedExperience[] = [];
    let current: ParsedExperience | null = null;
    let descLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const dateInfo = extractDateRange(line);

        if (dateInfo) {
            // Save previous entry
            if (current) {
                current.description = descLines.join('\n').trim();
                experiences.push(current);
                descLines = [];
            }

            // Determine position/company
            let position = '';
            let company = '';
            let location = '';
            const restOfDateLine = dateInfo.rest.replace(/^[\s|,\-–—]+/, '').replace(/[\s|,\-–—]+$/, '').trim();

            // Check previous line(s) for position/company
            const prevLine1 = i > 0 ? lines[i - 1].trim() : '';
            const prevLine2 = i > 1 ? lines[i - 2].trim() : '';

            // Is prevLine1 already consumed by a previous experience?
            const prevIsConsumed = current && descLines.length === 0 && i > 0;

            if (prevLine1 && !hasDateRange(prevLine1) && !prevLine1.match(/^[•\-–—\*]/) && prevLine1.length > 3) {
                // Check if prevLine2 is also a title line (position on one line, company on another)
                if (prevLine2 && !hasDateRange(prevLine2) && !prevLine2.match(/^[•\-–—\*]/) && prevLine2.length > 3 && !prevIsConsumed) {
                    const parsed2 = splitPositionCompany(prevLine2);
                    const parsed1 = splitPositionCompany(prevLine1);
                    // prevLine2 = position, prevLine1 = company (or vice versa)
                    position = parsed2.position || prevLine2;
                    company = parsed1.position || prevLine1;
                    location = parsed1.location || parsed2.location;
                } else {
                    const parsed = splitPositionCompany(prevLine1);
                    position = parsed.position;
                    company = parsed.company;
                    location = parsed.location;
                }
            }

            // If date line has remaining text, use it as company/position fallback
            if (restOfDateLine && restOfDateLine.length > 3) {
                if (!company) {
                    const parsed = splitPositionCompany(restOfDateLine);
                    if (!position) position = parsed.position;
                    else company = parsed.position;
                    if (!location) location = parsed.location;
                }
            }

            current = {
                position: position || 'Position',
                company: company || '',
                location: location || '',
                startDate: dateInfo.startDate,
                endDate: dateInfo.endDate,
                description: '',
            };
        } else if (current) {
            // Accumulate description
            const cleaned = line.replace(/^[•\-–—\*]\s*/, '').trim();
            if (cleaned.length > 2) {
                const isBullet = /^[•\-–—\*]/.test(line.trim());
                if (isBullet || cleaned.length > 15) {
                    descLines.push('• ' + cleaned);
                }
            }
        }
    }

    // Push last
    if (current) {
        current.description = descLines.join('\n').trim();
        experiences.push(current);
    }

    return experiences;
}

function splitPositionCompany(line: string): { position: string; company: string; location: string } {
    let position = '';
    let company = '';
    let location = '';

    const separators = [' at ', ' | ', ' — ', ' – ', ' - '];
    for (const sep of separators) {
        const idx = line.indexOf(sep);
        if (idx > 0) {
            position = line.slice(0, idx).trim();
            const rest = line.slice(idx + sep.length).trim();

            const locMatch = rest.match(/,\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:,\s*[A-Z]{2})?)$/);
            if (locMatch) {
                company = rest.slice(0, rest.lastIndexOf(locMatch[0])).trim();
                location = locMatch[1].trim();
            } else {
                company = rest;
            }
            return { position, company, location };
        }
    }

    // No separator found
    position = line;
    const locMatch = line.match(/,\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:,\s*[A-Z]{2})?)$/);
    if (locMatch) {
        position = line.slice(0, line.lastIndexOf(locMatch[0])).trim();
        location = locMatch[1].trim();
    }

    return { position, company, location };
}

// ═══════════════════════════════════
// EDUCATION PARSER
// ═══════════════════════════════════

const DEGREE_KEYWORDS = /\b(Bachelor'?s?|Master'?s?|PhD|Doctorate|MBA|BSc|MSc|BA|MA|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|B\.?E\.?|M\.?E\.?|Associate'?s?|Diploma|Certificate|BEng|MEng|B\.?Tech|M\.?Tech|BCom|MCom|LLB|LLM|MD|DDS|PharmD|Doctor|JD|GED|High School|Secondary School|A-?Levels?|O-?Levels?|GCSE|HND|HNC|BBA|BCA|MCA)\b/i;

const UNIVERSITY_KEYWORDS = /\b(University|College|Institute|School|Academy|Polytechnic|Universit[éy]|Hochschule|Fachhochschule)\b/i;

function parseEducationSection(lines: string[]): ParsedEducation[] {
    const educations: ParsedEducation[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i].replace(/^[•\-–—\*]\s*/, '').trim();
        if (!line || line.length < 3) { i++; continue; }

        const hasDegree = DEGREE_KEYWORDS.test(line);
        const hasUniversity = UNIVERSITY_KEYWORDS.test(line);

        if (hasDegree || hasUniversity) {
            const edu: ParsedEducation = {
                degree: '',
                institution: '',
                field: '',
                startDate: '',
                endDate: '',
                gpa: '',
            };

            if (hasDegree && hasUniversity) {
                // Both on same line — try to split
                edu.degree = line;
                edu.institution = line;
            } else if (hasDegree) {
                edu.degree = line;
                // Next line might be institution
                if (i + 1 < lines.length) {
                    const next = lines[i + 1].replace(/^[•\-–—\*]\s*/, '').trim();
                    if (next && (UNIVERSITY_KEYWORDS.test(next) || (!DEGREE_KEYWORDS.test(next) && next.length > 3 && !next.match(/^[•\-–—\*]/)))) {
                        edu.institution = next;
                        i++;
                    }
                }
            } else {
                edu.institution = line;
                // Next line might be degree
                if (i + 1 < lines.length) {
                    const next = lines[i + 1].replace(/^[•\-–—\*]\s*/, '').trim();
                    if (next && DEGREE_KEYWORDS.test(next)) {
                        edu.degree = next;
                        i++;
                    }
                }
            }

            // Check next lines for dates, GPA
            for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
                const nextLine = lines[j].replace(/^[•\-–—\*]\s*/, '').trim();
                if (!nextLine) continue;

                // Date range
                if (!edu.endDate) {
                    const dateInfo = extractDateRange(nextLine);
                    if (dateInfo) {
                        edu.startDate = dateInfo.startDate;
                        edu.endDate = dateInfo.endDate;
                        i = j;
                        continue;
                    }
                    // Single year
                    const yearMatch = nextLine.match(/\b(20\d{2}|19\d{2})\b/);
                    if (yearMatch && nextLine.length < 20) {
                        edu.endDate = yearMatch[1];
                        i = j;
                        continue;
                    }
                }

                // GPA
                const gpaMatch = nextLine.match(/(?:GPA|CGPA|Grade)[:\s]*(\d+\.?\d*(?:\s*\/\s*\d+\.?\d*)?)/i);
                if (gpaMatch) {
                    edu.gpa = gpaMatch[1];
                    i = j;
                }
            }

            // Extract dates from degree/institution text if not found
            const combinedText = edu.degree + ' ' + edu.institution;
            if (!edu.endDate) {
                const dateInfo = extractDateRange(combinedText);
                if (dateInfo) {
                    edu.startDate = dateInfo.startDate;
                    edu.endDate = dateInfo.endDate;
                } else {
                    const years = combinedText.match(/\b(20\d{2}|19\d{2})\b/g);
                    if (years) {
                        edu.endDate = years[years.length - 1];
                        if (years.length > 1) edu.startDate = years[0];
                    }
                }
                // Clean dates from text
                edu.degree = edu.degree.replace(/\b(20\d{2}|19\d{2})\b/g, '').replace(DATE_RANGE_REGEX, '').replace(DATE_RANGE_YEAR, '').trim();
                edu.institution = edu.institution.replace(/\b(20\d{2}|19\d{2})\b/g, '').replace(DATE_RANGE_REGEX, '').replace(DATE_RANGE_YEAR, '').trim();
            }

            // Extract field of study
            const fieldMatch = edu.degree.match(/\b(?:in|of)\s+(.+)/i);
            if (fieldMatch) {
                edu.field = fieldMatch[1].replace(/,.*$/, '').trim();
            }

            // Clean separators
            edu.degree = edu.degree.replace(/^[\s,\-–—|]+|[\s,\-–—|]+$/g, '').trim();
            edu.institution = edu.institution.replace(/^[\s,\-–—|]+|[\s,\-–—|]+$/g, '').trim();

            // Extract GPA from text if not found yet
            if (!edu.gpa) {
                const gpaMatch = combinedText.match(/(?:GPA|CGPA|Grade)[:\s]*(\d+\.?\d*(?:\s*\/\s*\d+\.?\d*)?)/i);
                if (gpaMatch) edu.gpa = gpaMatch[1];
            }

            if (edu.degree || edu.institution) {
                educations.push(edu);
            }
        }
        i++;
    }

    return educations;
}

// ═══════════════════════════════════
// SKILLS PARSER (with categories)
// ═══════════════════════════════════

function parseSkillsSection(lines: string[]): ParsedSkill[] {
    const skillGroups: ParsedSkill[] = [];
    let currentCategory = 'General';
    let currentItems: string[] = [];

    for (const line of lines) {
        const cleaned = line.replace(/^[•\-–—\*]\s*/, '').trim();
        if (!cleaned || cleaned.length < 2) continue;

        // Check for "Category: skill1, skill2, skill3" format
        const colonMatch = cleaned.match(/^([^:]{2,40}):\s*(.+)$/);
        if (colonMatch) {
            // Save previous group
            if (currentItems.length > 0) {
                skillGroups.push({ category: currentCategory, items: [...new Set(currentItems)] });
                currentItems = [];
            }
            currentCategory = colonMatch[1].trim();
            const skillList = colonMatch[2];
            const items = skillList.split(/[,|•;\/]/).map(s => s.trim()).filter(s => s.length > 0);
            currentItems.push(...items);
            continue;
        }

        // Check if line is a category header (short, no commas, possibly bold/caps in PDF)
        if (cleaned.length < 35 && !cleaned.includes(',') && !cleaned.includes('|') && !cleaned.includes(':') &&
            cleaned.split(/\s+/).length <= 4 && /^[A-Z]/.test(cleaned)) {
            // Could be a sub-category header
            if (currentItems.length > 0) {
                skillGroups.push({ category: currentCategory, items: [...new Set(currentItems)] });
                currentItems = [];
            }
            currentCategory = cleaned;
            continue;
        }

        // Regular skill list line
        if (cleaned.includes(',') || cleaned.includes('|') || cleaned.includes(';') || cleaned.includes('•')) {
            const parts = cleaned.split(/[,|•;]/).map(s => s.trim()).filter(s => s.length > 0);
            currentItems.push(...parts);
        } else if (cleaned.length < 80) {
            currentItems.push(cleaned);
        }
    }

    // Save last group
    if (currentItems.length > 0) {
        skillGroups.push({ category: currentCategory, items: [...new Set(currentItems)] });
    }

    // If we only have a single "General" category with items, try to split by common patterns
    if (skillGroups.length === 1 && skillGroups[0].category === 'General') {
        // Keep as is — at least we extracted the items
    }

    return skillGroups;
}

// ═══════════════════════════════════
// PROJECTS PARSER
// ═══════════════════════════════════

function parseProjectsSection(lines: string[]): ParsedProject[] {
    const projects: ParsedProject[] = [];
    let current: ParsedProject | null = null;
    let descLines: string[] = [];

    for (const line of lines) {
        const cleaned = line.replace(/^[•\-–—\*]\s*/, '').trim();
        if (!cleaned || cleaned.length < 3) continue;

        const isBullet = /^[•\-–—\*]/.test(line.trim());

        if (!isBullet && cleaned.length < 80 && !hasDateRange(cleaned)) {
            // Save previous
            if (current) {
                current.description = descLines.join('\n').trim();
                projects.push(current);
                descLines = [];
            }
            current = { name: cleaned, description: '', technologies: '' };
        } else if (current) {
            // Check for tech line
            const techMatch = cleaned.match(/(?:Tech(?:nologies|nical)?|Stack|Built with|Tools)[:\s]+(.+)/i);
            if (techMatch) {
                current.technologies = techMatch[1].trim();
            } else {
                descLines.push('• ' + cleaned);
            }
        }
    }

    if (current) {
        current.description = descLines.join('\n').trim();
        projects.push(current);
    }

    return projects;
}

// ═══════════════════════════════════
// FALLBACK PARSERS
// ═══════════════════════════════════

function fallbackExperienceParse(lines: string[]): ParsedExperience[] {
    const experiences: ParsedExperience[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const dateInfo = extractDateRange(line);

        if (dateInfo) {
            const prevLine = i > 0 ? lines[i - 1].trim() : '';
            const restOfLine = dateInfo.rest.replace(/^[\s|,\-–—]+/, '').trim();

            if (prevLine.length > 3 || restOfLine.length > 3) {
                const parsed = splitPositionCompany(prevLine || restOfLine);
                const descLines: string[] = [];

                for (let j = i + 1; j < lines.length && j < i + 20; j++) {
                    if (hasDateRange(lines[j])) break;
                    if (isSectionHeader(lines[j])) break;
                    const cleaned = lines[j].replace(/^[•\-–—\*]\s*/, '').trim();
                    if (cleaned.length > 5) {
                        descLines.push('• ' + cleaned);
                    }
                }

                experiences.push({
                    position: parsed.position || 'Position',
                    company: parsed.company || '',
                    location: parsed.location || '',
                    startDate: dateInfo.startDate,
                    endDate: dateInfo.endDate,
                    description: descLines.join('\n'),
                });
            }
        }
    }

    return experiences;
}

function fallbackEducationParse(lines: string[]): ParsedEducation[] {
    const educations: ParsedEducation[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (DEGREE_KEYWORDS.test(line) || UNIVERSITY_KEYWORDS.test(line)) {
            const edu: ParsedEducation = {
                degree: DEGREE_KEYWORDS.test(line) ? line : '',
                institution: UNIVERSITY_KEYWORDS.test(line) ? line : '',
                field: '',
                startDate: '',
                endDate: '',
                gpa: '',
            };

            // Look at surrounding lines
            if (i + 1 < lines.length) {
                const next = lines[i + 1];
                if (!edu.institution && UNIVERSITY_KEYWORDS.test(next)) {
                    edu.institution = next;
                } else if (!edu.degree && DEGREE_KEYWORDS.test(next)) {
                    edu.degree = next;
                }
            }

            const combined = edu.degree + ' ' + edu.institution;
            const years = combined.match(/\b(20\d{2}|19\d{2})\b/g);
            if (years) {
                edu.endDate = years[years.length - 1];
            }

            edu.degree = edu.degree.replace(/\b(20\d{2}|19\d{2})\b/g, '').trim();
            edu.institution = edu.institution.replace(/\b(20\d{2}|19\d{2})\b/g, '').trim();

            if (edu.degree || edu.institution) {
                educations.push(edu);
            }
        }
    }

    return educations;
}

// Known skills for fallback
const KNOWN_SKILLS = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby',
    'PHP', 'Swift', 'Kotlin', 'Dart', 'Scala', 'R', 'MATLAB',
    'React', 'Angular', 'Vue', 'Next.js', 'Nuxt', 'Svelte',
    'Node.js', 'Express', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Rails',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB',
    'GraphQL', 'REST', 'gRPC', 'WebSocket',
    'Git', 'CI/CD', 'Jenkins', 'GitHub Actions', 'GitLab CI',
    'HTML', 'CSS', 'SASS', 'Tailwind CSS', 'Bootstrap',
    'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator',
    'Agile', 'Scrum', 'Kanban', 'JIRA', 'Confluence',
    'Linux', 'Windows Server', 'macOS',
    'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy',
    'Firebase', 'Supabase', 'Vercel', 'Netlify', 'Heroku',
    'SQL', 'NoSQL', 'Prisma', 'Sequelize', 'SQLAlchemy', 'Mongoose',
    'Power BI', 'Tableau', 'Excel', 'Google Analytics',
    'Salesforce', 'HubSpot', 'SAP', 'ServiceNow',
    'WordPress', 'Shopify', 'WooCommerce',
    'Unity', 'Unreal Engine', 'Blender',
    'Solidity', 'Web3', 'Blockchain',
    'RabbitMQ', 'Kafka', 'Apache Spark',
    'Nginx', 'Apache', 'Caddy',
    'Cypress', 'Jest', 'Mocha', 'Selenium', 'Playwright',
    'Redux', 'Zustand', 'MobX', 'Recoil',
    'Three.js', 'D3.js', 'Chart.js',
    'OAuth', 'JWT', 'SAML', 'SSO',
    'Microservices', 'Serverless', 'Event-Driven',
    'Jira', 'Trello', 'Asana', 'Notion',
    'Webpack', 'Vite', 'Rollup', 'esbuild',
];

function fallbackSkillsParse(text: string): string[] {
    const found: string[] = [];
    for (const skill of KNOWN_SKILLS) {
        const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'i');
        if (regex.test(text)) {
            found.push(skill);
        }
    }
    return found;
}
