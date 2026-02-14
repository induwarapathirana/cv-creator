'use client';

import { useState } from 'react';
import { useResumeStore } from '@/stores/resume-store';
import ImageEditorModal from '@/components/ui/ImageEditorModal';
import RichTextEditor from '@/components/ui/RichTextEditor';

export default function PersonalInfoForm() {
    const updatePersonalInfo = useResumeStore((s) => s.updatePersonalInfo);
    const pushUndoState = useResumeStore((s) => s.pushUndoState);
    const resume = useResumeStore((s) => s.getActiveResume());

    // Local state for image editor
    const [showImageEditor, setShowImageEditor] = useState(false);
    const [tempImage, setTempImage] = useState<string | null>(null);

    if (!resume) return null;

    const { personalInfo } = resume;

    const handleChange = (field: string, value: string) => {
        pushUndoState();
        updatePersonalInfo({ [field]: value });
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempImage(reader.result as string);
                setShowImageEditor(true);
            };
            reader.readAsDataURL(file);
            e.target.value = ''; // Reset input
        }
    };

    const handleSaveCroppedImage = (croppedImage: string) => {
        pushUndoState();
        updatePersonalInfo({ photo: croppedImage });
        setShowImageEditor(false);
        setTempImage(null);
    };

    return (
        <div className="section-content">
            {showImageEditor && tempImage && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
                    <ImageEditorModal
                        imageSrc={tempImage}
                        onCancel={() => { setShowImageEditor(false); setTempImage(null); }}
                        onSave={handleSaveCroppedImage}
                    />
                </div>
            )}

            {/* Photo Upload */}
            <div className="input-group" style={{ marginBottom: 16 }}>
                <label>Profile Photo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {personalInfo.photo ? (
                        <div style={{ position: 'relative', width: 64, height: 64 }}>
                            <img
                                src={personalInfo.photo}
                                alt="Profile"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', border: '2px solid var(--border-color)' }}
                            />
                            <button
                                onClick={() => { pushUndoState(); updatePersonalInfo({ photo: '' }); }}
                                style={{
                                    position: 'absolute', top: -4, right: -4, background: '#ef4444', color: 'white',
                                    border: 'none', borderRadius: '50%', width: 20, height: 20,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12
                                }}
                                title="Remove photo"
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: 24 }}>
                            <span style={{ fontSize: 10, textAlign: 'center' }}>No Photo</span>
                        </div>
                    )}
                    <div style={{ flex: 1 }}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            style={{ display: 'none' }}
                            id="photo-upload"
                        />
                        <label
                            htmlFor="photo-upload"
                            className="btn btn-secondary btn-sm"
                        >
                            Upload Photo
                        </label>
                        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                            Recommended: Square JPG or PNG, max 1MB.
                        </p>
                    </div>
                </div>
            </div>

            <div className="input-row">
                <div className="input-group">
                    <label>Full Name</label>
                    <input
                        className="input"
                        value={personalInfo.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                        placeholder="John Doe"
                    />
                </div>
                <div className="input-group">
                    <label>Job Title</label>
                    <input
                        className="input"
                        value={personalInfo.jobTitle}
                        onChange={(e) => handleChange('jobTitle', e.target.value)}
                        placeholder="Software Engineer"
                    />
                </div>
            </div>

            <div className="input-row">
                <div className="input-group">
                    <label>Email</label>
                    <input
                        className="input"
                        type="email"
                        value={personalInfo.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="john@example.com"
                    />
                </div>
                <div className="input-group">
                    <label>Phone</label>
                    <input
                        className="input"
                        value={personalInfo.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                    />
                </div>
            </div>

            <div className="input-row">
                <div className="input-group">
                    <label>Location</label>
                    <input
                        className="input"
                        value={personalInfo.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                        placeholder="San Francisco, CA"
                    />
                </div>
                <div className="input-group">
                    <label>Website</label>
                    <input
                        className="input"
                        value={personalInfo.website}
                        onChange={(e) => handleChange('website', e.target.value)}
                        placeholder="https://portfolio.dev"
                    />
                </div>
            </div>

            <div className="input-row">
                <div className="input-group">
                    <label>LinkedIn</label>
                    <input
                        className="input"
                        value={personalInfo.linkedin}
                        onChange={(e) => handleChange('linkedin', e.target.value)}
                        placeholder="linkedin.com/in/johndoe"
                    />
                </div>
                <div className="input-group">
                    <label>GitHub</label>
                    <input
                        className="input"
                        value={personalInfo.github}
                        onChange={(e) => handleChange('github', e.target.value)}
                        placeholder="github.com/johndoe"
                    />
                </div>
            </div>

            <div className="input-group">
                <RichTextEditor
                    label="Professional Summary"
                    value={personalInfo.summary}
                    onChange={(val) => handleChange('summary', val)}
                    placeholder="Write a brief 2-4 sentence summary..."
                />
            </div>
        </div>
    );
}
