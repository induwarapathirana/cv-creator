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

export default function ModernTemplate({ resume, scale = 1 }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections, settings } = resume;
    const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);
    const primaryColor = settings.colors.primary;

    const skillsByCategory = skills.reduce((acc, skill) => {
        if (!acc[skill.category]) acc[skill.category] = [];
        acc[skill.category].push(skill);
        return acc;
    }, {} as Record<string, typeof skills>);

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
                {visibleSections.map((section) => {
                    switch (section.type) {
                        case 'personalInfo':
                            return (
                                <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px', textAlign: 'center' }}>
                                    <h1 style={{ color: primaryColor, fontSize: '28px', letterSpacing: '-0.02em' }}>
                                        {personalInfo.fullName || 'Your Name'}
                                    </h1>
                                    {personalInfo.jobTitle && (
                                        <p style={{ fontSize: '14px', color: '#555', marginTop: 4, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                            {personalInfo.jobTitle}
                                        </p>
                                    )}
                                    <div className="contact-row" style={{ justifyContent: 'center', marginTop: 10, gap: 8, flexWrap: 'wrap' }}>
                                        {personalInfo.email && <span>{personalInfo.email}</span>}
                                        {personalInfo.phone && <span>• {personalInfo.phone}</span>}
                                        {personalInfo.location && <span>• {personalInfo.location}</span>}
                                        {personalInfo.linkedin && <span>• {personalInfo.linkedin}</span>}
                                        {personalInfo.website && <span>• {personalInfo.website}</span>}
                                        {personalInfo.github && <span>• {personalInfo.github}</span>}
                                    </div>
                                </div>
                            );

                        case 'summary':
                            return personalInfo.summary ? (
                                <div key={section.id} className="section" style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <h2 style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}` }}>{section.title}</h2>
                                    <p style={{ fontSize: '10.5pt', lineHeight: 1.6, color: '#333' }}>{personalInfo.summary}</p>
                                </div>
                            ) : null;

                        case 'experience':
                            return experience.length > 0 ? (
                                <div key={section.id} className="section" style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <h2 style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}` }}>{section.title}</h2>
                                    {experience.map((exp) => (
                                        <div key={exp.id} className="entry">
                                            <div className="entry-header">
                                                <h3>{exp.position}</h3>
                                                <span className="entry-date">
                                                    {formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}
                                                </span>
                                            </div>
                                            <div className="entry-subtitle">
                                                {exp.company}{exp.location ? `, ${exp.location}` : ''}
                                            </div>
                                            {exp.description && <p style={{ fontSize: '10pt', marginTop: 4, color: '#444' }}>{exp.description}</p>}
                                            {exp.highlights.length > 0 && (
                                                <ul>
                                                    {exp.highlights.filter(Boolean).map((h, i) => (
                                                        <li key={i}>{h}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : null;

                        case 'education':
                            return education.length > 0 ? (
                                <div key={section.id} className="section" style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <h2 style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}` }}>{section.title}</h2>
                                    {education.map((edu) => (
                                        <div key={edu.id} className="entry">
                                            <div className="entry-header">
                                                <h3>{edu.degree} in {edu.field}</h3>
                                                <span className="entry-date">
                                                    {formatDate(edu.startDate)} — {formatDate(edu.endDate)}
                                                </span>
                                            </div>
                                            <div className="entry-subtitle">
                                                {edu.institution}{edu.location ? `, ${edu.location}` : ''}
                                                {edu.gpa ? ` • GPA: ${edu.gpa}` : ''}
                                            </div>
                                            {edu.description && <p style={{ fontSize: '10pt', marginTop: 4, color: '#444' }}>{edu.description}</p>}
                                        </div>
                                    ))}
                                </div>
                            ) : null;

                        case 'skills':
                            return skills.length > 0 ? (
                                <div key={section.id} className="section" style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <h2 style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}` }}>{section.title}</h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {Object.entries(skillsByCategory).map(([category, catSkills]) => (
                                            <div key={category} style={{ display: 'flex', gap: 8, fontSize: '10pt' }}>
                                                <span style={{ fontWeight: 600, minWidth: 80, color: '#333' }}>{category}:</span>
                                                <span style={{ color: '#555' }}>{catSkills.map(s => s.name).join(', ')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null;

                        case 'projects':
                            return projects.length > 0 ? (
                                <div key={section.id} className="section" style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <h2 style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}` }}>{section.title}</h2>
                                    {projects.map((proj) => (
                                        <div key={proj.id} className="entry">
                                            <div className="entry-header">
                                                <h3>{proj.name}</h3>
                                                {(proj.startDate || proj.endDate) && (
                                                    <span className="entry-date">
                                                        {formatDate(proj.startDate)}{proj.endDate ? ` — ${formatDate(proj.endDate)}` : ''}
                                                    </span>
                                                )}
                                            </div>
                                            {proj.technologies.length > 0 && (
                                                <div style={{ fontSize: '9pt', color: primaryColor, marginBottom: 2 }}>
                                                    {proj.technologies.join(' • ')}
                                                </div>
                                            )}
                                            <p style={{ fontSize: '10pt', color: '#444' }}>{proj.description}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : null;

                        case 'certifications':
                            return certifications.length > 0 ? (
                                <div key={section.id} className="section" style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <h2 style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}` }}>{section.title}</h2>
                                    {certifications.map((cert) => (
                                        <div key={cert.id} className="entry" style={{ marginBottom: 6 }}>
                                            <div className="entry-header">
                                                <h3>{cert.name}</h3>
                                                <span className="entry-date">{formatDate(cert.date)}</span>
                                            </div>
                                            <div className="entry-subtitle">{cert.issuer}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : null;

                        case 'languages':
                            return languages.length > 0 ? (
                                <div key={section.id} className="section" style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <h2 style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}` }}>{section.title}</h2>
                                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '10pt' }}>
                                        {languages.map((lang) => (
                                            <span key={lang.id}>
                                                <strong>{lang.name}</strong> — {lang.proficiency.charAt(0).toUpperCase() + lang.proficiency.slice(1)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : null;

                        case 'awards':
                            return awards.length > 0 ? (
                                <div key={section.id} className="section" style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <h2 style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}` }}>{section.title}</h2>
                                    {awards.map((award) => (
                                        <div key={award.id} className="entry" style={{ marginBottom: 6 }}>
                                            <div className="entry-header">
                                                <h3>{award.title}</h3>
                                                <span className="entry-date">{formatDate(award.date)}</span>
                                            </div>
                                            <div className="entry-subtitle">{award.issuer}</div>
                                            {award.description && <p style={{ fontSize: '10pt', color: '#444' }}>{award.description}</p>}
                                        </div>
                                    ))}
                                </div>
                            ) : null;

                        case 'custom':
                            const customSection = resume.customSections.find(cs => cs.id === section.customSectionId);
                            if (!customSection || customSection.items.length === 0) return null;
                            return (
                                <div key={section.id} className="section" style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                                    <h2 style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}` }}>{customSection.title}</h2>
                                    {customSection.items.map((item) => (
                                        <div key={item.id} className="entry" style={{ marginBottom: 6 }}>
                                            <div className="entry-header">
                                                <h3>{item.title}</h3>
                                                {item.date && <span className="entry-date">{item.date}</span>}
                                            </div>
                                            {item.subtitle && <div className="entry-subtitle">{item.subtitle}</div>}
                                            {item.description && <p style={{ fontSize: '10pt', color: '#444' }}>{item.description}</p>}
                                        </div>
                                    ))}
                                </div>
                            );

                        default:
                            return null;
                    }
                })}
            </div>
        </div>
    );
}
