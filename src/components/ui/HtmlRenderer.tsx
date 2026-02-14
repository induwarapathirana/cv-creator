'use client';

import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';

interface HtmlRendererProps {
    html: string;
    className?: string; // Allow passing classes for styling/layout
}

export default function HtmlRenderer({ html, className }: HtmlRendererProps) {
    const [sanitizedHtml, setSanitizedHtml] = useState<string>('');

    useEffect(() => {
        // Sanitize HTML only on client side
        const clean = DOMPurify.sanitize(html || '', {
            USE_PROFILES: { html: true }, // Only allow standard HTML
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'a', 'p', 'ul', 'ol', 'li', 'br', 'span'], // Whitelist tags
            ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'class'], // Whitelist attributes
        });
        setSanitizedHtml(clean);
    }, [html]);

    if (!sanitizedHtml) return null;

    return (
        <div
            className={`html-content ${className || ''}`}
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
    );
}
