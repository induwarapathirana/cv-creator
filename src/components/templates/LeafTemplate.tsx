import { Resume } from '@/types/resume';
import { defaultSettings } from '@/utils/sample-data';
import { SectionTitle, EntryHeader, ResumeHtmlContent, SkillBadge, ContactItem, formatDate } from './shared/ResumeComponents';
import { FiMail, FiPhone, FiMapPin, FiLinkedin, FiGithub, FiGlobe } from 'react-icons/fi';

interface TemplateProps {
    resume: Resume;
    scale?: number;
}

export default function LeafTemplate({ resume }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const primaryColor = settings.colors.primary;
    const visibleSections = (Array.isArray(sections) ? sections : []).filter(s => s.visible).sort((a, b) => a.order - b.order);

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: '"Quicksand", "Nunito", sans-serif',
                fontSize: settings.fontSize + 'px',
                lineHeight: 1.6,
                padding: settings.pageMargin + 'px',
                color: '#444',
                backgroundColor: 'white',
            }}
        >
            <div className="resume-template" style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header - Centered with Initial Circle */}
                <div style={{ textAlign: 'center', marginBottom: 50 }}>
                    <div style={{
                        width: 80,
                        height: 80,
                        background: primaryColor,
                        borderRadius: '50%',
                        margin: '0 auto 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '32px',
                        fontWeight: 300,
                        boxShadow: `0 4px 12px ${primaryColor}40`
                    }}>
                        {personalInfo.fullName?.charAt(0) || '?'}
                    </div>
                    <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
                        {personalInfo.fullName || 'Your Name'}
                    </h1>
                    {personalInfo.jobTitle && (
                        <div style={{ fontSize: '16px', color: primaryColor, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
                            {personalInfo.jobTitle}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px 20px' }}>
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
                                <div key={section.id} style={{ marginBottom: 40, textAlign: 'center' }}>
                                    <div style={{ fontStyle: 'italic', color: '#4b5563', maxWidth: '90%', margin: '0 auto' }}>
                                        <ResumeHtmlContent html={personalInfo.summary} />
                                    </div>
                                </div>
                            ) : null;

                        case 'experience':
                            return experience.length > 0 ? (
                                <div key={section.id} style={{ marginBottom: 40 }}>
                                    <SectionTitle title={section.title} color={primaryColor} centered />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                        {experience.map((exp: any) => (
                                            <div key={exp.id}>
                                                <EntryHeader
                                                    title={exp.position}
                                                    subtitle={exp.company}
                                                    date={`${formatDate(exp.startDate)} — ${exp.current ? 'Present' : formatDate(exp.endDate)}`}
                                                    centered
                                                />
                                                <div style={{ maxWidth: '95%', textAlign: 'left', width: '100%', margin: '0 auto' }}>
                                                    {exp.description && <ResumeHtmlContent html={exp.description} />}
                                                    {exp.highlights && exp.highlights.length > 0 && (
                                                        <ul style={{ margin: '8px 0 0 20px', padding: 0, fontSize: '10.5pt', color: '#4b5563', lineHeight: 1.6 }}>
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
                                <div key={section.id} style={{ marginBottom: 40 }}>
                                    <SectionTitle title={section.title} color={primaryColor} centered />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                        {education.map((edu: any) => (
                                            <div key={edu.id}>
                                                <EntryHeader
                                                    title={edu.institution}
                                                    subtitle={`${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`}
                                                    date={`${formatDate(edu.startDate)} — ${formatDate(edu.endDate)}`}
                                                    centered
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null;

                        case 'skills':
                            return skills.length > 0 ? (
                                <div key={section.id} style={{ marginBottom: 40 }}>
                                    <SectionTitle title={section.title} color={primaryColor} centered />
                                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                                        {skills.map((s: any) => <SkillBadge key={s.id} name={s.name} color={primaryColor} />)}
                                    </div>
                                </div>
                            ) : null;

                        case 'projects':
                            return projects.length > 0 ? (
                                <div key={section.id} style={{ marginBottom: 40 }}>
                                    <SectionTitle title={section.title} color={primaryColor} centered />
                                    {projects.map((proj: any) => (
                                        <div key={proj.id} style={{ marginBottom: 20 }}>
                                            <EntryHeader title={proj.name} date={formatDate(proj.startDate)} centered />
                                            <div style={{ textAlign: 'left', maxWidth: '95%', margin: '0 auto' }}>
                                                <ResumeHtmlContent html={proj.description} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : null;

                        case 'certifications':
                            return certifications.length > 0 ? (
                                <div key={section.id} style={{ marginBottom: 40 }}>
                                    <SectionTitle title={section.title} color={primaryColor} centered />
                                    {certifications.map((cert: any) => (
                                        <div key={cert.id} style={{ marginBottom: 16 }}>
                                            <EntryHeader title={cert.name} subtitle={cert.issuer} date={formatDate(cert.date)} centered />
                                        </div>
                                    ))}
                                </div>
                            ) : null;

                        case 'languages':
                            return languages.length > 0 ? (
                                <div key={section.id} style={{ marginBottom: 40 }}>
                                    <SectionTitle title={section.title} color={primaryColor} centered />
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
                                        {languages.map((lang: any) => (
                                            <div key={lang.id} style={{ fontSize: '11pt' }}>
                                                <span style={{ fontWeight: 700, color: '#111827' }}>{lang.name}</span>
                                                <span style={{ color: '#6b7280' }}> ({lang.proficiency})</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null;

                        case 'awards':
                            return awards.length > 0 ? (
                                <div key={section.id} style={{ marginBottom: 40 }}>
                                    <SectionTitle title={section.title} color={primaryColor} centered />
                                    {awards.map((award: any) => (
                                        <div key={award.id} style={{ marginBottom: 16 }}>
                                            <EntryHeader title={award.title} subtitle={award.issuer} date={formatDate(award.date)} centered />
                                        </div>
                                    ))}
                                </div>
                            ) : null;

                        case 'custom':
                            const customSection = resume.customSections?.find((cs: any) => cs.id === section.customSectionId);
                            return customSection && customSection.items.length > 0 ? (
                                <div key={section.id} style={{ marginBottom: 40 }}>
                                    <SectionTitle title={section.title || customSection.title} color={primaryColor} centered />
                                    {customSection.items.map((item: any) => (
                                        <div key={item.id} style={{ marginBottom: 24 }}>
                                            <EntryHeader title={item.title} subtitle={item.subtitle} date={formatDate(item.date)} centered />
                                            <div style={{ textAlign: 'left', maxWidth: '95%', margin: '0 auto' }}>
                                                <ResumeHtmlContent html={item.description} />
                                            </div>
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
