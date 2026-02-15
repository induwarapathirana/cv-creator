'use client';

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
            <div className="resume-pages-container renderer-wrapper" style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
                {/* For now, we render as one big "page" that can be breaked by CSS print rules or just viewed as a sequence */}
                {renderTemplate()}
            </div>
        );
    }

    return (
        <div className="renderer-wrapper" style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
            {renderTemplate()}
        </div>
    );
}
