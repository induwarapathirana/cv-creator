'use client';

import { useResumeStore } from '@/stores/resume-store';
import {
    FiPlus,
    FiZap,
    FiMoreVertical,
    FiEdit3,
    FiCopy,
    FiTrash2,
    FiSun,
    FiMoon,
    FiArrowLeft,
    FiFileText
} from 'react-icons/fi';
import { useState, useEffect } from 'react';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardContent() {
    const resumes = useResumeStore((s) => s.resumes);
    const setActiveResume = useResumeStore((s) => s.setActiveResume);
    const createResume = useResumeStore((s) => s.createResume);
    const duplicateResume = useResumeStore((s) => s.duplicateResume);
    const deleteResume = useResumeStore((s) => s.deleteResume);
    const loadSampleResume = useResumeStore((s) => s.loadSampleResume);
    const [menuOpen, setMenuOpen] = useState<string | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const router = useRouter();

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'dark';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        localStorage.setItem('theme', next);
        document.documentElement.setAttribute('data-theme', next);
    };

    const handleEdit = (id: string) => {
        setActiveResume(id);
        router.push('/builder');
    };

    const handleCreate = () => {
        const id = createResume('New Resume');
        router.push('/builder');
    };

    const handleSample = () => {
        loadSampleResume();
        router.push('/builder');
    };

    return (
        <div className="manager-page">
            <div className="container" style={{ maxWidth: 1000, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Link href="/" className="btn-icon" title="Back to Home">
                            <FiArrowLeft />
                        </Link>
                        <div>
                            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800 }}>
                                My Resumes
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                                Select a resume to edit or create a new one
                            </p>
                        </div>
                    </div>
                    <button className="btn-icon" onClick={toggleTheme} title="Toggle theme">
                        {theme === 'dark' ? <FiSun /> : <FiMoon />}
                    </button>
                </div>

                <div className="resumes-grid">
                    {/* New Resume */}
                    <button
                        className="new-resume-card"
                        onClick={handleCreate}
                    >
                        <div className="new-resume-icon"><FiPlus /></div>
                        <span>Create New Resume</span>
                    </button>

                    {/* Sample Resume */}
                    {resumes.length === 0 && (
                        <button
                            className="new-resume-card"
                            onClick={handleSample}
                            style={{ borderColor: 'var(--accent-primary)', borderStyle: 'dashed' }}
                        >
                            <div className="new-resume-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #059669)' }}>
                                <FiZap />
                            </div>
                            <span>Start with Sample</span>
                        </button>
                    )}

                    {/* Import from PDF */}
                    <button
                        className="new-resume-card"
                        onClick={() => router.push('/parser')}
                        style={{ borderColor: '#8b5cf6', borderStyle: 'dashed' }}
                    >
                        <div className="new-resume-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
                            <FiFileText />
                        </div>
                        <span>Import from PDF</span>
                    </button>

                    {/* Existing resumes */}
                    {resumes.map((r) => (
                        <div
                            key={r.id}
                            className="resume-card"
                            onClick={() => handleEdit(r.id)}
                        >
                            <div className="resume-card-preview">
                                <div style={{ transform: 'scale(0.24)', transformOrigin: 'center' }}>
                                    <TemplateRenderer resume={r} scale={1} />
                                </div>
                            </div>
                            <div className="resume-card-footer" style={{ color: '#fff' }}>
                                <div>
                                    <div className="resume-card-title">{r.title}</div>
                                    <div className="resume-card-date" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                        {new Date(r.updatedAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <button
                                        className="btn-icon"
                                        style={{ width: 32, height: 32, fontSize: 14, color: '#fff' }}
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
                                                    handleEdit(r.id);
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
