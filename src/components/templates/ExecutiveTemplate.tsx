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

export default function ExecutiveTemplate({ resume }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const primaryColor = settings.colors.primary;
    const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

    const SectionTitle = ({ title }: { title: string }) => (
        <h2 style={{
            fontSize: '14px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#111827',
            borderBottom: '1px solid #111827',
            paddingBottom: 4,
            marginBottom: 16
        }}>
            {title}
        </h2>
    );

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: 'Georgia, Cambria, "Times New Roman", serif',
                fontSize: settings.fontSize + 'px',
                lineHeight: 1.6,
                padding: settings.pageMargin + 'px',
                color: '#1f2937',
            }}
        >
            <div className="resume-template">
                {/* Header - Centered, Classic */}
                <div style={{ textAlign: 'center', marginBottom: 40, borderBottom: '1px double #e5e7eb', paddingBottom: 24 }}>
                    <h1 style={{ fontSize: '36px', fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-0.01em', color: '#111827' }}>
                        {personalInfo.fullName.toUpperCase()}
                    </h1>
                    <div style={{ fontSize: '18px', color: primaryColor, marginBottom: 16, fontWeight: 500, fontStyle: 'italic' }}>
                        {personalInfo.jobTitle}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: '#4b5563' }}>
                        {[
                            personalInfo.location,
                            personalInfo.phone,
                            personalInfo.email,
                            personalInfo.linkedin?.replace('https://', ''),
                            personalInfo.website?.replace('https://', '')
                        ].filter(Boolean).map((item, i) => (
                            <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
                                {i > 0 && <span style={{ marginRight: 16, color: '#d1d5db' }}>|</span>}
                                {item}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {visibleSections.map(section => {
                        if (section.type === 'personalInfo') return null;

                        switch (section.type) {
                            case 'summary':
                                return personalInfo.summary ? (
                                    <div key={section.id}>
                                        <SectionTitle title="Executive Profile" />
                                        <HtmlRenderer html={personalInfo.summary} className="html-content" />
                                    </div>
                                ) : null;

                            case 'experience':
                                return experience.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                            {experience.map(exp => (
                                                <div key={exp.id}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                                                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>{exp.position}</h3>
                                                        <span style={{ fontSize: '14px', color: '#4b5563', fontStyle: 'italic' }}>
                                                            {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: '16px', color: primaryColor, marginBottom: 8, fontWeight: 500 }}>
                                                        {exp.company}{exp.location ? `, ${exp.location}` : ''}
                                                    </div>
                                                    <HtmlRenderer html={exp.description} className="html-content" />
                                                    {exp.highlights.length > 0 && (
                                                        <ul style={{ marginTop: 8, paddingLeft: 16 }}>
                                                            {exp.highlights.filter(Boolean).map((h, i) => (
                                                                <li key={i} style={{ marginBottom: 4 }}>{h}</li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'education':
                                return education.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                            {education.map(edu => (
                                                <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: '16px' }}>{edu.institution}</div>
                                                        <div>{edu.degree} in {edu.field}</div>
                                                        {edu.description && <div style={{ fontSize: '13px', marginTop: 4 }}><HtmlRenderer html={edu.description} /></div>}
                                                    </div>
                                                    <div style={{ textAlign: 'right', fontStyle: 'italic', color: '#4b5563' }}>
                                                        {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'skills':
                                return skills.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} />
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px' }}>
                                            {skills.map(skill => (
                                                <span key={skill.id} style={{ fontSize: '14px', background: '#f3f4f6', padding: '4px 12px', borderRadius: 4, border: '1px solid #e5e7eb' }}>
                                                    {skill.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'projects':
                                return projects.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.title} />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                            {projects.map(proj => (
                                                <div key={proj.id} style={{ marginBottom: 4 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '16px' }}>
                                                        <span>{proj.name}</span>
                                                        <span style={{ fontSize: '14px', fontWeight: 400, color: '#4b5563' }}>
                                                            {formatDate(proj.startDate)} {proj.endDate ? `– ${formatDate(proj.endDate)}` : ''}
                                                        </span>
                                                    </div>
                                                    {proj.technologies && proj.technologies.length > 0 && (
                                                        <div style={{ fontSize: '13px', color: primaryColor, marginBottom: 4 }}>{proj.technologies.join(' • ')}</div>
                                                    )}
                                                    <HtmlRenderer html={proj.description} className="html-content" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            default:
                                // Generic fallback for Awards, Languages, Certifications, Custom
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
                                        <SectionTitle title={dynamicTitle || section.title} />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                            {items.map((item: any) => (
                                                <div key={item.id}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '15px' }}>
                                                        <span>{item.title || item.name || item.institution}</span>
                                                        <span style={{ fontWeight: 400, color: '#4b5563', fontSize: '14px' }}>
                                                            {formatDate(item.date || item.startDate)}
                                                        </span>
                                                    </div>
                                                    {item.subtitle && <div style={{ fontStyle: 'italic', fontSize: '14px', marginBottom: 2 }}>{item.subtitle}</div>}
                                                    {item.description && <HtmlRenderer html={item.description} className="html-content" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                        }
                    })}
                </div>
            </div>
        </div>
    );
}
