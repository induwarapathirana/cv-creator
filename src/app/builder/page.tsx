import { Suspense } from 'react';
import BuilderContent from '@/components/builder/BuilderContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Resume Builder - OpenResume',
    description: 'Build your professional resume with OpenResume\'s real-time preview and ATS optimization.',
    alternates: {
        canonical: '/builder',
    },
};

export default function BuilderPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
            <BuilderContent />
        </Suspense>
    );
}
