import { Resume } from '@/types/resume';
import { defaultSettings } from '@/utils/sample-data';
import { SectionTitle, EntryHeader, ResumeHtmlContent, SkillBadge, ContactItem, formatDate } from './shared/ResumeComponents';
import { FiMail, FiPhone, FiMapPin, FiLinkedin, FiGithub, FiGlobe } from 'react-icons/fi';

interface TemplateProps {
    resume: Resume;
    scale?: number;
}

export default function ExecutiveTemplate({ resume }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const primaryColor = settings.colors.primary;
    const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: 'Georgia, Cambria, "Times New Roman", serif',
                fontSize: settings.fontSize + 'px',
                lineHeight: 1.6,
                padding: settings.pageMargin + 'px',
                color: '#1f2937',
                backgroundColor: 'white',
            }}
        >
            <div className="resume-template">
                {/* Header - Centered, Classic */}
                <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '1px double #e5e7eb', paddingBottom: '24px' }}>
                    <h1 style={{ fontSize: '32pt', fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-0.01em', color: '#111827', textTransform: 'uppercase' }}>
                        {personalInfo.fullName}
                    </h1>
                    <div style={{ fontSize: '14pt', color: primaryColor, marginBottom: '16px', fontWeight: 500, fontStyle: 'italic' }}>
                        {personalInfo.jobTitle}
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        gap: '20px',
                        fontSize: '10pt',
                        color: '#4b5563'
                    }}>
                        <ContactItem icon={<FiMapPin />} text={personalInfo.location} color={primaryColor} />
                        <ContactItem icon={<FiPhone />} text={personalInfo.phone} color={primaryColor} />
                        <ContactItem icon={<FiMail />} text={personalInfo.email} color={primaryColor} />
                        <ContactItem icon={<FiLinkedin />} text={personalInfo.linkedin?.replace('https://', '')} href={personalInfo.linkedin} color={primaryColor} />
                        <ContactItem icon={<FiGlobe />} text={personalInfo.website?.replace('https://', '')} href={personalInfo.website} color={primaryColor} />
                    </div>
                </div>

                {/* Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {visibleSections.map(section => {
                        if (section.type === 'personalInfo') return null;

                        switch (section.type) {
                            case 'summary':
                                return personalInfo.summary ? (
                                    <div key={section.id}>
                                        <SectionTitle title="Executive Profile" color="#111827" variant="modern" />
                                        <ResumeHtmlContent html={personalInfo.summary} />
                                    </div>
                                ) : null;

                            case 'experience':
                                return experience.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} color="#111827" variant="modern" />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                            {experience.map(exp => (
                                                <div key={exp.id}>
                                                    <EntryHeader
                                                        title={exp.position}
                                                        subtitle={exp.company}
                                                        date={`${formatDate(exp.startDate)} – ${exp.current ? 'Present' : formatDate(exp.endDate)}`}
                                                        color={primaryColor}
                                                    />
                                                    <ResumeHtmlContent html={exp.description} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'education':
                                return education.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} color="#111827" variant="modern" />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {education.map(edu => (
                                                <div key={edu.id}>
                                                    <EntryHeader
                                                        title={edu.institution}
                                                        subtitle={`${edu.degree} in ${edu.field}`}
                                                        date={`${formatDate(edu.startDate)} – ${formatDate(edu.endDate)}`}
                                                    />
                                                    <ResumeHtmlContent html={edu.description} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'skills':
                                return skills.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} color="#111827" variant="modern" />
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {skills.map(skill => (
                                                <SkillBadge key={skill.id} name={skill.name} color={primaryColor} />
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'projects':
                                return projects.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} color="#111827" variant="modern" />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {projects.map(proj => (
                                                <div key={proj.id}>
                                                    <EntryHeader
                                                        title={proj.name}
                                                        date={`${formatDate(proj.startDate)} ${proj.endDate ? `– ${formatDate(proj.endDate)}` : ''}`}
                                                    />
                                                    <ResumeHtmlContent html={proj.description} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            default:
                                let items: any[] = (resume as any)[section.type] || [];
                                if (section.type === 'custom' && section.customSectionId) {
                                    const cs = resume.customSections.find(c => c.id === section.customSectionId);
                                    if (cs) items = cs.items;
                                }

                                if (!items || items.length === 0) return null;

                                const dynamicTitle = section.type === 'custom'
                                    ? resume.customSections.find(c => c.id === section.customSectionId)?.title
                                    : section.title;

                                return (
                                    <div key={section.id}>
                                        <SectionTitle title={dynamicTitle || section.title} color="#111827" variant="modern" />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {items.map((item: any) => (
                                                <div key={item.id}>
                                                    <EntryHeader
                                                        title={item.title || item.name || item.institution}
                                                        subtitle={item.subtitle}
                                                        date={formatDate(item.date || item.startDate)}
                                                    />
                                                    <ResumeHtmlContent html={item.description} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                        }
                    })}
                </div>
            </div>
        </div>
    );
}
