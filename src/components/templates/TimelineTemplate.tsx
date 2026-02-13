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

export default function TimelineTemplate({ resume, scale = 1 }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections, settings } = resume;
    const primaryColor = settings.colors.primary;

    const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

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
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 40, borderBottom: `4px solid ${primaryColor}`, paddingBottom: 30 }}>
                    {personalInfo.photo && (
                        <img
                            src={personalInfo.photo}
                            alt={personalInfo.fullName}
                            style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', marginBottom: 16, border: `4px solid ${primaryColor}` }}
                        />
                    )}
                    <h1 style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.02em', color: '#1a1a2e', marginBottom: 8 }}>
                        {personalInfo.fullName}
                    </h1>
                    <div style={{ fontSize: '16px', color: primaryColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {personalInfo.jobTitle}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 20px', marginTop: 16, fontSize: '13px' }}>
                        {personalInfo.email && <span>{personalInfo.email}</span>}
                        {personalInfo.phone && <span>{personalInfo.phone}</span>}
                        {personalInfo.location && <span>{personalInfo.location}</span>}
                        {personalInfo.website && <span>{personalInfo.website.replace(/^https?:\/\//, '')}</span>}
                        {personalInfo.linkedin && <span>LinkedIn</span>}
                    </div>
                </div>

                {/* Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: settings.sectionSpacing + 'px' }}>
                    {visibleSections.map(section => {
                        if (section.type === 'personalInfo') return null;

                        switch (section.type) {
                            case 'summary':
                                return personalInfo.summary ? (
                                    <div key={section.id}>
                                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{ width: 4, height: 24, background: primaryColor }}></span>
                                            About Me
                                        </h2>
                                        <p style={{ fontSize: '11pt', lineHeight: 1.6 }}>{personalInfo.summary}</p>
                                    </div>
                                ) : null;

                            case 'experience':
                                return experience.length > 0 ? (
                                    <div key={section.id}>
                                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{ width: 4, height: 24, background: primaryColor }}></span>
                                            {section.title}
                                        </h2>
                                        <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: 20 }}>
                                            {/* Timeline vertical line */}
                                            <div style={{ position: 'absolute', left: 4, top: 4, bottom: 0, width: 2, background: '#e5e7eb' }}></div>

                                            {experience.map((exp, index) => (
                                                <div key={exp.id} style={{ marginBottom: 24, position: 'relative', paddingLeft: 24 }}>
                                                    {/* Timeline dot */}
                                                    <div style={{ position: 'absolute', left: -21, top: 6, width: 10, height: 10, borderRadius: '50%', background: primaryColor, border: '2px solid white', boxShadow: '0 0 0 2px ' + primaryColor }}></div>

                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                                                        <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{exp.position}</h3>
                                                        <span style={{ fontSize: '12px', fontWeight: 600, color: primaryColor, background: 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: 4 }}>
                                                            {formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: 8 }}>
                                                        {exp.company}{exp.location ? `, ${exp.location}` : ''}
                                                    </div>
                                                    <p style={{ fontSize: '10.5pt', marginBottom: 6 }}>{exp.description}</p>
                                                    {exp.highlights.length > 0 && (
                                                        <ul style={{ paddingLeft: 18, margin: 0 }}>
                                                            {exp.highlights.filter(Boolean).map((h, i) => (
                                                                <li key={i} style={{ marginBottom: 3, fontSize: '10pt' }}>{h}</li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'education': // Simple timeline for education too
                                return education.length > 0 ? (
                                    <div key={section.id}>
                                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{ width: 4, height: 24, background: primaryColor }}></span>
                                            {section.title}
                                        </h2>
                                        <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: 20 }}>
                                            <div style={{ position: 'absolute', left: 4, top: 4, bottom: 0, width: 2, background: '#e5e7eb' }}></div>
                                            {education.map((edu) => (
                                                <div key={edu.id} style={{ marginBottom: 20, position: 'relative', paddingLeft: 24 }}>
                                                    <div style={{ position: 'absolute', left: -20, top: 6, width: 8, height: 8, borderRadius: '50%', background: '#fff', border: `2px solid ${primaryColor}` }}></div>
                                                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{edu.degree}</div>
                                                    <div style={{ fontSize: '13px' }}>{edu.institution}</div>
                                                    <div style={{ fontSize: '12px', color: '#666', marginTop: 2 }}>
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
                                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{ width: 4, height: 24, background: primaryColor }}></span>
                                            {section.title}
                                        </h2>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                            {skills.map(skill => (
                                                <div key={skill.id} style={{
                                                    border: `1px solid ${primaryColor}`,
                                                    borderRadius: 4,
                                                    padding: '6px 12px',
                                                    fontSize: '13px',
                                                    fontWeight: 500,
                                                    color: '#1a1a2e'
                                                }}>
                                                    {skill.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            // ... reuse standard list logic or minimal for others
                            default:
                                const items: any[] = (resume as any)[section.type] || (section.type === 'custom' ? resume.customSections.find(cs => cs.id === section.customSectionId)?.items : []);
                                if (!items || items.length === 0) return null;
                                return (
                                    <div key={section.id}>
                                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{ width: 4, height: 24, background: primaryColor }}></span>
                                            {section.title || (section.type === 'custom' ? resume.customSections.find(cs => cs.id === section.customSectionId)?.title : '')}
                                        </h2>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                            {items.map((item: any) => (
                                                <div key={item.id} style={{ background: '#f9f9f9', padding: 12, borderRadius: 6 }}>
                                                    <div style={{ fontWeight: 700, fontSize: '13px' }}>{item.name || item.title}</div>
                                                    {item.proficiency && <div style={{ fontSize: '12px', color: primaryColor }}>{item.proficiency}</div>}
                                                    {item.description && <div style={{ fontSize: '12px', marginTop: 4 }}>{item.description}</div>}
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
