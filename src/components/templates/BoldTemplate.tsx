import { Resume } from '@/types/resume';
import { defaultSettings } from '@/utils/sample-data';
import { SectionTitle, EntryHeader, ResumeHtmlContent, SkillBadge, ContactItem, formatDate } from './shared/ResumeComponents';
import { FiMail, FiPhone, FiMapPin, FiLinkedin, FiGithub, FiGlobe } from 'react-icons/fi';

interface TemplateProps {
    resume: Resume;
    scale?: number;
}

export default function BoldTemplate({ resume }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const primaryColor = settings.colors.primary;
    const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

    const renderSection = (section: any) => {
        if (section.type === 'personalInfo') return null;

        const commonProps = { color: primaryColor, variant: 'bold' as const };

        switch (section.type) {
            case 'summary':
                return personalInfo.summary ? (
                    <div key={section.id} style={{ marginBottom: '40px' }}>
                        <div style={{ fontSize: '1.2em', lineHeight: 1.6, fontWeight: 500 }}>
                            <ResumeHtmlContent html={personalInfo.summary} />
                        </div>
                    </div>
                ) : null;

            case 'experience':
                return experience.length > 0 ? (
                    <div key={section.id} style={{ marginBottom: '40px' }}>
                        <SectionTitle title={section.title} {...commonProps} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
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
                    <div key={section.id} style={{ marginBottom: '40px' }}>
                        <SectionTitle title="Education" {...commonProps} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {education.map(edu => (
                                <div key={edu.id} style={{ border: '3px solid #000', padding: '16px' }}>
                                    <h3 style={{ fontSize: '1.1em', fontWeight: 900, margin: '0 0 4px 0', textTransform: 'uppercase' }}>{edu.institution}</h3>
                                    <div style={{ fontSize: '1em', fontWeight: 700 }}>{edu.degree}</div>
                                    <div style={{ fontSize: '0.9em', fontWeight: 600, color: '#666', marginTop: '4px' }}>
                                        {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null;

            case 'skills':
                return skills.length > 0 ? (
                    <div key={section.id} style={{ marginBottom: '40px' }}>
                        <SectionTitle title={section.title} {...commonProps} />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {skills.map(skill => (
                                <span key={skill.id} style={{
                                    background: '#000',
                                    color: '#fff',
                                    padding: '8px 16px',
                                    fontWeight: 900,
                                    fontSize: '0.9em',
                                    textTransform: 'uppercase'
                                }}>
                                    {skill.name}
                                </span>
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
                    <div key={section.id} style={{ marginBottom: '40px' }}>
                        <SectionTitle title={dynamicTitle || section.title} {...commonProps} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

    const nameParts = personalInfo.fullName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: '"Inter", "Impact", "Arial Black", sans-serif',
                fontSize: settings.fontSize + 'px',
                lineHeight: 1.5,
                padding: '40px',
                color: '#000',
                backgroundColor: 'white',
            }}
        >
            <div className="resume-template">
                {/* Huge Header */}
                <div style={{ marginBottom: '48px', borderBottom: '12px solid #000', paddingBottom: '24px' }}>
                    <h1 style={{ fontSize: '4.5em', fontWeight: 900, lineHeight: 0.8, textTransform: 'uppercase', margin: 0, letterSpacing: '-0.05em' }}>
                        {firstName}
                        <span style={{ color: primaryColor }}>{lastName}</span>
                    </h1>
                    <div style={{ fontSize: '1.5em', fontWeight: 900, marginTop: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        {personalInfo.jobTitle}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '40px', marginBottom: '40px' }}>
                    <div style={{ borderRight: '4px solid #000', paddingRight: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <ContactItem icon={<FiMail />} text={personalInfo.email} color="#000" />
                            <ContactItem icon={<FiPhone />} text={personalInfo.phone} color="#000" />
                            <ContactItem icon={<FiMapPin />} text={personalInfo.location} color="#000" />
                            <ContactItem icon={<FiLinkedin />} text={personalInfo.linkedin?.replace('https://', '')} color="#000" />
                            <ContactItem icon={<FiGithub />} text={personalInfo.github?.replace('https://', '')} color="#000" />
                        </div>
                    </div>
                    <div>
                        {visibleSections.filter(s => s.type === 'summary').map(renderSection)}
                    </div>
                </div>

                {visibleSections.filter(s => s.type !== 'summary').map(renderSection)}
            </div>
        </div>
    );
}
