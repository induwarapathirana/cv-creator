'use client';

import { useResumeStore } from '@/stores/resume-store';
import { WorkExperience } from '@/types/resume';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';

export default function ExperienceForm() {
    const resume = useResumeStore((s) => s.getActiveResume());
    const addExperience = useResumeStore((s) => s.addExperience);
    const updateExperience = useResumeStore((s) => s.updateExperience);
    const removeExperience = useResumeStore((s) => s.removeExperience);
    const pushUndoState = useResumeStore((s) => s.pushUndoState);

    if (!resume) return null;

    const handleUpdate = (id: string, data: Partial<WorkExperience>) => {
        pushUndoState();
        updateExperience(id, data);
    };

    const handleAddHighlight = (id: string, highlights: string[]) => {
        pushUndoState();
        updateExperience(id, { highlights: [...highlights, ''] });
    };

    const handleUpdateHighlight = (id: string, highlights: string[], index: number, value: string) => {
        const updated = [...highlights];
        updated[index] = value;
        updateExperience(id, { highlights: updated });
    };

    const handleRemoveHighlight = (id: string, highlights: string[], index: number) => {
        pushUndoState();
        updateExperience(id, { highlights: highlights.filter((_, i) => i !== index) });
    };

    return (
        <div className="section-content">
            {resume.experience.map((exp) => (
                <div key={exp.id} className="entry-card">
                    <div className="entry-card-header">
                        <span className="entry-card-title">
                            {exp.position || exp.company || 'New Experience'}
                        </span>
                        <div className="entry-card-actions">
                            <button
                                className="btn-icon"
                                style={{ width: 28, height: 28, fontSize: 14 }}
                                onClick={() => { pushUndoState(); removeExperience(exp.id); }}
                                title="Remove"
                            >
                                <FiTrash2 />
                            </button>
                        </div>
                    </div>

                    <div className="input-row">
                        <div className="input-group">
                            <label>Position</label>
                            <input
                                className="input"
                                value={exp.position}
                                onChange={(e) => handleUpdate(exp.id, { position: e.target.value })}
                                placeholder="Software Engineer"
                            />
                        </div>
                        <div className="input-group">
                            <label>Company</label>
                            <input
                                className="input"
                                value={exp.company}
                                onChange={(e) => handleUpdate(exp.id, { company: e.target.value })}
                                placeholder="TechCorp Inc."
                            />
                        </div>
                    </div>

                    <div className="input-row" style={{ marginTop: 8 }}>
                        <div className="input-group">
                            <label>Location</label>
                            <input
                                className="input"
                                value={exp.location}
                                onChange={(e) => handleUpdate(exp.id, { location: e.target.value })}
                                placeholder="San Francisco, CA"
                            />
                        </div>
                        <div className="input-row" style={{ gap: 6 }}>
                            <div className="input-group">
                                <label>Start</label>
                                <input
                                    className="input"
                                    type="month"
                                    value={exp.startDate}
                                    onChange={(e) => handleUpdate(exp.id, { startDate: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <label>End</label>
                                <input
                                    className="input"
                                    type="month"
                                    value={exp.endDate}
                                    disabled={exp.current}
                                    onChange={(e) => handleUpdate(exp.id, { endDate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={exp.current}
                            onChange={(e) => handleUpdate(exp.id, { current: e.target.checked, endDate: '' })}
                            style={{ accentColor: 'var(--accent-primary)' }}
                        />
                        Currently working here
                    </label>

                    <div className="input-group" style={{ marginTop: 8 }}>
                        <label>Description</label>
                        <textarea
                            className="textarea"
                            rows={2}
                            value={exp.description}
                            onChange={(e) => handleUpdate(exp.id, { description: e.target.value })}
                            placeholder="Brief role description..."
                        />
                    </div>

                    <div style={{ marginTop: 8 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', display: 'block', marginBottom: 6 }}>
                            Key Achievements
                        </label>
                        <div className="highlights-list">
                            {exp.highlights.map((h, i) => (
                                <div key={i} className="highlight-item">
                                    <input
                                        className="input"
                                        value={h}
                                        onChange={(e) => handleUpdateHighlight(exp.id, exp.highlights, i, e.target.value)}
                                        placeholder="Led a team of 5 to deliver..."
                                    />
                                    <button
                                        className="highlight-remove"
                                        onClick={() => handleRemoveHighlight(exp.id, exp.highlights, i)}
                                    >
                                        <FiX />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            className="btn btn-ghost btn-sm"
                            style={{ marginTop: 6 }}
                            onClick={() => handleAddHighlight(exp.id, exp.highlights)}
                        >
                            <FiPlus /> Add Bullet Point
                        </button>
                    </div>
                </div>
            ))}

            <button
                className="add-entry-btn"
                onClick={() => { pushUndoState(); addExperience(); }}
            >
                <FiPlus /> Add Work Experience
            </button>
        </div>
    );
}
