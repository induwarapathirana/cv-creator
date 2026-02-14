'use client';

import { useState } from 'react';
import { useResumeStore } from '@/stores/resume-store';
import { useActiveResume } from '@/hooks/use-active-resume';
import { Resume } from '@/types/resume';
import { FiChevronDown, FiEye, FiEyeOff, FiMenu, FiUser, FiBriefcase, FiBook, FiCode, FiFolder, FiAward, FiGlobe, FiStar, FiPlus } from 'react-icons/fi';
import PersonalInfoForm from './sections/PersonalInfoForm';
import ExperienceForm from './sections/ExperienceForm';
import EducationForm from './sections/EducationForm';
import SkillsForm from './sections/SkillsForm';
import ProjectsForm from './sections/ProjectsForm';
import CertificationsForm from './sections/CertificationsForm';
import LanguagesForm from './sections/LanguagesForm';
import AwardsForm from './sections/AwardsForm';
import CustomSectionForm from './sections/CustomSectionForm';

const sectionForms: Record<string, React.ComponentType<any>> = {
    personalInfo: PersonalInfoForm,
    summary: PersonalInfoForm,
    experience: ExperienceForm,
    education: EducationForm,
    skills: SkillsForm,
    projects: ProjectsForm,
    certifications: CertificationsForm,
    languages: LanguagesForm,
    awards: AwardsForm,
    custom: CustomSectionForm,
};

const sectionIcons: Record<string, React.ComponentType<{ size?: number }>> = {
    personalInfo: FiUser,
    experience: FiBriefcase,
    education: FiBook,
    skills: FiCode,
    projects: FiFolder,
    certifications: FiAward,
    languages: FiGlobe,
    awards: FiStar,
    custom: FiMenu,
};

function getSectionSummary(type: string, resume: Resume, customSectionId?: string): string {
    switch (type) {
        case 'personalInfo': {
            const p = resume.personalInfo;
            const parts = [p.fullName, p.jobTitle].filter(Boolean);
            return parts.length > 0 ? parts.join(' — ') : 'Not filled in yet';
        }
        case 'experience': {
            const exp = Array.isArray(resume.experience) ? resume.experience : [];
            if (exp.length === 0) return 'No entries added';
            const items = exp.slice(0, 3).map(e =>
                e.position && e.company ? `${e.position} at ${e.company}` :
                    e.position || e.company || 'Untitled'
            );
            const more = exp.length > 3 ? ` +${exp.length - 3} more` : '';
            return items.join(' · ') + more;
        }
        case 'education': {
            const edu = Array.isArray(resume.education) ? resume.education : [];
            if (edu.length === 0) return 'No entries added';
            const items = edu.slice(0, 3).map(e =>
                e.degree && e.institution ? `${e.degree} — ${e.institution}` :
                    e.institution || e.degree || 'Untitled'
            );
            const more = edu.length > 3 ? ` +${edu.length - 3} more` : '';
            return items.join(' · ') + more;
        }
        case 'skills': {
            const skills = Array.isArray(resume.skills) ? resume.skills : [];
            if (skills.length === 0) return 'No skills added';
            const names = skills.slice(0, 6).map(s => s.name);
            const more = skills.length > 6 ? ` +${skills.length - 6} more` : '';
            return names.join(', ') + more;
        }
        case 'projects': {
            const projects = Array.isArray(resume.projects) ? resume.projects : [];
            if (projects.length === 0) return 'No projects added';
            return projects.map(p => p.name || 'Untitled').slice(0, 3).join(' · ');
        }
        case 'certifications': {
            const certs = Array.isArray(resume.certifications) ? resume.certifications : [];
            if (certs.length === 0) return 'No certifications added';
            return certs.map(c => c.name || 'Untitled').slice(0, 3).join(' · ');
        }
        case 'languages': {
            const langs = Array.isArray(resume.languages) ? resume.languages : [];
            if (langs.length === 0) return 'No languages added';
            return langs.map(l => `${l.name} (${l.proficiency})`).join(', ');
        }
        case 'awards': {
            const awards = Array.isArray(resume.awards) ? resume.awards : [];
            if (awards.length === 0) return 'No awards added';
            return awards.map(a => a.title || 'Untitled').slice(0, 3).join(' · ');
        }
        case 'custom': {
            const custom = resume.customSections.find(cs => cs.id === customSectionId);
            if (!custom || custom.items.length === 0) return 'No entries added';
            return custom.items.map(i => i.title || 'Untitled').slice(0, 3).join(' · ');
        }
        default:
            return '';
    }
}

function getItemCount(type: string, resume: Resume, customSectionId?: string): number | null {
    switch (type) {
        case 'experience': return Array.isArray(resume.experience) ? resume.experience.length : 0;
        case 'education': return Array.isArray(resume.education) ? resume.education.length : 0;
        case 'skills': return Array.isArray(resume.skills) ? resume.skills.length : 0;
        case 'projects': return Array.isArray(resume.projects) ? resume.projects.length : 0;
        case 'certifications': return Array.isArray(resume.certifications) ? resume.certifications.length : 0;
        case 'languages': return Array.isArray(resume.languages) ? resume.languages.length : 0;
        case 'awards': return Array.isArray(resume.awards) ? resume.awards.length : 0;
        case 'custom': {
            const custom = resume.customSections.find(cs => cs.id === customSectionId);
            return custom ? custom.items.length : 0;
        }
        default: return null;
    }
}

export default function EditorSidebar() {
    const resume = useActiveResume();
    const updateSectionConfig = useResumeStore((s) => s.updateSectionConfig);
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

    return (
        <div className="editor-sidebar">
            <div className="editor-sidebar-inner">
                {sortedSections.map((section) => {
                    const FormComponent = sectionForms[section.type];
                    if (!FormComponent) return null;
                    const isOpen = openSections[section.id] ?? false;
                    const Icon = sectionIcons[section.type] || FiMenu;
                    const summary = getSectionSummary(section.type, resume, section.customSectionId);
                    const count = getItemCount(section.type, resume, section.customSectionId);

                    return (
                        <div key={section.id} className={`editor-section ${isOpen ? 'editor-section-open' : ''} ${!section.visible ? 'editor-section-hidden' : ''}`}>
                            <div className="section-header-bar" onClick={() => toggleSection(section.id)}>
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
                                            maxWidth: '280px'
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
                    );
                })}

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
