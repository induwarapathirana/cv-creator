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

export default function LeafTemplate({ resume }: TemplateProps) {
    const { personalInfo, experience, education, skills, projects, certifications, languages, awards, sections } = resume;
    const settings = resume.settings || defaultSettings;
    const primaryColor = settings.colors.primary; // Green, teal, or earth tones work best
    const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);

    // Single column but with "cards" or "blocks" feeling

    const SectionTitle = ({ title }: { title: string }) => (
        <h2 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: primaryColor,
            marginBottom: 16,
            textAlign: 'center',
            background: `${primaryColor}15`, // very light bg
            padding: '8px',
            borderRadius: '12px'
        }}>
            {title}
        </h2>
    );

    const renderSection = (section: any) => {

        if (section.type === 'personalInfo') return null;

        if (section.type === 'summary' && personalInfo.summary) {
            return (
                <div key={section.id} style={{ marginBottom: 40 }}>
                    <div style={{ textAlign: 'center', fontStyle: 'italic', padding: '0 20px', color: '#555' }}>
                        <HtmlRenderer html={personalInfo.summary} className="html-content" />
                    </div>
                </div>
            )
        } else if (section.type === 'skills') {
            if (skills.length === 0) return null;
            return (
                <div key={section.id} style={{ marginBottom: 40 }}>
                    <SectionTitle title={section.title} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
                        {skills.map(skill => (
                            <span key={skill.id} style={{
                                background: '#fff',
                                border: `1px solid ${primaryColor}40`,
                                padding: '6px 16px',
                                borderRadius: 20,
                                fontSize: '13px',
                                color: '#444'
                            }}>
                                {skill.name}
                            </span>
                        ))}
                    </div>
                </div>
            )
        } else {
            // General List Items
            let items: any[] = (resume as any)[section.type] || [];
            if (section.type === 'custom' && section.customSectionId) {
                const cs = resume.customSections.find(c => c.id === section.customSectionId);
                if (cs) items = cs.items;
            }

            if (items.length === 0) return null;

            const dynamicTitle = section.type === 'custom'
                ? resume.customSections.find(c => c.id === section.customSectionId)?.title
                : section.title;

            return (
                <div key={section.id} style={{ marginBottom: 40 }}>
                    <SectionTitle title={dynamicTitle || section.title} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {items.map((item: any) => (
                            <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                <div style={{ fontSize: '16px', fontWeight: 700, color: '#222' }}>
                                    {item.title || item.position || item.institution || item.name}
                                </div>
                                <div style={{ fontSize: '14px', color: primaryColor, fontWeight: 500 }}>
                                    {item.company || item.subtitle || item.issuer}
                                </div>
                                <div style={{ fontSize: '12px', color: '#888', marginBottom: 6 }}>
                                    {formatDate(item.startDate || item.date)} {item.endDate ? `– ${item.endDate === 'Present' || item.current ? 'Present' : formatDate(item.endDate)}` : ''}
                                </div>
                                <div style={{ maxWidth: '90%', textAlign: 'left', fontSize: '13.5px', lineHeight: 1.5 }}>
                                    <HtmlRenderer html={item.description} className="html-content" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }
    };

    return (
        <div
            className="resume-page"
            style={{
                fontFamily: '"Quicksand", "Nunito", sans-serif',
                fontSize: settings.fontSize + 'px',
                lineHeight: 1.6,
                padding: settings.pageMargin + 'px',
                color: '#444',
            }}
        >
            <div className="resume-template" style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header covering full width */}
                <div style={{ textAlign: 'center', marginBottom: 50 }}>
                    <div style={{
                        width: 100,
                        height: 100,
                        background: primaryColor,
                        borderRadius: '50%',
                        margin: '0 auto 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '40px',
                        fontWeight: 300
                    }}>
                        {personalInfo.fullName.charAt(0)}
                    </div>
                    <h1 style={{ fontSize: '32px', fontWeight: 600, color: '#222', margin: '0 0 8px 0', letterSpacing: '0.05em' }}>
                        {personalInfo.fullName}
                    </h1>
                    <div style={{ fontSize: '16px', color: primaryColor, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        {personalInfo.jobTitle}
                    </div>
                    <div style={{ marginTop: 16, fontSize: '13px', color: '#888' }}>
                        {personalInfo.email} • {personalInfo.phone} • {personalInfo.location}
                    </div>
                </div>

                {visibleSections.map(renderSection)}
            </div>
        </div>
    );
}
