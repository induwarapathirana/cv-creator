import { Metadata } from 'next';
import HRReviewer from '@/components/parser/HRReviewer';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export const metadata: Metadata = {
    title: 'AI Resume HR Audit - OpenResume',
    description: 'Get an AI-powered HR review of your resume against any job description.',
};

export default function AnalyzerPage() {
    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ paddingTop: '120px', paddingBottom: '80px' }}>
                <div className="container">
                    <header style={{ marginBottom: '48px', textAlign: 'center' }}>
                        <h1 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(32px, 5vw, 48px)',
                            fontWeight: 900,
                            marginBottom: '16px'
                        }}>
                            AI <span className="gradient-text">HR Audit</span>
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
                            Match your resume against any job posting and get actionable feedback to increase your interview chances.
                        </p>
                    </header>

                    <HRReviewer />
                </div>
            </main>
            <Footer />
        </div>
    );
}
