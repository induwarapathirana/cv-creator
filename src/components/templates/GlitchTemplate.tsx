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
    return `${year}.${month}`;
}

export default function GlitchTemplate({ resume }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const primaryColor = settings.colors.primary || '#00ff41'; // Matrix green default if distinct
    // const bgColor = '#0d0d0d'; // Dark mode usually, but for printing we must invert or be careful.
    // Let's do a "Light Mode Cyberpunk" - White background, stark black text, neon accents.

    const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

    const SectionTitle = ({ title }: { title: string }) => (
        <h2 style={{
            fontSize: '16px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#000',
            marginBottom: 20,
            border: `2px solid #000`,
            display: 'inline-block',
            padding: '4px 12px',
            boxShadow: `4px 4px 0px ${primaryColor}`
        }}>
            {`> ${title}_`}
        </h2>
    );

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: '"Courier New", Courier, monospace',
                fontSize: settings.fontSize + 'px',
                lineHeight: 1.4,
                padding: settings.pageMargin + 'px',
                color: '#111',
                // background: '#fff' (default)
            }}
        >
            <div className="resume-template">
                {/* Header */}
                <div style={{ marginBottom: 40, borderBottom: '2px solid #000', paddingBottom: 20 }}>
                    <h1 style={{ fontSize: '42px', fontWeight: 800, margin: 0, letterSpacing: '-0.05em' }}>
                        {personalInfo.fullName.toUpperCase()}
                    </h1>
                    <div style={{ fontSize: '16px', fontWeight: 700, background: '#000', color: '#fff', display: 'inline-block', padding: '2px 8px', marginTop: 8 }}>
                        {`// ${personalInfo.jobTitle}`}
                    </div>
                    <div style={{ marginTop: 16, fontSize: '13px', display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                        {[
                            personalInfo.email,
                            personalInfo.phone,
                            personalInfo.github?.replace('https://', ''),
                            personalInfo.linkedin?.replace('https://', '')
                        ].filter(Boolean).map((item, i) => (
                            <span key={i}>[{item}]</span>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32 }}>
                    {visibleSections.map(section => {
                        if (section.type === 'personalInfo') return null;

                        let items: any[] = [];
                        let content = null;

                        // DATA PREP
                        if (['experience', 'education', 'projects', 'custom', 'certifications', 'awards', 'languages'].includes(section.type)) {
                            items = (resume as any)[section.type] || [];
                            if (section.type === 'custom' && section.customSectionId) {
                                const cs = resume.customSections.find(c => c.id === section.customSectionId);
                                if (cs) items = cs.items;
                            }
                        }

                        // RENDER
                        if (section.type === 'summary' && personalInfo.summary) {
                            content = (
                                <div style={{ borderLeft: `4px solid ${primaryColor}`, paddingLeft: 16 }}>
                                    <HtmlRenderer html={personalInfo.summary} className="html-content" />
                                </div>
                            )
                        } else if (section.type === 'skills' && skills.length > 0) {
                            content = (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                                    {skills.map(skill => (
                                        <div key={skill.id} style={{ border: '1px solid #000', padding: '4px 8px', fontSize: '12px', fontWeight: 700 }}>
                                            {skill.name} <span style={{ color: primaryColor }}>:: {skill.level}/5</span>
                                        </div>
                                    ))}
                                </div>
                            )
                        } else if (items.length > 0) {
                            content = (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                    {items.map((item: any) => (
                                        <div key={item.id}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px dashed #999', paddingBottom: 4, marginBottom: 8 }}>
                                                <div style={{ fontWeight: 700, fontSize: '16px' }}>
                                                    {item.title || item.position || item.institution || item.name}
                                                </div>
                                                <div style={{ fontSize: '12px' }}>
                                                    {formatDate(item.startDate || item.date)} {item.endDate ? `-> ${item.endDate === 'Present' || item.current ? 'NOW' : formatDate(item.endDate)}` : ''}
                                                </div>
                                            </div>
                                            {(item.company || item.subtitle || item.issuer) && (
                                                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: 8 }}>
                                                    @{item.company || item.subtitle || item.issuer}
                                                </div>
                                            )}

                                            {item.technologies && (
                                                <div style={{ fontSize: '12px', marginBottom: 8 }}>
                                                    STACK: [{item.technologies.join(', ')}]
                                                </div>
                                            )}

                                            {item.description && <HtmlRenderer html={item.description} className="html-content" />}
                                        </div>
                                    ))}
                                </div>
                            )
                        }

                        if (!content) return null;
                        const dynamicTitle = section.type === 'custom'
                            ? resume.customSections.find(c => c.id === section.customSectionId)?.title
                            : section.title;

                        return (
                            <div key={section.id}>
                                <SectionTitle title={dynamicTitle || section.title} />
                                {content}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
