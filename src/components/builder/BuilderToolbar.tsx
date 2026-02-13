'use client';

import { useResumeStore } from '@/stores/resume-store';
import {
    FiArrowLeft,
    FiDownload,
    FiUpload,
    FiTarget,
    FiRotateCcw,
    FiRotateCw,
    FiSettings,
} from 'react-icons/fi';
import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';

interface BuilderToolbarProps {
    onToggleATS: () => void;
    onToggleSettings: () => void;
}

export default function BuilderToolbar({ onToggleATS, onToggleSettings }: BuilderToolbarProps) {
    const resume = useResumeStore((s) => s.getActiveResume());
    const renameResume = useResumeStore((s) => s.renameResume);
    const exportResume = useResumeStore((s) => s.exportResume);
    const importResume = useResumeStore((s) => s.importResume);
    const undo = useResumeStore((s) => s.undo);
    const redo = useResumeStore((s) => s.redo);
    const undoStack = useResumeStore((s) => s.undoStack);
    const redoStack = useResumeStore((s) => s.redoStack);
    const [toast, setToast] = useState('');

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) redo();
                else undo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    const handleExportJSON = useCallback(() => {
        if (!resume) return;
        const json = exportResume(resume.id);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${resume.title.replace(/\s+/g, '_')}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Resume exported as JSON');
    }, [resume, exportResume]);

    const handleImportJSON = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const result = importResume(ev.target?.result as string);
                if (result) {
                    showToast('Resume imported successfully');
                } else {
                    showToast('Error: Invalid resume file');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }, [importResume]);

    const handlePrintPDF = () => {
        window.print();
        showToast('PDF export started');
    };

    if (!resume) return null;

    return (
        <>
            <div className="builder-toolbar">
                <div className="builder-toolbar-left">
                    <Link href="/" className="btn-icon" title="Back to Home">
                        <FiArrowLeft />
                    </Link>
                    <div className="toolbar-divider" />
                    <input
                        className="resume-title-input"
                        value={resume.title}
                        onChange={(e) => renameResume(resume.id, e.target.value)}
                    />
                </div>

                <div className="builder-toolbar-center">
                    <button
                        className="btn-icon"
                        onClick={undo}
                        disabled={undoStack.length === 0}
                        title="Undo (Ctrl+Z)"
                        style={{ opacity: undoStack.length === 0 ? 0.3 : 1 }}
                    >
                        <FiRotateCcw />
                    </button>
                    <button
                        className="btn-icon"
                        onClick={redo}
                        disabled={redoStack.length === 0}
                        title="Redo (Ctrl+Shift+Z)"
                        style={{ opacity: redoStack.length === 0 ? 0.3 : 1 }}
                    >
                        <FiRotateCw />
                    </button>
                </div>

                <div className="builder-toolbar-right">
                    <button className="btn-icon" onClick={onToggleSettings} title="Resume Settings">
                        <FiSettings />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={onToggleATS} title="ATS Score">
                        <FiTarget /> ATS Score
                    </button>
                    <div className="toolbar-divider" />
                    <button className="btn-icon" onClick={handleImportJSON} title="Import JSON">
                        <FiUpload />
                    </button>
                    <button className="btn-icon" onClick={handleExportJSON} title="Export JSON">
                        <FiDownload />
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={handlePrintPDF}>
                        <FiDownload /> PDF
                    </button>
                </div>
            </div>

            {toast && (
                <div className="toast-container">
                    <div className="toast toast-info">{toast}</div>
                </div>
            )}
        </>
    );
}
