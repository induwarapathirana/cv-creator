'use client';

import { Resume } from '@/types/resume';
import { defaultSettings } from '@/utils/sample-data';
import HtmlRenderer from '@/components/ui/HtmlRenderer';

interface TemplateProps {
    resume: Resume;
    scale?: number;
}

function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const [year, month] = dateStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return month ? `${months[parseInt(month) - 1]} ${year}` : year;
}

export default function BoldTemplate({ resume }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const primaryColor = settings.colors.primary;
    const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

    // Bold doesn't use columns, just big blocks

    const SectionTitle = ({ title }: { title: string }) => (
        <h2 style={{
            fontSize: '32px',
            fontWeight: 900,
            textTransform: 'uppercase',
            color: '#000',
            marginBottom: 24,
            lineHeight: 0.9,
            letterSpacing: '-0.02em',
            borderBottom: `4px solid ${primaryColor}`,
            display: 'inline-block',
            paddingRight: 20
        }}>
            {title}
        </h2>
    );

    const renderSection = (section: any) => {
        if (section.type === 'personalInfo') return null;

        switch (section.type) {
            case 'summary':
                return personalInfo.summary ? (
                    <div key={section.id} style={{ marginBottom: 40 }}>
                        <div style={{ fontSize: '18px', lineHeight: 1.6, fontWeight: 500 }}>
                            <HtmlRenderer html={personalInfo.summary} className="html-content" />
                        </div>
                    </div>
                ) : null;

            case 'experience':
                return experience.length > 0 ? (
                    <div key={section.id} style={{ marginBottom: 40 }}>
                        <SectionTitle title={section.title} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                            {experience.map(exp => (
                                <div key={exp.id}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>{exp.position}</h3>
                                            <div style={{ fontSize: '16px', color: primaryColor, fontWeight: 700 }}>{exp.company}</div>
                                        </div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, textAlign: 'right' }}>
                                            {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                                            <div style={{ fontSize: '13px', fontWeight: 400, color: '#666' }}>{exp.location}</div>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: 12 }}>
                                        <HtmlRenderer html={exp.description} className="html-content" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null;

            case 'education':
                return education.length > 0 ? (
                    <div key={section.id} style={{ marginBottom: 40 }}>
                        <SectionTitle title="Education" />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            {education.map(edu => (
                                <div key={edu.id} style={{ border: '2px solid #000', padding: 16 }}>
                                    <div style={{ fontWeight: 800, fontSize: '16px' }}>{edu.institution}</div>
                                    <div style={{ fontSize: '15px' }}>{edu.degree} in {edu.field}</div>
                                    <div style={{ fontSize: '13px', marginTop: 4, fontWeight: 600 }}>
                                        {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null;

            case 'skills':
                return skills.length > 0 ? (
                    <div key={section.id} style={{ marginBottom: 40 }}>
                        <SectionTitle title={section.title} />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                            {skills.map(skill => (
                                <span key={skill.id} style={{
                                    background: '#000',
                                    color: '#fff',
                                    padding: '8px 16px',
                                    fontWeight: 700,
                                    fontSize: '14px'
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
                    <div key={section.id} style={{ marginBottom: 40 }}>
                        <SectionTitle title={dynamicTitle || section.title} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {items.map((item: any) => (
                                <div key={item.id}>
                                    <div style={{ fontSize: '18px', fontWeight: 800 }}>
                                        {item.title || item.name || item.institution}
                                    </div>
                                    {(item.subtitle || item.issuer) && <div style={{ fontSize: '15px', color: '#555' }}>
                                        {item.subtitle || item.issuer}
                                    </div>}
                                    <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: 8 }}>
                                        {formatDate(item.date || item.startDate)}
                                    </div>
                                    {item.description && <HtmlRenderer html={item.description} className="html-content" />}
                                </div>
                            ))}
                        </div>
                    </div>
                )

        }
    }

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: '"Oswald", "Impact", "Arial Black", sans-serif', // Needs a google font import really, but fallback ok
                fontSize: settings.fontSize + 'px',
                lineHeight: 1.5,
                padding: '40px',
                color: '#111',
            }}
        >
            <div className="resume-template">
                {/* Huge Header */}
                <div style={{ marginBottom: 60, borderBottom: '8px solid #000', paddingBottom: 20 }}>
                    <h1 style={{ fontSize: '80px', fontWeight: 900, lineHeight: 0.8, textTransform: 'uppercase', margin: 0, letterSpacing: '-0.04em' }}>
                        {personalInfo.fullName.split(' ')[0]}
                        <span style={{ color: primaryColor }}>{personalInfo.fullName.split(' ').slice(1).join(' ')}</span>
                    </h1>
                    <div style={{ fontSize: '24px', fontWeight: 700, marginTop: 10, letterSpacing: '0.05em' }}>
                        {personalInfo.jobTitle.toUpperCase()}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 40, marginBottom: 60 }}>
                    <div style={{ borderRight: '2px solid #000', paddingRight: 20 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '14px', fontWeight: 600 }}>
                            <div>{personalInfo.email}</div>
                            <div>{personalInfo.phone}</div>
                            <div>{personalInfo.location}</div>
                            <div>{personalInfo.website?.replace('https://', '')}</div>
                            <div>{personalInfo.linkedin?.replace('https://', '')}</div>
                        </div>
                    </div>
                    <div>
                        {/* Summary first usually */}
                        {visibleSections.filter(s => s.type === 'summary').map(renderSection)}
                    </div>
                </div>

                {visibleSections.filter(s => s.type !== 'summary').map(renderSection)}
            </div>
        </div>
    );
}
