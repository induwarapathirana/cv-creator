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

export default function TimelineTemplate({ resume }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const primaryColor = settings.colors.primary;
    const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

    const leftColumnSections = visibleSections.filter(s => s.column === 'left');
    const rightColumnSections = visibleSections.filter(s => s.column === 'right' || !s.column);

    const SectionTitle = ({ title }: { title: string }) => (
        <h2 style={{
            fontSize: '14px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#888',
            marginBottom: 20,
            borderBottom: '1px solid #eee',
            paddingBottom: 8
        }}>
            {title}
        </h2>
    );

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: '"Lato", "Inter", sans-serif',
                fontSize: settings.fontSize + 'px',
                lineHeight: 1.5,
                padding: settings.pageMargin + 'px',
                color: '#333',
            }}
        >
            <div className="resume-template">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
                    <div>
                        <h1 style={{ fontSize: '36px', fontWeight: 800, margin: '0 0 8px 0', color: primaryColor }}>
                            {personalInfo.fullName}
                        </h1>
                        <div style={{ fontSize: '16px', fontWeight: 500, letterSpacing: '0.05em' }}>{personalInfo.jobTitle.toUpperCase()}</div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '13px', lineHeight: 1.6 }}>
                        <div>{personalInfo.email}</div>
                        <div>{personalInfo.phone}</div>
                        <div>{personalInfo.location}</div>
                        <div>{personalInfo.linkedin?.replace('https://', '')}</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 40 }}>
                    {/* Left Sidebar */}
                    <div>
                        {leftColumnSections.map(section => {
                            if (section.type === 'personalInfo') return null;

                            const items = (resume as any)[section.type] || [];
                            if (['skills', 'languages', 'certifications', 'awards'].includes(section.type) && items.length > 0) {
                                return (
                                    <div key={section.id} style={{ marginBottom: 30 }}>
                                        <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: '#999', marginBottom: 12 }}>{section.title}</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {items.map((item: any) => (
                                                <div key={item.id} style={section.type === 'skills' ? { background: '#f5f5f5', padding: '4px 8px', borderRadius: 4, fontSize: '12px', display: 'inline-block' } : { fontSize: '13px', width: '100%' }}>
                                                    {item.name || item.title} {item.proficiency && <span style={{ color: '#999' }}> - {item.proficiency}</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            }

                            if (section.type === 'summary' && personalInfo.summary) {
                                return (
                                    <div key={section.id} style={{ marginBottom: 30 }}>
                                        <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: '#999', marginBottom: 12 }}>Profile</h3>
                                        <HtmlRenderer html={personalInfo.summary} className="html-content" />
                                    </div>
                                )
                            }
                            return null;
                        })}
                    </div>

                    {/* Right Main Content (Timeline) */}
                    <div style={{ paddingLeft: 20, borderLeft: '2px solid #eee' }}>
                        {rightColumnSections.map(section => {
                            if (section.type === 'personalInfo') return null;

                            let items: any[] = [];
                            if (['experience', 'education', 'projects', 'custom'].includes(section.type)) {
                                items = (resume as any)[section.type] || [];
                                if (section.type === 'custom' && section.customSectionId) {
                                    const cs = resume.customSections.find(c => c.id === section.customSectionId);
                                    if (cs) items = cs.items;
                                }
                            }

                            if (items.length > 0) {
                                const dynamicTitle = section.type === 'custom'
                                    ? resume.customSections.find(c => c.id === section.customSectionId)?.title
                                    : section.title;

                                return (
                                    <div key={section.id} style={{ marginBottom: 40, position: 'relative' }}>
                                        <h2 style={{
                                            fontSize: '18px',
                                            fontWeight: 800,
                                            color: primaryColor,
                                            marginBottom: 20,
                                            position: 'relative'
                                        }}>
                                            <span style={{
                                                position: 'absolute',
                                                left: -29,
                                                top: 4,
                                                width: 16,
                                                height: 16,
                                                borderRadius: '50%',
                                                background: '#fff',
                                                border: `4px solid ${primaryColor}`
                                            }}></span>
                                            {dynamicTitle || section.title}
                                        </h2>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                            {items.map((item: any) => (
                                                <div key={item.id}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                        <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>
                                                            {item.title || item.position || item.institution || item.name}
                                                        </h3>
                                                        <span style={{ fontSize: '13px', color: '#888' }}>
                                                            {formatDate(item.startDate || item.date)} {item.endDate ? `– ${item.endDate === 'Present' || item.current ? 'Present' : formatDate(item.endDate)}` : ''}
                                                        </span>
                                                    </div>
                                                    {(item.company || item.subtitle || item.issuer) && (
                                                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#555', marginBottom: 8 }}>
                                                            {item.company || item.subtitle || item.issuer}
                                                        </div>
                                                    )}
                                                    {item.description && <HtmlRenderer html={item.description} className="html-content" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }

                            if (section.type === 'summary' && personalInfo.summary) {
                                return (
                                    <div key={section.id} style={{ marginBottom: 30 }}>
                                        <HtmlRenderer html={personalInfo.summary} className="html-content" />
                                    </div>
                                )
                            }

                            return null;
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
