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
        // Read data from global if available (set by Puppeteer)
        if (window.__RESUME_DATA__) {
            setResume(window.__RESUME_DATA__);
        } else {
            // Fallback: try to read from localStorage just in case
            try {
                const saved = localStorage.getItem('resume-export-data');
                if (saved) {
                    setResume(JSON.parse(saved));
                }
            } catch (e) {
                console.error('Failed to load resume from localStorage');
            }
        }
    }, []);

    if (!resume) {
        return <div className="p-8 text-center text-gray-500">Wait for data...</div>;
    }

    return (
        <div
            className="export-container"
            style={{
                background: 'white',
                minHeight: '100vh',
                width: '100%'
            }}
            data-theme="light"
        >
            <style jsx global>{`
                body {
                    background: white !important;
                    margin: 0 !important;
                    padding: 0 !important;
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
    );
}
