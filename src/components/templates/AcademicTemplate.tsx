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
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return month ? `${months[parseInt(month) - 1]} ${year}` : year;
}

export default function AcademicTemplate({ resume }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

    const SectionTitle = ({ title }: { title: string }) => (
        <h2 style={{
            fontSize: '14px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#000',
            marginBottom: 12,
            borderBottom: '1px solid #000',
            textAlign: 'center',
            paddingBottom: 4
        }}>
            {title}
        </h2>
    );

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: '"Times New Roman", Times, serif',
                fontSize: settings.fontSize + 'px',
                lineHeight: 1.4,
                padding: settings.pageMargin + 'px',
                color: '#000',
            }}
        >
            <div className="resume-template">
                {/* Header - Academic Style (Centered, simple) */}
                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 8px 0' }}>
                        {personalInfo.fullName}
                    </h1>
                    <div style={{ fontSize: '14px', marginBottom: 8 }}>
                        {[
                            personalInfo.location,
                            personalInfo.phone,
                            personalInfo.email,
                            personalInfo.website?.replace('https://', '')
                        ].filter(Boolean).join(' • ')}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {visibleSections.map(section => {
                        if (section.type === 'personalInfo') return null;

                        switch (section.type) {
                            case 'summary':
                                return personalInfo.summary ? (
                                    <div key={section.id}>
                                        <div style={{ marginBottom: 4 }}><HtmlRenderer html={personalInfo.summary} className="html-content" /></div>
                                    </div>
                                ) : null;

                            case 'education':
                                return education.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title="Education" />
                                        {education.map(edu => (
                                            <div key={edu.id} style={{ marginBottom: 8 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <strong>{edu.institution}, {edu.location}</strong>
                                                    <span>{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</span>
                                                </div>
                                                <div>{edu.degree} in {edu.field}</div>
                                                {edu.description && <div style={{ fontSize: '0.9em' }}>{edu.description}</div>}
                                            </div>
                                        ))}
                                    </div>
                                ) : null;

                            case 'experience':
                                return experience.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title="Professional Experience" />
                                        {experience.map(exp => (
                                            <div key={exp.id} style={{ marginBottom: 12 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <strong>{exp.company}</strong>
                                                    <span>{formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}</span>
                                                </div>
                                                <div style={{ fontStyle: 'italic', marginBottom: 2 }}>{exp.position}</div>
                                                <HtmlRenderer html={exp.description} className="html-content" />
                                                {exp.highlights.length > 0 && (
                                                    <ul style={{ margin: '4px 0 0 0', paddingLeft: 20 }}>
                                                        {exp.highlights.filter(Boolean).map((h, i) => (
                                                            <li key={i}>{h}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : null;

                            case 'publications': // Custom or Projects mapping
                            case 'projects':
                                return projects.length > 0 ? (
                                    <div key={section.id}>
                                        <SectionTitle title={section.type === 'projects' ? 'Research & Projects' : section.title} />
                                        {projects.map(proj => (
                                            <div key={proj.id} style={{ marginBottom: 8 }}>
                                                <strong>{proj.name}</strong> ({formatDate(proj.startDate)})
                                                <div style={{ fontSize: '0.95em' }}><HtmlRenderer html={proj.description} /></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : null;

                            default:
                                // Fallback
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
                                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                                            {items.map((item: any) => (
                                                <li key={item.id} style={{ marginBottom: 4 }}>
                                                    <strong>{item.title || item.name}</strong>
                                                    {item.institution && `, ${item.institution}`}
                                                    {item.date && ` (${formatDate(item.date)})`}
                                                    {item.subtitle && ` - ${item.subtitle}`}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                        }
                    })}
                </div>
            </div>
        </div>
    );
}
