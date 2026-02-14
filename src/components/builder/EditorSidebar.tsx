'use client';

import { useState } from 'react';
import { useResumeStore } from '@/stores/resume-store';
import { Resume } from '@/types/resume';
import { FiChevronDown, FiEye, FiEyeOff, FiMenu, FiUser, FiBriefcase, FiBook, FiCode, FiFolder, FiAward, FiGlobe, FiStar } from 'react-icons/fi';
import PersonalInfoForm from './sections/PersonalInfoForm';
import ExperienceForm from './sections/ExperienceForm';
import EducationForm from './sections/EducationForm';
import SkillsForm from './sections/SkillsForm';
import ProjectsForm from './sections/ProjectsForm';
import CertificationsForm from './sections/CertificationsForm';
import LanguagesForm from './sections/LanguagesForm';
import AwardsForm from './sections/AwardsForm';

const sectionForms: Record<string, React.ComponentType> = {
    personalInfo: PersonalInfoForm,
    summary: PersonalInfoForm,
    experience: ExperienceForm,
    education: EducationForm,
    skills: SkillsForm,
    projects: ProjectsForm,
    certifications: CertificationsForm,
    languages: LanguagesForm,
    awards: AwardsForm,
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
};

function getSectionSummary(type: string, resume: Resume): string {
    switch (type) {
        case 'personalInfo': {
            const p = resume.personalInfo;
            const parts = [p.fullName, p.jobTitle].filter(Boolean);
            return parts.length > 0 ? parts.join(' — ') : 'Not filled in yet';
        }
        case 'experience': {
            if (resume.experience.length === 0) return 'No entries added';
            const items = resume.experience.slice(0, 3).map(e =>
                e.position && e.company ? `${e.position} at ${e.company}` :
                    e.position || e.company || 'Untitled'
            );
            const more = resume.experience.length > 3 ? ` +${resume.experience.length - 3} more` : '';
            return items.join(' · ') + more;
        }
        case 'education': {
            if (resume.education.length === 0) return 'No entries added';
            const items = resume.education.slice(0, 3).map(e =>
                e.degree && e.institution ? `${e.degree} — ${e.institution}` :
                    e.institution || e.degree || 'Untitled'
            );
            const more = resume.education.length > 3 ? ` +${resume.education.length - 3} more` : '';
            return items.join(' · ') + more;
        }
        case 'skills': {
            if (resume.skills.length === 0) return 'No skills added';
            const names = resume.skills.slice(0, 6).map(s => s.name);
            const more = resume.skills.length > 6 ? ` +${resume.skills.length - 6} more` : '';
            return names.join(', ') + more;
        }
        case 'projects': {
            if (resume.projects.length === 0) return 'No projects added';
            return resume.projects.map(p => p.name || 'Untitled').slice(0, 3).join(' · ');
        }
        case 'certifications': {
            if (resume.certifications.length === 0) return 'No certifications added';
            return resume.certifications.map(c => c.name || 'Untitled').slice(0, 3).join(' · ');
        }
        case 'languages': {
            if (resume.languages.length === 0) return 'No languages added';
            return resume.languages.map(l => `${l.name} (${l.proficiency})`).join(', ');
        }
        case 'awards': {
            if (resume.awards.length === 0) return 'No awards added';
            return resume.awards.map(a => a.title || 'Untitled').slice(0, 3).join(' · ');
        }
        default:
            return '';
    }
}

function getItemCount(type: string, resume: Resume): number | null {
    switch (type) {
        case 'experience': return resume.experience.length;
        case 'education': return resume.education.length;
        case 'skills': return resume.skills.length;
        case 'projects': return resume.projects.length;
        case 'certifications': return resume.certifications.length;
        case 'languages': return resume.languages.length;
        case 'awards': return resume.awards.length;
        default: return null;
    }
}

export default function EditorSidebar() {
    const resume = useResumeStore((s) => s.getActiveResume());
    const updateSectionConfig = useResumeStore((s) => s.updateSectionConfig);
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
                    const summary = getSectionSummary(section.type, resume);
                    const count = getItemCount(section.type, resume);

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
                                {isOpen && <FormComponent />}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
