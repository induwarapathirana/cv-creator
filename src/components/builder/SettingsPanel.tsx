'use client';

import { useState } from 'react';
import { useResumeStore } from '@/stores/resume-store';
import { useActiveResume } from '@/hooks/use-active-resume';
import { FiDownload, FiUpload, FiPrinter, FiFileText, FiMaximize, FiMinimize } from 'react-icons/fi';

const templates = [
    { id: 'modern', label: 'Modern' },
    { id: 'classic', label: 'Classic' },
    { id: 'minimal', label: 'Minimal' },
    { id: 'executive', label: 'Executive' },
    { id: 'tech', label: 'Tech (Dev)' },
    { id: 'creative', label: 'Creative' },
    { id: 'academic', label: 'Academic (CV)' },
    { id: 'compact', label: 'Compact' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'bold', label: 'Bold' },
    { id: 'split', label: 'Split' },
    { id: 'glitch', label: 'Glitch (Cyber)' },
    { id: 'leaf', label: 'Leaf (Nature)' },
    { id: 'swiss', label: 'Swiss (Bold)' },
    { id: 'grid', label: 'Grid' },
    { id: 'modern2', label: 'Modern 2 (Sleek)' },
    { id: 'professional', label: 'Professional' },
    { id: 'elegant', label: 'Elegant' },
];

const fonts = [
    'Inter',
    'Georgia',
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Cambria',
    'Calibri',
];

const colorPresets = [
    { name: 'Indigo', primary: '#6366f1' },
    { name: 'Emerald', primary: '#059669' },
    { name: 'Rose', primary: '#e11d48' },
    { name: 'Navy', primary: '#1e3a5f' },
    { name: 'Purple', primary: '#7c3aed' },
    { name: 'Charcoal', primary: '#374151' },
    { name: 'Teal', primary: '#0d9488' },
    { name: 'Orange', primary: '#ea580c' },
];

interface SettingsPanelProps {
    onClose: () => void;
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
    const resume = useActiveResume();
    const updateSettings = useResumeStore((s) => s.updateSettings);
    const pushUndoState = useResumeStore((s) => s.pushUndoState);

    if (!resume) return null;

    const { settings } = resume;
    const [isExporting, setIsExporting] = useState(false);

    const handleExportPdf = async () => {
        setIsExporting(true);
        try {
            // 3. Send to API (Reactive Resume style: send data, not HTML)
            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resume }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.details || 'Failed to generate PDF');
            }

            // 4. Download the blob
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${resume.title.replace(/\s+/g, '_') || 'resume'}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error: any) {
            console.error('Export failed:', error);
            alert(`Export failed: ${error.message}`);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="ats-panel" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>
                    Resume Settings
                </h3>
                <button className="btn-icon" onClick={onClose} style={{ width: 32, height: 32 }}>✕</button>
            </div>

            {/* Template */}
            <div className="settings-section">
                <div className="settings-label" style={{ marginBottom: 8 }}>Template</div>
                <div className="template-selector">
                    {templates.map((t) => (
                        <button
                            key={t.id}
                            className={`template-option ${settings.template === t.id ? 'active' : ''}`}
                            onClick={() => { pushUndoState(); updateSettings({ template: t.id }); }}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Font */}
            <div className="settings-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                <div className="settings-label" style={{ marginBottom: 8 }}>Font</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {fonts.map((font) => (
                        <button
                            key={font}
                            className={`font-option ${settings.font === font ? 'active' : ''}`}
                            style={{ fontFamily: font, textAlign: 'left' }}
                            onClick={() => { pushUndoState(); updateSettings({ font }); }}
                        >
                            {font}
                        </button>
                    ))}
                </div>
            </div>

            {/* Colors */}
            <div className="settings-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                <div className="settings-label" style={{ marginBottom: 8 }}>Accent Color</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {colorPresets.map((color) => (
                        <div
                            key={color.name}
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 'var(--radius-sm)',
                                background: color.primary,
                                cursor: 'pointer',
                                border: settings.colors.primary === color.primary ? '3px solid var(--text-primary)' : '2px solid transparent',
                                transition: 'all var(--transition-fast)',
                            }}
                            title={color.name}
                            onClick={() => { pushUndoState(); updateSettings({ colors: { ...settings.colors, primary: color.primary } }); }}
                        />
                    ))}
                </div>
                <div style={{ marginTop: 8 }}>
                    <div className="color-picker-group">
                        <label style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Custom:</label>
                        <div className="color-swatch" style={{ background: settings.colors.primary }}>
                            <input
                                type="color"
                                value={settings.colors.primary}
                                onChange={(e) => { updateSettings({ colors: { ...settings.colors, primary: e.target.value } }); }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Font Size */}
            <div className="settings-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                <div className="settings-row">
                    <span className="settings-label">Font Size</span>
                    <span className="settings-value">{settings.fontSize}px</span>
                </div>
                <input
                    type="range"
                    className="range-input"
                    min="10"
                    max="18"
                    step="1"
                    value={settings.fontSize}
                    onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                    style={{ width: '100%' }}
                />
            </div>

            {/* Line Height */}
            <div className="settings-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                <div className="settings-row">
                    <span className="settings-label">Line Height</span>
                    <span className="settings-value">{settings.lineHeight}</span>
                </div>
                <input
                    type="range"
                    className="range-input"
                    min="1.0"
                    max="2.0"
                    step="0.1"
                    value={settings.lineHeight}
                    onChange={(e) => updateSettings({ lineHeight: parseFloat(e.target.value) })}
                    style={{ width: '100%' }}
                />
            </div>

            {/* Section Spacing */}
            <div className="settings-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                <div className="settings-row">
                    <span className="settings-label">Section Spacing</span>
                    <span className="settings-value">{settings.sectionSpacing}px</span>
                </div>
                <input
                    type="range"
                    className="range-input"
                    min="8"
                    max="32"
                    step="2"
                    value={settings.sectionSpacing}
                    onChange={(e) => updateSettings({ sectionSpacing: parseInt(e.target.value) })}
                    style={{ width: '100%' }}
                />
            </div>

            {/* Page Margins */}
            <div className="settings-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                <div className="settings-row">
                    <span className="settings-label">Page Margins</span>
                    <span className="settings-value">{settings.pageMargin}px</span>
                </div>
                <input
                    type="range"
                    className="range-input"
                    min="20"
                    max="60"
                    step="5"
                    value={settings.pageMargin}
                    onChange={(e) => updateSettings({ pageMargin: parseInt(e.target.value) })}
                    style={{ width: '100%' }}
                />
            </div>

            {/* Pagination Toggle */}
            <div className="settings-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                <div className="settings-label" style={{ marginBottom: 12 }}>Page Layout</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button
                        className={`template-option ${!settings.usePaging ? 'active' : ''}`}
                        onClick={() => { pushUndoState(); updateSettings({ usePaging: false }); }}
                        style={{ display: 'flex', flexDirection: 'column', padding: '12px 8px', gap: 4 }}
                    >
                        <FiMaximize style={{ fontSize: 18 }} />
                        <span>Single Page</span>
                    </button>
                    <button
                        className={`template-option ${settings.usePaging ? 'active' : ''}`}
                        onClick={() => { pushUndoState(); updateSettings({ usePaging: true }); }}
                        style={{ display: 'flex', flexDirection: 'column', padding: '12px 8px', gap: 4 }}
                    >
                        <FiMinimize style={{ fontSize: 18 }} />
                        <span>A4 Pagination</span>
                    </button>
                </div>
                {!settings.usePaging && (
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                            type="checkbox"
                            id="useSinglePage"
                            checked={settings.useSinglePage || false}
                            onChange={(e) => { pushUndoState(); updateSettings({ useSinglePage: e.target.checked }); }}
                            style={{ width: 16, height: 16 }}
                        />
                        <label htmlFor="useSinglePage" style={{ fontSize: 13, userSelect: 'none', cursor: 'pointer' }}>
                            Continuous PDF (One long page)
                        </label>
                    </div>
                )}
            </div>

            {/* Data Management */}
            <div className="settings-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16, paddingBottom: 40 }}>
                <div className="settings-label" style={{ marginBottom: 12 }}>Import / Export</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                    <button
                        className="btn btn-primary"
                        disabled={isExporting}
                        onClick={handleExportPdf}
                        style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 8 }}
                    >
                        {isExporting ? (
                            <>
                                <span className="spinner" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                                Generating PDF...
                            </>
                        ) : (
                            <>
                                <FiPrinter /> Download PDF
                            </>
                        )}
                    </button>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                                const json = useResumeStore.getState().exportResume(resume.id);
                                const blob = new Blob([json], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${resume.title.replace(/\s+/g, '_')}.json`;
                                a.click();
                                URL.revokeObjectURL(url);
                            }}
                        >
                            <FiFileText /> JSON
                        </button>

                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = '.json';
                                input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = async (event) => {
                                            const content = event.target?.result as string;
                                            if (content) {
                                                try {
                                                    const json = JSON.parse(content);
                                                    let id;
                                                    if (json.basics) {
                                                        const { importReactiveResumeJson } = await import('@/utils/import-reactive-resume');
                                                        const converted = importReactiveResumeJson(json);
                                                        if (converted) {
                                                            id = useResumeStore.getState().addResume(converted);
                                                        }
                                                    } else {
                                                        id = useResumeStore.getState().importResume(content);
                                                    }

                                                    if (id) {
                                                        alert('Resume imported successfully!');
                                                        setTimeout(() => onClose(), 100);
                                                    } else {
                                                        alert('Invalid resume file');
                                                    }
                                                } catch (err: any) {
                                                    console.error('Import Error:', err);
                                                    alert(`Error importing resume: ${err.message || 'Unknown error'}`);
                                                }
                                            }
                                        };
                                        reader.readAsText(file);
                                    }
                                };
                                input.click();
                            }}
                        >
                            <FiUpload /> Import
                        </button>
                    </div>
                </div>

                <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 12, textAlign: 'center' }}>
                    JSON files are compatible with CV Creator and Reactive Resume v4.
                </p>
            </div>
        </div>
    );
}
