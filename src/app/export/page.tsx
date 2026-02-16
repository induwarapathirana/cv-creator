'use client';

import { useEffect, useState } from 'react';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import { Resume } from '@/types/resume';

declare global {
    interface Window {
        __RESUME_DATA__?: Resume;
    }
}

export default function ExportPage() {
    const [resume, setResume] = useState<Resume | null>(null);

    useEffect(() => {
        const checkData = () => {
            if (window.__RESUME_DATA__) {
                setResume(window.__RESUME_DATA__);
                return true;
            }
            return false;
        };

        if (checkData()) return;

        // Poll for a bit if not immediately available
        const interval = setInterval(() => {
            if (checkData()) clearInterval(interval);
        }, 100);

        // Fallback: try to read from localStorage
        try {
            const saved = localStorage.getItem('resume-export-data');
            if (saved) {
                setResume(JSON.parse(saved));
                clearInterval(interval);
            }
        } catch (e) { }

        const timeout = setTimeout(() => clearInterval(interval), 5000);
        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, []);

    if (!resume) {
        return <div className="p-8 text-center text-gray-500">Wait for data...</div>;
    }

    return (
        <div className="builder-layout" data-theme="light">
            <div className="builder-main">
                <div className="preview-panel" style={{ background: 'white', padding: 0 }}>
                    <div
                        className="export-container"
                        style={{
                            background: 'white',
                            minHeight: '100vh',
                            width: '100%'
                        }}
                    >
                        <style jsx global>{`
                            /* Force visibility and light theme in PDF engine */
                            body {
                                background: white !important;
                                margin: 0 !important;
                                padding: 0 !important;
                                visibility: visible !important;
                                display: block !important;
                            }
                            
                            /* Override the "hide everything" rule in globals.css */
                            @media print {
                                body > * {
                                    display: block !important;
                                    visibility: visible !important;
                                }
                                .builder-layout, .builder-main, .preview-panel {
                                    display: block !important;
                                    position: static !important;
                                    width: 100% !important;
                                    height: auto !important;
                                    overflow: visible !important;
                                    background: white !important;
                                }
                                .resume-page {
                                    box-shadow: none !important;
                                    margin: 0 !important;
                                }
                            }

                            .renderer-wrapper {
                                transform: none !important;
                                width: 100% !important;
                                margin: 0 !important;
                                padding: 0 !important;
                            }
                        `}</style>
                        <TemplateRenderer resume={resume} scale={1} />
                    </div>
                </div>
            </div>
        </div>
    );
}
