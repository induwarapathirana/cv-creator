'use client';

import { useEffect, useState, Suspense } from 'react';
import { useResumeStore } from '@/stores/resume-store';
import { useActiveResume } from '@/hooks/use-active-resume';
import EditorSidebar from '@/components/builder/EditorSidebar';
import BuilderToolbar from '@/components/builder/BuilderToolbar';
import ATSPanel from '@/components/builder/ATSPanel';
import SettingsPanel from '@/components/builder/SettingsPanel';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import { useTheme } from '@/hooks/use-theme';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiEdit, FiEye } from 'react-icons/fi';
import SyncNoticeModal from '@/components/builder/SyncNoticeModal';

function BuilderContent() {
    const resumes = useResumeStore((s) => s.resumes);
    const activeResumeId = useResumeStore((s) => s.activeResumeId);
    const resume = useActiveResume();
    const setActiveResume = useResumeStore((s) => s.setActiveResume);
    const loadFromCloud = useResumeStore((s) => s.loadFromCloud);
    const syncToCloud = useResumeStore((s) => s.syncToCloud);
    const cloudSyncId = useResumeStore((s) => s.cloudSyncId);

    const searchParams = useSearchParams();
    const cloudId = searchParams.get('id');
    const router = useRouter();

    const [showATS, setShowATS] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [zoom, setZoom] = useState(0.65);
    const [mounted, setMounted] = useState(false);
    const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle Cloud Load
    useEffect(() => {
        if (mounted && cloudId) {
            loadFromCloud(cloudId).then(id => {
                if (id) {
                    console.log('Loaded from cloud:', id);
                }
            });
        }
    }, [mounted, cloudId, loadFromCloud]);

    // Handle Dashboard Redirect or Auto-select
    useEffect(() => {
        if (!mounted || cloudId) return;

        if (resumes.length === 0) {
            router.push('/dashboard');
        } else if (!activeResumeId && resumes.length > 0) {
            setActiveResume(resumes[0].id);
        }
    }, [mounted, resumes.length, activeResumeId, setActiveResume, resumes, cloudId, router]);

    // Auto-sync Logic
    useEffect(() => {
        if (!mounted || !cloudSyncId || !resume) return;

        const timer = setTimeout(() => {
            syncToCloud(resume.id);
        }, 2000);

        return () => clearTimeout(timer);
    }, [resume, cloudSyncId, syncToCloud, mounted]);

    if (!mounted) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-primary)',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        border: '3px solid var(--border-color)',
                        borderTopColor: 'var(--accent-primary)',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        margin: '0 auto 16px',
                    }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
                </div>
            </div>
        );
    }

    if (!resume) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-primary)',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>No resume selected</p>
                    <button className="btn btn-primary" onClick={() => router.push('/dashboard')}>
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`builder-layout ${mobileView === 'preview' ? 'mobile-show-preview' : 'mobile-show-editor'}`}>
            <BuilderToolbar
                onToggleATS={() => { setShowATS(!showATS); setShowSettings(false); }}
                onToggleSettings={() => { setShowSettings(!showSettings); setShowATS(false); }}
                onShowDashboard={() => router.push('/dashboard')}
            />

            <div className="builder-main">
                <EditorSidebar />

                <div className="preview-panel">
                    <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
                        <TemplateRenderer resume={resume} />
                    </div>
                </div>
            </div>

            {/* Mobile View Toggle */}
            <div className="mobile-view-toggle">
                <button
                    className={`mobile-toggle-btn ${mobileView === 'editor' ? 'active' : ''}`}
                    onClick={() => setMobileView('editor')}
                >
                    <FiEdit /> Editor
                </button>
                <button
                    className={`mobile-toggle-btn ${mobileView === 'preview' ? 'active' : ''}`}
                    onClick={() => setMobileView('preview')}
                >
                    <FiEye /> Preview
                </button>
            </div>

            {showATS && <ATSPanel onClose={() => setShowATS(false)} />}
            {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

            <SyncNoticeModal />

            {/* Zoom Controls */}
            <div className="preview-controls">
                <button className="btn-icon" style={{ width: 32, height: 32, fontSize: 14 }} onClick={() => setZoom(Math.max(0.3, zoom - 0.1))}>−</button>
                <span className="zoom-label">{Math.round(zoom * 100)}%</span>
                <button className="btn-icon" style={{ width: 32, height: 32, fontSize: 14 }} onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}>+</button>
            </div>
        </div>
    );
}

export default function BuilderPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
            <BuilderContent />
        </Suspense>
    );
}
