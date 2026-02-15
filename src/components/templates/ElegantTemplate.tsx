import { Resume } from '@/types/resume';
import { defaultSettings } from '@/utils/sample-data';
import { SectionTitle, EntryHeader, ResumeHtmlContent, SkillBadge, ContactItem, formatDate } from './shared/ResumeComponents';
import { FiMail, FiPhone, FiMapPin, FiLinkedin, FiGithub, FiGlobe } from 'react-icons/fi';

interface TemplateProps {
    resume: Resume;
    scale?: number;
}

export default function ElegantTemplate({ resume }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const primaryColor = settings.colors.primary;
    const visibleSections = (Array.isArray(sections) ? sections : []).filter(s => s.visible).sort((a, b) => a.order - b.order);

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: '"Playfair Display", "Times New Roman", serif',
                fontSize: settings.fontSize + 'px',
                lineHeight: settings.lineHeight + 0.2,
                padding: (settings.pageMargin + 20) + 'px',
                color: '#333',
            }}
        >
            <div className="resume-template">
                {/* Header - Minimalist Center Aligned */}
                <div style={{ textAlign: 'center', marginBottom: 60 }}>
                    <h1 style={{ fontSize: '38px', fontWeight: 400, color: '#111827', margin: '0 0 12px 0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        {personalInfo.fullName || 'Your Name'}
                    </h1>
                    {personalInfo.jobTitle && (
                        <div style={{ fontSize: '14px', fontWeight: 400, color: primaryColor, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 24 }}>
                            {personalInfo.jobTitle}
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px 24px' }}>
                        {personalInfo.email && <ContactItem icon={<FiMail />} text={personalInfo.email} color={primaryColor} />}
                        {personalInfo.phone && <ContactItem icon={<FiPhone />} text={personalInfo.phone} color={primaryColor} />}
                        {personalInfo.location && <ContactItem icon={<FiMapPin />} text={personalInfo.location} color={primaryColor} />}
                        {personalInfo.linkedin && <ContactItem icon={<FiLinkedin />} text="LinkedIn" href={personalInfo.linkedin} color={primaryColor} />}
                        {personalInfo.github && <ContactItem icon={<FiGithub />} text="GitHub" href={personalInfo.github} color={primaryColor} />}
                        {personalInfo.website && <ContactItem icon={<FiGlobe />} text="Portfolio" href={personalInfo.website} color={primaryColor} />}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: (settings.sectionSpacing + 10) + 'px' }}>
                    {visibleSections.map(section => {
                        if (section.type === 'personalInfo') return null;

                        switch (section.type) {
                            case 'summary':
                                return personalInfo.summary ? (
                                    <div key={section.id} style={{ textAlign: 'center', maxWidth: '85%', margin: '0 auto' }}>
                                        <div style={{ fontStyle: 'italic', color: '#4b5563', lineHeight: 1.8 }}>
                                            <ResumeHtmlContent html={personalInfo.summary} />
                                        </div>
                                    </div>
                                ) : null;

                            case 'experience':
                                return experience.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} color={primaryColor} variant="elegant" />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                                            {experience.map((exp: any) => (
                                                <div key={exp.id} style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 40 }}>
                                                    <div style={{ textAlign: 'right', fontSize: '9pt', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '4px' }}>
                                                        {formatDate(exp.startDate)} —<br />{exp.current ? 'Present' : formatDate(exp.endDate)}
                                                    </div>
                                                    <div>
                                                        <h3 style={{ fontSize: '12pt', fontWeight: 500, color: '#111827', margin: '0 0 2px 0' }}>{exp.position}</h3>
                                                        <div style={{ fontSize: '10pt', fontWeight: 500, color: primaryColor, marginBottom: 12 }}>{exp.company}</div>
                                                        {exp.description && <ResumeHtmlContent html={exp.description} />}
                                                        {exp.highlights && exp.highlights.length > 0 && (
                                                            <ul style={{ margin: '8px 0 0 20px', padding: 0, fontSize: '10pt', color: '#4b5563', lineHeight: 1.6 }}>
                                                                {exp.highlights.filter(Boolean).map((h: string, i: number) => (
                                                                    <li key={i} style={{ marginBottom: '4px' }}>{h}</li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'education':
                                return education.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} color={primaryColor} variant="elegant" />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                            {education.map((edu: any) => (
                                                <div key={edu.id} style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 40 }}>
                                                    <div style={{ textAlign: 'right', fontSize: '10pt', color: '#9ca3af', paddingTop: '4px' }}>
                                                        {formatDate(edu.endDate)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '12pt', fontWeight: 500, color: '#111827' }}>{edu.institution}</div>
                                                        <div style={{ fontSize: '10pt', fontStyle: 'italic', color: '#6b7280' }}>
                                                            {edu.degree} in {edu.field}
                                                            {edu.gpa && ` • GPA: ${edu.gpa}`}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'skills':
                                return skills.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} color={primaryColor} variant="elegant" />
                                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px 24px' }}>
                                            {skills.map((s: any) => (
                                                <span key={s.id} style={{ fontSize: '10pt', color: '#374151', letterSpacing: '0.02em' }}>
                                                    {s.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'projects':
                                return projects.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} color={primaryColor} variant="elegant" />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                            {projects.map((proj: any) => (
                                                <div key={proj.id} style={{ textAlign: 'center' }}>
                                                    <h3 style={{ fontSize: '12pt', fontWeight: 500, color: '#111827', marginBottom: 4 }}>{proj.name}</h3>
                                                    {proj.technologies && proj.technologies.length > 0 && (
                                                        <div style={{ fontSize: '9pt', color: primaryColor, marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                                            {proj.technologies.join(' • ')}
                                                        </div>
                                                    )}
                                                    <div style={{ maxWidth: '85%', margin: '0 auto' }}>
                                                        <ResumeHtmlContent html={proj.description} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'languages':
                                return languages.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} color={primaryColor} variant="elegant" />
                                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 24px', fontSize: '10pt' }}>
                                            {languages.map((lang: any) => (
                                                <div key={lang.id}>
                                                    <span style={{ fontWeight: 500, color: '#111827' }}>{lang.name}</span>
                                                    <span style={{ color: '#9ca3af', fontStyle: 'italic' }}> — {lang.proficiency}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'certifications':
                                return certifications.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} color={primaryColor} variant="elegant" />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                                            {certifications.map((cert: any) => (
                                                <div key={cert.id} style={{ textAlign: 'center' }}>
                                                    <div style={{ fontWeight: 500, color: '#111827' }}>{cert.name}</div>
                                                    <div style={{ fontSize: '9pt', color: '#6b7280' }}>{cert.issuer} • {formatDate(cert.date)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'awards':
                                return awards.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} color={primaryColor} variant="elegant" />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                                            {awards.map((award: any) => (
                                                <div key={award.id} style={{ textAlign: 'center', maxWidth: '80%' }}>
                                                    <div style={{ fontWeight: 500, color: '#111827' }}>{award.title}</div>
                                                    <div style={{ fontSize: '9pt', color: '#6b7280', marginBottom: 4 }}>{award.issuer} • {formatDate(award.date)}</div>
                                                    {award.description && <div style={{ fontSize: '10pt', color: '#4b5563', fontStyle: 'italic' }}><ResumeHtmlContent html={award.description} /></div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'custom':
                                const customSection = resume.customSections?.find((cs: any) => cs.id === section.customSectionId);
                                return customSection && customSection.items.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title || customSection.title} color={primaryColor} variant="elegant" />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                            {customSection.items.map((item: any) => (
                                                <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 40 }}>
                                                    <div style={{ textAlign: 'right', fontSize: '10pt', color: '#9ca3af', paddingTop: '4px' }}>
                                                        {formatDate(item.date)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '12pt', fontWeight: 500, color: '#111827', marginBottom: 2 }}>{item.title}</div>
                                                        {item.subtitle && <div style={{ fontSize: '10pt', color: primaryColor, marginBottom: 8 }}>{item.subtitle}</div>}
                                                        <ResumeHtmlContent html={item.description} />
                                                    </div>
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
