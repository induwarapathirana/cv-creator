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
    return `${year}`;
}

export default function GridTemplate({ resume, scale = 1 }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const primaryColor = settings.colors.primary;

    const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: settings.font + ', sans-serif',
                fontSize: settings.fontSize + 'px',
                lineHeight: settings.lineHeight,
                padding: settings.pageMargin + 'px',
                background: '#f8fafc',
            }}
        >
            <div className="resume-template" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Card Header */}
                <div style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 24 }}>
                    {personalInfo.photo && (
                        <img src={personalInfo.photo} alt="Profile" style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover' }} />
                    )}
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, color: '#111' }}>{personalInfo.fullName}</h1>
                        <p style={{ fontSize: '15px', color: primaryColor, fontWeight: 600, margin: '4px 0 0 0' }}>{personalInfo.jobTitle}</p>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '12px', color: '#555', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {personalInfo.email && <div>{personalInfo.email}</div>}
                        {personalInfo.phone && <div>{personalInfo.phone}</div>}
                        {personalInfo.location && <div>{personalInfo.location}</div>}
                    </div>
                </div>

                {/* Custom Grid Layout via Masonry or just flexible columns? Let's use CSS Grid Auto layout */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>

                    {/* Full width summary if exists */}
                    {personalInfo.summary && (
                        <div style={{ gridColumn: 'span 2', background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: '#888', marginBottom: 12 }}>About</h2>
                            <HtmlRenderer html={personalInfo.summary} className="html-content" />
                        </div>
                    )}

                    {visibleSections.map(section => {
                        if (section.type === 'personalInfo' || section.type === 'summary') return null;

                        const isWide = ['experience', 'education', 'projects'].includes(section.type);

                        switch (section.type) {
                            case 'experience':
                                return experience.length > 0 ? (
                                    <div key={section.id} style={{ gridColumn: 'span 2', background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                        <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: '#888', marginBottom: 16 }}>{section.title}</h2>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                            {experience.map(exp => (
                                                <div key={exp.id} style={{ border: '1px solid #eee', padding: 16, borderRadius: 6 }}>
                                                    <h3 style={{ fontSize: '14px', fontWeight: 700 }}>{exp.position}</h3>
                                                    <div style={{ fontSize: '12px', color: primaryColor, fontWeight: 600 }}>{exp.company}</div>
                                                    <div style={{ fontSize: '11px', color: '#999', marginBottom: 8 }}>{formatDate(exp.startDate)} — {exp.current ? 'Now' : formatDate(exp.endDate)}</div>
                                                    <HtmlRenderer html={exp.description} className="html-content" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'education':
                                return education.length > 0 ? (
                                    <div key={section.id} style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                        <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: '#888', marginBottom: 12 }}>{section.title}</h2>
                                        {education.map(edu => (
                                            <div key={edu.id} style={{ marginBottom: 12 }}>
                                                <div style={{ fontWeight: 700 }}>{edu.degree}</div>
                                                <div style={{ fontSize: '12px', color: '#555' }}>{edu.institution}, {formatDate(edu.endDate)}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : null;

                            case 'skills':
                                return skills.length > 0 ? (
                                    <div key={section.id} style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                        <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: '#888', marginBottom: 12 }}>{section.title}</h2>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                            {skills.map(s => <span key={s.id} style={{ fontSize: '11px', background: '#f3f4f6', padding: '4px 8px', borderRadius: 4 }}>{s.name}</span>)}
                                        </div>
                                    </div>
                                ) : null;

                            default:
                                let items: any[] = (resume as any)[section.type] || [];
                                if (section.type === 'custom' && section.customSectionId) {
                                    const customSection = resume.customSections?.find(cs => cs.id === section.customSectionId);
                                    if (customSection) items = customSection.items;
                                }
                                if (!items || items.length === 0) return null;
                                return (
                                    <div key={section.id} style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                        <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: '#888', marginBottom: 12 }}>{section.title}</h2>
                                        <ul style={{ paddingLeft: 16, margin: 0, fontSize: '11pt' }}>
                                            {items.map((item: any) => (
                                                <li key={item.id}>{item.name || item.title}</li>
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
