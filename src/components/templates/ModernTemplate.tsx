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

export default function ModernTemplate({ resume, scale = 1 }: TemplateProps) {
    const { personalInfo } = resume;
    const experience = Array.isArray(resume.experience) ? resume.experience : [];
    const education = Array.isArray(resume.education) ? resume.education : [];
    const skills = Array.isArray(resume.skills) ? resume.skills : [];
    const projects = Array.isArray(resume.projects) ? resume.projects : [];
    const certifications = Array.isArray(resume.certifications) ? resume.certifications : [];
    const languages = Array.isArray(resume.languages) ? resume.languages : [];
    const sections = Array.isArray(resume.sections) ? resume.sections : [];

    const settings = resume.settings || defaultSettings;
    // Sort visible sections
    const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);
    const primaryColor = settings.colors.primary;

    const skillsByCategory = skills.reduce((acc, skill) => {
        const cat = skill.category || 'General';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(skill);
        return acc;
    }, {} as Record<string, typeof skills>);

    // Group sections by column. default to right if column is missing or 'right'
    const leftSections = visibleSections.filter(s => s.column === 'left');
    const rightSections = visibleSections.filter(s => s.column !== 'left');

    const renderSection = (section: any) => {
        switch (section.type) {
            case 'personalInfo':
                return (
                    <div key={section.id} style={{ marginBottom: settings.sectionSpacing + 'px', textAlign: section.column === 'left' ? 'left' : 'center' }}>
                        <h1 style={{ color: primaryColor, fontSize: '24px', lineHeight: 1.2, letterSpacing: '-0.02em', wordBreak: 'break-word', fontWeight: 800 }}>
                            {personalInfo.fullName || 'Your Name'}
                        </h1>
                        {personalInfo.jobTitle && (
                            <p style={{ fontSize: '14px', color: '#555', marginTop: 4, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                {personalInfo.jobTitle}
                            </p>
                        )}
                        <div className="contact-row" style={{
                            display: 'flex',
                            flexDirection: section.column === 'left' ? 'column' : 'row',
                            justifyContent: section.column === 'left' ? 'flex-start' : 'center',
                            marginTop: 10,
                            gap: section.column === 'left' ? 4 : 12,
                            flexWrap: 'wrap',
                            fontSize: '10px',
                            lineHeight: 1.4,
                            color: '#444'
                        }}>
                            {personalInfo.email && <span>{personalInfo.email}</span>}
                            {personalInfo.phone && <span>{section.column === 'left' ? '' : '•'} {personalInfo.phone}</span>}
                            {personalInfo.location && <span>{section.column === 'left' ? '' : '•'} {personalInfo.location}</span>}
                            {personalInfo.linkedin && (
                                <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: primaryColor, textDecoration: 'none' }}>
                                    {section.column === 'left' ? 'LinkedIn' : '• LinkedIn'}
                                </a>
                            )}
                            {personalInfo.website && (
                                <a href={personalInfo.website} target="_blank" rel="noopener noreferrer" style={{ color: primaryColor, textDecoration: 'none' }}>
                                    {section.column === 'left' ? 'Portfolio' : '• Portfolio'}
                                </a>
                            )}
                            {personalInfo.github && (
                                <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" style={{ color: primaryColor, textDecoration: 'none' }}>
                                    {section.column === 'left' ? 'GitHub' : '• GitHub'}
                                </a>
                            )}
                        </div>
                    </div>
                );

            case 'summary':
                return personalInfo.summary ? (
                    <div key={section.id} className="section" style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                        <h2 style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}`, fontSize: '12pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, paddingBottom: 4 }}>
                            {section.title}
                        </h2>
                        <HtmlRenderer html={personalInfo.summary} className="html-content" />
                    </div>
                ) : null;

            case 'experience':
                return experience.length > 0 ? (
                    <div key={section.id} className="section" style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                        <h2 style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}`, fontSize: '12pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, paddingBottom: 4 }}>
                            {section.title}
                        </h2>
                        {experience.map((exp) => (
                            <div key={exp.id} className="entry" style={{ marginBottom: 12 }}>
                                <div className="entry-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                                    <h3 style={{ fontSize: '11pt', fontWeight: 700, margin: 0 }}>{exp.position}</h3>
                                    <span className="entry-date" style={{ fontSize: '9pt', color: '#666', whiteSpace: 'nowrap', marginLeft: 16 }}>
                                        {formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}
                                    </span>
                                </div>
                                <div className="entry-subtitle" style={{ fontSize: '10pt', fontWeight: 600, color: '#444', marginBottom: 4 }}>
                                    {exp.company}{exp.location ? `, ${exp.location}` : ''}
                                </div>
                                {exp.description && <HtmlRenderer html={exp.description} className="html-content" />}
                                {exp.highlights && exp.highlights.length > 0 && (
                                    <ul style={{ margin: '4px 0 0 16px', padding: 0, fontSize: '10pt', color: '#333' }}>
                                        {exp.highlights.filter(Boolean).map((h, i) => (
                                            <li key={i} style={{ marginBottom: 2 }}>{h}</li>
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
                        <h2 style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}`, fontSize: '12pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, paddingBottom: 4 }}>
                            {section.title}
                        </h2>
                        {education.map((edu) => (
                            <div key={edu.id} className="entry" style={{ marginBottom: 10 }}>
                                <div className="entry-header" style={{ marginBottom: 2 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                        <h3 style={{ fontSize: '11pt', fontWeight: 700, margin: 0 }}>{edu.institution}</h3>
                                        <span className="entry-date" style={{ fontSize: '9pt', color: '#666', whiteSpace: 'nowrap' }}>
                                            {formatDate(edu.startDate)} — {formatDate(edu.endDate)}
                                        </span>
                                    </div>
                                </div>
                                <div className="entry-subtitle" style={{ fontSize: '10pt', color: '#333' }}>
                                    {edu.degree} {edu.field ? `in ${edu.field}` : ''}
                                </div>
                                {edu.gpa && <div style={{ fontSize: '9pt', color: '#666', marginTop: 1 }}>GPA: {edu.gpa}</div>}
                                {edu.description && <HtmlRenderer html={edu.description} className="html-content" />}
                            </div>
                        ))}
                    </div>
                ) : null;

            case 'skills':
                return skills.length > 0 ? (
                    <div key={section.id} className="section" style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                        <h2 style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}`, fontSize: '12pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, paddingBottom: 4 }}>
                            {section.title}
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {Object.entries(skillsByCategory).map(([category, catSkills]) => (
                                <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: '10pt' }}>
                                    <span style={{ fontWeight: 600, color: '#333', fontSize: '9.5pt' }}>{category}</span>
                                    <span style={{ color: '#555', lineHeight: 1.3 }}>{catSkills.map(s => s.name).join(', ')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null;

            case 'projects':
                return projects.length > 0 ? (
                    <div key={section.id} className="section" style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                        <h2 style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}`, fontSize: '12pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, paddingBottom: 4 }}>
                            {section.title}
                        </h2>
                        {projects.map((proj) => (
                            <div key={proj.id} className="entry" style={{ marginBottom: 10 }}>
                                <div className="entry-header" style={{ marginBottom: 2 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                        <h3 style={{ fontSize: '11pt', fontWeight: 700, margin: 0 }}>{proj.name}</h3>
                                        {(proj.startDate || proj.endDate) && (
                                            <span className="entry-date" style={{ fontSize: '9pt', color: '#666', whiteSpace: 'nowrap' }}>
                                                {formatDate(proj.startDate)}{proj.endDate ? ` — ${formatDate(proj.endDate)}` : ''}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {proj.technologies && proj.technologies.length > 0 && (
                                    <div style={{ fontSize: '9pt', color: primaryColor, marginBottom: 2, fontWeight: 500 }}>
                                        {proj.technologies.join(' • ')}
                                    </div>
                                )}
                                <HtmlRenderer html={proj.description} className="html-content" />
                            </div>
                        ))}
                    </div>
                ) : null;

            case 'certifications':
                return certifications.length > 0 ? (
                    <div key={section.id} className="section" style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                        <h2 style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}`, fontSize: '12pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, paddingBottom: 4 }}>
                            {section.title}
                        </h2>
                        {certifications.map((cert) => (
                            <div key={cert.id} className="entry" style={{ marginBottom: 6 }}>
                                <div className="entry-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <h3 style={{ fontSize: '10.5pt', fontWeight: 700, margin: 0 }}>{cert.name}</h3>
                                    <span className="entry-date" style={{ fontSize: '9pt', color: '#666', whiteSpace: 'nowrap' }}>{formatDate(cert.date)}</span>
                                </div>
                                <div className="entry-subtitle" style={{ fontSize: '9.5pt', color: '#444' }}>{cert.issuer}</div>
                            </div>
                        ))}
                    </div>
                ) : null;

            case 'languages':
                return languages.length > 0 ? (
                    <div key={section.id} className="section" style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                        <h2 style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}`, fontSize: '12pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, paddingBottom: 4 }}>
                            {section.title}
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '10pt' }}>
                            {languages.map((lang) => (
                                <div key={lang.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: 600 }}>{lang.name}</span>
                                    <span style={{ color: '#666', fontSize: '9pt' }}>{lang.proficiency}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null;

            case 'awards':
                return resume.awards && resume.awards.length > 0 ? (
                    <div key={section.id} className="section" style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                        <h2 style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}`, fontSize: '12pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, paddingBottom: 4 }}>
                            {section.title}
                        </h2>
                        {resume.awards.map((award) => (
                            <div key={award.id} className="entry" style={{ marginBottom: 6 }}>
                                <div className="entry-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <h3 style={{ fontSize: '10.5pt', fontWeight: 700, margin: 0 }}>{award.title}</h3>
                                    <span className="entry-date" style={{ fontSize: '9pt', color: '#666', whiteSpace: 'nowrap' }}>{formatDate(award.date)}</span>
                                </div>
                                <div className="entry-subtitle" style={{ fontSize: '9.5pt', color: '#444' }}>{award.issuer}</div>
                                {award.description && <HtmlRenderer html={award.description} className="html-content" />}
                            </div>
                        ))}
                    </div>
                ) : null;

            case 'custom':
                const customSection = resume.customSections?.find(cs => cs.id === section.customSectionId);
                return customSection && customSection.items.length > 0 ? (
                    <div key={section.id} className="section" style={{ marginBottom: settings.sectionSpacing + 'px' }}>
                        <h2 style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}`, fontSize: '12pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, paddingBottom: 4 }}>
                            {section.title || customSection.title}
                        </h2>
                        {customSection.items.map((item) => (
                            <div key={item.id} className="entry" style={{ marginBottom: 10 }}>
                                <div className="entry-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                                    <h3 style={{ fontSize: '11pt', fontWeight: 700, margin: 0 }}>{item.title}</h3>
                                    <span className="entry-date" style={{ fontSize: '9pt', color: '#666', whiteSpace: 'nowrap' }}>{formatDate(item.date)}</span>
                                </div>
                                {item.subtitle && (
                                    <div className="entry-subtitle" style={{ fontSize: '10pt', fontWeight: 600, color: '#444', marginBottom: 4 }}>
                                        {item.subtitle}
                                    </div>
                                )}
                                {item.description && <HtmlRenderer html={item.description} className="html-content" />}
                            </div>
                        ))}
                    </div>
                ) : null;

            default:
                return null;
        }
    };

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: settings.font + ', sans-serif',
                fontSize: settings.fontSize + 'px',
                lineHeight: settings.lineHeight,
                padding: settings.pageMargin + 'px',
            }}
        >
            <div className="resume-template" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 35%) minmax(0, 65%)', gap: '30px', height: '100%', alignItems: 'start' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {leftSections.map(renderSection)}
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {rightSections.map(renderSection)}
                </div>
            </div>
        </div>
    );
}
