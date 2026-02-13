'use client';

import { useResumeStore } from '@/stores/resume-store';
import { FiPlus, FiX } from 'react-icons/fi';
import { useState } from 'react';

export default function SkillsForm() {
    const resume = useResumeStore((s) => s.getActiveResume());
    const addSkill = useResumeStore((s) => s.addSkill);
    const updateSkill = useResumeStore((s) => s.updateSkill);
    const removeSkill = useResumeStore((s) => s.removeSkill);
    const pushUndoState = useResumeStore((s) => s.pushUndoState);

    const [newSkill, setNewSkill] = useState('');
    const [newCategory, setNewCategory] = useState('Technical');

    if (!resume) return null;

    const handleAddSkill = () => {
        if (!newSkill.trim()) return;
        pushUndoState();
        addSkill({ name: newSkill.trim(), category: newCategory, level: 3 });
        setNewSkill('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSkill();
        }
    };

    const categories = [...new Set(resume.skills.map((s) => s.category))];

    return (
        <div className="section-content">
            {/* Skill Input */}
            <div style={{ display: 'flex', gap: 8 }}>
                <div className="input-group" style={{ flex: 1 }}>
                    <label>Skill Name</label>
                    <input
                        className="input"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g. React, Python, Leadership..."
                    />
                </div>
                <div className="input-group" style={{ width: 130 }}>
                    <label>Category</label>
                    <input
                        className="input"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Category"
                        list="skill-categories"
                    />
                    <datalist id="skill-categories">
                        <option value="Technical" />
                        <option value="Languages" />
                        <option value="Tools" />
                        <option value="Soft Skills" />
                        <option value="Frontend" />
                        <option value="Backend" />
                        <option value="DevOps" />
                        <option value="Cloud" />
                        <option value="Database" />
                    </datalist>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button className="btn btn-primary btn-sm" onClick={handleAddSkill}>
                        <FiPlus />
                    </button>
                </div>
            </div>

            {/* Skills by Category */}
            {categories.map((cat) => (
                <div key={cat} style={{ marginTop: 8 }}>
                    <div style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: 'var(--text-tertiary)',
                        marginBottom: 6,
                    }}>
                        {cat}
                    </div>
                    <div className="skills-grid">
                        {resume.skills
                            .filter((s) => s.category === cat)
                            .map((skill) => (
                                <div key={skill.id} className="skill-tag">
                                    <span>{skill.name}</span>
                                    <div className="skill-level-dots">
                                        {[1, 2, 3, 4, 5].map((level) => (
                                            <span
                                                key={level}
                                                className={`skill-dot ${level <= skill.level ? 'active' : ''}`}
                                                onClick={() => {
                                                    pushUndoState();
                                                    updateSkill(skill.id, { level });
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => { pushUndoState(); removeSkill(skill.id); }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: 'var(--text-tertiary)',
                                            fontSize: 12,
                                            padding: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <FiX />
                                    </button>
                                </div>
                            ))}
                    </div>
                </div>
            ))}

            {resume.skills.length === 0 && (
                <p style={{ color: 'var(--text-tertiary)', fontSize: 13, textAlign: 'center', padding: 16 }}>
                    Type a skill name and press Enter to add it.
                </p>
            )}
        </div>
    );
}
