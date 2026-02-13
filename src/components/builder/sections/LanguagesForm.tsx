'use client';

import { useResumeStore } from '@/stores/resume-store';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

export default function LanguagesForm() {
    const resume = useResumeStore((s) => s.getActiveResume());
    const addLanguage = useResumeStore((s) => s.addLanguage);
    const updateLanguage = useResumeStore((s) => s.updateLanguage);
    const removeLanguage = useResumeStore((s) => s.removeLanguage);
    const pushUndoState = useResumeStore((s) => s.pushUndoState);

    if (!resume) return null;

    return (
        <div className="section-content">
            {resume.languages.map((lang) => (
                <div key={lang.id} className="entry-card" style={{ padding: 12 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                        <div className="input-group" style={{ flex: 1 }}>
                            <label>Language</label>
                            <input className="input" value={lang.name} onChange={(e) => { pushUndoState(); updateLanguage(lang.id, { name: e.target.value }); }} placeholder="English" />
                        </div>
                        <div className="input-group" style={{ width: 150 }}>
                            <label>Proficiency</label>
                            <select className="select" value={lang.proficiency} onChange={(e) => { pushUndoState(); updateLanguage(lang.id, { proficiency: e.target.value as any }); }}>
                                <option value="native">Native</option>
                                <option value="fluent">Fluent</option>
                                <option value="advanced">Advanced</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="beginner">Beginner</option>
                            </select>
                        </div>
                        <button className="btn-icon" style={{ width: 36, height: 36, fontSize: 14, flexShrink: 0 }} onClick={() => { pushUndoState(); removeLanguage(lang.id); }}>
                            <FiTrash2 />
                        </button>
                    </div>
                </div>
            ))}
            <button className="add-entry-btn" onClick={() => { pushUndoState(); addLanguage(); }}>
                <FiPlus /> Add Language
            </button>
        </div>
    );
}
