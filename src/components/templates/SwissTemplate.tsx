'use client';

import { Resume } from '@/types/resume';

interface TemplateProps {
    resume: Resume;
    scale?: number;
}

function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const [year, month] = dateStr.split('-');
    return `${year}`; // Swiss style usually just years or minimal date
}

export default function SwissTemplate({ resume, scale = 1 }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections, settings } = resume;
    const primaryColor = settings.colors.primary;
    const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: 'Helvetica, Arial, sans-serif', // Enforce Swiss typography
                fontSize: settings.fontSize + 'px',
                lineHeight: settings.lineHeight,
                transform: `scale(${scale})`,
                padding: settings.pageMargin + 'px',
            }}
        >
            <div className="resume-template">
                {/* Header - Huge and Bold */}
                <div style={{ marginBottom: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                    <div>
                        <h1 style={{ fontSize: '64px', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.04em', margin: '0 0 16px 0', textTransform: 'lowercase' }}>
                            {personalInfo.fullName.split(' ')[0]}<br />
                            <span style={{ color: primaryColor }}>{personalInfo.fullName.split(' ').slice(1).join(' ')}</span>.
                        </h1>
                        <p style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>{personalInfo.jobTitle}</p>
                    </div>

                    {personalInfo.photo && (
                        <img src={personalInfo.photo} alt="Profile" style={{ width: 120, height: 120, objectFit: 'cover', filter: 'grayscale(100%)' }} />
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 40, borderTop: '4px solid #000', paddingTop: 32 }}>

                    {/* Sidebar Info */}
                    <div style={{ fontSize: '14px', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: 32 }}>
                        <div>
                            <div style={{ textTransform: 'uppercase', fontSize: '12px', color: '#999', marginBottom: 8 }}>Contact</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {personalInfo.email && <div style={{ wordBreak: 'break-all' }}>{personalInfo.email}</div>}
                                {personalInfo.phone && <div>{personalInfo.phone}</div>}
                                {personalInfo.location && <div>{personalInfo.location}</div>}
                                {personalInfo.website && <div>{personalInfo.website.replace('https://', '')}</div>}
                            </div>
                        </div>

                        {visibleSections.filter(s => ['skills', 'languages', 'certifications', 'awards'].includes(s.type)).map(section => {
                            switch (section.type) {
                                case 'skills':
                                    return skills.length > 0 ? (
                                        <div key={section.id}>
                                            <div style={{ textTransform: 'uppercase', fontSize: '12px', color: '#999', marginBottom: 8 }}>{section.title}</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                {skills.map(s => <span key={s.id}>{s.name}</span>)}
                                            </div>
                                        </div>
                                    ) : null;
                                // ... other lists
                                case 'languages':
                                    return languages.length > 0 ? (
                                        <div key={section.id}>
                                            <div style={{ textTransform: 'uppercase', fontSize: '12px', color: '#999', marginBottom: 8 }}>{section.title}</div>
                                            {languages.map(l => <div key={l.id}>{l.name} <span style={{ color: '#999', fontWeight: 400 }}>— {l.proficiency}</span></div>)}
                                        </div>
                                    ) : null;
                                default: return null;
                            }
                        })}
                    </div>

                    {/* Main Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
                        {visibleSections.filter(s => ['summary', 'experience', 'education', 'projects', 'custom'].includes(s.type)).map(section => {
                            switch (section.type) {
                                case 'summary':
                                    return personalInfo.summary ? (
                                        <div key={section.id}>
                                            <p style={{ fontSize: '18px', fontWeight: 500, lineHeight: 1.4 }}>{personalInfo.summary}</p>
                                        </div>
                                    ) : null;

                                case 'experience':
                                    return experience.length > 0 ? (
                                        <div key={section.id}>
                                            <h2 style={{ fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', marginBottom: 24, letterSpacing: '0.05em' }}>{section.title}</h2>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                                                {experience.map(exp => (
                                                    <div key={exp.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 24 }}>
                                                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#000' }}>
                                                            {formatDate(exp.startDate)} —<br />{exp.current ? 'Now' : formatDate(exp.endDate)}
                                                        </div>
                                                        <div>
                                                            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0' }}>{exp.position}</h3>
                                                            <div style={{ fontSize: '14px', fontWeight: 600, color: primaryColor, marginBottom: 8 }}>{exp.company}, {exp.location}</div>
                                                            <p style={{ fontSize: '14px', lineHeight: 1.5, fontWeight: 500 }}>{exp.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null;

                                case 'education':
                                    return education.length > 0 ? (
                                        <div key={section.id}>
                                            <h2 style={{ fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', marginBottom: 24, letterSpacing: '0.05em' }}>{section.title}</h2>
                                            {education.map(edu => (
                                                <div key={edu.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 24, marginBottom: 16 }}>
                                                    <div style={{ fontSize: '14px', fontWeight: 700 }}>{formatDate(edu.startDate)} — {formatDate(edu.endDate)}</div>
                                                    <div>
                                                        <div style={{ fontSize: '16px', fontWeight: 700 }}>{edu.institution}</div>
                                                        <div style={{ fontSize: '14px', color: '#555' }}>{edu.degree}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null;

                                default: return null;
                            }
                        })}
                    </div>

                </div>
            </div>
        </div>
    );
}
