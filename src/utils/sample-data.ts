import { Resume, SectionConfig } from '@/types/resume';
import { v4 as uuidv4 } from 'uuid';

export const defaultSections: SectionConfig[] = [
    { id: 'sec-1', type: 'personalInfo', title: 'Personal Info', visible: true, order: 0, column: 'left' },
    { id: 'sec-2', type: 'summary', title: 'Professional Summary', visible: true, order: 1, column: 'right' },
    { id: 'sec-3', type: 'experience', title: 'Work Experience', visible: true, order: 2, column: 'right' },
    { id: 'sec-4', type: 'education', title: 'Education', visible: true, order: 3, column: 'left' },
    { id: 'sec-5', type: 'skills', title: 'Skills', visible: true, order: 4, column: 'left' },
    { id: 'sec-6', type: 'projects', title: 'Projects', visible: true, order: 5, column: 'right' },
    { id: 'sec-7', type: 'certifications', title: 'Certifications', visible: true, order: 6, column: 'left' },
    { id: 'sec-8', type: 'languages', title: 'Languages', visible: true, order: 7, column: 'left' },
    { id: 'sec-9', type: 'awards', title: 'Awards', visible: false, order: 8, column: 'left' },
];

export const defaultSettings = {
    template: 'modern',
    font: 'Inter',
    fontSize: 14,
    lineHeight: 1.5,
    colors: {
        primary: '#2563eb',
        text: '#1a1a2e',
        background: '#ffffff',
        accent: '#3b82f6',
    },
    sectionSpacing: 16,
    pageMargin: 40,
    usePaging: false,
};

export function createEmptyResume(title: string = 'Untitled Resume'): Resume {
    return {
        id: uuidv4(),
        title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
        },
        experience: [],
        education: [],
        skills: [],
        languages: [],
        projects: [],
        certifications: [],
        awards: [],
        customSections: [],
        sections: [...defaultSections],
        settings: { ...defaultSettings },
    };
}

export const sampleResume: Resume = {
    id: 'sample-1',
    title: 'Sample Resume',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    personalInfo: {
        fullName: 'Alex Johnson',
        jobTitle: 'Senior Software Engineer',
        email: 'alex.johnson@email.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        website: 'https://alexjohnson.dev',
        linkedin: 'linkedin.com/in/alexjohnson',
        github: 'github.com/alexjohnson',
        summary:
            'Passionate software engineer with 7+ years of experience building scalable web applications. Expert in React, TypeScript, and Node.js with a track record of leading high-impact projects. Committed to writing clean, maintainable code and mentoring junior developers.',
        photo: '',
    },
    experience: [
        {
            id: 'exp-1',
            company: 'TechCorp Inc.',
            position: 'Senior Software Engineer',
            location: 'San Francisco, CA',
            startDate: '2021-03',
            endDate: '',
            current: true,
            description: 'Lead engineer for the core platform team, responsible for architecture decisions and technical mentorship.',
            highlights: [
                'Led migration from monolith to microservices, reducing deployment time by 60%',
                'Architected real-time data pipeline processing 1M+ events/day',
                'Mentored 5 junior engineers, resulting in 3 promotions',
                'Reduced API response times by 40% through caching optimization',
            ],
        },
        {
            id: 'exp-2',
            company: 'StartupXYZ',
            position: 'Full Stack Developer',
            location: 'Remote',
            startDate: '2018-06',
            endDate: '2021-02',
            current: false,
            description: 'Full-stack development role building customer-facing products from scratch.',
            highlights: [
                'Built and launched SaaS product serving 10,000+ users',
                'Implemented CI/CD pipeline reducing release cycles from weekly to daily',
                'Designed RESTful APIs consumed by web and mobile clients',
            ],
        },
    ],
    education: [
        {
            id: 'edu-1',
            institution: 'University of California, Berkeley',
            degree: "Bachelor's",
            field: 'Computer Science',
            location: 'Berkeley, CA',
            startDate: '2014-09',
            endDate: '2018-05',
            gpa: '3.8',
            description: 'Dean\'s List, ACM Club President',
        },
    ],
    skills: [
        { id: 'sk-1', name: 'React', level: 5, category: 'Frontend' },
        { id: 'sk-2', name: 'TypeScript', level: 5, category: 'Languages' },
        { id: 'sk-3', name: 'Node.js', level: 4, category: 'Backend' },
        { id: 'sk-4', name: 'Python', level: 4, category: 'Languages' },
        { id: 'sk-5', name: 'PostgreSQL', level: 4, category: 'Database' },
        { id: 'sk-6', name: 'AWS', level: 4, category: 'Cloud' },
        { id: 'sk-7', name: 'Docker', level: 4, category: 'DevOps' },
        { id: 'sk-8', name: 'GraphQL', level: 3, category: 'Backend' },
        { id: 'sk-9', name: 'Next.js', level: 5, category: 'Frontend' },
        { id: 'sk-10', name: 'Git', level: 5, category: 'Tools' },
    ],
    languages: [
        { id: 'lang-1', name: 'English', proficiency: 'native' },
        { id: 'lang-2', name: 'Spanish', proficiency: 'intermediate' },
    ],
    projects: [
        {
            id: 'proj-1',
            name: 'OpenSource Dashboard',
            description: 'An analytics dashboard for open-source project maintainers, tracking contributions, issues, and community growth.',
            technologies: ['React', 'D3.js', 'Node.js', 'MongoDB'],
            liveUrl: 'https://osdashboard.dev',
            repoUrl: 'https://github.com/alexjohnson/os-dashboard',
            startDate: '2022-01',
            endDate: '2022-06',
        },
    ],
    certifications: [
        {
            id: 'cert-1',
            name: 'AWS Solutions Architect Associate',
            issuer: 'Amazon Web Services',
            date: '2022-03',
            expiryDate: '2025-03',
            credentialId: 'AWS-SAA-123456',
            url: '',
        },
    ],
    awards: [
        {
            id: 'award-1',
            title: 'Innovation Award',
            issuer: 'TechCorp Inc.',
            date: '2023-12',
            description: 'Recognized for pioneering the real-time analytics platform.',
        },
    ],
    customSections: [],
    sections: [...defaultSections],
    settings: { ...defaultSettings },
};
