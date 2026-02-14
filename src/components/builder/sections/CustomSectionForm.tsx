'use client';

import { useResumeStore } from '@/stores/resume-store';
import { CustomSection, CustomItem } from '@/types/resume';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import RichTextEditor from '@/components/ui/RichTextEditor';

interface CustomSectionFormProps {
    id: string; // The ID of the CustomSection (not the SectionConfig ID)
}

export default function CustomSectionForm({ id }: CustomSectionFormProps) {
    const resume = useResumeStore((s) => s.getActiveResume());
    const updateCustomSection = useResumeStore((s) => s.updateCustomSection);
    const removeCustomSection = useResumeStore((s) => s.removeCustomSection);
    const addCustomItem = useResumeStore((s) => s.addCustomItem);
    const updateCustomItem = useResumeStore((s) => s.updateCustomItem);
    const removeCustomItem = useResumeStore((s) => s.removeCustomItem);
    const pushUndoState = useResumeStore((s) => s.pushUndoState);

    if (!resume) return null;

    const customSection = resume.customSections.find(s => s.id === id);
    if (!customSection) return null;

    const handleUpdateSection = (data: Partial<CustomSection>) => {
        pushUndoState();
        updateCustomSection(id, data);
    };

    const handleUpdateItem = (itemId: string, data: Partial<CustomItem>) => {
        pushUndoState();
        updateCustomItem(id, itemId, data);
    };

    return (
        <div className="section-content">
            <div className="input-group" style={{ marginBottom: 16 }}>
                <label>Section Title</label>
                <input
                    className="input"
                    value={customSection.title}
                    onChange={(e) => handleUpdateSection({ title: e.target.value })}
                    placeholder="e.g. Leadership, Volunteer Work..."
                />
            </div>

            {customSection.items.map((item) => (
                <div key={item.id} className="entry-card">
                    <div className="entry-card-header">
                        <span className="entry-card-title">
                            {item.title || 'New Item'}
                        </span>
                        <div className="entry-card-actions">
                            <button
                                className="btn-icon"
                                style={{ width: 28, height: 28, fontSize: 14 }}
                                onClick={() => { pushUndoState(); removeCustomItem(id, item.id); }}
                                title="Remove Item"
                            >
                                <FiTrash2 />
                            </button>
                        </div>
                    </div>

                    <div className="input-row">
                        <div className="input-group">
                            <label>Title</label>
                            <input
                                className="input"
                                value={item.title}
                                onChange={(e) => handleUpdateItem(item.id, { title: e.target.value })}
                                placeholder="Role or Achievement"
                            />
                        </div>
                        <div className="input-group">
                            <label>Subtitle / Organization</label>
                            <input
                                className="input"
                                value={item.subtitle}
                                onChange={(e) => handleUpdateItem(item.id, { subtitle: e.target.value })}
                                placeholder="Organization name"
                            />
                        </div>
                    </div>

                    <div className="input-group" style={{ marginTop: 8 }}>
                        <label>Date / Period</label>
                        <input
                            className="input"
                            value={item.date}
                            onChange={(e) => handleUpdateItem(item.id, { date: e.target.value })}
                            placeholder="Jan 2023 - Present"
                        />
                    </div>

                    <div className="input-group" style={{ marginTop: 8 }}>
                        <RichTextEditor
                            label="Description"
                            value={item.description}
                            onChange={(val) => handleUpdateItem(item.id, { description: val })}
                            placeholder="Details about this item..."
                        />
                    </div>
                </div>
            ))}

            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button
                    className="add-entry-btn"
                    style={{ flex: 1 }}
                    onClick={() => { pushUndoState(); addCustomItem(id); }}
                >
                    <FiPlus /> Add Item
                </button>
                <button
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                        if (confirm('Are you sure you want to delete this entire section?')) {
                            pushUndoState();
                            removeCustomSection(id);
                        }
                    }}
                >
                    <FiTrash2 /> Delete Section
                </button>
            </div>
        </div>
    );
}
