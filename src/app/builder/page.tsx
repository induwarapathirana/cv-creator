'use client';

import { useEffect, useState } from 'react';
import { useResumeStore } from '@/stores/resume-store';
import EditorSidebar from '@/components/builder/EditorSidebar';
import BuilderToolbar from '@/components/builder/BuilderToolbar';
import ATSPanel from '@/components/builder/ATSPanel';
import SettingsPanel from '@/components/builder/SettingsPanel';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import { FiPlus, FiZap, FiMoreVertical, FiCopy, FiTrash2, FiEdit3 } from 'react-icons/fi';
import { useTheme } from '@/hooks/use-theme';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function BuilderPage() {
    const resumes = useResumeStore((s) => s.resumes);
    const activeResumeId = useResumeStore((s) => s.activeResumeId);
    const resume = useResumeStore((s) => s.getActiveResume());
    const createResume = useResumeStore((s) => s.createResume);
    const loadSampleResume = useResumeStore((s) => s.loadSampleResume);
    const setActiveResume = useResumeStore((s) => s.setActiveResume);
    const duplicateResume = useResumeStore((s) => s.duplicateResume);
    const deleteResume = useResumeStore((s) => s.deleteResume);

    const [showATS, setShowATS] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [zoom, setZoom] = useState(0.65);
    const [mounted, setMounted] = useState(false);
    const [showManager, setShowManager] = useState(false);
    const [menuOpen, setMenuOpen] = useState<string | null>(null);
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && resumes.length === 0) {
            setShowManager(true);
        } else if (mounted && !activeResumeId && resumes.length > 0) {
            setActiveResume(resumes[0].id);
        }
    }, [mounted, resumes.length, activeResumeId, setActiveResume, resumes]);

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

    // Resume Manager / Dashboard
    if (showManager || !resume) {
        return (
            <div className="manager-page">
                <div className="container" style={{ maxWidth: 1000 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                        <div>
                            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800 }}>
                                My Resumes
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                                Select a resume to edit or create a new one
                            </p>
                        </div>
                        <button className="btn-icon" onClick={toggleTheme} title="Toggle theme">
                            {theme === 'dark' ? <FiSun /> : <FiMoon />}
                        </button>
                    </div>

                    <div className="resumes-grid">
                        {/* New Resume */}
                        <button
                            className="new-resume-card"
                            onClick={() => {
                                const id = createResume('New Resume');
                                setShowManager(false);
                            }}
                        >
                            <div className="new-resume-icon"><FiPlus /></div>
                            <span>Create New Resume</span>
                        </button>

                        {/* Sample Resume */}
                        {resumes.length === 0 && (
                            <button
                                className="new-resume-card"
                                onClick={() => {
                                    loadSampleResume();
                                    setShowManager(false);
                                }}
                                style={{ borderColor: 'var(--accent-primary)', borderStyle: 'dashed' }}
                            >
                                <div className="new-resume-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #059669)' }}>
                                    <FiZap />
                                </div>
                                <span>Start with Sample</span>
                            </button>
                        )}

                        {/* Existing resumes */}
                        {resumes.map((r) => (
                            <div
                                key={r.id}
                                className="resume-card"
                                onClick={() => {
                                    setActiveResume(r.id);
                                    setShowManager(false);
                                }}
                            >
                                <div className="resume-card-preview" style={{ transform: 'scale(0.35)', transformOrigin: 'top left', width: '286%', height: '286%' }}>
                                    <TemplateRenderer resume={r} scale={1} />
                                </div>
                                <div className="resume-card-footer">
                                    <div>
                                        <div className="resume-card-title">{r.title}</div>
                                        <div className="resume-card-date">
                                            {new Date(r.updatedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <button
                                            className="btn-icon"
                                            style={{ width: 32, height: 32, fontSize: 14 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMenuOpen(menuOpen === r.id ? null : r.id);
                                            }}
                                        >
                                            <FiMoreVertical />
                                        </button>
                                        {menuOpen === r.id && (
                                            <div style={{
                                                position: 'absolute',
                                                right: 0,
                                                bottom: 40,
                                                background: 'var(--bg-secondary)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: 'var(--radius-md)',
                                                boxShadow: 'var(--shadow-lg)',
                                                padding: 4,
                                                minWidth: 150,
                                                zIndex: 50,
                                            }}>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    style={{ width: '100%', justifyContent: 'flex-start' }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveResume(r.id);
                                                        setShowManager(false);
                                                        setMenuOpen(null);
                                                    }}
                                                >
                                                    <FiEdit3 /> Edit
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    style={{ width: '100%', justifyContent: 'flex-start' }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        duplicateResume(r.id);
                                                        setMenuOpen(null);
                                                    }}
                                                >
                                                    <FiCopy /> Duplicate
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    style={{ width: '100%', justifyContent: 'flex-start', color: '#ef4444' }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteResume(r.id);
                                                        setMenuOpen(null);
                                                    }}
                                                >
                                                    <FiTrash2 /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Builder View
    return (
        <div className="builder-layout">
            <BuilderToolbar
                onToggleATS={() => { setShowATS(!showATS); setShowSettings(false); }}
                onToggleSettings={() => { setShowSettings(!showSettings); setShowATS(false); }}
            />

            <EditorSidebar />

            <div className="preview-panel">
                <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
                    <TemplateRenderer resume={resume} />
                </div>
            </div>

            {showATS && <ATSPanel onClose={() => setShowATS(false)} />}
            {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

            {/* Zoom Controls */}
            <div className="preview-controls">
                <button className="btn-icon" style={{ width: 32, height: 32, fontSize: 14 }} onClick={() => setZoom(Math.max(0.3, zoom - 0.1))}>−</button>
                <span className="zoom-label">{Math.round(zoom * 100)}%</span>
                <button className="btn-icon" style={{ width: 32, height: 32, fontSize: 14 }} onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}>+</button>
            </div>
        </div>
    );
}
