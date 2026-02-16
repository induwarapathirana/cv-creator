import { Resume } from '@/types/resume';
import { defaultSettings } from '@/utils/sample-data';
import { SectionTitle, EntryHeader, ResumeHtmlContent, SkillBadge, ContactItem, formatDate } from './shared/ResumeComponents';
import { FiMail, FiPhone, FiMapPin, FiLinkedin, FiGithub, FiGlobe } from 'react-icons/fi';

interface TemplateProps {
    resume: Resume;
    scale?: number;
}

export default function TimelineTemplate({ resume }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const primaryColor = settings.colors.primary;
    const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

    const leftColumnSections = visibleSections.filter(s => s.column === 'left');
    const rightColumnSections = visibleSections.filter(s => s.column === 'right' || !s.column);

    const renderSection = (section: any, isSidebar: boolean = false) => {
        if (section.type === 'personalInfo') return null;

        const items = (resume as any)[section.type] || [];
        if (section.type === 'custom' && section.customSectionId) {
            const cs = resume.customSections.find(c => c.id === section.customSectionId);
            if (cs) items.push(...cs.items);
        }

        if (items.length === 0 && section.type !== 'summary') return null;

        const dynamicTitle = section.type === 'custom' && section.customSectionId
            ? resume.customSections.find(c => c.id === section.customSectionId)?.title
            : section.title;

        if (isSidebar) {
            return (
                <div key={section.id} style={{ marginBottom: '32px' }}>
                    <SectionTitle title={dynamicTitle || section.title} color="#888" variant="minimal" />
                    {section.type === 'summary' && personalInfo.summary ? (
                        <ResumeHtmlContent html={personalInfo.summary} />
                    ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {items.map((item: any) => (
                                section.type === 'skills' ? (
                                    <SkillBadge key={item.id} name={item.name} color={primaryColor} />
                                ) : (
                                    <div key={item.id} style={{ fontSize: '0.9em', width: '100%' }}>
                                        <strong>{item.name || item.title || item.institution}</strong>
                                        {item.proficiency && <div style={{ color: '#888', fontSize: '0.85em' }}>{item.proficiency}</div>}
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        // Timeline Right Content
        return (
            <div key={section.id} style={{ marginBottom: '48px', position: 'relative' }}>
                <h2 style={{
                    fontSize: '1.2em',
                    fontWeight: 800,
                    color: primaryColor,
                    marginBottom: '24px',
                    position: 'relative',
                    letterSpacing: '-0.02em'
                }}>
                    <span style={{
                        position: 'absolute',
                        left: -29,
                        top: 6,
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: 'white',
                        border: `4px solid ${primaryColor}`,
                        zIndex: 2
                    }}></span>
                    {dynamicTitle || section.title}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {section.type === 'summary' && personalInfo.summary ? (
                        <ResumeHtmlContent html={personalInfo.summary} />
                    ) : (
                        items.map((item: any) => (
                            <div key={item.id}>
                                <EntryHeader
                                    title={item.position || item.title || item.name || item.institution}
                                    subtitle={item.company || item.subtitle || item.issuer}
                                    date={`${formatDate(item.startDate || item.date)}${item.endDate ? ` – ${item.endDate === 'Present' || item.current ? 'Present' : formatDate(item.endDate)}` : ''}`}
                                    color={primaryColor}
                                />
                                <ResumeHtmlContent html={item.description} />
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: '"Lato", "Inter", sans-serif',
                fontSize: settings.fontSize + 'px',
                lineHeight: 1.5,
                padding: settings.pageMargin + 'px',
                color: '#333',
                backgroundColor: 'white',
            }}
        >
            <div className="resume-template">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5em', fontWeight: 800, margin: '0 0 8px 0', color: primaryColor, letterSpacing: '-0.03em' }}>
                            {personalInfo.fullName}
                        </h1>
                        <div style={{ fontSize: '1em', fontWeight: 600, letterSpacing: '0.1em', color: '#666' }}>{personalInfo.jobTitle.toUpperCase()}</div>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <ContactItem icon={<FiMail />} text={personalInfo.email} color={primaryColor} />
                        <ContactItem icon={<FiPhone />} text={personalInfo.phone} color={primaryColor} />
                        <ContactItem icon={<FiMapPin />} text={personalInfo.location} color={primaryColor} />
                        <ContactItem icon={<FiLinkedin />} text={personalInfo.linkedin?.replace('https://', '')} href={personalInfo.linkedin} color={primaryColor} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '64px' }}>
                    {/* Left Sidebar */}
                    <div>
                        {leftColumnSections.map(s => renderSection(s, true))}
                    </div>

                    {/* Right Main Content (Timeline) */}
                    <div style={{ paddingLeft: '20px', borderLeft: '2px solid #eee' }}>
                        {rightColumnSections.map(s => renderSection(s, false))}
                    </div>
                </div>
            </div>
        </div>
    );
}
