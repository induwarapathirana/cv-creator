import { Resume } from '@/types/resume';
import { defaultSettings } from '@/utils/sample-data';
import { SectionTitle, EntryHeader, ResumeHtmlContent, SkillBadge, ContactItem, formatDate } from './shared/ResumeComponents';
import { FiMail, FiPhone, FiMapPin, FiLinkedin, FiGithub, FiGlobe } from 'react-icons/fi';

interface TemplateProps {
    resume: Resume;
    scale?: number;
}

export default function SplitTemplate({ resume }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const primaryColor = settings.colors.primary;
    const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

    const leftColumnSections = visibleSections.filter(s => s.column === 'left');
    const rightColumnSections = visibleSections.filter(s => s.column === 'right' || !s.column);

    const renderSidebarSection = (section: any) => {
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

        return (
            <div key={section.id} style={{ marginBottom: '32px' }}>
                <SectionTitle title={dynamicTitle || section.title} color="rgba(255,255,255,0.8)" variant="minimal" />
                {section.type === 'summary' && personalInfo.summary ? (
                    <div style={{ color: 'rgba(255,255,255,0.9)' }}>
                        <ResumeHtmlContent html={personalInfo.summary} />
                    </div>
                ) : section.type === 'skills' || section.type === 'languages' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {items.map((item: any) => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9em' }}>
                                <span style={{ fontWeight: 600 }}>{item.name}</span>
                                {item.proficiency && <span style={{ opacity: 0.7 }}>{item.proficiency}</span>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {items.map((item: any) => (
                            <div key={item.id} style={{ fontSize: '0.9em' }}>
                                <div style={{ fontWeight: 700, fontSize: '1em' }}>{item.title || item.name || item.institution}</div>
                                <div style={{ opacity: 0.8, marginBottom: '4px' }}>
                                    {formatDate(item.date || item.startDate)}
                                </div>
                                {item.description && <ResumeHtmlContent html={item.description} />}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderMainSection = (section: any) => {
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

        return (
            <div key={section.id} style={{ marginBottom: '40px' }}>
                <SectionTitle title={dynamicTitle || section.title} color="#222" variant="modern" style={{ borderBottom: `2px solid ${primaryColor}` }} />

                {section.type === 'summary' && personalInfo.summary ? (
                    <ResumeHtmlContent html={personalInfo.summary} />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {items.map((item: any) => (
                            <div key={item.id}>
                                <EntryHeader
                                    title={item.position || item.title || item.name || item.institution}
                                    subtitle={item.company || item.subtitle || item.issuer}
                                    date={`${formatDate(item.startDate || item.date)}${item.endDate ? ` – ${item.endDate === 'Present' || item.current ? 'Present' : formatDate(item.endDate)}` : ''}`}
                                    color={primaryColor}
                                />
                                <ResumeHtmlContent html={item.description} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: '"Roboto", sans-serif',
                fontSize: settings.fontSize + 'px',
                lineHeight: 1.5,
                padding: 0,
                color: '#333',
                backgroundColor: '#fff',
                minHeight: '297mm'
            }}
        >
            <div className="resume-template" style={{ display: 'flex', height: '100%' }}>
                {/* Dark Sidebar - 35% width */}
                <div style={{
                    width: '35%',
                    background: '#2d3748',
                    color: '#fff',
                    padding: '40px 30px',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ marginBottom: '40px' }}>
                        <h1 style={{ fontSize: '2em', fontWeight: 800, lineHeight: 1.1, marginBottom: '12px', letterSpacing: '-0.02em' }}>
                            {personalInfo.fullName}
                        </h1>
                        <div style={{ fontSize: '1.1em', color: primaryColor, fontWeight: 600 }}>
                            {personalInfo.jobTitle}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '48px' }}>
                        <ContactItem icon={<FiMail />} text={personalInfo.email} color={primaryColor} />
                        <ContactItem icon={<FiPhone />} text={personalInfo.phone} color={primaryColor} />
                        <ContactItem icon={<FiMapPin />} text={personalInfo.location} color={primaryColor} />
                        <ContactItem icon={<FiGlobe />} text={personalInfo.website?.replace('https://', '')} href={personalInfo.website} color={primaryColor} />
                        <ContactItem icon={<FiLinkedin />} text={personalInfo.linkedin?.replace('https://', '')} href={personalInfo.linkedin} color={primaryColor} />
                    </div>

                    {leftColumnSections.map(renderSidebarSection)}
                </div>

                {/* Main Content - 65% width */}
                <div style={{ width: '65%', padding: '40px' }}>
                    {rightColumnSections.map(renderMainSection)}
                </div>
            </div>
        </div>
    );
}
