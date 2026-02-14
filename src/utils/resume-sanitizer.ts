import { Resume } from '@/types/resume';
import { defaultSections, defaultSettings } from './sample-data';

export function sanitizeResume(resume: Partial<Resume>): Resume {
    return {
        id: resume.id || 'unknown',
        title: (resume.title && !resume.title.includes('undefined')) ? resume.title : 'Untitled Resume',
        createdAt: resume.createdAt || new Date().toISOString(),
        updatedAt: resume.updatedAt || new Date().toISOString(),
        personalInfo: {
            fullName: '',
            jobTitle: '',
            email: '',
            phone: '',
            location: '',
            website: '',
            linkedin: '',
            github: '',
            summary: '',
            photo: '',
            ...(resume.personalInfo || {})
        },
        experience: Array.isArray(resume.experience) ? resume.experience : [],
        education: Array.isArray(resume.education) ? resume.education : [],
        skills: Array.isArray(resume.skills) ? resume.skills : [],
        languages: Array.isArray(resume.languages) ? resume.languages : [],
        projects: Array.isArray(resume.projects) ? resume.projects : [],
        certifications: Array.isArray(resume.certifications) ? resume.certifications : [],
        awards: Array.isArray(resume.awards) ? resume.awards : [],
        customSections: Array.isArray(resume.customSections) ? resume.customSections : [],
        sections: (Array.isArray(resume.sections) && resume.sections.length > 0) ? resume.sections : [...defaultSections],
        settings: resume.settings || { ...defaultSettings },
    } as Resume;
}
