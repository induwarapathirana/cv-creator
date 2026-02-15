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

export default function CreativeTemplate({ resume }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const primaryColor = settings.colors.primary;
    const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

    const leftColumnSections = visibleSections.filter(s => s.column === 'left');
    const rightColumnSections = visibleSections.filter(s => s.column === 'right' || !s.column);

    const SectionTitle = ({ title }: { title: string }) => (
        <h2 style={{
            fontSize: '24px',
            fontWeight: 800,
            color: '#111',
            marginBottom: 20,
            letterSpacing: '-0.03em'
        }}>
            {title}
        </h2>
    );

    const renderSection = (section: any) => {
        if (section.type === 'personalInfo') return null;

        switch (section.type) {
            case 'summary':
                return personalInfo.summary ? (
                    <div key={section.id} style={{ marginBottom: 32 }}>
                        <HtmlRenderer html={personalInfo.summary} className="html-content" />
                    </div>
                ) : null;

            case 'experience':
                return experience.length > 0 ? (
                    <div key={section.id} style={{ marginBottom: 32 }}>
                        <SectionTitle title={section.title} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            {experience.map(exp => (
                                <div key={exp.id} style={{ borderLeft: `2px solid #eee`, paddingLeft: 16 }}>
                                    <div style={{ fontSize: '18px', fontWeight: 700 }}>{exp.position}</div>
                                    <div style={{ fontSize: '15px', color: primaryColor, fontWeight: 600, marginBottom: 4 }}>
                                        {exp.company}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#888', marginBottom: 8, fontStyle: 'italic' }}>
                                        {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                                    </div>
                                    <HtmlRenderer html={exp.description} className="html-content" />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null;

            case 'projects':
                return projects.length > 0 ? (
                    <div key={section.id} style={{ marginBottom: 32 }}>
                        <SectionTitle title={section.title} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
                            {projects.map(proj => (
                                <div key={proj.id} style={{}}>
                                    <div style={{ fontSize: '16px', fontWeight: 700 }}>{proj.name}</div>
                                    <div style={{ fontSize: '12px', color: '#888', marginBottom: 4 }}>
                                        {formatDate(proj.startDate)}
                                    </div>
                                    <HtmlRenderer html={proj.description} className="html-content" />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null;

            case 'skills':
                return skills.length > 0 ? (
                    <div key={section.id} style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#111', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {section.title}
                        </h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {skills.map(skill => (
                                <span key={skill.id} style={{
                                    border: `1px solid ${primaryColor}`,
                                    color: primaryColor,
                                    padding: '6px 12px',
                                    borderRadius: 100,
                                    fontSize: '12px',
                                    fontWeight: 600
                                }}>
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    </div>
                ) : null;

            default:
                // Generic
                let items: any[] = (resume as any)[section.type] || [];
                if (section.type === 'custom' && section.customSectionId) {
                    const cs = resume.customSections.find(c => c.id === section.customSectionId);
                    if (cs) items = cs.items;
                }
                if (!items || items.length === 0) return null;
                const dynamicTitle = section.type === 'custom'
                    ? resume.customSections.find(c => c.id === section.customSectionId)?.title
                    : section.title;

                return (
                    <div key={section.id} style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#111', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {dynamicTitle || section.title}
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {items.map((item: any) => (
                                <div key={item.id}>
                                    <div style={{ fontWeight: 700, fontSize: '14px' }}>
                                        {item.title || item.name || item.institution}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#888' }}>
                                        {formatDate(item.date || item.startDate)}
                                    </div>
                                    {item.subtitle && <div style={{ fontSize: '13px' }}>{item.subtitle}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: '"Poppins", "Inter", sans-serif',
                fontSize: settings.fontSize + 'px',
                lineHeight: 1.6,
                padding: 0, // Custom padding for layout
                color: '#333',
                overflow: 'hidden',
                backgroundColor: '#fff',
                minHeight: '297mm'
            }}
        >
            <div className="resume-template" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

                {/* Header Block */}
                <div style={{ background: primaryColor, color: '#fff', padding: '40px 50px' }}>
                    <h1 style={{ fontSize: '56px', fontWeight: 900, margin: 0, letterSpacing: '-0.04em', lineHeight: 0.9 }}>
                        {personalInfo.fullName.toUpperCase()}
                    </h1>
                    <div style={{ fontSize: '20px', marginTop: 8, opacity: 0.9, fontWeight: 300 }}>
                        {personalInfo.jobTitle}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '30% 70%', flex: 1 }}>
                    {/* Sidebar */}
                    <div style={{ background: '#f9fafb', padding: '40px 30px', borderRight: '1px solid #eee' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40, fontSize: '13px' }}>
                            {[
                                personalInfo.email,
                                personalInfo.phone,
                                personalInfo.location,
                                personalInfo.website?.replace('https://', ''),
                                personalInfo.linkedin?.replace('https://', '')
                            ].filter(Boolean).map((item, i) => (
                                <div key={i} style={{ wordBreak: 'break-all' }}>{item}</div>
                            ))}
                        </div>

                        {leftColumnSections.map(renderSection)}
                    </div>

                    {/* Main Content */}
                    <div style={{ padding: '40px 50px' }}>
                        {rightColumnSections.map(renderSection)}
                    </div>
                </div>
            </div>
        </div>
    );
}
