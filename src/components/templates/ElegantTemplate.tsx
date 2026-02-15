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

export default function ElegantTemplate({ resume }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const primaryColor = settings.colors.primary;
    const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: '"Playfair Display", "Times New Roman", serif',
                fontSize: settings.fontSize + 'px',
                lineHeight: settings.lineHeight + 0.2, // Slightly more airy for elegant
                padding: (settings.pageMargin + 20) + 'px',
                color: '#333',
            }}
        >
            <div className="resume-template">
                {/* Header - Minimalist Center Aligned */}
                <div style={{ textAlign: 'center', marginBottom: 60 }}>
                    <h1 style={{ fontSize: '38px', fontWeight: 400, color: '#111', margin: '0 0 12px 0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        {personalInfo.fullName || 'Your Name'}
                    </h1>
                    <div style={{ fontSize: '14px', fontWeight: 400, color: primaryColor, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 20 }}>
                        {personalInfo.jobTitle}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px', fontSize: '12px', color: '#777', letterSpacing: '0.05em' }}>
                        {personalInfo.email && <span>{personalInfo.email}</span>}
                        {personalInfo.phone && <span>{personalInfo.phone}</span>}
                        {personalInfo.location && <span>{personalInfo.location}</span>}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: (settings.sectionSpacing + 10) + 'px' }}>
                    {visibleSections.map(section => {
                        if (section.type === 'personalInfo') return null;

                        switch (section.type) {
                            case 'summary':
                                return personalInfo.summary ? (
                                    <div key={section.id} className="section" style={{ textAlign: 'center', maxWidth: '80%', margin: '0 auto' }}>
                                        <div style={{ fontStyle: 'italic', color: '#555' }}>
                                            <HtmlRenderer html={personalInfo.summary} className="html-content" />
                                        </div>
                                    </div>
                                ) : null;

                            case 'experience':
                                return experience.length > 0 ? (
                                    <div key={section.id} className="section">
                                        <h2 style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', color: '#999', letterSpacing: '0.2em', textAlign: 'center', marginBottom: 32 }}>
                                            {section.title}
                                        </h2>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                                            {experience.map(exp => (
                                                <div key={exp.id} style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 40 }}>
                                                    <div style={{ textAlign: 'right', fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                        {formatDate(exp.startDate)} —<br />{exp.current ? 'Present' : formatDate(exp.endDate)}
                                                    </div>
                                                    <div>
                                                        <h3 style={{ fontSize: '18px', fontWeight: 500, color: '#111', margin: '0 0 4px 0' }}>{exp.position}</h3>
                                                        <div style={{ fontSize: '14px', fontWeight: 500, color: primaryColor, marginBottom: 12 }}>{exp.company}</div>
                                                        <HtmlRenderer html={exp.description} className="html-content" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'education':
                                return education.length > 0 ? (
                                    <div key={section.id} className="section">
                                        <h2 style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', color: '#999', letterSpacing: '0.2em', textAlign: 'center', marginBottom: 24 }}>
                                            {section.title}
                                        </h2>
                                        {education.map(edu => (
                                            <div key={edu.id} style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 40, marginBottom: 20 }}>
                                                <div style={{ textAlign: 'right', fontSize: '12px', color: '#999' }}>{formatDate(edu.endDate)}</div>
                                                <div>
                                                    <div style={{ fontSize: '16px', fontWeight: 500 }}>{edu.institution}</div>
                                                    <div style={{ fontSize: '14px', fontStyle: 'italic', color: '#666' }}>{edu.degree} in {edu.field}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : null;

                            case 'skills':
                                return skills.length > 0 ? (
                                    <div key={section.id} className="section">
                                        <h2 style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', color: '#999', letterSpacing: '0.2em', textAlign: 'center', marginBottom: 20 }}>
                                            {section.title}
                                        </h2>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 20px', fontSize: '14px', color: '#444' }}>
                                            {skills.map(skill => (
                                                <span key={skill.id}>{skill.name}</span>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'projects':
                                return projects.length > 0 ? (
                                    <div key={section.id} className="section">
                                        <h2 style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', color: '#999', letterSpacing: '0.2em', textAlign: 'center', marginBottom: 24 }}>
                                            {section.title}
                                        </h2>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                            {projects.map(proj => (
                                                <div key={proj.id}>
                                                    <h3 style={{ fontSize: '16px', fontWeight: 500, color: '#111', textAlign: 'center', marginBottom: 4 }}>{proj.name}</h3>
                                                    <div style={{ fontSize: '12px', color: primaryColor, textAlign: 'center', marginBottom: 8, letterSpacing: '0.05em' }}>
                                                        {proj.technologies.join(' • ')}
                                                    </div>
                                                    <div style={{ textAlign: 'center', maxWidth: '90%', margin: '0 auto' }}>
                                                        <HtmlRenderer html={proj.description} className="html-content" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'languages':
                                return languages.length > 0 ? (
                                    <div key={section.id} className="section">
                                        <h2 style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', color: '#999', letterSpacing: '0.2em', textAlign: 'center', marginBottom: 20 }}>
                                            {section.title}
                                        </h2>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 24px', fontSize: '14px' }}>
                                            {languages.map(lang => (
                                                <div key={lang.id}>
                                                    <span style={{ fontWeight: 500 }}>{lang.name}</span> <span style={{ color: '#888', fontStyle: 'italic' }}>— {lang.proficiency}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'certifications':
                                return certifications.length > 0 ? (
                                    <div key={section.id} className="section">
                                        <h2 style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', color: '#999', letterSpacing: '0.2em', textAlign: 'center', marginBottom: 20 }}>
                                            {section.title}
                                        </h2>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                                            {certifications.map(cert => (
                                                <div key={cert.id} style={{ textAlign: 'center' }}>
                                                    <div style={{ fontWeight: 500 }}>{cert.name}</div>
                                                    <div style={{ fontSize: '13px', color: '#666' }}>{cert.issuer} • {formatDate(cert.date)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'awards':
                                return awards.length > 0 ? (
                                    <div key={section.id} className="section">
                                        <h2 style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', color: '#999', letterSpacing: '0.2em', textAlign: 'center', marginBottom: 20 }}>
                                            {section.title}
                                        </h2>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                                            {awards.map(award => (
                                                <div key={award.id} style={{ textAlign: 'center', maxWidth: '80%' }}>
                                                    <div style={{ fontWeight: 500 }}>{award.title}</div>
                                                    <div style={{ fontSize: '13px', color: '#666', marginBottom: 4 }}>{award.issuer} • {formatDate(award.date)}</div>
                                                    {award.description && <div style={{ fontSize: '13px', color: '#555', fontStyle: 'italic' }}><HtmlRenderer html={award.description} /></div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'custom':
                                const customSection = resume.customSections?.find(cs => cs.id === section.customSectionId);
                                return customSection && customSection.items.length > 0 ? (
                                    <div key={section.id} className="section">
                                        <h2 style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', color: '#999', letterSpacing: '0.2em', textAlign: 'center', marginBottom: 24 }}>
                                            {section.title || customSection.title}
                                        </h2>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                            {customSection.items.map(item => (
                                                <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 40 }}>
                                                    <div style={{ textAlign: 'right', fontSize: '12px', color: '#999' }}>{formatDate(item.date)}</div>
                                                    <div>
                                                        <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: 2 }}>{item.title}</div>
                                                        {item.subtitle && <div style={{ fontSize: '14px', color: primaryColor, marginBottom: 8 }}>{item.subtitle}</div>}
                                                        {item.description && <HtmlRenderer html={item.description} className="html-content" />}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            default: return null;
                        }
                    })}
                </div>
            </div>
        </div>
    );
}
