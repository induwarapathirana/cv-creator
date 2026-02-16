import { Resume } from '@/types/resume';
import { defaultSettings } from '@/utils/sample-data';
import { SectionTitle, EntryHeader, ResumeHtmlContent, SkillBadge, ContactItem, formatDate } from './shared/ResumeComponents';
import { FiMail, FiPhone, FiMapPin, FiLinkedin, FiGithub, FiGlobe } from 'react-icons/fi';

interface TemplateProps {
    resume: Resume;
    scale?: number;
}

export default function AcademicTemplate({ resume }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const primaryColor = settings.colors.primary;
    const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: '"Times New Roman", Times, serif',
                fontSize: settings.fontSize + 'px',
                lineHeight: 1.4,
                padding: settings.pageMargin + 'px',
                color: '#000',
                backgroundColor: 'white',
            }}
        >
            <div className="resume-template">
                {/* Header - Academic Style (Centered, simple) */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '2em', fontWeight: 700, margin: '0 0 8px 0', color: '#000' }}>
                        {personalInfo.fullName}
                    </h1>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                        fontSize: '0.9em',
                        color: '#4b5563'
                    }}>
                        <ContactItem icon={<FiMapPin />} text={personalInfo.location} color={primaryColor} />
                        <ContactItem icon={<FiPhone />} text={personalInfo.phone} color={primaryColor} />
                        <ContactItem icon={<FiMail />} text={personalInfo.email} color={primaryColor} />
                        <ContactItem icon={<FiGlobe />} text={personalInfo.website?.replace('https://', '')} href={personalInfo.website} color={primaryColor} />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {visibleSections.map(section => {
                        if (section.type === 'personalInfo') return null;

                        switch (section.type) {
                            case 'summary':
                                return personalInfo.summary ? (
                                    <div key={section.id}>
                                        <ResumeHtmlContent html={personalInfo.summary} />
                                    </div>
                                ) : null;

                            case 'education':
                                return education.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title="Education" color="#000" variant="academic" />
                                        {education.map(edu => (
                                            <div key={edu.id} style={{ marginBottom: '12px' }}>
                                                <EntryHeader
                                                    title={edu.institution}
                                                    subtitle={`${edu.degree} in ${edu.field}`}
                                                    date={`${formatDate(edu.startDate)} – ${formatDate(edu.endDate)}`}
                                                />
                                                <ResumeHtmlContent html={edu.description} />
                                            </div>
                                        ))}
                                    </div>
                                ) : null;

                            case 'experience':
                                return experience.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title="Professional Experience" color="#000" variant="academic" />
                                        {experience.map(exp => (
                                            <div key={exp.id} style={{ marginBottom: '16px' }}>
                                                <EntryHeader
                                                    title={exp.company}
                                                    subtitle={exp.position}
                                                    date={`${formatDate(exp.startDate)} – ${exp.current ? 'Present' : formatDate(exp.endDate)}`}
                                                />
                                                <ResumeHtmlContent html={exp.description} />
                                            </div>
                                        ))}
                                    </div>
                                ) : null;

                            case 'projects':
                                return projects.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title="Research & Projects" color="#000" variant="academic" />
                                        {projects.map(proj => (
                                            <div key={proj.id} style={{ marginBottom: '12px' }}>
                                                <EntryHeader
                                                    title={proj.name}
                                                    date={formatDate(proj.startDate)}
                                                />
                                                <ResumeHtmlContent html={proj.description} />
                                            </div>
                                        ))}
                                    </div>
                                ) : null;

                            case 'skills':
                                return skills.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title="Skills" color="#000" variant="academic" />
                                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                            {skills.map(skill => (
                                                <SkillBadge key={skill.id} name={skill.name} color="#000" />
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            default:
                                // Fallback
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
                                        <SectionTitle title={dynamicTitle || section.title} color="#000" variant="academic" />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
