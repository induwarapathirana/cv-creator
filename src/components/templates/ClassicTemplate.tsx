'use client';

import { Resume } from '@/types/resume';
import { defaultSettings } from '@/utils/sample-data';
import { SectionTitle, EntryHeader, ResumeHtmlContent, SkillBadge, ContactItem, formatDate } from './shared/ResumeComponents';

interface TemplateProps {
    resume: Resume;
    scale?: number;
}

export default function ClassicTemplate({ resume, scale = 1 }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const visibleSections = (Array.isArray(sections) ? sections : []).filter(s => s.visible).sort((a, b) => a.order - b.order);
    const primaryColor = settings.colors.primary;

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: settings.font + ', serif',
                fontSize: settings.fontSize + 'px',
                lineHeight: settings.lineHeight,
                padding: settings.pageMargin + 'px',
                color: '#333',
                backgroundColor: 'white',
            }}
        >
            <div className="resume-template">
                {/* Header - Traditional Centered */}
                <div style={{ marginBottom: settings.sectionSpacing + 'px', textAlign: 'center', borderBottom: '2px solid #1a1a2e', paddingBottom: '1.2em' }}>
                    <h1 style={{ color: '#1a1a2e', fontSize: '2.2em', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>
                        {personalInfo.fullName || 'Your Name'}
                    </h1>
                    {personalInfo.jobTitle && (
                        <p style={{ fontSize: '1.1em', color: '#4b5563', marginTop: 4, fontStyle: 'italic', fontWeight: 500 }}>
                            {personalInfo.jobTitle}
                        </p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px 16px', marginTop: 12 }}>
                        {personalInfo.email && <ContactItem text={personalInfo.email} color="#1a1a2e" />}
                        {personalInfo.phone && <ContactItem text={personalInfo.phone} color="#1a1a2e" />}
                        {personalInfo.location && <ContactItem text={personalInfo.location} color="#1a1a2e" />}
                        {personalInfo.linkedin && <ContactItem text="LinkedIn" href={personalInfo.linkedin} color="#1a1a2e" />}
                        {personalInfo.website && <ContactItem text="Portfolio" href={personalInfo.website} color="#1a1a2e" />}
                    </div>
                </div>

                {visibleSections.map((section) => {
                    if (section.type === 'personalInfo') return null;

                    switch (section.type) {
                        case 'summary':
                            return personalInfo.summary ? (
                                <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <SectionTitle title={section.title} color={primaryColor} variant="classic" />
                                    <ResumeHtmlContent html={personalInfo.summary} />
                                </div>
                            ) : null;

                        case 'experience':
                            return experience.length > 0 ? (
                                <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <SectionTitle title={section.title} color={primaryColor} variant="classic" />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {experience.map((exp: any) => (
                                            <div key={exp.id}>
                                                <EntryHeader
                                                    title={exp.position}
                                                    subtitle={exp.company}
                                                    date={`${formatDate(exp.startDate)} — ${exp.current ? 'Present' : formatDate(exp.endDate)}`}
                                                />
                                                {exp.description && <ResumeHtmlContent html={exp.description} />}
                                                {exp.highlights && exp.highlights.length > 0 && (
                                                    <ul style={{ margin: '6px 0 0 20px', padding: 0, fontSize: 'inherit', color: '#374151' }}>
                                                        {exp.highlights.filter(Boolean).map((h: string, i: number) => (
                                                            <li key={i} style={{ marginBottom: '2px' }}>{h}</li>
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
                                    <SectionTitle title={section.title} color={primaryColor} variant="classic" />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {education.map((edu: any) => (
                                            <div key={edu.id}>
                                                <EntryHeader
                                                    title={edu.institution}
                                                    subtitle={`${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`}
                                                    date={`${formatDate(edu.startDate)} — ${formatDate(edu.endDate)}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null;

                        case 'skills':
                            return skills.length > 0 ? (
                                <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <SectionTitle title={section.title} color={primaryColor} variant="classic" />
                                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                        {skills.map((s: any) => <SkillBadge key={s.id} name={s.name} color={primaryColor} />)}
                                    </div>
                                </div>
                            ) : null;

                        case 'projects':
                            return projects.length > 0 ? (
                                <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <SectionTitle title={section.title} color={primaryColor} variant="classic" />
                                    {projects.map((proj: any) => (
                                        <div key={proj.id} style={{ marginBottom: '12px' }}>
                                            <EntryHeader title={proj.name} date={formatDate(proj.startDate)} />
                                            <ResumeHtmlContent html={proj.description} />
                                        </div>
                                    ))}
                                </div>
                            ) : null;

                        case 'certifications':
                            return certifications.length > 0 ? (
                                <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <SectionTitle title={section.title} color={primaryColor} variant="classic" />
                                    {certifications.map((cert: any) => (
                                        <div key={cert.id} style={{ marginBottom: '6px' }}>
                                            <EntryHeader title={cert.name} subtitle={cert.issuer} date={formatDate(cert.date)} />
                                        </div>
                                    ))}
                                </div>
                            ) : null;

                        case 'languages':
                            return languages.length > 0 ? (
                                <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <SectionTitle title={section.title} color={primaryColor} variant="classic" />
                                    <p style={{ fontSize: 'inherit', margin: 0 }}>
                                        {languages.map((l: any) => `${l.name} (${l.proficiency})`).join(' • ')}
                                    </p>
                                </div>
                            ) : null;

                        case 'awards':
                            return awards.length > 0 ? (
                                <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <SectionTitle title={section.title} color={primaryColor} variant="classic" />
                                    {awards.map((a: any) => (
                                        <div key={a.id} style={{ marginBottom: '6px' }}>
                                            <EntryHeader title={a.title} subtitle={a.issuer} date={formatDate(a.date)} />
                                        </div>
                                    ))}
                                </div>
                            ) : null;

                        case 'custom':
                            const customSection = resume.customSections?.find((cs: any) => cs.id === section.customSectionId);
                            return customSection && customSection.items.length > 0 ? (
                                <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <SectionTitle title={section.title || customSection.title} color={primaryColor} variant="classic" />
                                    {customSection.items.map((item: any) => (
                                        <div key={item.id} style={{ marginBottom: '12px' }}>
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
