'use client';

import { Resume } from '@/types/resume';
import { defaultSettings } from '@/utils/sample-data';
import { SectionTitle, EntryHeader, ResumeHtmlContent, SkillBadge, ContactItem, formatDate } from './shared/ResumeComponents';
import { FiMail, FiPhone, FiMapPin, FiLinkedin, FiGithub, FiGlobe } from 'react-icons/fi';

interface TemplateProps {
    resume: Resume;
    scale?: number;
}

export default function MinimalTemplate({ resume, scale = 1 }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const visibleSections = (Array.isArray(sections) ? sections : []).filter(s => s.visible).sort((a, b) => a.order - b.order);
    const primaryColor = settings.colors.primary;

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: settings.font + ', sans-serif',
                fontSize: settings.fontSize + 'px',
                lineHeight: settings.lineHeight,
                padding: settings.pageMargin + 'px',
            }}
        >
            <div className="resume-template">
                {/* Header - Left Aligned */}
                <div style={{ marginBottom: settings.sectionSpacing * 1.5 + 'px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 6, color: '#111827' }}>
                        {personalInfo.fullName || 'Your Name'}
                    </h1>
                    {personalInfo.jobTitle && (
                        <p style={{ fontSize: '16px', color: '#4b5563', fontWeight: 600, letterSpacing: '0.02em' }}>
                            {personalInfo.jobTitle}
                        </p>
                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', marginTop: 16 }}>
                        {personalInfo.email && <ContactItem icon={<FiMail />} text={personalInfo.email} color={primaryColor} />}
                        {personalInfo.phone && <ContactItem icon={<FiPhone />} text={personalInfo.phone} color={primaryColor} />}
                        {personalInfo.location && <ContactItem icon={<FiMapPin />} text={personalInfo.location} color={primaryColor} />}
                        {personalInfo.linkedin && <ContactItem icon={<FiLinkedin />} text="LinkedIn" href={personalInfo.linkedin} color={primaryColor} />}
                        {personalInfo.github && <ContactItem icon={<FiGithub />} text="GitHub" href={personalInfo.github} color={primaryColor} />}
                        {personalInfo.website && <ContactItem icon={<FiGlobe />} text="Portfolio" href={personalInfo.website} color={primaryColor} />}
                    </div>
                </div>

                {visibleSections.map((section) => {
                    if (section.type === 'personalInfo') return null;

                    switch (section.type) {
                        case 'summary':
                            return personalInfo.summary ? (
                                <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <ResumeHtmlContent html={personalInfo.summary} />
                                </div>
                            ) : null;

                        case 'experience':
                            return experience.length > 0 ? (
                                <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <SectionTitle title={section.title} color="#9ca3af" />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {experience.map((exp: any) => (
                                            <div key={exp.id}>
                                                <EntryHeader
                                                    title={exp.position}
                                                    subtitle={`${exp.company}${exp.location ? ` • ${exp.location}` : ''}`}
                                                    date={`${formatDate(exp.startDate)} — ${exp.current ? 'Present' : formatDate(exp.endDate)}`}
                                                />
                                                {exp.description && <ResumeHtmlContent html={exp.description} />}
                                                {exp.highlights && exp.highlights.length > 0 && (
                                                    <ul style={{ margin: '6px 0 0 16px', padding: 0, fontSize: '10pt', color: '#4b5563', lineHeight: 1.5 }}>
                                                        {exp.highlights.filter(Boolean).map((h: string, i: number) => (
                                                            <li key={i} style={{ marginBottom: '3px' }}>{h}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null;

                        case 'education':
                            return education.length > 0 ? (
                                <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <SectionTitle title={section.title} color="#9ca3af" />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {education.map((edu: any) => (
                                            <div key={edu.id}>
                                                <EntryHeader
                                                    title={edu.institution}
                                                    subtitle={`${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`}
                                                    date={`${formatDate(edu.startDate)} — ${formatDate(edu.endDate)}`}
                                                />
                                                {edu.gpa && <div style={{ fontSize: '9pt', color: '#6b7280', marginTop: '-2px' }}>GPA: {edu.gpa}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null;

                        case 'skills':
                            return skills.length > 0 ? (
                                <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <SectionTitle title={section.title} color="#9ca3af" />
                                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                        {skills.map((s: any) => <SkillBadge key={s.id} name={s.name} color={primaryColor} />)}
                                    </div>
                                </div>
                            ) : null;

                        case 'projects':
                            return projects.length > 0 ? (
                                <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <SectionTitle title={section.title} color="#9ca3af" />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {projects.map((proj: any) => (
                                            <div key={proj.id}>
                                                <EntryHeader
                                                    title={proj.name}
                                                    date={proj.startDate || proj.endDate ? `${formatDate(proj.startDate)}${proj.endDate ? ` — ${formatDate(proj.endDate)}` : ''}` : undefined}
                                                />
                                                <ResumeHtmlContent html={proj.description} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null;

                        case 'certifications':
                            return certifications.length > 0 ? (
                                <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <SectionTitle title={section.title} color="#9ca3af" />
                                    {certifications.map((cert: any) => (
                                        <div key={cert.id} style={{ marginBottom: '8px' }}>
                                            <EntryHeader title={cert.name} subtitle={cert.issuer} date={formatDate(cert.date)} />
                                        </div>
                                    ))}
                                </div>
                            ) : null;

                        case 'languages':
                            return languages.length > 0 ? (
                                <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <SectionTitle title={section.title} color="#9ca3af" />
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                        {languages.map((lang: any) => (
                                            <div key={lang.id} style={{ fontSize: '10pt' }}>
                                                <span style={{ fontWeight: 700, color: '#111827' }}>{lang.name}</span>
                                                <span style={{ color: '#6b7280' }}> ({lang.proficiency})</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null;

                        case 'awards':
                            return awards.length > 0 ? (
                                <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <SectionTitle title={section.title} color="#9ca3af" />
                                    {awards.map((award: any) => (
                                        <div key={award.id} style={{ marginBottom: '10px' }}>
                                            <EntryHeader title={award.title} subtitle={award.issuer} date={formatDate(award.date)} />
                                        </div>
                                    ))}
                                </div>
                            ) : null;

                        case 'custom':
                            const customSection = resume.customSections?.find((cs: any) => cs.id === section.customSectionId);
                            return customSection && customSection.items.length > 0 ? (
                                <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <SectionTitle title={section.title || customSection.title} color="#9ca3af" />
                                    {customSection.items.map((item: any) => (
                                        <div key={item.id} style={{ marginBottom: '16px' }}>
                                            <EntryHeader title={item.title} subtitle={item.subtitle} date={formatDate(item.date)} />
                                            <ResumeHtmlContent html={item.description} />
                                        </div>
                                    ))}
                                </div>
                            ) : null;

                        default: return null;
                    }
                })}
            </div>
        </div>
    );
}
