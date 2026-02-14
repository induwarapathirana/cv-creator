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

export default function MinimalTemplate({ resume, scale = 1 }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const visibleSections = (Array.isArray(sections) ? sections : []).filter(s => s.visible).sort((a, b) => a.order - b.order);
    const primaryColor = settings.colors.primary;

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: settings.font + ', sans-serif',
                fontSize: settings.fontSize + 'px',
                lineHeight: settings.lineHeight,
                transform: `scale(${scale})`,
                padding: settings.pageMargin + 'px',
            }}
        >
            <div className="resume-template">
                {/* Header - Left Aligned */}
                <div style={{ marginBottom: settings.sectionSpacing * 1.5 + 'px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 4 }}>
                        {personalInfo.fullName || 'Your Name'}
                    </h1>
                    <p style={{ fontSize: '16px', color: '#555', fontWeight: 500 }}>{personalInfo.jobTitle}</p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 24px', marginTop: 12, fontSize: '13px', color: '#666' }}>
                        {personalInfo.email && <span>{personalInfo.email}</span>}
                        {personalInfo.phone && <span>{personalInfo.phone}</span>}
                        {personalInfo.location && <span>{personalInfo.location}</span>}
                        {personalInfo.website && <span>{personalInfo.website.replace('https://', '')}</span>}
                        {personalInfo.linkedin && <span>{personalInfo.linkedin.replace('https://www.', '').replace('linkedin.com/in/', 'in/')}</span>}
                    </div>
                </div>

                {visibleSections.map((section) => {
                    if (section.type === 'personalInfo') return null; // Handled above

                    switch (section.type) {
                        case 'summary':
                            return personalInfo.summary ? (
                                <div key={section.id} className="section" style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <HtmlRenderer html={personalInfo.summary} className="html-content" />
                                </div>
                            ) : null;

                        case 'experience':
                            return experience.length > 0 ? (
                                <div key={section.id} className="section" style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <h2 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: 16 }}>
                                        {section.title}
                                    </h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                        {experience.map((exp) => (
                                            <div key={exp.id}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                                                    <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{exp.position}</h3>
                                                    <span style={{ fontSize: '13px', color: '#666' }}>
                                                        {formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '13px', fontWeight: 500, color: '#444', marginBottom: 6 }}>
                                                    {exp.company}{exp.location ? `, ${exp.location}` : ''}
                                                </div>
                                                {exp.description && <HtmlRenderer html={exp.description} className="html-content" />}
                                                {exp.highlights.length > 0 && (
                                                    <ul style={{ paddingLeft: 16, margin: 0 }}>
                                                        {exp.highlights.filter(Boolean).map((h, i) => (
                                                            <li key={i} style={{ fontSize: '10pt', marginBottom: 3 }}>{h}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null;

                        // ... reuse logic for other sections, keeping styling minimal ...
                        case 'education':
                        case 'projects':
                        case 'awards':
                        case 'certifications':
                        case 'custom':
                            // Generic minimal implementation for list items
                            const items: any[] = (resume as any)[section.type] || (section.type === 'custom' ? resume.customSections.find(cs => cs.id === section.customSectionId)?.items : []);
                            if (!items || items.length === 0) return null;

                            return (
                                <div key={section.id} className="section" style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <h2 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: 16 }}>
                                        {section.title}
                                    </h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        {items.map((item: any) => (
                                            <div key={item.id}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                                                    <h3 style={{ fontSize: '14px', fontWeight: 700 }}>{item.institution || item.name || item.title}</h3>
                                                    <span style={{ fontSize: '13px', color: '#666' }}>
                                                        {formatDate(item.startDate || item.date)} {item.endDate ? `— ${formatDate(item.endDate)}` : ''}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '13px', color: '#444' }}>
                                                    {item.degree ? `${item.degree} in ${item.field}` : (item.issuer || item.subtitle)}
                                                </div>
                                                {item.description && <HtmlRenderer html={item.description} className="html-content" />}
                                                {item.technologies && item.technologies.length > 0 && (
                                                    <div style={{ fontSize: '9pt', color: '#666', marginTop: 4 }}>{item.technologies.join(' • ')}</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );

                        case 'skills':
                            return skills.length > 0 ? (
                                <div key={section.id} className="section" style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <h2 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: 12 }}>
                                        {section.title}
                                    </h2>
                                    <p style={{ fontSize: '10.5pt', lineHeight: 1.6 }}>{skills.map(s => s.name).join(', ')}</p>
                                </div>
                            ) : null;

                        case 'languages':
                            return languages.length > 0 ? (
                                <div key={section.id} className="section" style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <h2 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: 12 }}>
                                        {section.title}
                                    </h2>
                                    <p style={{ fontSize: '10.5pt' }}>{languages.map(l => `${l.name} (${l.proficiency})`).join(' · ')}</p>
                                </div>
                            ) : null;

                        default: return null;
                    }
                })}
            </div>
        </div>
    );
}
