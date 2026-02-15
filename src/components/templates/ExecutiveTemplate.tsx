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

export default function ExecutiveTemplate({ resume, scale = 1 }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const primaryColor = settings.colors.primary;

    const visibleSections = (Array.isArray(sections) ? sections : []).filter(s => s.visible).sort((a, b) => a.order - b.order);

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: settings.font + ', sans-serif',
                fontSize: settings.fontSize + 'px',
                lineHeight: settings.lineHeight,
                padding: 0,
                display: 'flex',
                flexDirection: 'row',
            }}
        >
            {/* Sidebar Column (Left) */}
            <div style={{
                width: '32%',
                background: '#f4f4f5',
                padding: `${settings.pageMargin}px 24px`,
                borderRight: '1px solid #e4e4e7',
                display: 'flex',
                flexDirection: 'column',
                gap: settings.sectionSpacing * 1.5,
            }}>
                {personalInfo.photo && (
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                        <img
                            src={personalInfo.photo}
                            alt={personalInfo.fullName}
                            style={{ width: 140, height: 140, borderRadius: '50%', objectFit: 'cover', border: `4px solid white`, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                        />
                    </div>
                )}

                {/* Contact Info in Sidebar */}
                <div>
                    <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: primaryColor, marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid ${primaryColor}` }}>Contact</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '11pt' }}>
                        {personalInfo.email && <div style={{ wordBreak: 'break-all' }}>{personalInfo.email}</div>}
                        {personalInfo.phone && <div>{personalInfo.phone}</div>}
                        {personalInfo.location && <div>{personalInfo.location}</div>}
                        {personalInfo.website && <a href={personalInfo.website} style={{ color: 'inherit', textDecoration: 'none' }}>{personalInfo.website.replace(/^https?:\/\//, '')}</a>}
                        {personalInfo.linkedin && <a href={personalInfo.linkedin} style={{ color: 'inherit', textDecoration: 'none' }}>LinkedIn</a>}
                    </div>
                </div>

                {visibleSections.filter(s => s.column === 'left').map(section => {
                    switch (section.type) {
                        case 'education':
                            return education.length > 0 ? (
                                <div key={section.id}>
                                    <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: primaryColor, marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid ${primaryColor}` }}>{section.title}</h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {education.map(edu => (
                                            <div key={edu.id}>
                                                <div style={{ fontWeight: 700, fontSize: '12pt' }}>{edu.degree}</div>
                                                <div style={{ fontSize: '11pt' }}>{edu.institution}</div>
                                                <div style={{ fontSize: '10pt', color: '#666', marginTop: 2 }}>
                                                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null;

                        case 'skills':
                            return skills.length > 0 ? (
                                <div key={section.id}>
                                    <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: primaryColor, marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid ${primaryColor}` }}>{section.title}</h2>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {skills.map(s => (
                                            <span key={s.id} style={{ fontSize: '10pt', background: '#fff', border: '1px solid #ddd', borderRadius: 4, padding: '2px 6px' }}>{s.name}</span>
                                        ))}
                                    </div>
                                </div>
                            ) : null;

                        case 'personalInfo':
                            return null;

                        // Flexible handling for other sections in sidebar
                        default:
                            const items: any[] = (resume as any)[section.type] || (section.type === 'custom' ? resume.customSections.find(cs => cs.id === section.customSectionId)?.items : []);
                            if (!items || items.length === 0) return null;
                            return (
                                <div key={section.id}>
                                    <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: primaryColor, marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid ${primaryColor}` }}>{section.title}</h2>
                                    <ul style={{ paddingLeft: 16, margin: 0, fontSize: '11pt' }}>
                                        {items.map((item: any) => (
                                            <li key={item.id} style={{ marginBottom: 4 }}>
                                                {item.name || item.title} {item.proficiency ? `(${item.proficiency})` : ''}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                    }
                })}
            </div>

            {/* Main Content Column (Right) */}
            <div style={{
                flex: 1,
                padding: `${settings.pageMargin}px 40px`,
                display: 'flex',
                flexDirection: 'column',
            }}>
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#1a1a2e', lineHeight: 1, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                        {personalInfo.fullName}
                    </h1>
                    <div style={{ fontSize: '18px', color: primaryColor, fontWeight: 600, marginTop: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {personalInfo.jobTitle}
                    </div>
                </div>

                {visibleSections.filter(s => (s.column === 'right' || !s.column)).map(section => {
                    if (section.type === 'personalInfo') return null;
                    switch (section.type) {
                        case 'summary':
                            return personalInfo.summary ? (
                                <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <h2 style={{ fontSize: '16px', fontWeight: 700, textTransform: 'uppercase', color: '#1a1a2e', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ width: 40, height: 2, background: '#1a1a2e' }}></span>
                                        {section.title}
                                    </h2>
                                    <HtmlRenderer html={personalInfo.summary} className="html-content" />
                                </div>
                            ) : null;

                        case 'experience':
                            return experience.length > 0 ? (
                                <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <h2 style={{ fontSize: '16px', fontWeight: 700, textTransform: 'uppercase', color: '#1a1a2e', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ width: 40, height: 2, background: '#1a1a2e' }}></span>
                                        {section.title}
                                    </h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                        {experience.map(exp => (
                                            <div key={exp.id}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a2e' }}>{exp.position}</h3>
                                                    <span style={{ fontWeight: 600, fontSize: '11pt', color: '#444' }}>{formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}</span>
                                                </div>
                                                <div style={{ fontSize: '12pt', color: primaryColor, fontWeight: 500, marginBottom: 8 }}>{exp.company}, {exp.location}</div>
                                                <HtmlRenderer html={exp.description} className="html-content" />
                                                <ul style={{ paddingLeft: 18, margin: 0 }}>
                                                    {exp.highlights.filter(Boolean).map((h, i) => (
                                                        <li key={i} style={{ marginBottom: 4, fontSize: '10.5pt' }}>{h}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null;

                        case 'projects':
                            return projects.length > 0 ? (
                                <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <h2 style={{ fontSize: '16px', fontWeight: 700, textTransform: 'uppercase', color: '#1a1a2e', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ width: 40, height: 2, background: '#1a1a2e' }}></span>
                                        {section.title}
                                    </h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        {projects.map(proj => (
                                            <div key={proj.id}>
                                                <h3 style={{ fontSize: '14px', fontWeight: 700 }}>{proj.name}</h3>
                                                <HtmlRenderer html={proj.description} className="html-content" />
                                                {proj.technologies.length > 0 && <div style={{ fontSize: '10pt', color: '#666', marginTop: 4, fontStyle: 'italic' }}>{proj.technologies.join(', ')}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null;

                        // Handle custom sections and others in main column
                        default:
                            const items: any[] = (resume as any)[section.type] || (section.type === 'custom' ? resume.customSections.find(cs => cs.id === section.customSectionId)?.items : []);
                            if (!items || items.length === 0) return null;
                            const sectionTitle = section.title || (section.type === 'custom' ? resume.customSections.find(cs => cs.id === section.customSectionId)?.title : '');

                            // Check if it's a list-like section (skills, languages) forced into main column
                            const isList = ['skills', 'languages', 'certifications', 'awards'].includes(section.type);

                            return (
                                <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <h2 style={{ fontSize: '16px', fontWeight: 700, textTransform: 'uppercase', color: '#1a1a2e', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ width: 40, height: 2, background: '#1a1a2e' }}></span>
                                        {sectionTitle}
                                    </h2>
                                    {isList ? (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                                            {items.map((item: any) => (
                                                <div key={item.id} style={{ background: '#f5f5f5', padding: '6px 12px', borderRadius: 4, fontSize: '13px', fontWeight: 500 }}>
                                                    {item.name || item.title}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        items.map(item => (
                                            <div key={item.id} style={{ marginBottom: 12 }}>
                                                <div style={{ fontWeight: 700 }}>{item.title || item.name}</div>
                                                <div><HtmlRenderer html={item.description} /></div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            );
                    }
                })}
            </div>
        </div>
    );
}
