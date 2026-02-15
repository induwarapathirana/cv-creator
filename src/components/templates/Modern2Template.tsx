import { Resume } from '@/types/resume';
import { defaultSettings } from '@/utils/sample-data';
import { SectionTitle, EntryHeader, ResumeHtmlContent, SkillBadge, ContactItem, formatDate } from './shared/ResumeComponents';
import { FiMail, FiPhone, FiMapPin, FiLinkedin, FiGithub, FiGlobe } from 'react-icons/fi';

interface TemplateProps {
    resume: Resume;
    scale?: number;
}

export default function Modern2Template({ resume }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const primaryColor = settings.colors.primary;
    const visibleSections = (Array.isArray(sections) ? sections : []).filter(s => s.visible).sort((a, b) => a.order - b.order);

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: settings.font + ', sans-serif',
                fontSize: settings.fontSize + 'px',
                lineHeight: settings.lineHeight,
                padding: settings.pageMargin + 'px',
                display: 'flex',
                flexDirection: 'column',
                gap: 30,
            }}
        >
            {/* Header - Modern Left Aligned */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: `2px solid ${primaryColor}1a`, paddingBottom: 24 }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
                        {personalInfo.fullName || 'Your Name'}
                    </h1>
                    {personalInfo.jobTitle && (
                        <p style={{ fontSize: '18px', color: primaryColor, fontWeight: 600, marginTop: 4 }}>
                            {personalInfo.jobTitle}
                        </p>
                    )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                    {personalInfo.email && <ContactItem icon={<FiMail />} text={personalInfo.email} color={primaryColor} />}
                    {personalInfo.phone && <ContactItem icon={<FiPhone />} text={personalInfo.phone} color={primaryColor} />}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '2px' }}>
                        {personalInfo.linkedin && <ContactItem icon={<FiLinkedin />} text="LinkedIn" href={personalInfo.linkedin} color={primaryColor} />}
                        {personalInfo.github && <ContactItem icon={<FiGithub />} text="GitHub" href={personalInfo.github} color={primaryColor} />}
                    </div>
                </div>
            </div>

            <div className="resume-template" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40 }}>
                {/* Main Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: settings.sectionSpacing + 'px' }}>
                    {visibleSections.filter(s => !s.column || s.column === 'right').map(section => {
                        if (section.type === 'personalInfo') return null;

                        switch (section.type) {
                            case 'summary':
                                return personalInfo.summary ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} color={primaryColor} />
                                        <ResumeHtmlContent html={personalInfo.summary} />
                                    </div>
                                ) : null;

                            case 'experience':
                                return experience.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} color={primaryColor} />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                            {experience.map((exp: any) => (
                                                <div key={exp.id}>
                                                    <EntryHeader
                                                        title={exp.position}
                                                        subtitle={exp.company}
                                                        date={`${formatDate(exp.startDate)} — ${exp.current ? 'Present' : formatDate(exp.endDate)}`}
                                                    />
                                                    {exp.description && <ResumeHtmlContent html={exp.description} />}
                                                    {exp.highlights && exp.highlights.length > 0 && (
                                                        <ul style={{ margin: '6px 0 0 20px', padding: 0, fontSize: '10pt', color: '#4b5563', lineHeight: 1.5 }}>
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

                            case 'projects':
                                return projects.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} color={primaryColor} />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                            {projects.map((proj: any) => (
                                                <div key={proj.id}>
                                                    <EntryHeader title={proj.name} date={proj.startDate ? formatDate(proj.startDate) : undefined} />
                                                    {proj.technologies && proj.technologies.length > 0 && (
                                                        <div style={{ fontSize: '9pt', color: primaryColor, fontWeight: 600, marginBottom: 4 }}>
                                                            {proj.technologies.join(' • ')}
                                                        </div>
                                                    )}
                                                    <ResumeHtmlContent html={proj.description} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'certifications':
                                return certifications.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} color={primaryColor} />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                            {certifications.map((cert: any) => (
                                                <div key={cert.id}>
                                                    <EntryHeader title={cert.name} subtitle={cert.issuer} date={formatDate(cert.date)} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'awards':
                                return awards.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} color={primaryColor} />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                            {awards.map((award: any) => (
                                                <div key={award.id}>
                                                    <EntryHeader title={award.title} subtitle={award.issuer} date={formatDate(award.date)} />
                                                    <ResumeHtmlContent html={award.description} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'custom':
                                const customSection = resume.customSections?.find((cs: any) => cs.id === section.customSectionId);
                                return customSection && customSection.items.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title || customSection.title} color={primaryColor} />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                            {customSection.items.map((item: any) => (
                                                <div key={item.id}>
                                                    <EntryHeader title={item.title} subtitle={item.subtitle} date={formatDate(item.date)} />
                                                    <ResumeHtmlContent html={item.description} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            default: return null;
                        }
                    })}
                </div>

                {/* Sidebar Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: settings.sectionSpacing + 'px' }}>
                    {visibleSections.filter(s => s.column === 'left').map(section => {
                        switch (section.type) {
                            case 'education':
                                return education.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} color={primaryColor} />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                            {education.map((edu: any) => (
                                                <div key={edu.id}>
                                                    <div style={{ fontWeight: 700, fontSize: '11pt', color: '#111827' }}>{edu.degree}</div>
                                                    <div style={{ fontSize: '10pt', color: '#4b5563' }}>{edu.institution}</div>
                                                    <div style={{ fontSize: '9pt', color: '#9ca3af' }}>{formatDate(edu.endDate)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'skills':
                                return skills.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} color={primaryColor} />
                                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                            {skills.map((s: any) => <SkillBadge key={s.id} name={s.name} color={primaryColor} />)}
                                        </div>
                                    </div>
                                ) : null;

                            case 'languages':
                                return languages.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} color={primaryColor} />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {languages.map((lang: any) => (
                                                <div key={lang.id} style={{ fontSize: '10pt' }}>
                                                    <span style={{ fontWeight: 700, color: '#111827' }}>{lang.name}</span>
                                                    <span style={{ color: '#6b7280' }}> — {lang.proficiency}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'custom':
                                const customSection = resume.customSections?.find((cs: any) => cs.id === section.customSectionId);
                                return customSection && customSection.items.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title || customSection.title} color={primaryColor} />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                            {customSection.items.map((item: any) => (
                                                <div key={item.id}>
                                                    <div style={{ fontWeight: 700, fontSize: '11pt', color: '#111827' }}>{item.title}</div>
                                                    {item.subtitle && <div style={{ fontSize: '10pt', color: '#4b5563' }}>{item.subtitle}</div>}
                                                    <div style={{ fontSize: '9pt', color: '#9ca3af' }}>{formatDate(item.date)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            default: return null;
                        }
                    })}
                </div>
            </div>
        </div>
    );
}
