import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    Resume,
    WorkExperience,
    Education,
    Skill,
    Language,
    Project,
    Certification,
    Award,
    CustomSection,
    CustomItem,
    SectionConfig,
    ResumeSettings,
    PersonalInfo,
} from '@/types/resume';
import { createEmptyResume, sampleResume } from '@/utils/sample-data';
import { sanitizeResume } from '@/utils/resume-sanitizer';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface ResumeState {
    resumes: Resume[];
    activeResumeId: string | null;
    undoStack: Resume[];
    redoStack: Resume[];

    // Resume Management
    getActiveResume: () => Resume | null;
    createResume: (title?: string) => string;
    loadSampleResume: () => string;
    duplicateResume: (id: string) => string;
    deleteResume: (id: string) => void;
    setActiveResume: (id: string) => void;
    renameResume: (id: string, title: string) => void;

    // Undo/Redo
    undo: () => void;
    redo: () => void;
    pushUndoState: () => void;

    // Personal Info
    updatePersonalInfo: (info: Partial<PersonalInfo>) => void;

    // Experience
    addExperience: (exp?: Partial<WorkExperience>) => void;
    updateExperience: (id: string, exp: Partial<WorkExperience>) => void;
    removeExperience: (id: string) => void;
    reorderExperience: (startIndex: number, endIndex: number) => void;

    // Education
    addEducation: (edu?: Partial<Education>) => void;
    updateEducation: (id: string, edu: Partial<Education>) => void;
    removeEducation: (id: string) => void;
    reorderEducation: (startIndex: number, endIndex: number) => void;

    // Skills
    addSkill: (skill?: Partial<Skill>) => void;
    updateSkill: (id: string, skill: Partial<Skill>) => void;
    removeSkill: (id: string) => void;

    // Languages
    addLanguage: (lang?: Partial<Language>) => void;
    updateLanguage: (id: string, lang: Partial<Language>) => void;
    removeLanguage: (id: string) => void;

    // Projects
    addProject: (proj?: Partial<Project>) => void;
    updateProject: (id: string, proj: Partial<Project>) => void;
    removeProject: (id: string) => void;

    // Certifications
    addCertification: (cert?: Partial<Certification>) => void;
    updateCertification: (id: string, cert: Partial<Certification>) => void;
    removeCertification: (id: string) => void;

    // Awards
    addAward: (award?: Partial<Award>) => void;
    updateAward: (id: string, award: Partial<Award>) => void;
    removeAward: (id: string) => void;

    // Custom Sections
    addCustomSection: (title?: string) => void;
    updateCustomSection: (id: string, data: Partial<CustomSection>) => void;
    removeCustomSection: (id: string) => void;
    addCustomItem: (sectionId: string) => void;
    updateCustomItem: (sectionId: string, itemId: string, data: Partial<CustomItem>) => void;
    removeCustomItem: (sectionId: string, itemId: string) => void;

    // Section Management
    updateSectionConfig: (id: string, config: Partial<SectionConfig>) => void;
    reorderSections: (startIndex: number, endIndex: number) => void;

    // Settings
    updateSettings: (settings: Partial<ResumeSettings>) => void;

    // Import/Export
    exportResume: (id: string) => string;
    importResume: (json: string) => string | null;
    addResume: (resume: Resume) => string;

    // Cloud Sync
    syncToCloud: (id: string) => Promise<string | null>;
    loadFromCloud: (id: string) => Promise<string | null>;
}

function updateActiveResume(
    state: ResumeState,
    updater: (resume: Resume) => Partial<Resume>
): Partial<ResumeState> {
    if (!state.activeResumeId) return {};
    return {
        resumes: state.resumes.map((r) =>
            r.id === state.activeResumeId
                ? { ...r, ...updater(r), updatedAt: new Date().toISOString() }
                : r
        ),
    };
}

function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
}

export const useResumeStore = create<ResumeState>()(
    persist(
        (set, get) => ({
            resumes: [],
            activeResumeId: null,
            undoStack: [],
            redoStack: [],

            getActiveResume: () => {
                const state = get();
                return state.resumes.find((r) => r.id === state.activeResumeId) || null;
            },

            createResume: (title) => {
                const resume = createEmptyResume(title);
                set((state) => ({
                    resumes: [...state.resumes, resume],
                    activeResumeId: resume.id,
                }));
                return resume.id;
            },

            loadSampleResume: () => {
                const resume = { ...sampleResume, id: uuidv4() };
                set((state) => ({
                    resumes: [...state.resumes, resume],
                    activeResumeId: resume.id,
                }));
                return resume.id;
            },

            duplicateResume: (id) => {
                const state = get();
                const original = state.resumes.find((r) => r.id === id);
                if (!original) return '';
                const copy: Resume = {
                    ...JSON.parse(JSON.stringify(original)),
                    id: uuidv4(),
                    title: original.title ? `${original.title} (Copy)` : 'Untitled Resume (Copy)',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                set((s) => ({
                    resumes: [...s.resumes, copy],
                    activeResumeId: copy.id,
                }));
                return copy.id;
            },

            deleteResume: (id) => {
                set((state) => {
                    const filtered = state.resumes.filter((r) => r.id !== id);
                    return {
                        resumes: filtered,
                        activeResumeId:
                            state.activeResumeId === id
                                ? filtered.length > 0
                                    ? filtered[0].id
                                    : null
                                : state.activeResumeId,
                    };
                });
            },

            setActiveResume: (id) => set({ activeResumeId: id }),

            renameResume: (id, title) => {
                set((state) => ({
                    resumes: state.resumes.map((r) =>
                        r.id === id ? { ...r, title, updatedAt: new Date().toISOString() } : r
                    ),
                }));
            },

            // Undo/Redo
            pushUndoState: () => {
                const state = get();
                const active = state.resumes.find((r) => r.id === state.activeResumeId);
                if (active) {
                    set({
                        undoStack: [...state.undoStack.slice(-19), JSON.parse(JSON.stringify(active))],
                        redoStack: [],
                    });
                }
            },

            undo: () => {
                const state = get();
                if (state.undoStack.length === 0 || !state.activeResumeId) return;
                const previous = state.undoStack[state.undoStack.length - 1];
                const current = state.resumes.find((r) => r.id === state.activeResumeId);
                set({
                    undoStack: state.undoStack.slice(0, -1),
                    redoStack: current ? [...state.redoStack, JSON.parse(JSON.stringify(current))] : state.redoStack,
                    resumes: state.resumes.map((r) =>
                        r.id === state.activeResumeId ? { ...previous, id: state.activeResumeId } : r
                    ),
                });
            },

            redo: () => {
                const state = get();
                if (state.redoStack.length === 0 || !state.activeResumeId) return;
                const next = state.redoStack[state.redoStack.length - 1];
                const current = state.resumes.find((r) => r.id === state.activeResumeId);
                set({
                    redoStack: state.redoStack.slice(0, -1),
                    undoStack: current ? [...state.undoStack, JSON.parse(JSON.stringify(current))] : state.undoStack,
                    resumes: state.resumes.map((r) =>
                        r.id === state.activeResumeId ? { ...next, id: state.activeResumeId } : r
                    ),
                });
            },

            // Personal Info
            updatePersonalInfo: (info) => {
                set((state) => updateActiveResume(state, (r) => ({
                    personalInfo: { ...r.personalInfo, ...info },
                })));
            },

            // Experience
            addExperience: (exp) => {
                const newExp: WorkExperience = {
                    id: uuidv4(),
                    company: '',
                    position: '',
                    location: '',
                    startDate: '',
                    endDate: '',
                    current: false,
                    description: '',
                    highlights: [],
                    ...exp,
                };
                set((state) => updateActiveResume(state, (r) => ({
                    experience: [...r.experience, newExp],
                })));
            },

            updateExperience: (id, exp) => {
                set((state) => updateActiveResume(state, (r) => ({
                    experience: r.experience.map((e) => (e.id === id ? { ...e, ...exp } : e)),
                })));
            },

            removeExperience: (id) => {
                set((state) => updateActiveResume(state, (r) => ({
                    experience: r.experience.filter((e) => e.id !== id),
                })));
            },

            reorderExperience: (startIndex, endIndex) => {
                set((state) => updateActiveResume(state, (r) => ({
                    experience: reorder(r.experience, startIndex, endIndex),
                })));
            },

            // Education
            addEducation: (edu) => {
                const newEdu: Education = {
                    id: uuidv4(),
                    institution: '',
                    degree: '',
                    field: '',
                    location: '',
                    startDate: '',
                    endDate: '',
                    gpa: '',
                    description: '',
                    ...edu,
                };
                set((state) => updateActiveResume(state, (r) => ({
                    education: [...r.education, newEdu],
                })));
            },

            updateEducation: (id, edu) => {
                set((state) => updateActiveResume(state, (r) => ({
                    education: r.education.map((e) => (e.id === id ? { ...e, ...edu } : e)),
                })));
            },

            removeEducation: (id) => {
                set((state) => updateActiveResume(state, (r) => ({
                    education: r.education.filter((e) => e.id !== id),
                })));
            },

            reorderEducation: (startIndex, endIndex) => {
                set((state) => updateActiveResume(state, (r) => ({
                    education: reorder(r.education, startIndex, endIndex),
                })));
            },

            // Skills
            addSkill: (skill) => {
                const newSkill: Skill = {
                    id: uuidv4(),
                    name: '',
                    level: 3,
                    category: 'General',
                    ...skill,
                };
                set((state) => updateActiveResume(state, (r) => ({
                    skills: [...r.skills, newSkill],
                })));
            },

            updateSkill: (id, skill) => {
                set((state) => updateActiveResume(state, (r) => ({
                    skills: r.skills.map((s) => (s.id === id ? { ...s, ...skill } : s)),
                })));
            },

            removeSkill: (id) => {
                set((state) => updateActiveResume(state, (r) => ({
                    skills: r.skills.filter((s) => s.id !== id),
                })));
            },

            // Languages
            addLanguage: (lang) => {
                const newLang: Language = {
                    id: uuidv4(),
                    name: '',
                    proficiency: 'intermediate',
                    ...lang,
                };
                set((state) => updateActiveResume(state, (r) => ({
                    languages: [...r.languages, newLang],
                })));
            },

            updateLanguage: (id, lang) => {
                set((state) => updateActiveResume(state, (r) => ({
                    languages: r.languages.map((l) => (l.id === id ? { ...l, ...lang } : l)),
                })));
            },

            removeLanguage: (id) => {
                set((state) => updateActiveResume(state, (r) => ({
                    languages: r.languages.filter((l) => l.id !== id),
                })));
            },

            // Projects
            addProject: (proj) => {
                const newProj: Project = {
                    id: uuidv4(),
                    name: '',
                    description: '',
                    technologies: [],
                    liveUrl: '',
                    repoUrl: '',
                    startDate: '',
                    endDate: '',
                    ...proj,
                };
                set((state) => updateActiveResume(state, (r) => ({
                    projects: [...r.projects, newProj],
                })));
            },

            updateProject: (id, proj) => {
                set((state) => updateActiveResume(state, (r) => ({
                    projects: r.projects.map((p) => (p.id === id ? { ...p, ...proj } : p)),
                })));
            },

            removeProject: (id) => {
                set((state) => updateActiveResume(state, (r) => ({
                    projects: r.projects.filter((p) => p.id !== id),
                })));
            },

            // Certifications
            addCertification: (cert) => {
                const newCert: Certification = {
                    id: uuidv4(),
                    name: '',
                    issuer: '',
                    date: '',
                    expiryDate: '',
                    credentialId: '',
                    url: '',
                    ...cert,
                };
                set((state) => updateActiveResume(state, (r) => ({
                    certifications: [...r.certifications, newCert],
                })));
            },

            updateCertification: (id, cert) => {
                set((state) => updateActiveResume(state, (r) => ({
                    certifications: r.certifications.map((c) => (c.id === id ? { ...c, ...cert } : c)),
                })));
            },

            removeCertification: (id) => {
                set((state) => updateActiveResume(state, (r) => ({
                    certifications: r.certifications.filter((c) => c.id !== id),
                })));
            },

            // Awards
            addAward: (award) => {
                const newAward: Award = {
                    id: uuidv4(),
                    title: '',
                    issuer: '',
                    date: '',
                    description: '',
                    ...award,
                };
                set((state) => updateActiveResume(state, (r) => ({
                    awards: [...r.awards, newAward],
                })));
            },

            updateAward: (id, award) => {
                set((state) => updateActiveResume(state, (r) => ({
                    awards: r.awards.map((a) => (a.id === id ? { ...a, ...award } : a)),
                })));
            },

            removeAward: (id) => {
                set((state) => updateActiveResume(state, (r) => ({
                    awards: r.awards.filter((a) => a.id !== id),
                })));
            },

            // Custom Sections
            addCustomSection: (title) => {
                const section: CustomSection = {
                    id: uuidv4(),
                    title: title || 'Custom Section',
                    items: [],
                };
                set((state) => {
                    const updated = updateActiveResume(state, (r) => ({
                        customSections: [...r.customSections, section],
                        sections: [
                            ...r.sections,
                            {
                                id: `sec-custom-${section.id}`,
                                type: 'custom' as const,
                                title: section.title,
                                visible: true,
                                order: r.sections.length,
                                customSectionId: section.id,
                            },
                        ],
                    }));
                    return updated;
                });
            },

            updateCustomSection: (id, data) => {
                set((state) => updateActiveResume(state, (r) => ({
                    customSections: r.customSections.map((s) => (s.id === id ? { ...s, ...data } : s)),
                })));
            },

            removeCustomSection: (id) => {
                set((state) => updateActiveResume(state, (r) => ({
                    customSections: r.customSections.filter((s) => s.id !== id),
                    sections: r.sections.filter((s) => s.customSectionId !== id),
                })));
            },

            addCustomItem: (sectionId) => {
                const item: CustomItem = {
                    id: uuidv4(),
                    title: '',
                    subtitle: '',
                    date: '',
                    description: '',
                };
                set((state) => updateActiveResume(state, (r) => ({
                    customSections: r.customSections.map((s) =>
                        s.id === sectionId ? { ...s, items: [...s.items, item] } : s
                    ),
                })));
            },

            updateCustomItem: (sectionId, itemId, data) => {
                set((state) => updateActiveResume(state, (r) => ({
                    customSections: r.customSections.map((s) =>
                        s.id === sectionId
                            ? { ...s, items: s.items.map((i) => (i.id === itemId ? { ...i, ...data } : i)) }
                            : s
                    ),
                })));
            },

            removeCustomItem: (sectionId, itemId) => {
                set((state) => updateActiveResume(state, (r) => ({
                    customSections: r.customSections.map((s) =>
                        s.id === sectionId
                            ? { ...s, items: s.items.filter((i) => i.id !== itemId) }
                            : s
                    ),
                })));
            },

            // Section Management
            updateSectionConfig: (id, config) => {
                set((state) => updateActiveResume(state, (r) => ({
                    sections: r.sections.map((s) => (s.id === id ? { ...s, ...config } : s)),
                })));
            },

            reorderSections: (startIndex, endIndex) => {
                set((state) => updateActiveResume(state, (r) => {
                    const reordered = reorder(r.sections, startIndex, endIndex);
                    return {
                        sections: reordered.map((s, i) => ({ ...s, order: i })),
                    };
                }));
            },

            // Settings
            updateSettings: (settings) => {
                set((state) => updateActiveResume(state, (r) => ({
                    settings: {
                        ...r.settings,
                        ...settings,
                        colors: settings.colors
                            ? { ...r.settings.colors, ...settings.colors }
                            : r.settings.colors,
                    },
                })));
            },

            // Import/Export
            exportResume: (id) => {
                const state = get();
                const resume = state.resumes.find((r) => r.id === id);
                return resume ? JSON.stringify(resume, null, 2) : '';
            },

            addResume: (resume: Resume) => {
                set((state) => ({
                    resumes: [...state.resumes, resume],
                    activeResumeId: resume.id,
                }));
                return resume.id;
            },

            importResume: (json) => {
                try {
                    const rawResume = JSON.parse(json);
                    const resume = sanitizeResume(rawResume);
                    resume.id = uuidv4();
                    resume.title = `${resume.title || 'Imported'} (Imported)`;
                    resume.createdAt = new Date().toISOString(),
                        resume.updatedAt = new Date().toISOString(),
                        set((state) => ({
                            resumes: [...state.resumes, resume],
                            activeResumeId: resume.id,
                        }));
                    return resume.id;
                } catch {
                    return null;
                }
            },

            // Cloud Sync
            syncToCloud: async (id: string) => {
                const state = get();
                const resume = state.resumes.find((r) => r.id === id);
                if (!resume) return null;

                try {
                    const docRef = doc(db, 'resumes', id);
                    await setDoc(docRef, {
                        ...resume,
                        updatedAt: new Date().toISOString()
                    });
                    return id;
                } catch (error) {
                    console.error('Error syncing to cloud:', error);
                    return null;
                }
            },

            loadFromCloud: async (id: string) => {
                try {
                    const docRef = doc(db, 'resumes', id);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const cloudResume = docSnap.data() as Resume;
                        const sanitized = sanitizeResume(cloudResume);

                        // Check if we already have this resume (by ID)
                        const state = get();
                        const exists = state.resumes.find(r => r.id === id);

                        if (exists) {
                            set((s) => ({
                                activeResumeId: id,
                                resumes: s.resumes.map(r => r.id === id ? sanitized : r)
                            }));
                        } else {
                            set((s) => ({
                                resumes: [...s.resumes, sanitized],
                                activeResumeId: id,
                            }));
                        }
                        return id;
                    }
                    return null;
                } catch (error) {
                    console.error('Error loading from cloud:', error);
                    return null;
                }
            },
        }),
        {
            name: 'cv-creator-storage',
            partialize: (state) => ({
                resumes: state.resumes,
                activeResumeId: state.activeResumeId,
            }),
        }
    )
);
