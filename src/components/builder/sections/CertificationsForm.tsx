'use client';

import { useResumeStore } from '@/stores/resume-store';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

export default function CertificationsForm() {
    const resume = useResumeStore((s) => s.getActiveResume());
    const addCertification = useResumeStore((s) => s.addCertification);
    const updateCertification = useResumeStore((s) => s.updateCertification);
    const removeCertification = useResumeStore((s) => s.removeCertification);
    const pushUndoState = useResumeStore((s) => s.pushUndoState);

    if (!resume) return null;

    return (
        <div className="section-content">
            {resume.certifications.map((cert) => (
                <div key={cert.id} className="entry-card">
                    <div className="entry-card-header">
                        <span className="entry-card-title">{cert.name || 'New Certification'}</span>
                        <button
                            className="btn-icon"
                            style={{ width: 28, height: 28, fontSize: 14 }}
                            onClick={() => { pushUndoState(); removeCertification(cert.id); }}
                        >
                            <FiTrash2 />
                        </button>
                    </div>
                    <div className="input-row">
                        <div className="input-group">
                            <label>Certification Name</label>
                            <input className="input" value={cert.name} onChange={(e) => { pushUndoState(); updateCertification(cert.id, { name: e.target.value }); }} placeholder="AWS Solutions Architect" />
                        </div>
                        <div className="input-group">
                            <label>Issuer</label>
                            <input className="input" value={cert.issuer} onChange={(e) => { pushUndoState(); updateCertification(cert.id, { issuer: e.target.value }); }} placeholder="Amazon Web Services" />
                        </div>
                    </div>
                    <div className="input-row" style={{ marginTop: 8 }}>
                        <div className="input-group">
                            <label>Date Issued</label>
                            <input className="input" type="month" value={cert.date} onChange={(e) => { pushUndoState(); updateCertification(cert.id, { date: e.target.value }); }} />
                        </div>
                        <div className="input-group">
                            <label>Credential ID</label>
                            <input className="input" value={cert.credentialId} onChange={(e) => { pushUndoState(); updateCertification(cert.id, { credentialId: e.target.value }); }} placeholder="ABC-123456" />
                        </div>
                    </div>
                </div>
            ))}
            <button className="add-entry-btn" onClick={() => { pushUndoState(); addCertification(); }}>
                <FiPlus /> Add Certification
            </button>
        </div>
    );
}
