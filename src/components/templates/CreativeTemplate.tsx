import { Resume } from '@/types/resume';
import { defaultSettings } from '@/utils/sample-data';
import { SectionTitle, EntryHeader, ResumeHtmlContent, SkillBadge, SkillsGrouped, ContactItem, formatDate } from './shared/ResumeComponents';
import { FiMail, FiPhone, FiMapPin, FiLinkedin, FiGithub, FiGlobe } from 'react-icons/fi';

interface TemplateProps {
    resume: Resume;
    scale?: number;
}

export default function CreativeTemplate({ resume }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const primaryColor = settings.colors.primary;
    const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

    const leftColumnSections = visibleSections.filter(s => s.column === 'left');
    const rightColumnSections = visibleSections.filter(s => s.column === 'right' || !s.column);

    const renderSection = (section: any, isSidebar: boolean = false) => {
        if (section.type === 'personalInfo') return null;

        const titleVariant = isSidebar ? 'minimal' : 'modern';

        switch (section.type) {
            case 'summary':
                return personalInfo.summary ? (
                    <div key={section.id} style={{ marginBottom: '32px' }}>
                        <ResumeHtmlContent html={personalInfo.summary} />
                    </div>
                ) : null;

            case 'experience':
                return experience.length > 0 ? (
                    <div key={section.id} style={{ marginBottom: '32px' }}>
                        <SectionTitle title={section.title} color={isSidebar ? '#000' : primaryColor} variant={titleVariant} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {experience.map(exp => (
                                <div key={exp.id} style={{ borderLeft: isSidebar ? 'none' : `2px solid #eee`, paddingLeft: isSidebar ? 0 : '16px' }}>
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

            case 'projects':
                return projects.length > 0 ? (
                    <div key={section.id} style={{ marginBottom: '32px' }}>
                        <SectionTitle title={section.title} color={isSidebar ? '#000' : primaryColor} variant={titleVariant} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {projects.map(proj => (
                                <div key={proj.id}>
                                    <EntryHeader
                                        title={proj.name}
                                        date={formatDate(proj.startDate)}
                                    />
                                    <ResumeHtmlContent html={proj.description} />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null;

            case 'skills':
                return skills.length > 0 ? (
                    <div key={section.id} style={{ marginBottom: '32px' }}>
                        <SectionTitle title={section.title} color={isSidebar ? 'inherit' : primaryColor} variant={titleVariant} />
                        <SkillsGrouped skills={skills} color={primaryColor} />
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
                    <div key={section.id} style={{ marginBottom: '32px' }}>
                        <SectionTitle title={dynamicTitle || section.title} color={isSidebar ? '#000' : primaryColor} variant={titleVariant} />
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
    };

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: '"Poppins", "Inter", sans-serif',
                padding: 0,
                color: '#1a1a2e',
                backgroundColor: 'white',
                minHeight: '297mm',
                boxSizing: 'border-box'
            }}
        >
            <div className="resume-template" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Header Block */}
                <div style={{ background: primaryColor, color: '#fff', padding: '48px 64px' }}>
                    <h1 style={{ fontSize: '3.5em', fontWeight: 900, margin: 0, letterSpacing: '-0.04em', lineHeight: 0.9, textTransform: 'uppercase' }}>
                        {personalInfo.fullName}
                    </h1>
                    <div style={{ fontSize: '1.5em', marginTop: '12px', opacity: 0.9, fontWeight: 300 }}>
                        {personalInfo.jobTitle}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '32% 68%', flex: 1 }}>
                    {/* Sidebar */}
                    <div style={{ background: '#f9fafb', padding: '48px 32px', borderRight: '1px solid #eee', boxSizing: 'border-box' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
                            <ContactItem icon={<FiMail />} text={personalInfo.email} color={primaryColor} />
                            <ContactItem icon={<FiPhone />} text={personalInfo.phone} color={primaryColor} />
                            <ContactItem icon={<FiMapPin />} text={personalInfo.location} color={primaryColor} />
                            <ContactItem icon={<FiGlobe />} text={personalInfo.website?.replace('https://', '')} href={personalInfo.website} color={primaryColor} />
                            <ContactItem icon={<FiLinkedin />} text={personalInfo.linkedin?.replace('https://', '')} href={personalInfo.linkedin} color={primaryColor} />
                            <ContactItem icon={<FiGithub />} text={personalInfo.github?.replace('https://', '')} href={personalInfo.github} color={primaryColor} />
                        </div>

                        {leftColumnSections.map(s => renderSection(s, true))}
                    </div>

                    {/* Main Content */}
                    <div style={{ padding: '48px 64px', boxSizing: 'border-box' }}>
                        {rightColumnSections.map(s => renderSection(s, false))}
                    </div>
                </div>
            </div>
        </div>
    );
}
