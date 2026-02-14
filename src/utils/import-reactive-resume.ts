import { Resume, SectionType, SectionConfig } from '@/types/resume';
import { defaultSections, defaultSettings } from './sample-data';
import { v4 as uuidv4 } from 'uuid';

export function importReactiveResumeJson(json: any): Resume | null {
    try {
        if (!json || !json.basics) {
            console.error('Invalid Reactive Resume JSON: Missing basics');
            return null;
        }

        const newResume: Resume = {
            id: uuidv4(),
            title: json.basics.name ? `${json.basics.name}'s Resume` : 'Imported Resume',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            // placeholders removed as it does not exist in Resume type
            personalInfo: {
                fullName: json.basics.name || '',
                jobTitle: json.basics.headline || '',
                email: json.basics.email || '',
                phone: json.basics.phone || '',
                location: typeof json.basics.location === 'string' ? json.basics.location : (json.basics.location?.address || json.basics.location?.city || ''),
                website: json.basics.url?.href || (typeof json.basics.url === 'string' ? json.basics.url : ''),
                linkedin: '', // Will try to find in profiles
                github: '', // Will try to find in profiles
                summary: json.sections?.summary?.content || json.basics.summary || '',
                photo: json.basics.picture?.url || '',
            },
            experience: [],
            education: [],
            skills: [],
            languages: [],
            projects: [],
            certifications: [],
            awards: [],
            customSections: [],
            sections: defaultSections.map(s => ({ ...s })), // Deep copy (1 level) to avoid mutating shared defaultSections
            settings: { ...defaultSettings },
        };

        // Network profiles mapping
        if (json.sections?.profiles?.items) {
            json.sections.profiles.items.forEach((item: any) => {
                const network = item.network.toLowerCase();
                if (network.includes('linkedin')) {
                    newResume.personalInfo.linkedin = item.url?.href || item.url || '';
                } else if (network.includes('github')) {
                    newResume.personalInfo.github = item.url?.href || item.url || '';
                }
            });
        }

        // Map Sections
        if (json.sections) {
            // Experience
            if (json.sections.experience?.items) {
                newResume.experience = json.sections.experience.items.map((item: any) => ({
                    id: uuidv4(),
                    company: item.company || item.name || '',
                    position: item.position || '',
                    location: item.location || '',
                    startDate: item.date?.split(' - ')[0] || item.startDate || '',
                    endDate: item.date?.split(' - ')[1] || item.endDate || '',
                    current: item.date?.toLowerCase().includes('present') || false,
                    description: item.summary || '', // Reactive Resume uses 'summary' for description
                    highlights: item.highlights || [],
                }));
            }

            // Education
            if (json.sections.education?.items) {
                newResume.education = json.sections.education.items.map((item: any) => ({
                    id: uuidv4(),
                    institution: item.institution || '',
                    degree: item.area || item.studyType || '',
                    field: item.studyType || item.area || '', // Fallback swap
                    startDate: item.date?.split(' - ')[0] || item.startDate || '',
                    endDate: item.date?.split(' - ')[1] || item.endDate || '',
                    gpa: item.score || '',
                    description: item.summary || '',
                    location: '',
                }));
            }

            // Skills
            if (json.sections.skills?.items) {
                newResume.skills = json.sections.skills.items.flatMap((item: any) => {
                    // Reactive Resume groups by category (item.name is category, keywords are skills)
                    // We flatten this to our Skill[] structure
                    // Logic: Create a skill entry for each keyword, set category to item.name
                    return (item.keywords || []).map((keyword: string) => ({
                        id: uuidv4(),
                        name: keyword,
                        level: 3, // Default level
                        category: item.name || 'General',
                    }));
                });
            }

            // Projects
            if (json.sections.projects?.items) {
                newResume.projects = json.sections.projects.items.map((item: any) => ({
                    id: uuidv4(),
                    name: item.name || '',
                    description: item.description || item.summary || '',
                    technologies: item.keywords || [],
                    liveUrl: item.url?.href || '',
                    repoUrl: '',
                    startDate: item.date?.split(' - ')[0] || item.startDate || '',
                    endDate: item.date?.split(' - ')[1] || item.endDate || '',
                }));
            }

            // Certifications
            if (json.sections.certifications?.items) {
                newResume.certifications = json.sections.certifications.items.map((item: any) => ({
                    id: uuidv4(),
                    name: item.name || '',
                    issuer: item.issuer || '',
                    date: item.date || '',
                    expiryDate: '',
                    credentialId: '',
                    url: item.url?.href || '',
                }));
            }

            // Awards
            if (json.sections.awards?.items) {
                newResume.awards = json.sections.awards.items.map((item: any) => ({
                    id: uuidv4(),
                    title: item.title || item.name || '',
                    issuer: item.awarder || item.issuer || '',
                    date: item.date || '',
                    description: item.summary || '',
                }));
            }

            // Languages
            if (json.sections.languages?.items) {
                newResume.languages = json.sections.languages.items.map((item: any) => ({
                    id: uuidv4(),
                    name: item.name || item.language || '',
                    proficiency: item.fluency || item.level || 'Native',
                }));
            }

            // Custom Sections (e.g. custom.xxxx)
            if (json.sections.custom) {
                // In RR, custom sections are objects under 'custom' key with random IDs
                Object.keys(json.sections.custom).forEach(key => {
                    const customSecString = json.sections.custom[key];
                    // In the provided JSON, custom sections are direct keys in 'sections' with id 'custom.xxx' OR they are within 'custom' object? 
                    // Wait, looking at user JSON:
                    // "custom": { "id": "custom.klm...", "name": "Leadership...", "items": [...] }
                    // Actually in the user JSON, 'custom' is a key in 'sections' which contains objects keyed by ID?
                    // "sections": { ... "custom": { "klm...": { name: "...", items: [] } } }

                    // Let's parse that structure based on the user provided JSON
                    // "custom": { "klm...": { "name": "Leadership", ... "items": [...] } }

                    // We need to iterate over keys of json.sections.custom
                    const customSectionData = json.sections.custom[key];
                    if (customSectionData && customSectionData.items) {
                        const newCustomSectionId = uuidv4();

                        const newCustomSection = {
                            id: newCustomSectionId,
                            title: customSectionData.name || 'Custom Section',
                            items: customSectionData.items.map((item: any) => ({
                                id: uuidv4(),
                                title: item.name || item.title || '',
                                description: item.summary || item.description || '',
                                date: item.date || '',
                            })),
                        };
                        newResume.customSections.push(newCustomSection);

                        // Add to section config
                        newResume.sections.push({
                            id: uuidv4(),
                            type: 'custom',
                            title: newCustomSection.title,
                            visible: true,
                            order: 99, // Append to end
                            customSectionId: newCustomSectionId,
                            column: 'left' // Default to a column
                        });
                    }
                });
            }
        }

        // Settings / Metadata mapping (Optional)
        // json.metadata.theme ...

        return newResume;

    } catch (e) {
        console.error('Import failed', e);
        return null;
    }
}
