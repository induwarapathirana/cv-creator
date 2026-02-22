'use client';
import { useEffect, useRef } from 'react';
import { Resume } from '@/types/resume';
import { defaultSettings } from '@/utils/sample-data';
import { sanitizeResume } from '@/utils/resume-sanitizer';
import ModernTemplate from './ModernTemplate';
import ClassicTemplate from './ClassicTemplate';
import MinimalTemplate from './MinimalTemplate';
import ExecutiveTemplate from './ExecutiveTemplate';
import CreativeTemplate from './CreativeTemplate';
import TechTemplate from './TechTemplate';
import AcademicTemplate from './AcademicTemplate';
import CompactTemplate from './CompactTemplate';
import TimelineTemplate from './TimelineTemplate';
import BoldTemplate from './BoldTemplate';
import SplitTemplate from './SplitTemplate';
import GlitchTemplate from './GlitchTemplate';
import LeafTemplate from './LeafTemplate';
import SwissTemplate from './SwissTemplate';
import GridTemplate from './GridTemplate';
import Modern2Template from './Modern2Template';
import ProfessionalTemplate from './ProfessionalTemplate';
import ElegantTemplate from './ElegantTemplate';

interface TemplateRendererProps {
    resume: Resume;
    scale?: number;
}

export default function TemplateRenderer({ resume: rawResume, scale = 1 }: TemplateRendererProps) {
    const resume = sanitizeResume(rawResume);
    const settings = resume.settings || defaultSettings;
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial check for useSinglePage migration (ensure it exists)
    if (typeof settings.useSinglePage === 'undefined') {
        settings.useSinglePage = false;
    }

    useEffect(() => {
        if (!settings.useSinglePage || settings.usePaging) {
            const styleEl = document.getElementById('dynamic-print-style');
            if (styleEl) styleEl.remove();
            return;
        }

        const applyStyle = () => {
            if (containerRef.current) {
                const heightPx = containerRef.current.scrollHeight;
                const widthPx = containerRef.current.scrollWidth;
                const ratio = heightPx / widthPx;
                const heightMm = Math.ceil(210 * ratio);
                const finalHeight = Math.max(heightMm, 297);

                let styleEl = document.getElementById('dynamic-print-style');
                if (!styleEl) {
                    styleEl = document.createElement('style');
                    styleEl.id = 'dynamic-print-style';
                    document.head.appendChild(styleEl);
                }

                styleEl.innerHTML = `
                    @media print {
                        @page {
                            size: 210mm ${finalHeight + 10}mm !important;
                            margin: 0 !important;
                        }
                        .resume-page {
                            min-height: ${finalHeight + 10}mm !important;
                            height: auto !important;
                            margin: 0 !important;
                            box-shadow: none !important;
                        }
                    }
                `;
            }
        };

        // Apply immediately for export context or if already rendered
        applyStyle();

        const handleBeforePrint = () => {
            applyStyle();
        };

        const handleAfterPrint = () => {
            // Only remove if not on export page
            if (window.location.pathname !== '/export') {
                const styleEl = document.getElementById('dynamic-print-style');
                if (styleEl) styleEl.remove();
            }
        };

        window.addEventListener('beforeprint', handleBeforePrint);
        window.addEventListener('afterprint', handleAfterPrint);

        return () => {
            window.removeEventListener('beforeprint', handleBeforePrint);
            window.removeEventListener('afterprint', handleAfterPrint);
            const styleEl = document.getElementById('dynamic-print-style');
            if (styleEl) styleEl.remove();
        };
    }, [settings.useSinglePage, settings.usePaging, resume]);

    const renderTemplate = () => {
        switch (settings.template) {
            case 'classic':
                return <ClassicTemplate resume={resume} scale={scale} />;
            case 'minimal':
                return <MinimalTemplate resume={resume} scale={scale} />;
            case 'executive':
                return <ExecutiveTemplate resume={resume} scale={scale} />;
            case 'creative':
                return <CreativeTemplate resume={resume} scale={scale} />;
            case 'tech':
                return <TechTemplate resume={resume} scale={scale} />;
            case 'academic':
                return <AcademicTemplate resume={resume} scale={scale} />;
            case 'compact':
                return <CompactTemplate resume={resume} scale={scale} />;
            case 'timeline':
                return <TimelineTemplate resume={resume} scale={scale} />;
            case 'bold':
                return <BoldTemplate resume={resume} scale={scale} />;
            case 'split':
                return <SplitTemplate resume={resume} scale={scale} />;
            case 'glitch':
                return <GlitchTemplate resume={resume} scale={scale} />;
            case 'leaf':
                return <LeafTemplate resume={resume} scale={scale} />;
            case 'swiss':
                return <SwissTemplate resume={resume} scale={scale} />;
            case 'grid':
                return <GridTemplate resume={resume} scale={scale} />;
            case 'modern2':
                return <Modern2Template resume={resume} scale={scale} />;
            case 'professional':
                return <ProfessionalTemplate resume={resume} scale={scale} />;
            case 'elegant':
                return <ElegantTemplate resume={resume} scale={scale} />;
            case 'modern':
            default:
                return <ModernTemplate resume={resume} scale={scale} />;
        }
    };

    if (settings.usePaging) {
        return (
            <div
                className="resume-pages-container renderer-wrapper"
                data-paging="true"
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center',
                    // Reactive Resume Style CSS Variables
                    ['--font-size' as any]: settings.fontSize + 'px',
                    ['--line-height' as any]: settings.lineHeight,
                    ['--section-spacing' as any]: settings.sectionSpacing + 'px',
                    ['--primary-color' as any]: settings.colors.primary,
                    ['--page-margin' as any]: settings.pageMargin + 'px'
                } as any}
            >
                {/* For now, we render as one big "page" that can be breaked by CSS print rules or just viewed as a sequence */}
                {/* Dynamic Page Markers for visual guide in editor */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    {[0, 1, 2, 3, 4].map(i => (
                        <div
                            key={i}
                            className="page-marker"
                            style={{ top: `${(i * 297) + 10}mm` }}
                        >
                            P. {i + 1}
                        </div>
                    ))}
                </div>
                {renderTemplate()}
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="renderer-wrapper"
            data-print-wrapper="true"
            style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top center',
                // Reactive Resume Style CSS Variables
                ['--font-size' as any]: settings.fontSize + 'px',
                ['--line-height' as any]: settings.lineHeight,
                ['--section-spacing' as any]: settings.sectionSpacing + 'px',
                ['--primary-color' as any]: settings.colors.primary,
                ['--page-margin' as any]: settings.pageMargin + 'px'
            } as any}
        >
            {renderTemplate()}
        </div>
    );
}
