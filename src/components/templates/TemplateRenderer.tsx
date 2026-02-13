'use client';

import { Resume } from '@/types/resume';
import ModernTemplate from './ModernTemplate';
import ClassicTemplate from './ClassicTemplate';
import MinimalTemplate from './MinimalTemplate';
import ExecutiveTemplate from './ExecutiveTemplate';
import CreativeTemplate from './CreativeTemplate';
import TimelineTemplate from './TimelineTemplate';
import SwissTemplate from './SwissTemplate';
import GridTemplate from './GridTemplate';

interface TemplateRendererProps {
    resume: Resume;
    scale?: number;
}

export default function TemplateRenderer({ resume, scale = 1 }: TemplateRendererProps) {
    switch (resume.settings.template) {
        case 'classic':
            return <ClassicTemplate resume={resume} scale={scale} />;
        case 'minimal':
            return <MinimalTemplate resume={resume} scale={scale} />;
        case 'executive':
            return <ExecutiveTemplate resume={resume} scale={scale} />;
        case 'creative':
            return <CreativeTemplate resume={resume} scale={scale} />;
        case 'timeline':
            return <TimelineTemplate resume={resume} scale={scale} />;
        case 'swiss':
            return <SwissTemplate resume={resume} scale={scale} />;
        case 'grid':
            return <GridTemplate resume={resume} scale={scale} />;
        case 'modern':
        default:
            return <ModernTemplate resume={resume} scale={scale} />;
    }
}
