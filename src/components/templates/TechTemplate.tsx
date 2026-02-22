import { Resume } from '@/types/resume';
import { defaultSettings } from '@/utils/sample-data';
import { SectionTitle, EntryHeader, ResumeHtmlContent, SkillBadge, SkillsGrouped, ContactItem, formatDate } from './shared/ResumeComponents';
import { FiMail, FiPhone, FiMapPin, FiLinkedin, FiGithub, FiGlobe } from 'react-icons/fi';

interface TemplateProps {
    resume: Resume;
    scale?: number;
}

export default function TechTemplate({ resume }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const primaryColor = settings.colors.primary;
    const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

    const leftColumnSections = visibleSections.filter(s => s.column === 'left');
    const rightColumnSections = visibleSections.filter(s => s.column === 'right' || !s.column);

    const renderSection = (section: any) => {
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
            <div key={section.id} style={{ marginBottom: '24px' }}>
                <SectionTitle
                    title={dynamicTitle || section.title}
                    color="inherit"
                    variant="modern"
                    style={{ borderLeft: `4px solid ${primaryColor}`, paddingLeft: '12px', background: 'transparent' }}
                />

                {section.type === 'summary' && personalInfo.summary ? (
                    <ResumeHtmlContent html={personalInfo.summary} />
                ) : section.type === 'skills' ? (
                    <SkillsGrouped skills={skills} color={primaryColor} />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {items.map((item: any) => (
                            <div key={item.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <h3 style={{ fontSize: '1.1em', fontWeight: 700, margin: 0 }}>
                                        {item.position || item.title || item.name || item.institution}
                                    </h3>
                                    <span style={{ fontSize: '0.85em', color: '#6b7280', whiteSpace: 'nowrap' }}>
                                        {formatDate(item.startDate || item.date)} {item.endDate ? `– ${item.endDate === 'Present' || item.current ? 'Present' : formatDate(item.endDate)}` : ''}
                                    </span>
                                </div>
                                {(item.company || item.subtitle || item.issuer) && (
                                    <div style={{ fontSize: '0.9em', color: primaryColor, fontWeight: 600, marginBottom: '4px' }}>
                                        {item.company || item.subtitle || item.issuer}
                                    </div>
                                )}
                                {item.technologies && (
                                    <div style={{ fontSize: '0.85em', color: '#666', fontFamily: 'monospace', marginBottom: '4px' }}>
                                        [{item.technologies.join(' • ')}]
                                    </div>
                                )}
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
                fontFamily: '"Inter", sans-serif',
                padding: 'var(--page-margin)',
                color: '#1a1a2e',
                backgroundColor: 'white',
            }}
        >
            <div className="resume-template">
                {/* Modern Tech Header */}
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.5em', fontWeight: 900, lineHeight: 1, marginBottom: '8px', letterSpacing: '-0.03em' }}>
                        {personalInfo.fullName}
                    </h1>
                    <div style={{ fontSize: '1.2em', color: primaryColor, fontWeight: 600, marginBottom: '20px' }}>
                        {personalInfo.jobTitle}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px' }}>
                        <ContactItem icon={<FiMail />} text={personalInfo.email} color={primaryColor} />
                        <ContactItem icon={<FiPhone />} text={personalInfo.phone} color={primaryColor} />
                        <ContactItem icon={<FiMapPin />} text={personalInfo.location} color={primaryColor} />
                        <ContactItem icon={<FiGithub />} text={personalInfo.github?.replace('https://', '')} href={personalInfo.github} color={primaryColor} />
                        <ContactItem icon={<FiLinkedin />} text={personalInfo.linkedin?.replace('https://', '')} href={personalInfo.linkedin} color={primaryColor} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
                    {/* Left Column (Skills, Education, etc) */}
                    <div>
                        {leftColumnSections.map(renderSection)}
                    </div>

                    {/* Right Column (Experience, Projects) */}
                    <div>
                        {rightColumnSections.map(renderSection)}
                    </div>
                </div>
            </div>
        </div>
    );
}
