import React from 'react';
import HtmlRenderer from '@/components/ui/HtmlRenderer';

export function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const [year, month] = dateStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return month ? `${months[parseInt(month) - 1]} ${year}` : year;
}

interface SectionTitleProps {
    title: string;
    color: string;
    variant?: 'modern' | 'classic' | 'minimal' | 'elegant' | 'academic' | 'bold';
    centered?: boolean;
    style?: React.CSSProperties;
}

export const SectionTitle = ({ title, color, variant = 'modern', centered, style }: SectionTitleProps) => {
    const textColor = variant === 'elegant' ? '#9ca3af' : (variant === 'classic' ? 'inherit' : color);
    const borderColor = variant === 'classic' ? 'currentColor' : color;

    if (variant === 'classic') {
        return (
            <h2 style={{
                color: 'inherit',
                borderBottom: `1px solid ${borderColor}`,
                fontSize: '1.2em',
                fontVariant: 'small-caps',
                marginBottom: '10px',
                marginTop: '15px',
                paddingBottom: '2px',
                opacity: 0.9,
                ...style
            }}>
                {title}
            </h2>
        );
    }

    if (variant === 'elegant') {
        return (
            <h2 style={{
                fontSize: '0.9em',
                fontWeight: 600,
                textTransform: 'uppercase',
                color: textColor,
                letterSpacing: '0.25em',
                textAlign: 'center',
                marginBottom: '32px',
                marginTop: '16px',
                ...style
            }}>
                {title}
            </h2>
        );
    }

    return (
        <div style={{ marginBottom: '12px', marginTop: '4px', textAlign: centered ? 'center' : 'left', ...style }}>
            <h2 style={{
                color: color,
                fontSize: '1em',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: centered ? 'center' : 'flex-start',
                gap: '8px'
            }}>
                {centered && <div style={{ flex: 1, height: '1.5px', background: color, opacity: 0.1 }} />}
                {title}
                <div style={{ flex: 1, height: '1.5px', background: color, opacity: 0.2 }} />
            </h2>
        </div>
    );
};

interface EntryHeaderProps {
    title: string;
    subtitle?: string;
    date?: string;
    color?: string;
    centered?: boolean;
}

export const EntryHeader = ({ title, subtitle, date, color, centered }: EntryHeaderProps) => (
    <div style={{ marginBottom: '6px', textAlign: centered ? 'center' : 'left' }}>
        <div style={{
            display: 'flex',
            flexDirection: centered ? 'column' : 'row',
            justifyContent: centered ? 'center' : 'space-between',
            alignItems: centered ? 'center' : 'baseline',
            gap: centered ? '2px' : '12px'
        }}>
            <h3 style={{ fontSize: '1em', fontWeight: 700, margin: 0, color: 'inherit' }}>{title}</h3>
            {date && (
                <span style={{ fontSize: '0.85em', color: 'inherit', opacity: 0.6, fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {date}
                </span>
            )}
        </div>
        {subtitle && (
            <div style={{ fontSize: '0.9em', fontWeight: 600, color: color || 'inherit', opacity: color ? 1 : 0.8, marginTop: '1px' }}>
                {subtitle}
            </div>
        )}
    </div>
);

export const ResumeHtmlContent = ({ html }: { html?: string }) => (
    <div style={{ fontSize: 'inherit', color: 'inherit', opacity: 0.9, lineHeight: 'inherit' }}>
        <HtmlRenderer html={html || ''} className="html-content" />
    </div>
);

export const SkillBadge = ({ name, color }: { name: string, color: string }) => (
    <span style={{
        backgroundColor: `${color}15`, // 15% opacity
        color: color,
        padding: '2px 10px',
        borderRadius: '5px',
        fontSize: '0.85em',
        fontWeight: 600,
        display: 'inline-block',
        marginRight: '8px',
        marginBottom: '8px',
        border: `1px solid ${color}30`,
        letterSpacing: '0.02em'
    }}>
        {name}
    </span>
);

export const SkillsGrouped = ({ skills, color, categoryColor }: { skills: any[], color: string, categoryColor?: string }) => {
    const skillsByCategory: Record<string, any[]> = skills.reduce((acc, skill) => {
        const cat = skill.category || 'General';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(skill);
        return acc;
    }, {} as Record<string, any[]>);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.keys(skillsByCategory).map((category) => {
                const catSkills = skillsByCategory[category];
                return (
                    <div key={category}>
                        <div style={{
                            fontWeight: 700,
                            color: categoryColor || 'inherit',
                            opacity: categoryColor ? 1 : 0.6,
                            fontSize: '0.8em',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '6px'
                        }}>
                            {category}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {catSkills.map((s: any) => <SkillBadge key={s.id} name={s.name} color={color} />)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export const ContactItem = ({ icon, text, href, color }: { icon?: React.ReactNode, text: string, href?: string, color: string }) => {
    const content = (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'inherit', opacity: 0.9, fontSize: '0.85em', fontWeight: 500, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
            {icon && <span style={{ color: color, fontSize: '0.9em', flexShrink: 0 }}>{icon}</span>}
            <span style={{ flex: 1 }}>{text}</span>
        </span>
    );

    if (href) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                {content}
            </a>
        );
    }

    return content;
};
