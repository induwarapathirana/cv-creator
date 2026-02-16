import { Resume } from '@/types/resume';
import { defaultSettings } from '@/utils/sample-data';
import { SectionTitle, EntryHeader, ResumeHtmlContent, SkillBadge, ContactItem, formatDate } from './shared/ResumeComponents';
import { FiMail, FiPhone, FiMapPin, FiLinkedin, FiGithub, FiGlobe } from 'react-icons/fi';

interface TemplateProps {
    resume: Resume;
    scale?: number;
}

export default function SwissTemplate({ resume }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const primaryColor = settings.colors.primary;
    const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

    const renderSection = (section: any, isSidebar: boolean = false) => {
        if (section.type === 'personalInfo') return null;

        const titleVariant = isSidebar ? 'minimal' : 'modern';

        switch (section.type) {
            case 'summary':
                return personalInfo.summary ? (
                    <div key={section.id}>
                        <ResumeHtmlContent html={personalInfo.summary} />
                    </div>
                ) : null;

            case 'experience':
                return experience.length > 0 ? (
                    <div key={section.id}>
                        <SectionTitle title={section.title} color="#000" variant={titleVariant} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: isSidebar ? '16px' : '32px' }}>
                            {experience.map(exp => (
                                <div key={exp.id} style={{ display: isSidebar ? 'block' : 'grid', gridTemplateColumns: isSidebar ? 'none' : '120px 1fr', gap: '24px' }}>
                                    {!isSidebar && (
                                        <div style={{ fontSize: '1em', fontWeight: 700, color: '#000' }}>
                                            {formatDate(exp.startDate)} —<br />{exp.current ? 'Now' : formatDate(exp.endDate)}
                                        </div>
                                    )}
                                    <div>
                                        <EntryHeader
                                            title={exp.position}
                                            subtitle={exp.company}
                                            date={isSidebar ? `${formatDate(exp.startDate)} — ${exp.current ? 'Now' : formatDate(exp.endDate)}` : undefined}
                                            color={primaryColor}
                                        />
                                        <ResumeHtmlContent html={exp.description} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null;

            case 'skills':
                return skills.length > 0 ? (
                    <div key={section.id}>
                        <SectionTitle title={section.title} color="#000" variant={titleVariant} />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
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
                    <div key={section.id}>
                        <SectionTitle title={dynamicTitle || section.title} color="#000" variant={titleVariant} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {items.map((item: any) => (
                                <div key={item.id} style={{ display: isSidebar ? 'block' : 'grid', gridTemplateColumns: isSidebar ? 'none' : '120px 1fr', gap: '24px' }}>
                                    {!isSidebar && (
                                        <div style={{ fontSize: '1em', fontWeight: 700 }}>
                                            {formatDate(item.date || item.startDate)} — {item.endDate ? formatDate(item.endDate) : ''}
                                        </div>
                                    )}
                                    <div>
                                        <EntryHeader
                                            title={item.title || item.name || item.institution}
                                            subtitle={item.subtitle}
                                            date={isSidebar ? formatDate(item.date || item.startDate) : undefined}
                                        />
                                        <ResumeHtmlContent html={item.description} />
                                    </div>
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
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                padding: 'var(--page-margin)',
                color: '#000',
                backgroundColor: 'white',
            }}
        >
            <div className="resume-template">
                {/* Header - Huge and Bold */}
                <div style={{ marginBottom: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                    <div>
                        <h1 style={{ fontSize: '3.5em', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.04em', margin: '0 0 16px 0', textTransform: 'lowercase' }}>
                            {personalInfo.fullName.split(' ')[0]}<br />
                            <span style={{ color: primaryColor }}>{personalInfo.fullName.split(' ').slice(1).join(' ')}</span>.
                        </h1>
                        <p style={{ fontSize: '1.5em', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>{personalInfo.jobTitle}</p>
                    </div>

                    {personalInfo.photo && (
                        <img src={personalInfo.photo} alt="Profile" style={{ width: '140px', height: '140px', objectFit: 'cover', filter: 'grayscale(100%)' }} />
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '48px', borderTop: '4px solid #000', paddingTop: '32px' }}>
                    {/* Left Column (Sidebar) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div>
                            <SectionTitle title="Contact" color="#000" variant="minimal" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <ContactItem icon={<FiMail />} text={personalInfo.email} color={primaryColor} />
                                <ContactItem icon={<FiPhone />} text={personalInfo.phone} color={primaryColor} />
                                <ContactItem icon={<FiMapPin />} text={personalInfo.location} color={primaryColor} />
                                <ContactItem icon={<FiGlobe />} text={personalInfo.website?.replace('https://', '')} href={personalInfo.website} color={primaryColor} />
                                <ContactItem icon={<FiLinkedin />} text={personalInfo.linkedin?.replace('https://', '')} href={personalInfo.linkedin} color={primaryColor} />
                            </div>
                        </div>

                        {visibleSections.filter(s => s.column === 'left').map(s => renderSection(s, true))}
                    </div>

                    {/* Right Column (Main) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                        {visibleSections.filter(s => (s.column === 'right' || !s.column)).map(s => renderSection(s, false))}
                    </div>
                </div>
            </div>
        </div>
    );
}
