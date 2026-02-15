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

export default function Modern2Template({ resume }: TemplateProps) {
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
                display: 'flex',
                flexDirection: 'column',
                gap: 30,
            }}
        >
            {/* Header - Modern Left Aligned */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `1px solid #eee`, paddingBottom: 24 }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#111', margin: 0, letterSpacing: '-0.02em' }}>
                        {personalInfo.fullName || 'Your Name'}
                    </h1>
                    <p style={{ fontSize: '18px', color: primaryColor, fontWeight: 600, marginTop: 4 }}>
                        {personalInfo.jobTitle}
                    </p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '13px', color: '#666', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {personalInfo.email && <div>{personalInfo.email}</div>}
                    {personalInfo.phone && <div>{personalInfo.phone}</div>}
                    {personalInfo.location && <div>{personalInfo.location}</div>}
                    {(personalInfo.linkedin || personalInfo.website) && (
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                            {personalInfo.linkedin && <span style={{ color: primaryColor }}>LinkedIn</span>}
                            {personalInfo.github && <span style={{ color: primaryColor }}>GitHub</span>}
                        </div>
                    )}
                </div>
            </div>

            <div className="resume-template" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40 }}>
                {/* Main Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: settings.sectionSpacing + 'px' }}>
                    {visibleSections.filter(s => !s.column || s.column === 'right').map(section => {
                        if (section.type === 'personalInfo') return null;

                        switch (section.type) {
                            case 'summary':
                                return personalInfo.summary ? (
                                    <div key={section.id} className="section">
                                        <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: primaryColor, marginBottom: 12, borderBottom: `2px solid ${primaryColor}1a` }}>
                                            Profile
                                        </h2>
                                        <HtmlRenderer html={personalInfo.summary} className="html-content" />
                                    </div>
                                ) : null;

                            case 'experience':
                                return experience.length > 0 ? (
                                    <div key={section.id} className="section">
                                        <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: primaryColor, marginBottom: 16, borderBottom: `2px solid ${primaryColor}1a` }}>
                                            {section.title}
                                        </h2>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                            {experience.map(exp => (
                                                <div key={exp.id}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                                                        <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{exp.position}</h3>
                                                        <span style={{ fontSize: '12px', color: '#888', fontWeight: 500 }}>
                                                            {formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#555', marginBottom: 8 }}>{exp.company}</div>
                                                    <HtmlRenderer html={exp.description} className="html-content" />
                                                    {exp.highlights.length > 0 && (
                                                        <ul style={{ paddingLeft: 16, marginTop: 4 }}>
                                                            {exp.highlights.filter(Boolean).map((h, i) => (
                                                                <li key={i} style={{ marginBottom: 2 }}>{h}</li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'projects':
                                return projects.length > 0 ? (
                                    <div key={section.id} className="section">
                                        <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: primaryColor, marginBottom: 16, borderBottom: `2px solid ${primaryColor}1a` }}>
                                            {section.title}
                                        </h2>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                            {projects.map(proj => (
                                                <div key={proj.id}>
                                                    <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{proj.name}</h3>
                                                    <div style={{ fontSize: '11px', color: primaryColor, fontWeight: 600, marginBottom: 4 }}>{proj.technologies.join(' • ')}</div>
                                                    <HtmlRenderer html={proj.description} className="html-content" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            default: return null;
                        }
                    })}
                </div>

                {/* Sidebar Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: settings.sectionSpacing + 'px' }}>
                    {visibleSections.filter(s => s.column === 'left').map(section => {
                        switch (section.type) {
                            case 'education':
                                return education.length > 0 ? (
                                    <div key={section.id}>
                                        <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: primaryColor, marginBottom: 12 }}>{section.title}</h2>
                                        {education.map(edu => (
                                            <div key={edu.id} style={{ marginBottom: 12 }}>
                                                <div style={{ fontWeight: 700, fontSize: '14px' }}>{edu.degree}</div>
                                                <div style={{ fontSize: '13px' }}>{edu.institution}</div>
                                                <div style={{ fontSize: '12px', color: '#888' }}>{formatDate(edu.endDate)}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : null;

                            case 'skills':
                                return skills.length > 0 ? (
                                    <div key={section.id}>
                                        <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: primaryColor, marginBottom: 12 }}>{section.title}</h2>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                            {skills.map(skill => (
                                                <span key={skill.id} style={{ fontSize: '12px', background: '#f3f4f6', padding: '4px 8px', borderRadius: 4 }}>{skill.name}</span>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'languages':
                                return languages.length > 0 ? (
                                    <div key={section.id}>
                                        <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: primaryColor, marginBottom: 12 }}>{section.title}</h2>
                                        {languages.map(lang => (
                                            <div key={lang.id} style={{ fontSize: '13px', marginBottom: 4 }}>
                                                <strong>{lang.name}</strong> <span style={{ color: '#888' }}>— {lang.proficiency}</span>
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
    );
}
