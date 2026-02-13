'use client';

import { useResumeStore } from '@/stores/resume-store';
import { Project } from '@/types/resume';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { useState } from 'react';

export default function ProjectsForm() {
    const resume = useResumeStore((s) => s.getActiveResume());
    const addProject = useResumeStore((s) => s.addProject);
    const updateProject = useResumeStore((s) => s.updateProject);
    const removeProject = useResumeStore((s) => s.removeProject);
    const pushUndoState = useResumeStore((s) => s.pushUndoState);

    const [techInput, setTechInput] = useState<Record<string, string>>({});

    if (!resume) return null;

    const handleUpdate = (id: string, data: Partial<Project>) => {
        pushUndoState();
        updateProject(id, data);
    };

    const handleAddTech = (id: string, technologies: string[]) => {
        const value = techInput[id]?.trim();
        if (!value) return;
        pushUndoState();
        updateProject(id, { technologies: [...technologies, value] });
        setTechInput((prev) => ({ ...prev, [id]: '' }));
    };

    return (
        <div className="section-content">
            {resume.projects.map((proj) => (
                <div key={proj.id} className="entry-card">
                    <div className="entry-card-header">
                        <span className="entry-card-title">{proj.name || 'New Project'}</span>
                        <button
                            className="btn-icon"
                            style={{ width: 28, height: 28, fontSize: 14 }}
                            onClick={() => { pushUndoState(); removeProject(proj.id); }}
                        >
                            <FiTrash2 />
                        </button>
                    </div>

                    <div className="input-group">
                        <label>Project Name</label>
                        <input
                            className="input"
                            value={proj.name}
                            onChange={(e) => handleUpdate(proj.id, { name: e.target.value })}
                            placeholder="My Awesome Project"
                        />
                    </div>

                    <div className="input-group" style={{ marginTop: 8 }}>
                        <label>Description</label>
                        <textarea
                            className="textarea"
                            rows={3}
                            value={proj.description}
                            onChange={(e) => handleUpdate(proj.id, { description: e.target.value })}
                            placeholder="Describe the project, your role, and key outcomes..."
                        />
                    </div>

                    <div className="input-group" style={{ marginTop: 8 }}>
                        <label>Technologies</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                            {proj.technologies.map((tech, i) => (
                                <span key={i} className="skill-tag" style={{ fontSize: 12, padding: '3px 8px' }}>
                                    {tech}
                                    <button
                                        onClick={() => {
                                            pushUndoState();
                                            updateProject(proj.id, { technologies: proj.technologies.filter((_, idx) => idx !== i) });
                                        }}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 10, padding: 0, display: 'flex' }}
                                    >
                                        <FiX />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <input
                                className="input"
                                value={techInput[proj.id] || ''}
                                onChange={(e) => setTechInput((prev) => ({ ...prev, [proj.id]: e.target.value }))}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTech(proj.id, proj.technologies); } }}
                                placeholder="Add technology..."
                                style={{ flex: 1 }}
                            />
                            <button className="btn btn-ghost btn-sm" onClick={() => handleAddTech(proj.id, proj.technologies)}>
                                <FiPlus />
                            </button>
                        </div>
                    </div>

                    <div className="input-row" style={{ marginTop: 8 }}>
                        <div className="input-group">
                            <label>Live URL</label>
                            <input
                                className="input"
                                value={proj.liveUrl}
                                onChange={(e) => handleUpdate(proj.id, { liveUrl: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="input-group">
                            <label>Repository URL</label>
                            <input
                                className="input"
                                value={proj.repoUrl}
                                onChange={(e) => handleUpdate(proj.id, { repoUrl: e.target.value })}
                                placeholder="https://github.com/..."
                            />
                        </div>
                    </div>
                </div>
            ))}

            <button
                className="add-entry-btn"
                onClick={() => { pushUndoState(); addProject(); }}
            >
                <FiPlus /> Add Project
            </button>
        </div>
    );
}
