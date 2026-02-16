import { Resume } from '@/types/resume';
import { defaultSettings } from '@/utils/sample-data';
import { SectionTitle, EntryHeader, ResumeHtmlContent, SkillBadge, ContactItem, formatDate } from './shared/ResumeComponents';
import { FiMail, FiPhone, FiMapPin, FiLinkedin, FiGithub, FiGlobe } from 'react-icons/fi';

interface TemplateProps {
    resume: Resume;
    scale?: number;
}

export default function ProfessionalTemplate({ resume }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const primaryColor = settings.colors.primary;
    const visibleSections = (Array.isArray(sections) ? sections : []).filter(s => s.visible).sort((a, b) => a.order - b.order);

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
                {/* Header - Traditional Center Aligned */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <h1 style={{ fontSize: '2.2em', fontWeight: 700, color: '#111827', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {personalInfo.fullName || 'Your Name'}
                    </h1>
                    {personalInfo.jobTitle && (
                        <div style={{ fontSize: '1.1em', fontWeight: 600, color: primaryColor, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            {personalInfo.jobTitle}
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px 16px' }}>
                        {personalInfo.email && <ContactItem icon={<FiMail />} text={personalInfo.email} color={primaryColor} />}
                        {personalInfo.phone && <ContactItem icon={<FiPhone />} text={personalInfo.phone} color={primaryColor} />}
                        {personalInfo.location && <ContactItem icon={<FiMapPin />} text={personalInfo.location} color={primaryColor} />}
                        {personalInfo.linkedin && <ContactItem icon={<FiLinkedin />} text="LinkedIn" href={personalInfo.linkedin} color={primaryColor} />}
                        {personalInfo.github && <ContactItem icon={<FiGithub />} text="GitHub" href={personalInfo.github} color={primaryColor} />}
                        {personalInfo.website && <ContactItem icon={<FiGlobe />} text="Portfolio" href={personalInfo.website} color={primaryColor} />}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: settings.sectionSpacing + 'px' }}>
                    {visibleSections.map(section => {
                        if (section.type === 'personalInfo') return null;

                        switch (section.type) {
                            case 'summary':
                                return personalInfo.summary ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} color="#111827" />
                                        <ResumeHtmlContent html={personalInfo.summary} />
                                    </div>
                                ) : null;

                            case 'experience':
                                return experience.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} color="#111827" />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                            {experience.map((exp: any) => (
                                                <div key={exp.id}>
                                                    <EntryHeader
                                                        title={exp.position}
                                                        subtitle={`${exp.company}${exp.location ? ` • ${exp.location}` : ''}`}
                                                        date={`${formatDate(exp.startDate)} — ${exp.current ? 'Present' : formatDate(exp.endDate)}`}
                                                    />
                                                    {exp.description && <ResumeHtmlContent html={exp.description} />}
                                                    {exp.highlights && exp.highlights.length > 0 && (
                                                        <ul style={{ margin: '6px 0 0 20px', padding: 0, fontSize: '0.9em', color: '#374151', lineHeight: 'inherit' }}>
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
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} color="#111827" />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                            {education.map((edu: any) => (
                                                <div key={edu.id}>
                                                    <EntryHeader
                                                        title={edu.institution}
                                                        subtitle={`${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`}
                                                        date={`${formatDate(edu.startDate)} — ${formatDate(edu.endDate)}`}
                                                    />
                                                    {edu.gpa && <div style={{ fontSize: '0.85em', color: '#6b7280', marginTop: '-2px' }}>GPA: {edu.gpa}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'skills':
                                return skills.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} color="#111827" />
                                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                            {skills.map((s: any) => <SkillBadge key={s.id} name={s.name} color={primaryColor} />)}
                                        </div>
                                    </div>
                                ) : null;

                            case 'projects':
                                return projects.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} color="#111827" />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} color="#111827" />
                                        {certifications.map((cert: any) => (
                                            <div key={cert.id} style={{ marginBottom: '8px' }}>
                                                <EntryHeader title={cert.name} subtitle={cert.issuer} date={formatDate(cert.date)} />
                                            </div>
                                        ))}
                                    </div>
                                ) : null;

                            case 'languages':
                                return languages.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} color="#111827" />
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                                            {languages.map((lang: any) => (
                                                <div key={lang.id} style={{ fontSize: '0.9em' }}>
                                                    <span style={{ fontWeight: 700, color: '#111827' }}>{lang.name}</span>
                                                    <span style={{ color: '#6b7280' }}> ({lang.proficiency})</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'awards':
                                return awards.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} color="#111827" />
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
                                    <div key={section.id}>
                                        <SectionTitle title={section.title || customSection.title} color="#111827" />
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
        </div>
    );
}
