import { Metadata } from 'next';
import ParserContent from '@/components/parser/ParserContent';

export const metadata: Metadata = {
    title: 'Resume Parser - OpenResume',
    description: 'Upload your PDF resume and import it into OpenResume\'s free builder instantly.',
    alternates: {
        canonical: '/parser',
    },
};

export default function ParserPage() {
    return <ParserContent />;
}
