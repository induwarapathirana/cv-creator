'use client';

import { useState } from 'react';
import { useResumeStore } from '@/stores/resume-store';
import { useActiveResume } from '@/hooks/use-active-resume';
import { Resume } from '@/types/resume';
import { FiChevronDown, FiEye, FiEyeOff, FiMenu, FiUser, FiBriefcase, FiBook, FiCode, FiFolder, FiAward, FiGlobe, FiStar, FiPlus } from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import PersonalInfoForm from './sections/PersonalInfoForm';
import ExperienceForm from './sections/ExperienceForm';
import EducationForm from './sections/EducationForm';
import SkillsForm from './sections/SkillsForm';
import ProjectsForm from './sections/ProjectsForm';
import CertificationsForm from './sections/CertificationsForm';
import LanguagesForm from './sections/LanguagesForm';
import AwardsForm from './sections/AwardsForm';
import CustomSectionForm from './sections/CustomSectionForm';

import { SectionType } from '@/types/resume';

const sectionForms: Record<string, any> = {
    personalInfo: PersonalInfoForm,
    experience: ExperienceForm,
    education: EducationForm,
    skills: SkillsForm,
    projects: ProjectsForm,
    certifications: CertificationsForm,
    languages: LanguagesForm,
    awards: AwardsForm,
    custom: CustomSectionForm,
};

const sectionIcons: Record<string, any> = {
    personalInfo: FiUser,
    experience: FiBriefcase,
    education: FiBook,
    skills: FiCode,
    projects: FiFolder,
    certifications: FiAward,
    languages: FiGlobe,
    awards: FiStar,
    custom: FiPlus,
};

const getItemCount = (type: SectionType, resume: Resume, customId?: string) => {
    if (type === 'personalInfo') return null;
    if (type === 'custom' && customId) {
        return resume.customSections.find(s => s.id === customId)?.items.length || 0;
    }
    const items = (resume as any)[type];
    return Array.isArray(items) ? items.length : 0;
};

const getSectionSummary = (type: SectionType, resume: Resume, customId?: string) => {
    if (type === 'personalInfo') return resume.personalInfo.fullName;
    if (type === 'custom' && customId) {
        const section = resume.customSections.find(s => s.id === customId);
        return section?.items.length ? `${section.items.length} items` : 'No items';
    }
    const items = (resume as any)[type];
    if (Array.isArray(items)) {
        return items.length ? `${items.length} items` : 'No items';
    }
    return '';
};

export default function EditorSidebar() {
    const resume = useActiveResume();
    const updateSectionConfig = useResumeStore((s) => s.updateSectionConfig);
    const reorderSections = useResumeStore((s) => s.reorderSections);
    const addCustomSection = useResumeStore((s) => s.addCustomSection);
    const pushUndoState = useResumeStore((s) => s.pushUndoState);
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

    if (!resume) return null;

    const sections = Array.isArray(resume.sections) ? resume.sections : [];
    const sortedSections = [...sections]
        .filter((s) => s.type !== 'summary')
        .sort((a, b) => a.order - b.order);

    const toggleSection = (id: string) => {
        setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleVisibility = (id: string, visible: boolean) => {
        pushUndoState();
        updateSectionConfig(id, { visible: !visible });
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        if (result.destination.index === result.source.index) return;

        pushUndoState();
        reorderSections(result.draggableId, result.destination.index);
    };

    return (
        <div className="editor-sidebar">
            <div className="editor-sidebar-inner">
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="sections-list">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                {sortedSections.map((section, index) => {
                                    const FormComponent = sectionForms[section.type];
                                    if (!FormComponent) return null;
                                    const isOpen = openSections[section.id] ?? false;
                                    const Icon = sectionIcons[section.type] || FiMenu;
                                    const summary = getSectionSummary(section.type, resume, section.customSectionId);
                                    const count = getItemCount(section.type, resume, section.customSectionId);

                                    return (
                                        <Draggable key={section.id} draggableId={section.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`editor-section ${isOpen ? 'editor-section-open' : ''} ${!section.visible ? 'editor-section-hidden' : ''} ${snapshot.isDragging ? 'is-dragging' : ''}`}
                                                    style={{
                                                        ...provided.draggableProps.style,
                                                        marginBottom: '8px'
                                                    }}
                                                >
                                                    <div className="section-header-bar" onClick={() => toggleSection(section.id)}>
                                                        <div {...provided.dragHandleProps} className="section-drag-handle" style={{ padding: '0 8px', color: 'var(--text-tertiary)', cursor: 'grab' }}>
                                                            <FiMenu size={14} />
                                                        </div>
                                                        <span className="section-icon">
                                                            <Icon size={16} />
                                                        </span>
                                                        <div className="section-header-content">
                                                            <div className="section-header-top" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                <span className="section-title-text" style={{ fontSize: 15 }}>{section.title}</span>
                                                                {count !== null && count > 0 && (
                                                                    <span className="section-count" style={{
                                                                        fontSize: 11,
                                                                        fontWeight: 700,
                                                                        background: 'var(--bg-tertiary)',
                                                                        padding: '2px 8px',
                                                                        borderRadius: 12,
                                                                        color: 'var(--text-secondary)'
                                                                    }}>
                                                                        {count}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {!isOpen && (
                                                                <div className="section-summary" style={{
                                                                    fontSize: 13,
                                                                    color: 'var(--text-tertiary)',
                                                                    marginTop: 4,
                                                                    lineHeight: 1.4,
                                                                    whiteSpace: 'nowrap',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    maxWidth: '240px'
                                                                }}>
                                                                    {summary}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="section-header-actions">
                                                            <div className="section-column-toggle" style={{ display: 'flex', gap: 2, marginRight: 8, background: 'var(--bg-tertiary)', padding: 2, borderRadius: 4 }}>
                                                                <button
                                                                    title="Move to Left Column"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        updateSectionConfig(section.id, { column: 'left' });
                                                                    }}
                                                                    style={{
                                                                        padding: '2px 4px',
                                                                        fontSize: 10,
                                                                        fontWeight: 700,
                                                                        borderRadius: 3,
                                                                        border: 'none',
                                                                        cursor: 'pointer',
                                                                        background: section.column === 'left' ? 'var(--primary)' : 'transparent',
                                                                        color: section.column === 'left' ? '#fff' : 'var(--text-tertiary)',
                                                                        transition: 'all 0.2s'
                                                                    }}
                                                                >
                                                                    L
                                                                </button>
                                                                <button
                                                                    title="Move to Right Column"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        updateSectionConfig(section.id, { column: 'right' });
                                                                    }}
                                                                    style={{
                                                                        padding: '2px 4px',
                                                                        fontSize: 10,
                                                                        fontWeight: 700,
                                                                        borderRadius: 3,
                                                                        border: 'none',
                                                                        cursor: 'pointer',
                                                                        background: (section.column === 'right' || !section.column) ? 'var(--primary)' : 'transparent',
                                                                        color: (section.column === 'right' || !section.column) ? '#fff' : 'var(--text-tertiary)',
                                                                        transition: 'all 0.2s'
                                                                    }}
                                                                >
                                                                    R
                                                                </button>
                                                            </div>
                                                            <button
                                                                className="section-toggle"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleVisibility(section.id, section.visible);
                                                                    if (section.type === 'personalInfo') {
                                                                        const summarySection = resume.sections.find(s => s.type === 'summary');
                                                                        if (summarySection) {
                                                                            updateSectionConfig(summarySection.id, { visible: !section.visible });
                                                                        }
                                                                    }
                                                                }}
                                                                title={section.visible ? 'Hide section' : 'Show section'}
                                                            >
                                                                {section.visible ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                                                            </button>
                                                            <span className={`section-chevron ${isOpen ? 'open' : ''}`}>
                                                                <FiChevronDown size={14} />
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className={`section-body ${isOpen ? 'section-body-open' : ''}`}>
                                                        {isOpen && <FormComponent id={section.customSectionId} />}
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    );
                                })}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                <div className="add-section-container" style={{ padding: '0 20px 20px' }}>
                    <button
                        className="add-entry-btn"
                        onClick={() => {
                            pushUndoState();
                            addCustomSection('Custom Section');
                        }}
                    >
                        <FiPlus /> Add Custom Section
                    </button>
                </div>
            </div>
        </div>
    );
}
