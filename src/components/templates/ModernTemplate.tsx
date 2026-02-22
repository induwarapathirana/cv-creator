'use client';

import { Resume } from '@/types/resume';
import { defaultSettings } from '@/utils/sample-data';
import { SectionTitle, EntryHeader, ResumeHtmlContent, SkillBadge, SkillsGrouped, ContactItem, formatDate } from './shared/ResumeComponents';
import { FiMail, FiPhone, FiMapPin, FiLinkedin, FiGithub, FiGlobe } from 'react-icons/fi';

interface TemplateProps {
    resume: Resume;
    scale?: number;
}

export default function ModernTemplate({ resume, scale = 1 }: TemplateProps) {
    const { personalInfo } = resume;
    const experience = Array.isArray(resume.experience) ? resume.experience : [];
    const education = Array.isArray(resume.education) ? resume.education : [];
    const skills = Array.isArray(resume.skills) ? resume.skills : [];
    const projects = Array.isArray(resume.projects) ? resume.projects : [];
    const certifications = Array.isArray(resume.certifications) ? resume.certifications : [];
    const languages = Array.isArray(resume.languages) ? resume.languages : [];
    const sections = Array.isArray(resume.sections) ? resume.sections : [];

    const settings = resume.settings || defaultSettings;
    const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);
    const primaryColor = settings.colors.primary;

    const leftSections = visibleSections.filter(s => s.column === 'left');
    const rightSections = visibleSections.filter(s => s.column !== 'left');

    const renderSection = (section: any) => {
        switch (section.type) {
            case 'personalInfo':
                return (
                    <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                        <h1 style={{ color: primaryColor, fontSize: '2.5em', lineHeight: 1.1, letterSpacing: '-0.03em', fontWeight: 900, marginBottom: '6px' }}>
                            {personalInfo.fullName || 'Your Name'}
                        </h1>
                        {personalInfo.jobTitle && (
                            <p style={{ fontSize: '1.2em', color: 'inherit', opacity: 0.7, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
                                {personalInfo.jobTitle}
                            </p>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {personalInfo.email && <ContactItem icon={<FiMail />} text={personalInfo.email} color={primaryColor} />}
                            {personalInfo.phone && <ContactItem icon={<FiPhone />} text={personalInfo.phone} color={primaryColor} />}
                            {personalInfo.location && <ContactItem icon={<FiMapPin />} text={personalInfo.location} color={primaryColor} />}
                            {personalInfo.linkedin && <ContactItem icon={<FiLinkedin />} text="LinkedIn" href={personalInfo.linkedin} color={primaryColor} />}
                            {personalInfo.github && <ContactItem icon={<FiGithub />} text="GitHub" href={personalInfo.github} color={primaryColor} />}
                            {personalInfo.website && <ContactItem icon={<FiGlobe />} text="Portfolio" href={personalInfo.website} color={primaryColor} />}
                        </div>
                    </div>
                );

            case 'summary':
                return personalInfo.summary ? (
                    <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                        <SectionTitle title={section.title} color={primaryColor} />
                        <ResumeHtmlContent html={personalInfo.summary} />
                    </div>
                ) : null;

            case 'experience':
                return experience.length > 0 ? (
                    <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                        <SectionTitle title={section.title} color={primaryColor} />
                        {experience.map((exp) => (
                            <div key={exp.id} style={{ marginBottom: '16px' }}>
                                <EntryHeader
                                    title={exp.position}
                                    subtitle={`${exp.company}${exp.location ? ` • ${exp.location}` : ''}`}
                                    date={`${formatDate(exp.startDate)} — ${exp.current ? 'Present' : formatDate(exp.endDate)}`}
                                />
                                {exp.description && <ResumeHtmlContent html={exp.description} />}
                                {exp.highlights && exp.highlights.length > 0 && (
                                    <ul style={{ margin: '6px 0 0 16px', padding: 0, fontSize: '0.9em', color: '#374151', lineHeight: 'inherit' }}>
                                        {exp.highlights.filter(Boolean).map((h, i) => (
                                            <li key={i} style={{ marginBottom: '3px' }}>{h}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                ) : null;

            case 'education':
                return education.length > 0 ? (
                    <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                        <SectionTitle title={section.title} color={primaryColor} />
                        {education.map((edu) => (
                            <div key={edu.id} style={{ marginBottom: '14px' }}>
                                <EntryHeader
                                    title={edu.institution}
                                    subtitle={`${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`}
                                    date={`${formatDate(edu.startDate)} — ${formatDate(edu.endDate)}`}
                                />
                                {edu.gpa && <div style={{ fontSize: '0.85em', color: '#666', marginTop: '-2px', marginBottom: '4px' }}>GPA: {edu.gpa}</div>}
                                {edu.description && <ResumeHtmlContent html={edu.description} />}
                            </div>
                        ))}
                    </div>
                ) : null;

            case 'skills':
                return skills.length > 0 ? (
                    <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                        <SectionTitle title={section.title} color={primaryColor} />
                        <SkillsGrouped skills={skills} color={primaryColor} />
                    </div>
                ) : null;

            case 'projects':
                return projects.length > 0 ? (
                    <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                        <SectionTitle title={section.title} color={primaryColor} />
                        {projects.map((proj) => (
                            <div key={proj.id} style={{ marginBottom: '14px' }}>
                                <EntryHeader
                                    title={proj.name}
                                    date={proj.startDate || proj.endDate ? `${formatDate(proj.startDate)}${proj.endDate ? ` — ${formatDate(proj.endDate)}` : ''}` : undefined}
                                />
                                {proj.technologies && proj.technologies.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '-2px', marginBottom: '6px' }}>
                                        {proj.technologies.map((tech, i) => (
                                            <span key={i} style={{ fontSize: '0.8em', color: primaryColor, fontWeight: 600, marginRight: '8px' }}>
                                                {tech}{i < proj.technologies.length - 1 ? ' •' : ''}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <ResumeHtmlContent html={proj.description} />
                            </div>
                        ))}
                    </div>
                ) : null;

            case 'certifications':
                return certifications.length > 0 ? (
                    <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                        <SectionTitle title={section.title} color={primaryColor} />
                        {certifications.map((cert) => (
                            <div key={cert.id} style={{ marginBottom: '8px' }}>
                                <EntryHeader
                                    title={cert.name}
                                    subtitle={cert.issuer}
                                    date={formatDate(cert.date)}
                                />
                            </div>
                        ))}
                    </div>
                ) : null;

            case 'languages':
                return languages.length > 0 ? (
                    <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                        <SectionTitle title={section.title} color={primaryColor} />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
                            {languages.map((lang) => (
                                <div key={lang.id} style={{ fontSize: '0.9em' }}>
                                    <div style={{ fontWeight: 700, color: '#1a1a2e' }}>{lang.name}</div>
                                    <div style={{ fontSize: '0.85em', color: '#666' }}>{lang.proficiency}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null;

            case 'awards':
                return resume.awards && resume.awards.length > 0 ? (
                    <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                        <SectionTitle title={section.title} color={primaryColor} />
                        {resume.awards.map((award) => (
                            <div key={award.id} style={{ marginBottom: '10px' }}>
                                <EntryHeader
                                    title={award.title}
                                    subtitle={award.issuer}
                                    date={formatDate(award.date)}
                                />
                                {award.description && <ResumeHtmlContent html={award.description} />}
                            </div>
                        ))}
                    </div>
                ) : null;

            case 'custom':
                const customSection = resume.customSections?.find(cs => cs.id === section.customSectionId);
                return customSection && customSection.items.length > 0 ? (
                    <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                        <SectionTitle title={section.title || customSection.title} color={primaryColor} />
                        {customSection.items.map((item) => (
                            <div key={item.id} style={{ marginBottom: '14px' }}>
                                <EntryHeader
                                    title={item.title}
                                    subtitle={item.subtitle}
                                    date={formatDate(item.date)}
                                />
                                {item.description && <ResumeHtmlContent html={item.description} />}
                            </div>
                        ))}
                    </div>
                ) : null;

            default:
                return null;
        }
    };

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: settings.font + ', sans-serif',
                color: '#1a1a2e',
                backgroundColor: 'white',
                padding: 'var(--page-margin)',
            }}
        >
            <div className="resume-template" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 35%) minmax(0, 65%)', gap: '30px', height: '100%', alignItems: 'start' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {leftSections.map(renderSection)}
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {rightSections.map(renderSection)}
                </div>
            </div>
        </div>
    );
}
