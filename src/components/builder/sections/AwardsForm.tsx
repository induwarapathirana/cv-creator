'use client';

import { useResumeStore } from '@/stores/resume-store';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

export default function AwardsForm() {
    const resume = useResumeStore((s) => s.getActiveResume());
    const addAward = useResumeStore((s) => s.addAward);
    const updateAward = useResumeStore((s) => s.updateAward);
    const removeAward = useResumeStore((s) => s.removeAward);
    const pushUndoState = useResumeStore((s) => s.pushUndoState);

    if (!resume) return null;

    return (
        <div className="section-content">
            {resume.awards.map((award) => (
                <div key={award.id} className="entry-card">
                    <div className="entry-card-header">
                        <span className="entry-card-title">{award.title || 'New Award'}</span>
                        <button className="btn-icon" style={{ width: 28, height: 28, fontSize: 14 }} onClick={() => { pushUndoState(); removeAward(award.id); }}>
                            <FiTrash2 />
                        </button>
                    </div>
                    <div className="input-row">
                        <div className="input-group">
                            <label>Award Title</label>
                            <input className="input" value={award.title} onChange={(e) => { pushUndoState(); updateAward(award.id, { title: e.target.value }); }} placeholder="Innovation Award" />
                        </div>
                        <div className="input-group">
                            <label>Issuer</label>
                            <input className="input" value={award.issuer} onChange={(e) => { pushUndoState(); updateAward(award.id, { issuer: e.target.value }); }} placeholder="TechCorp Inc." />
                        </div>
                    </div>
                    <div className="input-row" style={{ marginTop: 8 }}>
                        <div className="input-group">
                            <label>Date</label>
                            <input className="input" type="month" value={award.date} onChange={(e) => { pushUndoState(); updateAward(award.id, { date: e.target.value }); }} />
                        </div>
                        <div className="input-group">
                            <label>Description</label>
                            <input className="input" value={award.description} onChange={(e) => { pushUndoState(); updateAward(award.id, { description: e.target.value }); }} placeholder="Brief description..." />
                        </div>
                    </div>
                </div>
            ))}
            <button className="add-entry-btn" onClick={() => { pushUndoState(); addAward(); }}>
                <FiPlus /> Add Award
            </button>
        </div>
    );
}
