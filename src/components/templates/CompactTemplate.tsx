import { Resume } from '@/types/resume';
import { defaultSettings } from '@/utils/sample-data';
import { SectionTitle, EntryHeader, ResumeHtmlContent, SkillBadge, ContactItem, formatDate } from './shared/ResumeComponents';
import { FiMail, FiPhone, FiMapPin, FiLinkedin, FiGithub, FiGlobe } from 'react-icons/fi';

interface TemplateProps {
    resume: Resume;
    scale?: number;
}

export default function CompactTemplate({ resume }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const primaryColor = settings.colors.primary;
    const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

    const renderSection = (section: any) => {
        if (section.type === 'personalInfo') return null;

        switch (section.type) {
            case 'summary':
                return personalInfo.summary ? (
                    <div key={section.id} style={{ marginBottom: '12px', breakInside: 'avoid' }}>
                        <SectionTitle title="Profile" color={primaryColor} variant="minimal" />
                        <ResumeHtmlContent html={personalInfo.summary} />
                    </div>
                ) : null;

            case 'experience':
                return experience.length > 0 ? (
                    <div key={section.id} style={{ marginBottom: '12px', breakInside: 'avoid' }}>
                        <SectionTitle title={section.title} color={primaryColor} variant="minimal" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {experience.map(exp => (
                                <div key={exp.id}>
                                    <EntryHeader
                                        title={exp.position}
                                        subtitle={exp.company}
                                        date={`${formatDate(exp.startDate)}-${exp.current ? 'Pres' : formatDate(exp.endDate)}`}
                                    />
                                    <ResumeHtmlContent html={exp.description} />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null;

            case 'skills':
                return skills.length > 0 ? (
                    <div key={section.id} style={{ marginBottom: '12px', breakInside: 'avoid' }}>
                        <SectionTitle title={section.title} color={primaryColor} variant="minimal" />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {skills.map(skill => (
                                <SkillBadge key={skill.id} name={skill.name} color={primaryColor} />
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
                    <div key={section.id} style={{ marginBottom: '12px', breakInside: 'avoid' }}>
                        <SectionTitle title={dynamicTitle || section.title} color={primaryColor} variant="minimal" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
    }

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: (settings.fontSize - 2) + 'px',
                lineHeight: 1.3,
                padding: '32px',
                color: '#111',
                backgroundColor: 'white',
            }}
        >
            <div className="resume-template">
                {/* Compact Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: '16px',
                    borderBottom: `2px solid ${primaryColor}`,
                    paddingBottom: '8px'
                }}>
                    <div>
                        <h1 style={{ fontSize: '20pt', fontWeight: 800, margin: 0, textTransform: 'uppercase', color: '#000' }}>
                            {personalInfo.fullName}
                        </h1>
                        <div style={{ fontSize: '10pt', fontWeight: 700, color: primaryColor }}>{personalInfo.jobTitle}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                        <ContactItem icon={<FiMail />} text={personalInfo.email} color={primaryColor} />
                        <ContactItem icon={<FiPhone />} text={personalInfo.phone} color={primaryColor} />
                        <ContactItem icon={<FiMapPin />} text={personalInfo.location} color={primaryColor} />
                    </div>
                </div>

                <div style={{ columnCount: 2, columnGap: '24px' }}>
                    {visibleSections.map(renderSection)}
                </div>
            </div>
        </div>
    );
}
