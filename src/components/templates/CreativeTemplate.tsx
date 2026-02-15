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

export default function CreativeTemplate({ resume, scale = 1 }: TemplateProps) {
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
                padding: settings.pageMargin + 'px',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Decorative background shape */}
            <div style={{
                position: 'absolute',
                top: -150,
                right: -100,
                width: 400,
                height: 400,
                background: primaryColor,
                borderRadius: '50%',
                opacity: 0.1,
                zIndex: 0,
            }} />
            <div style={{
                position: 'absolute',
                bottom: -100,
                left: -100,
                width: 300,
                height: 300,
                background: primaryColor,
                borderRadius: '50%',
                opacity: 0.05,
                zIndex: 0,
            }} />

            <div className="resume-template" style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 40, borderBottom: `2px solid ${primaryColor}`, paddingBottom: 32 }}>
                    {personalInfo.photo && (
                        <img
                            src={personalInfo.photo}
                            alt="Profile"
                            style={{ width: 120, height: 120, borderRadius: 24, objectFit: 'cover', boxShadow: '4px 4px 0px rgba(0,0,0,0.1)' }}
                        />
                    )}
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '42px', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em', color: '#111' }}>
                            {personalInfo.fullName || 'Your Name'}
                        </h1>
                        <div style={{ fontSize: '18px', color: primaryColor, fontWeight: 600, marginTop: 4 }}>
                            {personalInfo.jobTitle}
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: 12, fontSize: '12px', fontWeight: 500, color: '#555' }}>
                            {personalInfo.email && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>✉ {personalInfo.email}</span>}
                            {personalInfo.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>☎ {personalInfo.phone}</span>}
                            {personalInfo.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>📍 {personalInfo.location}</span>}
                            {personalInfo.website && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>🌐 {personalInfo.website.replace(/^https?:\/\//, '')}</span>}
                        </div>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 40 }}>

                    {/* Left Column (Main) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: settings.sectionSpacing * 1.2 }}>
                        {visibleSections.filter(s => (s.column === 'left' || (!s.column && ['summary', 'experience', 'projects', 'custom'].includes(s.type)))).map(section => {
                            // Default logic: detailed sections go here unless specified otherwise
                            switch (section.type) {
                                case 'summary':
                                    return personalInfo.summary ? (
                                        <div key={section.id}>
                                            <h2 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', marginBottom: 12, color: '#111' }}>About Me</h2>
                                            <HtmlRenderer html={personalInfo.summary} className="html-content" />
                                        </div>
                                    ) : null;
                                case 'experience':
                                    return experience.length > 0 ? (
                                        <div key={section.id}>
                                            <h2 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', marginBottom: 16, color: '#111', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ width: 8, height: 8, background: primaryColor, borderRadius: 2 }}></span>
                                                {section.title}
                                            </h2>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, borderLeft: '2px solid #eee', paddingLeft: 20 }}>
                                                {experience.map(exp => (
                                                    <div key={exp.id} style={{ position: 'relative' }}>
                                                        <div style={{ position: 'absolute', left: -25, top: 4, width: 8, height: 8, borderRadius: '50%', background: '#ccc' }} />
                                                        <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{exp.position}</h3>
                                                        <div style={{ fontSize: '13px', color: primaryColor, fontWeight: 600, marginBottom: 4 }}>{exp.company}</div>
                                                        <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                                                            {formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}
                                                        </div>
                                                        <HtmlRenderer html={exp.description} className="html-content" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null;

                                case 'personalInfo':
                                    return null;

                                default:
                                    // Handle any moved section in main column
                                    const items: any[] = (resume as any)[section.type] || (section.type === 'custom' ? resume.customSections.find(cs => cs.id === section.customSectionId)?.items : []);
                                    if (!items || items.length === 0) return null;
                                    const sectionTitle = section.title || (section.type === 'custom' ? resume.customSections.find(cs => cs.id === section.customSectionId)?.title : '');

                                    // Check if it's a list-like section (skills, languages) forced into main column
                                    const isList = ['skills', 'languages', 'certifications', 'awards'].includes(section.type);

                                    return (
                                        <div key={section.id}>
                                            <h2 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', marginBottom: 16, color: '#111', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ width: 8, height: 8, background: primaryColor, borderRadius: 2 }}></span>
                                                {sectionTitle}
                                            </h2>
                                            {isList ? (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                    {items.map((item: any) => (
                                                        <span key={item.id} style={{ fontSize: '11px', fontWeight: 600, background: primaryColor, color: 'white', padding: '4px 10px', borderRadius: 20 }}>
                                                            {item.name || item.title}
                                                        </span>
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

                    {/* Right Column (Sidebar) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: settings.sectionSpacing * 1.2 }}>
                        {visibleSections.filter(s => (s.column === 'right' || (!s.column && ['education', 'skills', 'languages', 'certifications', 'awards'].includes(s.type)))).map(section => {
                            switch (section.type) {
                                case 'education':
                                    return education.length > 0 ? (
                                        <div key={section.id} style={{ background: '#f8f8fa', padding: 20, borderRadius: 12 }}>
                                            <h2 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', marginBottom: 12, color: primaryColor }}>{section.title}</h2>
                                            {education.map(edu => (
                                                <div key={edu.id} style={{ marginBottom: 16 }}>
                                                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{edu.degree}</div>
                                                    <div style={{ fontSize: '12px' }}>{edu.institution}</div>
                                                    <div style={{ fontSize: '11px', color: '#777', marginTop: 2 }}>{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null;

                                case 'skills':
                                    return skills.length > 0 ? (
                                        <div key={section.id}>
                                            <h2 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', marginBottom: 12, color: primaryColor }}>{section.title}</h2>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                {skills.map(s => (
                                                    <span key={s.id} style={{ fontSize: '11px', fontWeight: 600, background: primaryColor, color: 'white', padding: '4px 10px', borderRadius: 20 }}>
                                                        {s.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null;

                                case 'personalInfo':
                                    return null;

                                default:
                                    const items: any[] = (resume as any)[section.type] || (section.type === 'custom' ? resume.customSections.find(cs => cs.id === section.customSectionId)?.items : []);
                                    if (!items || items.length === 0) return null;
                                    const sectionTitle = section.title || (section.type === 'custom' ? resume.customSections.find(cs => cs.id === section.customSectionId)?.title : '');

                                    return (
                                        <div key={section.id}>
                                            <h2 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', marginBottom: 12, color: primaryColor }}>{sectionTitle}</h2>
                                            {items.map((item: any) => (
                                                <div key={item.id} style={{ marginBottom: 8, fontSize: '13px' }}>
                                                    <strong>{item.name || item.title}</strong>
                                                    {item.proficiency && <div style={{ fontSize: '11px', color: '#666' }}>{item.proficiency}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    );
                            }
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
