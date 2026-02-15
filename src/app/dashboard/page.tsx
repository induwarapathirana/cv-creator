import { Metadata } from 'next';
import DashboardContent from '@/components/dashboard/DashboardContent';

export const metadata: Metadata = {
    title: 'Dashboard - OpenResume',
    description: 'Manage your resumes, create new ones, or import from PDF with OpenResume.',
    alternates: {
        canonical: '/dashboard',
    },
};

export default function DashboardPage() {
    return <DashboardContent />;
}
