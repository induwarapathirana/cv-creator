'use client';

import { useResumeStore } from '@/stores/resume-store';
import { Education } from '@/types/resume';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

export default function EducationForm() {
    const resume = useResumeStore((s) => s.getActiveResume());
    const addEducation = useResumeStore((s) => s.addEducation);
    const updateEducation = useResumeStore((s) => s.updateEducation);
    const removeEducation = useResumeStore((s) => s.removeEducation);
    const pushUndoState = useResumeStore((s) => s.pushUndoState);

    if (!resume) return null;

    const handleUpdate = (id: string, data: Partial<Education>) => {
        pushUndoState();
        updateEducation(id, data);
    };

    return (
        <div className="section-content">
            {resume.education.map((edu) => (
                <div key={edu.id} className="entry-card">
                    <div className="entry-card-header">
                        <span className="entry-card-title">
                            {edu.institution || edu.degree || 'New Education'}
                        </span>
                        <button
                            className="btn-icon"
                            style={{ width: 28, height: 28, fontSize: 14 }}
                            onClick={() => { pushUndoState(); removeEducation(edu.id); }}
                        >
                            <FiTrash2 />
                        </button>
                    </div>

                    <div className="input-row">
                        <div className="input-group">
                            <label>Institution</label>
                            <input
                                className="input"
                                value={edu.institution}
                                onChange={(e) => handleUpdate(edu.id, { institution: e.target.value })}
                                placeholder="Stanford University"
                            />
                        </div>
                        <div className="input-group">
                            <label>Degree</label>
                            <input
                                className="input"
                                value={edu.degree}
                                onChange={(e) => handleUpdate(edu.id, { degree: e.target.value })}
                                placeholder="Bachelor's"
                            />
                        </div>
                    </div>

                    <div className="input-row" style={{ marginTop: 8 }}>
                        <div className="input-group">
                            <label>Field of Study</label>
                            <input
                                className="input"
                                value={edu.field}
                                onChange={(e) => handleUpdate(edu.id, { field: e.target.value })}
                                placeholder="Computer Science"
                            />
                        </div>
                        <div className="input-group">
                            <label>GPA</label>
                            <input
                                className="input"
                                value={edu.gpa}
                                onChange={(e) => handleUpdate(edu.id, { gpa: e.target.value })}
                                placeholder="3.8 / 4.0"
                            />
                        </div>
                    </div>

                    <div className="input-row" style={{ marginTop: 8 }}>
                        <div className="input-group">
                            <label>Location</label>
                            <input
                                className="input"
                                value={edu.location}
                                onChange={(e) => handleUpdate(edu.id, { location: e.target.value })}
                                placeholder="Palo Alto, CA"
                            />
                        </div>
                        <div className="input-row" style={{ gap: 6 }}>
                            <div className="input-group">
                                <label>Start</label>
                                <input
                                    className="input"
                                    type="month"
                                    value={edu.startDate}
                                    onChange={(e) => handleUpdate(edu.id, { startDate: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <label>End</label>
                                <input
                                    className="input"
                                    type="month"
                                    value={edu.endDate}
                                    onChange={(e) => handleUpdate(edu.id, { endDate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="input-group" style={{ marginTop: 8 }}>
                        <label>Activities / Description</label>
                        <textarea
                            className="textarea"
                            rows={2}
                            value={edu.description}
                            onChange={(e) => handleUpdate(edu.id, { description: e.target.value })}
                            placeholder="Dean's List, Club President..."
                        />
                    </div>
                </div>
            ))}

            <button
                className="add-entry-btn"
                onClick={() => { pushUndoState(); addEducation(); }}
            >
                <FiPlus /> Add Education
            </button>
        </div>
    );
}
