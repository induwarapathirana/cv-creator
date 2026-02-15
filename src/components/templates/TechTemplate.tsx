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

export default function TechTemplate({ resume }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const primaryColor = settings.colors.primary;
    const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

    const leftColumnSections = visibleSections.filter(s => s.column === 'left');
    const rightColumnSections = visibleSections.filter(s => s.column === 'right' || !s.column);

    const SectionTitle = ({ title }: { title: string }) => (
        <h2 style={{
            fontSize: '15px',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: '#374151',
            marginBottom: 12,
            borderLeft: `4px solid ${primaryColor}`,
            paddingLeft: 8,
            marginTop: 4
        }}>
            {title}
        </h2>
    );

    const renderSection = (section: any) => {
        if (section.type === 'personalInfo') return null;

        switch (section.type) {
            case 'summary':
                return personalInfo.summary ? (
                    <div key={section.id} style={{ marginBottom: 24 }}>
                        <SectionTitle title="Profile" />
                        <HtmlRenderer html={personalInfo.summary} className="html-content" />
                    </div>
                ) : null;

            case 'experience':
                return experience.length > 0 ? (
                    <div key={section.id} style={{ marginBottom: 24 }}>
                        <SectionTitle title={section.title} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {experience.map(exp => (
                                <div key={exp.id}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{exp.position}</h3>
                                        <span style={{ fontSize: '13px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                                            {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '14px', color: primaryColor, fontWeight: 600, marginBottom: 4 }}>
                                        {exp.company}
                                    </div>
                                    <HtmlRenderer html={exp.description} className="html-content" />
                                    {exp.highlights.length > 0 && (
                                        <ul style={{ paddingLeft: 16, marginTop: 4 }}>
                                            {exp.highlights.filter(Boolean).map((h, i) => (
                                                <li key={i} style={{ marginBottom: 2 }}>{h}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null;

            case 'projects':
                return projects.length > 0 ? (
                    <div key={section.id} style={{ marginBottom: 24 }}>
                        <SectionTitle title={section.title} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {projects.map(proj => (
                                <div key={proj.id}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{proj.name}</h3>
                                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                            {formatDate(proj.startDate)}
                                        </div>
                                    </div>
                                    {proj.technologies && (
                                        <div style={{ fontSize: '12px', color: primaryColor, fontFamily: 'monospace', marginBottom: 4 }}>
                                            {proj.technologies.join(' • ')}
                                        </div>
                                    )}
                                    <HtmlRenderer html={proj.description} className="html-content" />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null;

            case 'skills':
                return skills.length > 0 ? (
                    <div key={section.id} style={{ marginBottom: 24 }}>
                        <SectionTitle title={section.title} />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {skills.map(skill => (
                                <span key={skill.id} style={{
                                    background: '#f3f4f6',
                                    padding: '4px 8px',
                                    borderRadius: 4,
                                    fontSize: '13px',
                                    fontWeight: 500
                                }}>
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    </div>
                ) : null;

            case 'education':
                return education.length > 0 ? (
                    <div key={section.id} style={{ marginBottom: 24 }}>
                        <SectionTitle title={section.title} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {education.map(edu => (
                                <div key={edu.id}>
                                    <div style={{ fontWeight: 700 }}>{edu.institution}</div>
                                    <div style={{ fontSize: '14px' }}>{edu.degree} in {edu.field}</div>
                                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                        {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null;

            default:
                // Generic handler for others
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
                    <div key={section.id} style={{ marginBottom: 24 }}>
                        <SectionTitle title={dynamicTitle || section.title} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {items.map((item: any) => (
                                <div key={item.id}>
                                    <div style={{ fontWeight: 700, fontSize: '14px' }}>
                                        {item.title || item.name || item.institution}
                                    </div>
                                    {item.subtitle && <div style={{ fontSize: '13px', fontStyle: 'italic' }}>{item.subtitle}</div>}
                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                        {formatDate(item.date || item.startDate)}
                                    </div>
                                    {item.description && <HtmlRenderer html={item.description} className="html-content" />}
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
                fontFamily: '"Roboto", "Inter", sans-serif',
                fontSize: settings.fontSize + 'px',
                lineHeight: 1.5,
                padding: settings.pageMargin + 'px',
                color: '#1f2937',
            }}
        >
            <div className="resume-template">
                {/* Modern Header */}
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: '42px', fontWeight: 900, lineHeight: 1, marginBottom: 8, letterSpacing: '-0.03em' }}>
                        {personalInfo.fullName}
                    </h1>
                    <div style={{ fontSize: '18px', color: primaryColor, fontWeight: 600, marginBottom: 16 }}>
                        {personalInfo.jobTitle}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', fontSize: '13px', fontWeight: 500, color: '#4b5563' }}>
                        {[
                            personalInfo.email,
                            personalInfo.phone,
                            personalInfo.location,
                            personalInfo.github?.replace('https://', ''),
                            personalInfo.linkedin?.replace('https://', ''),
                            personalInfo.website?.replace('https://', '')
                        ].filter(Boolean).map((item, i) => (
                            <span key={i}>{item}</span>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32 }}>
                    {/* Left Column (Skills, Education, etc usually) */}
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
