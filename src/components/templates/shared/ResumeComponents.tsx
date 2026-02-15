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
}

export const SectionTitle = ({ title, color, variant = 'modern', centered }: SectionTitleProps) => {
    if (variant === 'classic') {
        return (
            <h2 style={{
                color: '#1a1a2e',
                borderBottom: '1px solid #ccc',
                fontSize: '13pt',
                fontVariant: 'small-caps',
                marginBottom: '10px',
                marginTop: '15px',
                paddingBottom: '2px'
            }}>
                {title}
            </h2>
        );
    }

    if (variant === 'elegant') {
        return (
            <h2 style={{
                fontSize: '10pt',
                fontWeight: 600,
                textTransform: 'uppercase',
                color: '#9ca3af', // gray-400
                letterSpacing: '0.25em',
                textAlign: 'center',
                marginBottom: '32px',
                marginTop: '16px'
            }}>
                {title}
            </h2>
        );
    }

    return (
        <div style={{ marginBottom: '12px', marginTop: '4px', textAlign: centered ? 'center' : 'left' }}>
            <h2 style={{
                color: color,
                fontSize: '11pt',
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
            <h3 style={{ fontSize: '11pt', fontWeight: 700, margin: 0, color: '#1a1a2e' }}>{title}</h3>
            {date && (
                <span style={{ fontSize: '9pt', color: '#666', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {date}
                </span>
            )}
        </div>
        {subtitle && (
            <div style={{ fontSize: '10pt', fontWeight: 600, color: '#4b5563', marginTop: '1px' }}>
                {subtitle}
            </div>
        )}
    </div>
);

export const ResumeHtmlContent = ({ html }: { html?: string }) => (
    <div style={{ fontSize: '10pt', color: '#374151', lineHeight: 1.5 }}>
        <HtmlRenderer html={html || ''} className="html-content" />
    </div>
);

export const SkillBadge = ({ name, color }: { name: string, color: string }) => (
    <span style={{
        backgroundColor: `${color}10`, // 10% opacity
        color: color,
        padding: '2px 10px',
        borderRadius: '5px',
        fontSize: '9pt',
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

export const ContactItem = ({ icon, text, href, color }: { icon?: React.ReactNode, text: string, href?: string, color: string }) => {
    const content = (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4b5563', fontSize: '10px', fontWeight: 500 }}>
            {icon && <span style={{ color: color, fontSize: '12px' }}>{icon}</span>}
            {text}
        </span>
    );

    if (href) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                {content}
            </a>
        );
    }

    return content;
};
