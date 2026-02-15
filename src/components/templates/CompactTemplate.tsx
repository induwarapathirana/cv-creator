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
    return year; // Compact uses just year
}

export default function CompactTemplate({ resume }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const primaryColor = settings.colors.primary;
    const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

    // Compact splits sections for density
    const col1 = visibleSections.filter((_, i) => i % 2 === 0);
    const col2 = visibleSections.filter((_, i) => i % 2 !== 0);


    const SectionTitle = ({ title }: { title: string }) => (
        <h2 style={{
            fontSize: '13px',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: primaryColor,
            marginBottom: 8,
            borderBottom: `1px solid ${primaryColor}40`,
            paddingBottom: 2
        }}>
            {title}
        </h2>
    );

    const renderSection = (section: any) => {
        if (section.type === 'personalInfo') return null;

        switch (section.type) {
            case 'summary':
                return personalInfo.summary ? (
                    <div key={section.id} style={{ marginBottom: 16 }}>
                        <SectionTitle title="Profile" />
                        <HtmlRenderer html={personalInfo.summary} className="html-content" />
                    </div>
                ) : null;

            case 'experience':
                return experience.length > 0 ? (
                    <div key={section.id} style={{ marginBottom: 16 }}>
                        <SectionTitle title={section.title} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {experience.map(exp => (
                                <div key={exp.id}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700 }}>
                                        <span>{exp.position}, {exp.company}</span>
                                        <span style={{ color: '#666' }}>{formatDate(exp.startDate)}-{exp.current ? 'Pres' : formatDate(exp.endDate)}</span>
                                    </div>
                                    <HtmlRenderer html={exp.description} className="html-content" />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null;

            case 'skills':
                return skills.length > 0 ? (
                    <div key={section.id} style={{ marginBottom: 16 }}>
                        <SectionTitle title={section.title} />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', fontSize: '12px' }}>
                            {skills.map(skill => (
                                <span key={skill.id}>
                                    <strong>{skill.name}</strong>
                                </span>
                            ))}
                        </div>
                    </div>
                ) : null;

            default:
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
                    <div key={section.id} style={{ marginBottom: 16 }}>
                        <SectionTitle title={dynamicTitle || section.title} />
                        {items.map((item: any) => (
                            <div key={item.id} style={{ marginBottom: 4 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                                    <span>{item.title || item.name || item.institution}</span>
                                    <span style={{ color: '#666', fontSize: '11px' }}>{formatDate(item.date || item.startDate)}</span>
                                </div>
                                {item.subtitle && <div style={{ fontSize: '12px', fontStyle: 'italic' }}>{item.subtitle}</div>}
                            </div>
                        ))}
                    </div>
                );
        }
    }

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: '"Arial", sans-serif',
                fontSize: (settings.fontSize - 2) + 'px', // Smaller default
                lineHeight: 1.3,
                padding: '30px',
                color: '#111',
            }}
        >
            <div className="resume-template">
                {/* Compact Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, borderBottom: `2px solid ${primaryColor}`, paddingBottom: 10 }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, textTransform: 'uppercase' }}>
                            {personalInfo.fullName}
                        </h1>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: primaryColor }}>{personalInfo.jobTitle}</div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '11px', color: '#555' }}>
                        <div>{personalInfo.email} • {personalInfo.phone}</div>
                        <div>{personalInfo.location} • {personalInfo.linkedin?.replace('https://', '')}</div>
                    </div>
                </div>

                <div style={{ columnCount: 2, columnGap: 24, orphans: 3 }}>
                    {/* Render all sections in flow for masonry-like fit */}
                    {visibleSections.map(renderSection)}
                </div>
            </div>
        </div>
    );
}
