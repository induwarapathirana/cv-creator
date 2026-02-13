'use client';

import { Resume } from '@/types/resume';

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

export default function ClassicTemplate({ resume, scale = 1 }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections, settings } = resume;
    const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: settings.fontSize + 'px',
                lineHeight: settings.lineHeight,
                transform: `scale(${scale})`,
                padding: settings.pageMargin + 'px',
            }}
        >
            <div className="resume-template">
                {visibleSections.map((section) => {
                    switch (section.type) {
                        case 'personalInfo':
                            return (
                                <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px', textAlign: 'center', borderBottom: '2px solid #1a1a2e', paddingBottom: 16 }}>
                                    <h1 style={{ color: '#1a1a2e', fontSize: '26px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                        {personalInfo.fullName || 'Your Name'}
                                    </h1>
                                    {personalInfo.jobTitle && (
                                        <p style={{ fontSize: '13px', color: '#555', marginTop: 6, fontStyle: 'italic' }}>
                                            {personalInfo.jobTitle}
                                        </p>
                                    )}
                                    <div className="contact-row" style={{ justifyContent: 'center', marginTop: 8, gap: 10, fontSize: '10pt' }}>
                                        {personalInfo.email && <span>{personalInfo.email}</span>}
                                        {personalInfo.phone && <span>| {personalInfo.phone}</span>}
                                        {personalInfo.location && <span>| {personalInfo.location}</span>}
                                        {personalInfo.linkedin && <span>| {personalInfo.linkedin}</span>}
                                        {personalInfo.website && <span>| {personalInfo.website}</span>}
                                    </div>
                                </div>
                            );

                        case 'summary':
                            return personalInfo.summary ? (
                                <div key={section.id} className="section" style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <h2 style={{ color: '#1a1a2e', borderBottom: '1px solid #ccc', fontSize: '13pt', fontVariant: 'small-caps' }}>{section.title}</h2>
                                    <p style={{ fontSize: '10.5pt', lineHeight: 1.6, color: '#333', textAlign: 'justify' }}>{personalInfo.summary}</p>
                                </div>
                            ) : null;

                        case 'experience':
                            return experience.length > 0 ? (
                                <div key={section.id} className="section" style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <h2 style={{ color: '#1a1a2e', borderBottom: '1px solid #ccc', fontSize: '13pt', fontVariant: 'small-caps' }}>{section.title}</h2>
                                    {experience.map((exp) => (
                                        <div key={exp.id} className="entry">
                                            <div className="entry-header">
                                                <h3 style={{ fontStyle: 'normal' }}>{exp.position}</h3>
                                                <span className="entry-date">{formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}</span>
                                            </div>
                                            <div className="entry-subtitle" style={{ fontStyle: 'italic' }}>
                                                {exp.company}{exp.location ? `, ${exp.location}` : ''}
                                            </div>
                                            {exp.highlights.length > 0 && (
                                                <ul>{exp.highlights.filter(Boolean).map((h, i) => <li key={i}>{h}</li>)}</ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : null;

                        case 'education':
                            return education.length > 0 ? (
                                <div key={section.id} className="section" style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <h2 style={{ color: '#1a1a2e', borderBottom: '1px solid #ccc', fontSize: '13pt', fontVariant: 'small-caps' }}>{section.title}</h2>
                                    {education.map((edu) => (
                                        <div key={edu.id} className="entry">
                                            <div className="entry-header">
                                                <h3>{edu.degree} in {edu.field}</h3>
                                                <span className="entry-date">{formatDate(edu.startDate)} — {formatDate(edu.endDate)}</span>
                                            </div>
                                            <div className="entry-subtitle" style={{ fontStyle: 'italic' }}>{edu.institution}{edu.gpa ? ` — GPA: ${edu.gpa}` : ''}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : null;

                        case 'skills':
                            return skills.length > 0 ? (
                                <div key={section.id} className="section" style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <h2 style={{ color: '#1a1a2e', borderBottom: '1px solid #ccc', fontSize: '13pt', fontVariant: 'small-caps' }}>{section.title}</h2>
                                    <p style={{ fontSize: '10pt', color: '#444' }}>{skills.map(s => s.name).join(' · ')}</p>
                                </div>
                            ) : null;

                        case 'projects':
                            return projects.length > 0 ? (
                                <div key={section.id} className="section" style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <h2 style={{ color: '#1a1a2e', borderBottom: '1px solid #ccc', fontSize: '13pt', fontVariant: 'small-caps' }}>{section.title}</h2>
                                    {projects.map((proj) => (
                                        <div key={proj.id} className="entry">
                                            <div className="entry-header"><h3>{proj.name}</h3></div>
                                            <p style={{ fontSize: '10pt', color: '#444' }}>{proj.description}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : null;

                        case 'certifications':
                            return certifications.length > 0 ? (
                                <div key={section.id} className="section" style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <h2 style={{ color: '#1a1a2e', borderBottom: '1px solid #ccc', fontSize: '13pt', fontVariant: 'small-caps' }}>{section.title}</h2>
                                    {certifications.map((cert) => (
                                        <div key={cert.id} style={{ marginBottom: 4, fontSize: '10pt' }}>
                                            <strong>{cert.name}</strong> — {cert.issuer} ({formatDate(cert.date)})
                                        </div>
                                    ))}
                                </div>
                            ) : null;

                        case 'languages':
                            return languages.length > 0 ? (
                                <div key={section.id} className="section" style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <h2 style={{ color: '#1a1a2e', borderBottom: '1px solid #ccc', fontSize: '13pt', fontVariant: 'small-caps' }}>{section.title}</h2>
                                    <p style={{ fontSize: '10pt' }}>{languages.map(l => `${l.name} (${l.proficiency})`).join(' · ')}</p>
                                </div>
                            ) : null;

                        case 'awards':
                            return awards.length > 0 ? (
                                <div key={section.id} className="section" style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <h2 style={{ color: '#1a1a2e', borderBottom: '1px solid #ccc', fontSize: '13pt', fontVariant: 'small-caps' }}>{section.title}</h2>
                                    {awards.map((a) => (
                                        <div key={a.id} style={{ marginBottom: 4, fontSize: '10pt' }}>
                                            <strong>{a.title}</strong> — {a.issuer} ({formatDate(a.date)})
                                        </div>
                                    ))}
                                </div>
                            ) : null;

                        default:
                            return null;
                    }
                })}
            </div>
        </div>
    );
}
