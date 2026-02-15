'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUploadCloud, FiArrowLeft, FiArrowRight, FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiBook, FiStar, FiGlobe, FiCheckCircle, FiSun, FiMoon, FiFileText } from 'react-icons/fi';
import { extractTextFromPDF, parseResumeText, ParsedResume } from '@/utils/parse-resume';
import { useResumeStore } from '@/stores/resume-store';
import { v4 as uuidv4 } from 'uuid';

export default function ParserContent() {
    const [file, setFile] = useState<File | null>(null);
    const [parsing, setParsing] = useState(false);
    const [parsed, setParsed] = useState<ParsedResume | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const router = useRouter();
    const addResume = useResumeStore((s) => s.addResume);

    // Initialize theme
    useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'dark';
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
    });

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        localStorage.setItem('theme', next);
        document.documentElement.setAttribute('data-theme', next);
    };

    const handleFile = useCallback(async (f: File) => {
        if (!f.type.includes('pdf')) {
            setError('Please upload a PDF file.');
            return;
        }
        setFile(f);
        setError(null);
        setParsing(true);
        setParsed(null);

        try {
            const text = await extractTextFromPDF(f);
            const result = parseResumeText(text);
            setParsed(result);
        } catch (err: any) {
            console.error('Parse error:', err);
            setError('Failed to parse the PDF. Please ensure it contains selectable text (not a scanned image).');
        } finally {
            setParsing(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    }, [handleFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragActive(false);
    }, []);

    const handleAddToTemplate = () => {
        if (!parsed) return;

        const now = new Date().toISOString();

        // Flatten skills from categories for the resume store (which might expect a flat list or we need to update store)
        // Check resume-store types. Usually skills are flat in the store with a 'level' and 'name'.
        // We will map them and maybe add category if the store supports it, or just name.
        // The previous code used: skills: parsed.skills.map(s => ({ ... category: 'General' }))

        const allSkills = parsed.skills.flatMap(group =>
            group.items.map(item => ({
                id: uuidv4(),
                name: item,
                level: 3,
                category: group.category || 'General',
            }))
        );

        const resumeData: any = {
            id: uuidv4(),
            title: parsed.fullName ? `${parsed.fullName}'s Resume` : 'Parsed Resume',
            createdAt: now,
            updatedAt: now,
            personalInfo: {
                fullName: parsed.fullName,
                email: parsed.email,
                phone: parsed.phone,
                location: parsed.location,
                website: parsed.website,
                linkedin: parsed.linkedin,
                github: parsed.github,
                jobTitle: parsed.jobTitle,
                summary: parsed.summary,
                photo: '',
            },
            experience: parsed.experience.map(exp => ({
                id: uuidv4(),
                company: exp.company,
                position: exp.position,
                location: exp.location,
                startDate: exp.startDate,
                endDate: exp.endDate,
                current: exp.endDate.toLowerCase().includes('present') || exp.endDate.toLowerCase().includes('current'),
                description: exp.description,
                highlights: [],
            })),
            education: parsed.education.map(edu => ({
                id: uuidv4(),
                institution: edu.institution,
                degree: edu.degree,
                field: edu.field,
                startDate: edu.startDate,
                endDate: edu.endDate,
                gpa: edu.gpa,
                description: '',
            })),
            skills: allSkills,
            languages: parsed.languages.map(l => ({
                id: uuidv4(),
                name: l,
                proficiency: 'Conversational',
            })),
            certifications: parsed.certifications.map(c => ({
                id: uuidv4(),
                name: c,
                issuer: '',
                date: '',
                url: '',
            })),
            projects: parsed.projects.map(p => ({
                id: uuidv4(),
                name: p.name,
                description: p.description,
                url: '',
                technologies: p.technologies,
            })),
            awards: [],
            customSections: [],
            // Default Layout
            sections: [
                { id: 'sec-1', type: 'personalInfo', title: 'Personal Info', visible: true, order: 0, column: 'left' },
                { id: 'sec-2', type: 'summary', title: 'Professional Summary', visible: true, order: 1, column: 'right' },
                { id: 'sec-3', type: 'experience', title: 'Work Experience', visible: true, order: 2, column: 'right' },
                { id: 'sec-4', type: 'education', title: 'Education', visible: true, order: 3, column: 'left' },
                { id: 'sec-5', type: 'skills', title: 'Skills', visible: true, order: 4, column: 'left' },
                { id: 'sec-6', type: 'projects', title: 'Projects', visible: true, order: 5, column: 'right' },
                { id: 'sec-7', type: 'certifications', title: 'Certifications', visible: true, order: 6, column: 'left' },
                { id: 'sec-8', type: 'languages', title: 'Languages', visible: true, order: 7, column: 'left' },
                { id: 'sec-9', type: 'awards', title: 'Awards', visible: false, order: 8, column: 'left' },
            ],
            settings: {
                template: 'modern',
                font: 'Inter',
                fontSize: 14,
                lineHeight: 1.5,
                colors: { primary: '#2563eb', text: '#1a1a2e', background: '#ffffff', accent: '#3b82f6' },
                sectionSpacing: 16,
                pageMargin: 40,
                usePaging: false,
            },
        };

        addResume(resumeData);
        router.push('/builder');
    };

    const [showRaw, setShowRaw] = useState(false);

    return (
        <div className="manager-page" style={{ minHeight: '100vh' }}>
            {/* Header */}
            <div className="container" style={{ maxWidth: 900, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Link href="/dashboard" className="btn-icon" title="Back to Dashboard">
                            <FiArrowLeft />
                        </Link>
                        <div>
                            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800 }}>
                                Resume Parser
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>
                                Upload a PDF resume to extract and import its content
                            </p>
                        </div>
                    </div>
                    <button className="btn-icon" onClick={toggleTheme} title="Toggle theme">
                        {theme === 'dark' ? <FiSun /> : <FiMoon />}
                    </button>
                </div>

                {/* Upload Area */}
                {!parsed && (
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        style={{
                            border: `2px dashed ${dragActive ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                            borderRadius: 'var(--radius-lg)',
                            padding: '60px 40px',
                            textAlign: 'center',
                            background: dragActive ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-secondary)',
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                        }}
                        onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = '.pdf';
                            input.onchange = (e) => {
                                const f = (e.target as HTMLInputElement).files?.[0];
                                if (f) handleFile(f);
                            };
                            input.click();
                        }}
                    >
                        {parsing ? (
                            <div>
                                <div style={{
                                    width: 48,
                                    height: 48,
                                    border: '3px solid var(--border-color)',
                                    borderTopColor: 'var(--accent-primary)',
                                    borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite',
                                    margin: '0 auto 20px',
                                }} />
                                <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>
                                    Parsing your resume...
                                </p>
                                <p style={{ color: 'var(--text-tertiary)', marginTop: 8 }}>
                                    Extracting text and identifying sections
                                </p>
                            </div>
                        ) : (
                            <div>
                                <FiUploadCloud style={{ fontSize: 56, color: 'var(--accent-primary)', marginBottom: 20 }} />
                                <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                                    Drop your PDF resume here
                                </p>
                                <p style={{ color: 'var(--text-tertiary)', marginBottom: 24 }}>
                                    or click to browse files
                                </p>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '10px 24px',
                                    background: 'var(--accent-primary)',
                                    color: '#fff',
                                    borderRadius: 'var(--radius-md)',
                                    fontWeight: 600,
                                    fontSize: 14,
                                }}>
                                    <FiFileText /> Select PDF File
                                </div>
                                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 16 }}>
                                    Supports PDF files with selectable text. Scanned/image PDFs are not supported.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <div style={{
                        padding: '16px 20px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        color: '#ef4444',
                        marginTop: 16,
                        fontSize: 14,
                    }}>
                        {error}
                    </div>
                )}

                {/* Parsed Results */}
                {parsed && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* Success Banner */}
                        <div style={{
                            padding: '16px 24px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <FiCheckCircle style={{ color: '#10b981', fontSize: 20 }} />
                                <span style={{ fontWeight: 600 }}>Resume parsed successfully from <strong>{file?.name}</strong></span>
                            </div>
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => { setParsed(null); setFile(null); }}
                            >
                                Upload Another
                            </button>
                        </div>

                        {/* Raw Text Toggle (Debug) */}
                        <div style={{ textAlign: 'right' }}>
                            <button
                                onClick={() => setShowRaw(!showRaw)}
                                style={{ fontSize: 12, color: 'var(--text-tertiary)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                {showRaw ? 'Hide Raw Text' : 'Show Extracted Text (Debug)'}
                            </button>
                        </div>

                        {showRaw && (
                            <div style={{
                                padding: 16,
                                background: '#1e1e1e',
                                color: '#eee',
                                borderRadius: 8,
                                fontSize: 12,
                                fontFamily: 'monospace',
                                maxHeight: 300,
                                overflowY: 'auto',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {parsed.rawText}
                            </div>
                        )}

                        {/* Personal Info Card */}
                        <div style={{
                            background: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--border-color)',
                            padding: 24,
                        }}>
                            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <FiUser style={{ color: 'var(--accent-primary)' }} /> Personal Information
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <InfoField icon={<FiUser />} label="Full Name" value={parsed.fullName} />
                                <InfoField icon={<FiBriefcase />} label="Job Title" value={parsed.jobTitle} />
                                <InfoField icon={<FiMail />} label="Email" value={parsed.email} />
                                <InfoField icon={<FiPhone />} label="Phone" value={parsed.phone} />
                                <InfoField icon={<FiMapPin />} label="Location" value={parsed.location} />
                                <InfoField icon={<FiGlobe />} label="Website" value={parsed.website} />
                                <InfoField icon={<FiGlobe />} label="LinkedIn" value={parsed.linkedin} />
                                <InfoField icon={<FiGlobe />} label="GitHub" value={parsed.github} />
                            </div>
                            {parsed.summary && (
                                <div style={{ marginTop: 16 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 6 }}>Summary</div>
                                    <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{parsed.summary}</p>
                                </div>
                            )}
                        </div>

                        {/* Experience */}
                        {parsed.experience.length > 0 && (
                            <div style={{
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--border-color)',
                                padding: 24,
                            }}>
                                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FiBriefcase style={{ color: 'var(--accent-primary)' }} /> Experience ({parsed.experience.length})
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    {parsed.experience.map((exp, i) => (
                                        <div key={i} style={{
                                            padding: 16,
                                            background: 'var(--bg-primary)',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--border-color)',
                                        }}>
                                            <div style={{ fontWeight: 700, fontSize: 15 }}>{exp.position}</div>
                                            <div style={{ fontSize: 13, color: 'var(--accent-primary)', fontWeight: 600 }}>{exp.company}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>
                                                {exp.startDate} — {exp.endDate} {exp.location && `| ${exp.location}`}
                                            </div>
                                            {exp.description && (
                                                <div style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                                                    {exp.description}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Education */}
                        {parsed.education.length > 0 && (
                            <div style={{
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--border-color)',
                                padding: 24,
                            }}>
                                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FiBook style={{ color: 'var(--accent-primary)' }} /> Education ({parsed.education.length})
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {parsed.education.map((edu, i) => (
                                        <div key={i} style={{
                                            padding: 12,
                                            background: 'var(--bg-primary)',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--border-color)',
                                        }}>
                                            <div style={{ fontWeight: 700 }}>{edu.degree || edu.institution}</div>
                                            {edu.institution && <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{edu.institution}</div>}
                                            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                                                {edu.endDate && <span>{edu.startDate ? `${edu.startDate} - ` : ''}{edu.endDate}</span>}
                                                {edu.gpa && <span>GPA: {edu.gpa}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Projects */}
                        {parsed.projects.length > 0 && (
                            <div style={{
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--border-color)',
                                padding: 24,
                            }}>
                                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FiFileText style={{ color: 'var(--accent-primary)' }} /> Projects ({parsed.projects.length})
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {parsed.projects.map((proj, i) => (
                                        <div key={i} style={{
                                            padding: 12,
                                            background: 'var(--bg-primary)',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--border-color)',
                                        }}>
                                            <div style={{ fontWeight: 700 }}>{proj.name}</div>
                                            {proj.technologies && <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>{proj.technologies}</div>}
                                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{proj.description}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Skills */}
                        {parsed.skills.length > 0 && (
                            <div style={{
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--border-color)',
                                padding: 24,
                            }}>
                                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FiStar style={{ color: 'var(--accent-primary)' }} /> Skills
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {parsed.skills.map((group, i) => (
                                        <div key={i}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 8 }}>{group.category}</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                {group.items.map((s, j) => (
                                                    <span key={j} style={{
                                                        padding: '4px 12px',
                                                        background: 'var(--bg-primary)',
                                                        border: '1px solid var(--border-color)',
                                                        borderRadius: 16,
                                                        fontSize: 12,
                                                    }}>
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Languages & Certifications */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            {parsed.languages.length > 0 && (
                                <div style={{
                                    background: 'var(--bg-secondary)',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--border-color)',
                                    padding: 24,
                                }}>
                                    <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Languages</h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {parsed.languages.map((l, i) => (
                                            <span key={i} style={{ fontSize: 14 }}>• {l}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {parsed.certifications.length > 0 && (
                                <div style={{
                                    background: 'var(--bg-secondary)',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--border-color)',
                                    padding: 24,
                                }}>
                                    <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Certifications</h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {parsed.certifications.map((c, i) => (
                                            <span key={i} style={{ fontSize: 14 }}>• {c}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Button */}
                        <div style={{ textAlign: 'center', padding: '20px 0 40px' }}>
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleAddToTemplate}
                                style={{
                                    padding: '14px 40px',
                                    fontSize: 16,
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 10,
                                }}
                            >
                                Add to Template & Edit <FiArrowRight />
                            </button>
                            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 12 }}>
                                Your parsed data will be added to a new resume. You can edit everything in the builder.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function InfoField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--text-tertiary)', fontSize: 16 }}>{icon}</span>
            <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: value ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                    {value || 'Not detected'}
                </div>
            </div>
        </div>
    );
}
