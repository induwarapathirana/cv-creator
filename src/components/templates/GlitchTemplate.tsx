import { Resume } from '@/types/resume';
import { defaultSettings } from '@/utils/sample-data';
import { SectionTitle, EntryHeader, ResumeHtmlContent, SkillBadge, ContactItem, formatDate } from './shared/ResumeComponents';
import { FiMail, FiPhone, FiMapPin, FiLinkedin, FiGithub, FiGlobe } from 'react-icons/fi';

interface TemplateProps {
    resume: Resume;
    scale?: number;
}

export default function GlitchTemplate({ resume }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const primaryColor = settings.colors.primary || '#00ff41';
    const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

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
            <div key={section.id} style={{ marginBottom: '32px' }}>
                <SectionTitle
                    title={`> ${dynamicTitle || section.title}_`}
                    color="#000"
                    variant="minimal"
                    style={{
                        border: '2px solid #000',
                        padding: '4px 12px',
                        boxShadow: `4px 4px 0px ${primaryColor}`,
                        display: 'inline-block',
                        textTransform: 'uppercase',
                        fontWeight: 900
                    }}
                />

                {section.type === 'summary' && personalInfo.summary ? (
                    <div style={{ borderLeft: `6px solid ${primaryColor}`, paddingLeft: '16px', marginTop: '16px' }}>
                        <ResumeHtmlContent html={personalInfo.summary} />
                    </div>
                ) : section.type === 'skills' ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '16px' }}>
                        {skills.map(skill => (
                            <div key={skill.id} style={{ border: '1px solid #000', padding: '4px 8px', fontSize: '0.85em', fontWeight: 700 }}>
                                {skill.name.toUpperCase()} <span style={{ color: primaryColor }}>:: {skill.level || 5}/5</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '16px' }}>
                        {items.map((item: any) => (
                            <div key={item.id} style={{ borderBottom: '1px dashed #999', paddingBottom: '16px' }}>
                                <EntryHeader
                                    title={item.position || item.title || item.name || item.institution}
                                    subtitle={item.company || item.subtitle || item.issuer}
                                    date={`${formatDate(item.startDate || item.date)}${item.endDate ? ` -> ${item.endDate === 'Present' || item.current ? 'NOW' : formatDate(item.endDate)}` : ''}`}
                                    color={primaryColor}
                                />
                                {item.technologies && (
                                    <div style={{ fontSize: '0.75em', margin: '4px 0', fontWeight: 700 }}>
                                        STACK: [{item.technologies.join(', ').toUpperCase()}]
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
                fontFamily: '"Courier New", Courier, monospace',
                fontSize: settings.fontSize + 'px',
                lineHeight: 1.4,
                padding: settings.pageMargin + 'px',
                color: '#111',
                backgroundColor: 'white',
            }}
        >
            <div className="resume-template">
                {/* Glitch Header */}
                <div style={{ marginBottom: '40px', borderBottom: '4px solid #000', paddingBottom: '20px' }}>
                    <h1 style={{ fontSize: '2.5em', fontWeight: 900, margin: 0, letterSpacing: '-0.05em' }}>
                        {personalInfo.fullName.toUpperCase()}
                    </h1>
                    <div style={{ fontSize: '1.1em', fontWeight: 700, background: '#000', color: '#fff', display: 'inline-block', padding: '4px 12px', marginTop: '12px' }}>
                        {`// ${personalInfo.jobTitle.toUpperCase()}`}
                    </div>
                    <div style={{ marginTop: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                        <ContactItem icon={<span>[EMAIL]</span>} text={personalInfo.email} color={primaryColor} />
                        <ContactItem icon={<span>[PHONE]</span>} text={personalInfo.phone} color={primaryColor} />
                        <ContactItem icon={<span>[LOC]</span>} text={personalInfo.location} color={primaryColor} />
                        <ContactItem icon={<span>[DEV]</span>} text={personalInfo.github?.replace('https://', '')} href={personalInfo.github} color={primaryColor} />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {visibleSections.map(renderSection)}
                </div>
            </div>
        </div>
    );
}
