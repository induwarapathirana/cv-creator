'use client';

import { useResumeStore } from '@/stores/resume-store';
import { useActiveResume } from '@/hooks/use-active-resume';

const templates = [
    { id: 'modern', label: 'Modern' },
    { id: 'classic', label: 'Classic' },
    { id: 'minimal', label: 'Minimal' },
    { id: 'executive', label: 'Executive' },
    { id: 'creative', label: 'Creative' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'swiss', label: 'Swiss (Bold)' },
    { id: 'grid', label: 'Grid' },
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

            {/* Data Management */}
            <div className="settings-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                <div className="settings-label" style={{ marginBottom: 12 }}>Data Management</div>
                <button
                    className="btn-secondary"
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
                                            // Check if Reactive Resume format (has basics)
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
                                                // Small delay to ensure state update propagates safely
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
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                    <span>📥</span> Import JSON (CV Creator / Reactive Resume)
                </button>
            </div>
        </div>
    );
}
