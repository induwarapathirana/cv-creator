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

export default function ProfessionalTemplate({ resume }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const primaryColor = settings.colors.primary;
    const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: settings.font + ', serif',
                fontSize: settings.fontSize + 'px',
                lineHeight: settings.lineHeight,
                padding: settings.pageMargin + 'px',
            }}
        >
            <div className="resume-template">
                {/* Header - Traditional Center Aligned */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <h1 style={{ fontSize: '30px', fontWeight: 700, color: '#000', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {personalInfo.fullName || 'Your Name'}
                    </h1>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 12px', fontSize: '13px', color: '#444' }}>
                        {personalInfo.email && <span>{personalInfo.email}</span>}
                        {personalInfo.phone && <span>• {personalInfo.phone}</span>}
                        {personalInfo.location && <span>• {personalInfo.location}</span>}
                        {personalInfo.linkedin && <span>• LinkedIn</span>}
                        {personalInfo.website && <span>• {personalInfo.website.replace(/^https?:\/\//, '')}</span>}
                    </div>
                    {personalInfo.jobTitle && (
                        <div style={{ fontSize: '16px', fontWeight: 600, color: primaryColor, marginTop: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {personalInfo.jobTitle}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: settings.sectionSpacing + 'px' }}>
                    {visibleSections.map(section => {
                        if (section.type === 'personalInfo') return null;

                        switch (section.type) {
                            case 'summary':
                                return personalInfo.summary ? (
                                    <div key={section.id} className="section">
                                        <h2 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', color: '#000', borderBottom: '2px solid #000', paddingBottom: 4, marginBottom: 12 }}>
                                            Professional Summary
                                        </h2>
                                        <HtmlRenderer html={personalInfo.summary} className="html-content" />
                                    </div>
                                ) : null;

                            case 'experience':
                                return experience.length > 0 ? (
                                    <div key={section.id} className="section">
                                        <h2 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', color: '#000', borderBottom: '2px solid #000', paddingBottom: 4, marginBottom: 16 }}>
                                            Work Experience
                                        </h2>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                            {experience.map(exp => (
                                                <div key={exp.id}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                                                        <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{exp.company}</h3>
                                                        <span style={{ fontSize: '13px', fontWeight: 600 }}>
                                                            {formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontStyle: 'italic', marginBottom: 8 }}>
                                                        <span style={{ fontWeight: 600, color: '#333' }}>{exp.position}</span>
                                                        <span style={{ fontSize: '12px' }}>{exp.location}</span>
                                                    </div>
                                                    <HtmlRenderer html={exp.description} className="html-content" />
                                                    {exp.highlights.length > 0 && (
                                                        <ul style={{ paddingLeft: 18, marginTop: 6 }}>
                                                            {exp.highlights.filter(Boolean).map((h, i) => (
                                                                <li key={i} style={{ marginBottom: 4 }}>{h}</li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;

                            case 'education':
                                return education.length > 0 ? (
                                    <div key={section.id} className="section">
                                        <h2 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', color: '#000', borderBottom: '2px solid #000', paddingBottom: 4, marginBottom: 16 }}>
                                            Education
                                        </h2>
                                        {education.map(edu => (
                                            <div key={edu.id} style={{ marginBottom: 12 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                                                    <span>{edu.institution}</span>
                                                    <span>{formatDate(edu.endDate)}</span>
                                                </div>
                                                <div>{edu.degree} in {edu.field} {edu.gpa ? `(GPA: ${edu.gpa})` : ''}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : null;

                            case 'skills':
                                return skills.length > 0 ? (
                                    <div key={section.id} className="section">
                                        <h2 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', color: '#000', borderBottom: '2px solid #000', paddingBottom: 4, marginBottom: 12 }}>
                                            Skills & Competencies
                                        </h2>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                                            {skills.map(skill => (
                                                <div key={skill.id} style={{ fontSize: '13px' }}>
                                                    • {skill.name}
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
