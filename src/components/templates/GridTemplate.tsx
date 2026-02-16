import { Resume } from '@/types/resume';
import { defaultSettings } from '@/utils/sample-data';
import { SectionTitle, EntryHeader, ResumeHtmlContent, SkillBadge, ContactItem, formatDate } from './shared/ResumeComponents';
import { FiMail, FiPhone, FiMapPin, FiLinkedin, FiGithub, FiGlobe } from 'react-icons/fi';

interface TemplateProps {
    resume: Resume;
    scale?: number;
}

export default function GridTemplate({ resume }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const primaryColor = settings.colors.primary;
    const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: settings.fontSize + 'px',
                lineHeight: settings.lineHeight,
                padding: settings.pageMargin + 'px',
                color: '#333',
                backgroundColor: 'white',
            }}
        >
            <div className="resume-template" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Card Header */}
                <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '32px' }}>
                    {personalInfo.photo && (
                        <img src={personalInfo.photo} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '16px', objectFit: 'cover' }} />
                    )}
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '1.8em', fontWeight: 800, margin: 0, color: '#111', letterSpacing: '-0.02em' }}>{personalInfo.fullName}</h1>
                        <p style={{ fontSize: '1.1em', color: primaryColor, fontWeight: 600, margin: '4px 0 0 0' }}>{personalInfo.jobTitle}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <ContactItem icon={<FiMail />} text={personalInfo.email} color={primaryColor} />
                        <ContactItem icon={<FiPhone />} text={personalInfo.phone} color={primaryColor} />
                        <ContactItem icon={<FiMapPin />} text={personalInfo.location} color={primaryColor} />
                    </div>
                </div>

                {/* Grid Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>

                    {/* Full width summary if exists */}
                    {personalInfo.summary && (
                        <div style={{ gridColumn: 'span 2', background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <SectionTitle title="About Me" color={primaryColor} variant="minimal" />
                            <ResumeHtmlContent html={personalInfo.summary} />
                        </div>
                    )}

                    {visibleSections.map(section => {
                        if (section.type === 'personalInfo' || section.type === 'summary') return null;

                        const isWide = ['experience', 'education', 'projects'].includes(section.type);
                        const items = (resume as any)[section.type] || [];

                        // Handle dynamic titles for custom sections
                        let dynamicTitle = section.title;
                        if (section.type === 'custom' && section.customSectionId) {
                            const cs = resume.customSections.find(c => c.id === section.customSectionId);
                            if (cs) {
                                dynamicTitle = cs.title;
                                items.push(...cs.items);
                            }
                        }

                        if (!items || items.length === 0) return null;

                        return (
                            <div key={section.id} style={{
                                gridColumn: isWide ? 'span 2' : 'span 1',
                                background: '#fff',
                                padding: '24px',
                                borderRadius: '12px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}>
                                <SectionTitle title={dynamicTitle} color={primaryColor} variant="minimal" />

                                {section.type === 'skills' ? (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {skills.map(skill => (
                                            <SkillBadge key={skill.id} name={skill.name} color={primaryColor} />
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {items.map((item: any) => (
                                            <div key={item.id}>
                                                <EntryHeader
                                                    title={item.title || item.position || item.name || item.institution}
                                                    subtitle={item.company || item.subtitle || item.issuer}
                                                    date={formatDate(item.startDate || item.date)}
                                                    color={primaryColor}
                                                />
                                                <ResumeHtmlContent html={item.description} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
