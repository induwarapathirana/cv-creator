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

// ═══════════════════════════════════
// PDF TEXT EXTRACTION (Improved)
// ═══════════════════════════════════

export async function extractTextFromPDF(file: File): Promise<string> {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();

        // Group text items by their Y position to reconstruct lines properly
        const items = content.items as any[];
        if (items.length === 0) continue;

        // Sort by Y (descending = top to bottom), then X (left to right)
        const sorted = [...items].sort((a, b) => {
            const yDiff = b.transform[5] - a.transform[5];
            if (Math.abs(yDiff) > 3) return yDiff; // different line
            return a.transform[0] - b.transform[0]; // same line, sort by X
        });

        // Group items into lines based on Y proximity
        const lineGroups: any[][] = [];
        let currentLine: any[] = [sorted[0]];
        let currentY = sorted[0].transform[5];

        for (let j = 1; j < sorted.length; j++) {
            const item = sorted[j];
            const y = item.transform[5];
            if (Math.abs(y - currentY) < 3) {
                // Same line
                currentLine.push(item);
            } else {
                // New line
                lineGroups.push(currentLine);
                currentLine = [item];
                currentY = y;
            }
        }
        lineGroups.push(currentLine);

        // Convert line groups to text
        for (const group of lineGroups) {
            // Sort by X within each line
            group.sort((a: any, b: any) => a.transform[0] - b.transform[0]);

            let lineText = '';
            for (let k = 0; k < group.length; k++) {
                const item = group[k];
                const str = item.str;
                if (!str) continue;

                // Add space between items if there's a gap
                if (k > 0) {
                    const prevItem = group[k - 1];
                    const prevEnd = prevItem.transform[0] + (prevItem.width || 0);
                    const gap = item.transform[0] - prevEnd;
                    // If there's a significant gap, add space; if very large gap, add tab/separator
                    if (gap > 5) {
                        lineText += '  '; // double space for column separation
                    } else if (gap > 1) {
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
        fullText += '\n'; // Page separator
    }

    return fullText;
}

// ═══════════════════════════════════
// HEURISTIC RESUME PARSER (Improved)
// ═══════════════════════════════════

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

    // ── Contact Info Extraction ──
    // Email
    const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
    if (emailMatch) result.email = emailMatch[0];

    // Phone - improved to handle more formats
    const phonePatterns = [
        /(\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/,
        /(\+\d{1,3}\s?)?\d{10,12}/,
        /\(\d{3}\)\s?\d{3}[\s.-]?\d{4}/,
    ];
    for (const pattern of phonePatterns) {
        const match = text.match(pattern);
        if (match) {
            result.phone = match[0].trim();
            break;
        }
    }

    // LinkedIn
    const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i);
    if (linkedinMatch) {
        result.linkedin = linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : 'https://' + linkedinMatch[0];
    }

    // GitHub
    const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+/i);
    if (githubMatch) {
        result.github = githubMatch[0].startsWith('http') ? githubMatch[0] : 'https://' + githubMatch[0];
    }

    // Website (non-linkedin, non-github)
    const websiteMatch = text.match(/https?:\/\/(?!.*(?:linkedin|github)\.com)[\w./\-?=&#]+/i);
    if (websiteMatch) result.website = websiteMatch[0];

    // ── Name Detection ──
    // First substantial line that doesn't look like contact info
    for (const line of lines.slice(0, 8)) {
        const lower = line.toLowerCase();
        if (
            !line.includes('@') &&
            !line.match(/^\+?\d/) &&
            !line.includes('http') &&
            !line.includes('linkedin') &&
            !line.includes('github') &&
            !isSectionHeader(line) &&
            line.length > 2 &&
            line.length < 60 &&
            // Likely a name: mostly letters and spaces
            /^[A-Z\u00C0-\u024F]/.test(line) &&
            line.split(/\s+/).length <= 5
        ) {
            result.fullName = line;
            break;
        }
    }

    // ── Job Title Detection ──
    const nameIndex = lines.indexOf(result.fullName);
    if (nameIndex >= 0) {
        // Check the next few lines for a job title
        for (let i = nameIndex + 1; i < Math.min(nameIndex + 4, lines.length); i++) {
            const candidateLine = lines[i];
            if (
                candidateLine &&
                !candidateLine.includes('@') &&
                !candidateLine.match(/^\+?\d/) &&
                !candidateLine.includes('http') &&
                !isSectionHeader(candidateLine) &&
                candidateLine.length > 3 &&
                candidateLine.length < 80 &&
                // Filter out address-like lines
                !candidateLine.match(/\b\d{5}\b/) // zip code
            ) {
                result.jobTitle = candidateLine;
                break;
            }
        }
    }

    // ── Location Detection ──
    // Look for common location patterns in the first 10 lines
    for (const line of lines.slice(0, 15)) {
        // City, State/Country pattern
        const locationMatch = line.match(/([A-Z][a-zA-Z\s]+),\s*([A-Z]{2}(?:\s+\d{5})?|[A-Z][a-zA-Z\s]+)/);
        if (locationMatch && !line.includes('@') && line.length < 60) {
            result.location = locationMatch[0].trim();
            break;
        }
    }

    // ── Section Detection (Improved) ──
    const sectionHeaders: Record<string, string[]> = {
        'summary': ['summary', 'professional summary', 'about', 'about me', 'profile', 'objective', 'career objective', 'professional profile', 'executive summary', 'personal statement'],
        'experience': ['experience', 'work experience', 'employment', 'professional experience', 'work history', 'employment history', 'career history', 'relevant experience'],
        'education': ['education', 'academic background', 'qualifications', 'academic qualifications', 'educational background', 'academic history'],
        'skills': ['skills', 'technical skills', 'core competencies', 'competencies', 'expertise', 'core skills', 'key skills', 'professional skills', 'areas of expertise', 'technologies', 'tech stack'],
        'certifications': ['certifications', 'certificates', 'licenses', 'professional certifications', 'licenses & certifications', 'certifications & licenses'],
        'languages': ['languages', 'language', 'language skills', 'language proficiency'],
        'projects': ['projects', 'personal projects', 'key projects', 'notable projects', 'selected projects'],
        'awards': ['awards', 'honors', 'achievements', 'awards & honors'],
        'volunteer': ['volunteer', 'volunteer experience', 'community service'],
        'interests': ['interests', 'hobbies', 'hobbies & interests'],
        'references': ['references'],
    };

    // Flatten all header variants for matching
    const allHeaderVariants: { category: string; variant: string }[] = [];
    for (const [category, variants] of Object.entries(sectionHeaders)) {
        for (const variant of variants) {
            allHeaderVariants.push({ category, variant });
        }
    }
    // Sort by variant length descending so longer/more specific matches are tried first
    allHeaderVariants.sort((a, b) => b.variant.length - a.variant.length);

    interface SectionInfo {
        category: string;
        start: number;
        end: number;
        lines: string[];
    }

    const detectedSections: SectionInfo[] = [];

    for (let i = 0; i < lines.length; i++) {
        const normalizedLine = lines[i].toLowerCase().replace(/[^a-z\s&]/g, '').trim();
        // Also try without trailing/leading spaces in the original
        const normalizedLine2 = lines[i].toLowerCase().replace(/[^a-z\s]/g, '').trim();

        for (const { category, variant } of allHeaderVariants) {
            if (
                normalizedLine === variant ||
                normalizedLine2 === variant ||
                normalizedLine.startsWith(variant + ' ') ||
                normalizedLine.endsWith(' ' + variant) ||
                // Handle cases like "WORK EXPERIENCE:" or "Skills:"
                normalizedLine.replace(/\s+/g, ' ') === variant ||
                // Handle lines that are JUST the header (common in formatted PDFs)
                (normalizedLine.length < variant.length + 10 && normalizedLine.includes(variant))
            ) {
                detectedSections.push({ category, start: i, end: lines.length, lines: [] });
                break;
            }
        }
    }

    // Deduplicate: keep only the first occurrence of each category
    const seenCategories = new Set<string>();
    const uniqueSections: SectionInfo[] = [];
    for (const section of detectedSections) {
        if (!seenCategories.has(section.category)) {
            seenCategories.add(section.category);
            uniqueSections.push(section);
        }
    }

    // Sort by start position and set end boundaries
    uniqueSections.sort((a, b) => a.start - b.start);
    for (let i = 0; i < uniqueSections.length; i++) {
        const nextStart = i < uniqueSections.length - 1 ? uniqueSections[i + 1].start : lines.length;
        uniqueSections[i].end = nextStart;
        uniqueSections[i].lines = lines.slice(uniqueSections[i].start + 1, nextStart);
    }

    // Build a quick lookup
    const sectionByCategory: Record<string, SectionInfo> = {};
    for (const s of uniqueSections) {
        sectionByCategory[s.category] = s;
    }

    // ── Parse Summary ──
    if (sectionByCategory['summary']) {
        result.summary = sectionByCategory['summary'].lines
            .filter(l => l.length > 2)
            .join(' ')
            .trim();
    }

    // ── Parse Experience (Improved) ──
    if (sectionByCategory['experience']) {
        result.experience = parseExperienceLines(sectionByCategory['experience'].lines);
    }

    // ── Parse Education (Improved) ──
    if (sectionByCategory['education']) {
        result.education = parseEducationLines(sectionByCategory['education'].lines);
    }

    // ── Parse Skills (Improved) ──
    if (sectionByCategory['skills']) {
        result.skills = parseSkillLines(sectionByCategory['skills'].lines);
    }

    // ── Parse Languages ──
    if (sectionByCategory['languages']) {
        result.languages = sectionByCategory['languages'].lines
            .filter(l => l.length > 1)
            .map(l => l.replace(/^[•\-–—\*]\s*/, '').trim())
            .filter(Boolean);
    }

    // ── Parse Certifications ──
    if (sectionByCategory['certifications']) {
        result.certifications = sectionByCategory['certifications'].lines
            .filter(l => l.length > 2)
            .map(l => l.replace(/^[•\-–—\*]\s*/, '').trim())
            .filter(Boolean);
    }

    // ── Fallback: If no experience found, try harder ──
    if (result.experience.length === 0) {
        result.experience = fallbackExperienceParse(lines);
    }

    // ── Fallback: If no skills found, try extracting from raw text ──
    if (result.skills.length === 0) {
        result.skills = fallbackSkillsParse(text);
    }

    return result;
}

// ═══════════════════════════════════
// SECTION HEADER DETECTION
// ═══════════════════════════════════

const SECTION_HEADER_WORDS = new Set([
    'summary', 'experience', 'education', 'skills', 'certifications',
    'languages', 'projects', 'awards', 'references', 'volunteer',
    'interests', 'hobbies', 'objective', 'profile', 'competencies',
    'expertise', 'qualifications', 'employment', 'achievements',
    'honors', 'certificates', 'licenses', 'technologies',
]);

function isSectionHeader(line: string): boolean {
    const normalized = line.toLowerCase().replace(/[^a-z\s]/g, '').trim();
    if (normalized.length > 40) return false;
    const words = normalized.split(/\s+/);
    return words.some(w => SECTION_HEADER_WORDS.has(w));
}

// ═══════════════════════════════════
// EXPERIENCE PARSER (Improved)
// ═══════════════════════════════════

// Common date patterns found in resumes
const DATE_REGEX = /\b((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\.?\s*\d{2,4}|\d{1,2}\/\d{2,4}|\d{4})\s*(?:[-–—to\s]+)\s*((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\.?\s*\d{2,4}|\d{1,2}\/\d{2,4}|\d{4}|Present|Current|Now|Ongoing)/i;

const DATE_RANGE_LOOSE = /\b(\d{4})\s*[-–—]\s*(\d{4}|Present|Current|Now|Ongoing)\b/i;

function parseExperienceLines(lines: string[]): ParsedExperience[] {
    const experiences: ParsedExperience[] = [];
    let current: ParsedExperience | null = null;
    let descriptionLines: string[] = [];
    let titleCandidates: string[] = []; // Lines before a date line

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const dateMatch = line.match(DATE_REGEX) || line.match(DATE_RANGE_LOOSE);

        if (dateMatch) {
            // Save previous entry
            if (current) {
                current.description = descriptionLines.join('\n').trim();
                if (current.position || current.company) {
                    experiences.push(current);
                }
                descriptionLines = [];
            }

            // Try to determine position/company from context
            const datePart = dateMatch[0];
            const restOfLine = line.replace(datePart, '').replace(/^[\s|,\-–—]+/, '').replace(/[\s|,\-–—]+$/, '').trim();

            // Collect title candidates (non-date, non-bullet lines before this date)
            let position = '';
            let company = '';
            let location = '';

            // Check: is the date on a line with other text?
            if (restOfLine.length > 3) {
                // Date is on the same line as title/company
                const parsed = splitPositionCompany(restOfLine);
                position = parsed.position;
                company = parsed.company;
                location = parsed.location;
            }

            // Check preceding lines (up to 3 lines back) for title/company
            if (!position) {
                for (let back = 1; back <= 3 && i - back >= 0; back++) {
                    const prevLine = lines[i - back].trim();
                    // Skip empty, bullet points, and date-only lines
                    if (!prevLine || prevLine.match(/^[•\-–—\*]/) || prevLine.match(DATE_REGEX) || prevLine.match(DATE_RANGE_LOOSE)) {
                        continue;
                    }
                    // Don't go past a previous experience entry's description
                    if (current && descriptionLines.length > 0) break;

                    if (!position) {
                        const parsed = splitPositionCompany(prevLine);
                        position = parsed.position;
                        company = parsed.company || company;
                        location = parsed.location || location;
                    } else if (!company) {
                        company = prevLine;
                    }
                    break; // Only use the most recent preceding line
                }
            }

            // Check line after date for company if we only have position
            if (position && !company && i + 1 < lines.length) {
                const nextLine = lines[i + 1].trim();
                if (nextLine && !nextLine.match(/^[•\-–—\*]/) && !nextLine.match(DATE_REGEX) && nextLine.length < 80) {
                    company = nextLine.replace(/^[•\-–—\*]\s*/, '').trim();
                    // We'll skip this line in the description
                }
            }

            current = {
                position: position || 'Position',
                company: company || '',
                location: location || '',
                startDate: dateMatch[1] || '',
                endDate: dateMatch[2] || '',
                description: '',
            };

            titleCandidates = [];
        } else if (current) {
            // Accumulate description lines
            const cleaned = line.replace(/^[•\-–—\*]\s*/, '').trim();
            if (cleaned.length > 2) {
                // Check if this line looks like a bullet point / description
                const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('–') || line.trim().startsWith('*');
                if (isBullet) {
                    descriptionLines.push('• ' + cleaned);
                } else if (cleaned.length > 15) {
                    // Long lines are likely descriptions
                    descriptionLines.push('• ' + cleaned);
                }
                // Short non-bullet lines might be sub-headers, skip them or add as-is
            }
        } else {
            // Before any experience entry, these could be title candidates
            titleCandidates.push(line);
        }
    }

    // Push last entry
    if (current) {
        current.description = descriptionLines.join('\n').trim();
        if (current.position || current.company) {
            experiences.push(current);
        }
    }

    return experiences;
}

function splitPositionCompany(line: string): { position: string; company: string; location: string } {
    let position = '';
    let company = '';
    let location = '';

    // Common separators: " at ", " - ", " | ", ", "
    const separators = [' at ', ' | ', ' — ', ' – ', ' - '];
    for (const sep of separators) {
        if (line.includes(sep)) {
            const parts = line.split(sep);
            position = parts[0].trim();
            const rest = parts.slice(1).join(sep).trim();

            // Check if rest contains location (e.g., "Company, City, State")
            const locMatch = rest.match(/,\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:,\s*[A-Z]{2})?)$/);
            if (locMatch) {
                company = rest.slice(0, rest.indexOf(locMatch[0])).trim();
                location = locMatch[1].trim();
            } else {
                company = rest;
            }
            return { position, company, location };
        }
    }

    // If no separator, treat the whole line as position
    position = line;

    // Check for trailing location
    const locMatch = line.match(/,\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:,\s*[A-Z]{2})?)$/);
    if (locMatch) {
        position = line.slice(0, line.indexOf(locMatch[0])).trim();
        location = locMatch[1].trim();
    }

    return { position, company, location };
}

// ═══════════════════════════════════
// EDUCATION PARSER (Improved)
// ═══════════════════════════════════

const DEGREE_PATTERNS = /\b(Bachelor|Master|PhD|Doctorate|MBA|BSc|MSc|BA|MA|B\.S\.|M\.S\.|B\.A\.|M\.A\.|B\.E\.|M\.E\.|Associate|Diploma|Certificate|BEng|MEng|B\.Tech|M\.Tech|BCom|MCom|LLB|LLM|MD|DDS|PharmD|Doctor of|Juris Doctor|JD)\b/i;

const UNIVERSITY_KEYWORDS = /\b(University|College|Institute|School|Academy|Polytechnic|Universit[éy])\b/i;

function parseEducationLines(lines: string[]): ParsedEducation[] {
    const educations: ParsedEducation[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i].replace(/^[•\-–—\*]\s*/, '').trim();
        if (!line || line.length < 3) { i++; continue; }

        const hasDegree = DEGREE_PATTERNS.test(line);
        const hasUniversity = UNIVERSITY_KEYWORDS.test(line);

        if (hasDegree || hasUniversity) {
            const edu: ParsedEducation = {
                degree: '',
                institution: '',
                field: '',
                endDate: '',
            };

            if (hasDegree && hasUniversity) {
                // Both on same line, try to split
                edu.degree = line;
                edu.institution = line;
            } else if (hasDegree) {
                edu.degree = line;
                // Next line might be institution
                if (i + 1 < lines.length) {
                    const nextLine = lines[i + 1].replace(/^[•\-–—\*]\s*/, '').trim();
                    if (nextLine && !DEGREE_PATTERNS.test(nextLine) && nextLine.length > 3) {
                        edu.institution = nextLine;
                        i++;
                    }
                }
            } else if (hasUniversity) {
                edu.institution = line;
                // Next line might be degree
                if (i + 1 < lines.length) {
                    const nextLine = lines[i + 1].replace(/^[•\-–—\*]\s*/, '').trim();
                    if (nextLine && DEGREE_PATTERNS.test(nextLine)) {
                        edu.degree = nextLine;
                        i++;
                    }
                }
            }

            // Extract year from degree + institution text
            const combinedText = edu.degree + ' ' + edu.institution;
            const yearMatch = combinedText.match(/\b(20\d{2}|19\d{2})\b/g);
            if (yearMatch) {
                edu.endDate = yearMatch[yearMatch.length - 1]; // last year mentioned
                edu.degree = edu.degree.replace(/\b(20\d{2}|19\d{2})\b/g, '').trim();
                edu.institution = edu.institution.replace(/\b(20\d{2}|19\d{2})\b/g, '').trim();
            }

            // Also check for date ranges
            const dateRangeMatch = combinedText.match(DATE_RANGE_LOOSE);
            if (dateRangeMatch) {
                edu.endDate = dateRangeMatch[2];
                edu.degree = edu.degree.replace(DATE_RANGE_LOOSE, '').trim();
                edu.institution = edu.institution.replace(DATE_RANGE_LOOSE, '').trim();
            }

            // Clean up separators
            edu.degree = edu.degree.replace(/^[\s,\-–—|]+|[\s,\-–—|]+$/g, '').trim();
            edu.institution = edu.institution.replace(/^[\s,\-–—|]+|[\s,\-–—|]+$/g, '').trim();

            // Try extracting field of study
            const fieldMatch = edu.degree.match(/\b(?:in|of)\s+(.+)/i);
            if (fieldMatch) {
                edu.field = fieldMatch[1].trim();
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
// SKILLS PARSER (Improved)
// ═══════════════════════════════════

function parseSkillLines(lines: string[]): string[] {
    const skills: string[] = [];

    for (const line of lines) {
        const cleaned = line.replace(/^[•\-–—\*]\s*/, '').trim();
        if (!cleaned || cleaned.length < 2) continue;

        // Handle "Category: skill1, skill2, skill3" format
        const colonSplit = cleaned.match(/^(.+?):\s*(.+)$/);
        if (colonSplit) {
            const skillList = colonSplit[2];
            const parts = skillList.split(/[,|•;]/).map(s => s.trim()).filter(s => s.length > 1);
            skills.push(...parts);
            continue;
        }

        // Handle comma, pipe, semicolon, or bullet separated lists
        if (cleaned.includes(',') || cleaned.includes('|') || cleaned.includes(';') || cleaned.includes('•')) {
            const parts = cleaned.split(/[,|•;]/).map(s => s.trim()).filter(s => s.length > 1);
            skills.push(...parts);
        } else {
            // Single skill per line — accept up to reasonable length
            if (cleaned.length < 60) {
                skills.push(cleaned);
            }
        }
    }

    return [...new Set(skills)]; // deduplicate
}

// ═══════════════════════════════════
// FALLBACK PARSERS
// ═══════════════════════════════════

function fallbackExperienceParse(lines: string[]): ParsedExperience[] {
    // Try to find any date ranges in the document and build experience entries around them
    const experiences: ParsedExperience[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const dateMatch = line.match(DATE_REGEX) || line.match(DATE_RANGE_LOOSE);

        if (dateMatch) {
            const prevLine = i > 0 ? lines[i - 1].trim() : '';
            const restOfLine = line.replace(dateMatch[0], '').trim().replace(/^[\s|,\-–—]+/, '').trim();

            // Only treat as experience if near a substantial text
            if (prevLine.length > 3 || restOfLine.length > 3) {
                const parsed = splitPositionCompany(prevLine || restOfLine);
                const descLines: string[] = [];

                // Collect description lines after the date
                for (let j = i + 1; j < lines.length && j < i + 20; j++) {
                    const descLine = lines[j];
                    if (descLine.match(DATE_REGEX) || descLine.match(DATE_RANGE_LOOSE)) break;
                    if (isSectionHeader(descLine)) break;
                    const cleaned = descLine.replace(/^[•\-–—\*]\s*/, '').trim();
                    if (cleaned.length > 5) {
                        descLines.push('• ' + cleaned);
                    }
                }

                experiences.push({
                    position: parsed.position || 'Position',
                    company: parsed.company || '',
                    location: parsed.location || '',
                    startDate: dateMatch[1] || '',
                    endDate: dateMatch[2] || '',
                    description: descLines.join('\n'),
                });
            }
        }
    }

    return experiences;
}

// Common tech skills for fallback extraction
const KNOWN_SKILLS = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby',
    'PHP', 'Swift', 'Kotlin', 'Dart', 'Scala', 'R', 'MATLAB',
    'React', 'Angular', 'Vue', 'Next.js', 'Nuxt', 'Svelte',
    'Node.js', 'Express', 'Django', 'Flask', 'FastAPI', 'Spring', 'Rails',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
    'GraphQL', 'REST', 'gRPC', 'WebSocket',
    'Git', 'CI/CD', 'Jenkins', 'GitHub Actions',
    'HTML', 'CSS', 'SASS', 'Tailwind', 'Bootstrap',
    'Figma', 'Sketch', 'Adobe XD',
    'Agile', 'Scrum', 'Kanban', 'JIRA',
    'Linux', 'Windows', 'macOS',
    'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy',
    'Firebase', 'Supabase', 'Vercel', 'Netlify', 'Heroku',
    'SQL', 'NoSQL', 'Prisma', 'Sequelize', 'SQLAlchemy',
    'Photoshop', 'Illustrator', 'InDesign', 'After Effects',
    'Power BI', 'Tableau', 'Excel', 'Google Analytics',
    'Salesforce', 'HubSpot', 'Zendesk', 'SAP',
    'WordPress', 'Shopify', 'Magento', 'WooCommerce',
    'Unity', 'Unreal Engine', 'Blender',
    'ROS', 'MATLAB', 'Simulink', 'LabVIEW',
    'Solidity', 'Web3', 'Blockchain', 'Ethereum',
];

function fallbackSkillsParse(text: string): string[] {
    const found: string[] = [];
    for (const skill of KNOWN_SKILLS) {
        // Case-insensitive but preserve original casing
        const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(text)) {
            found.push(skill);
        }
    }
    return found;
}
