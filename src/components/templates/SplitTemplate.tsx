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

export default function SplitTemplate({ resume }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const primaryColor = settings.colors.primary;
    const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

    const leftColumnSections = visibleSections.filter(s => s.column === 'left');
    const rightColumnSections = visibleSections.filter(s => s.column === 'right' || !s.column);

    const SidebarTitle = ({ title }: { title: string }) => (
        <h2 style={{
            fontSize: '14px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: 16,
            borderBottom: '1px solid rgba(255,255,255,0.2)',
            paddingBottom: 4
        }}>
            {title}
        </h2>
    );

    const MainTitle = ({ title }: { title: string }) => (
        <h2 style={{
            fontSize: '16px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#222',
            marginBottom: 20,
            borderBottom: `2px solid ${primaryColor}`,
            paddingBottom: 4,
            width: '100%'
        }}>
            {title}
        </h2>
    );

    const renderSidebarSection = (section: any) => {
        if (section.type === 'personalInfo') return null;

        // Sidebar usually contains Skills, Languages, Contact, etc
        // If "Education" is assigned left, it goes here too

        let items: any[] = (resume as any)[section.type] || [];
        if (section.type === 'custom' && section.customSectionId) {
            const cs = resume.customSections.find(c => c.id === section.customSectionId);
            if (cs) items = cs.items;
        }

        if (items.length === 0 && section.type !== 'summary') return null;

        if (section.type === 'summary' && personalInfo.summary) {
            return (
                <div key={section.id} style={{ marginBottom: 32 }}>
                    <SidebarTitle title="Profile" />
                    <div style={{ fontSize: '13px', lineHeight: 1.6, opacity: 0.9 }}>
                        <HtmlRenderer html={personalInfo.summary} className="html-content" />
                    </div>
                </div>
            )
        }

        if (section.type === 'skills' || section.type === 'languages') {
            return (
                <div key={section.id} style={{ marginBottom: 32 }}>
                    <SidebarTitle title={section.title} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {items.map((item: any) => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                <span style={{ fontWeight: 600 }}>{item.name}</span>
                                {item.proficiency && <span style={{ opacity: 0.7 }}>{item.level ? `${item.level}/5` : item.proficiency}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )
        }

        // Default sidebar render for education/awards/etc
        return (
            <div key={section.id} style={{ marginBottom: 32 }}>
                <SidebarTitle title={section.title} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {items.map((item: any) => (
                        <div key={item.id} style={{ fontSize: '13px' }}>
                            <div style={{ fontWeight: 700, fontSize: '14px' }}>{item.title || item.name || item.institution}</div>
                            <div style={{ opacity: 0.8, marginBottom: 4 }}>
                                {formatDate(item.date || item.startDate)}
                            </div>
                            {item.subtitle && <div style={{ fontStyle: 'italic', marginBottom: 2 }}>{item.subtitle}</div>}
                        </div>
                    ))}
                </div>
            </div>
        )
    };

    const renderMainSection = (section: any) => {
        if (section.type === 'personalInfo') return null;

        // Experience, Projects usually here
        let items: any[] = (resume as any)[section.type] || [];
        if (section.type === 'custom' && section.customSectionId) {
            const cs = resume.customSections.find(c => c.id === section.customSectionId);
            if (cs) items = cs.items;
        }

        if (items.length === 0 && section.type !== 'summary') return null;

        if (section.type === 'summary' && personalInfo.summary) {
            return (
                <div key={section.id} style={{ marginBottom: 32 }}>
                    <MainTitle title="Professional Summary" />
                    <HtmlRenderer html={personalInfo.summary} className="html-content" />
                </div>
            )
        }

        return (
            <div key={section.id} style={{ marginBottom: 32 }}>
                <MainTitle title={section.title} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {items.map((item: any) => (
                        <div key={item.id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                                    {item.position || item.title || item.name || item.institution}
                                </h3>
                                <span style={{ fontSize: '13px', color: '#666' }}>
                                    {formatDate(item.startDate || item.date)} {item.endDate ? `– ${item.endDate === 'Present' || item.current ? 'Present' : formatDate(item.endDate)}` : ''}
                                </span>
                            </div>
                            {(item.company || item.subtitle || item.issuer) && (
                                <div style={{ fontSize: '14px', color: primaryColor, fontWeight: 600, marginBottom: 8 }}>
                                    {item.company || item.subtitle || item.issuer}
                                    {item.location && <span style={{ color: '#888', fontWeight: 400 }}> • {item.location}</span>}
                                </div>
                            )}
                            {item.description && <HtmlRenderer html={item.description} className="html-content" />}

                            {item.highlights && item.highlights.length > 0 && (
                                <ul style={{ paddingLeft: 16, marginTop: 6, marginBottom: 0 }}>
                                    {item.highlights.filter(Boolean).map((h: string, i: number) => (
                                        <li key={i} style={{ marginBottom: 3 }}>{h}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: '"Roboto", sans-serif',
                fontSize: settings.fontSize + 'px',
                lineHeight: 1.5,
                padding: 0,
                color: '#333',
                backgroundColor: '#fff',
                minHeight: '297mm'
            }}
        >
            <div className="resume-template" style={{ display: 'flex', height: '100%' }}>

                {/* Fixed Sidebar - 35% width */}
                <div style={{
                    width: '35%',
                    background: '#2d3748', // Dark slate
                    color: '#fff',
                    padding: '40px 30px',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Photo Placeholder if needed */}
                    <div style={{ marginBottom: 30 }}>
                        <h1 style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1.1, marginBottom: 12 }}>
                            {personalInfo.fullName}
                        </h1>
                        <div style={{ fontSize: '16px', color: primaryColor, fontWeight: 500 }}>
                            {personalInfo.jobTitle}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40, fontSize: '13px', opacity: 0.9 }}>
                        <div>{personalInfo.location}</div>
                        <div>{personalInfo.phone}</div>
                        <div>{personalInfo.email}</div>
                        <div>{personalInfo.website?.replace('https://', '')}</div>
                        <div>{personalInfo.linkedin?.replace('https://', '')}</div>
                    </div>

                    {leftColumnSections.map(renderSidebarSection)}

                </div>

                {/* Main Content - 65% width */}
                <div style={{ width: '65%', padding: '40px' }}>
                    {rightColumnSections.map(renderMainSection)}
                </div>

            </div>
        </div>
    );
}
