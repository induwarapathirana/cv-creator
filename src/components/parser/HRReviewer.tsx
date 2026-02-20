'use client';

import { useState, useCallback, useRef } from 'react';
import { HRAnalysisResult } from '@/types/resume';
import { FiCpu, FiFileText, FiLink, FiImage, FiCheckCircle, FiAlertCircle, FiTrendingUp, FiCheck, FiX, FiArrowRight, FiLoader, FiTarget, FiStar, FiZap, FiUploadCloud } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { extractTextFromPDF } from '@/utils/parse-resume';

export default function HRReviewer() {
    const [activeTab, setActiveTab] = useState<'text' | 'url' | 'image'>('text');

    // Inputs
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [resumeText, setResumeText] = useState<string>('');
    const [jobDescription, setJobDescription] = useState('');
    const [jdUrl, setJdUrl] = useState('');
    const [jdImage, setJdImage] = useState<string | null>(null);

    const resumeInputRef = useRef<HTMLInputElement>(null);
    const jdImageInputRef = useRef<HTMLInputElement>(null);

    // State
    const [analyzing, setAnalyzing] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [result, setResult] = useState<HRAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setResumeFile(file);
        setExtracting(true);
        setError(null);
        setResumeText(''); // Clear previous text

        try {
            if (file.type === 'application/pdf') {
                const text = await extractTextFromPDF(file);
                setResumeText(text);
            } else if (file.type.startsWith('image/')) {
                // For images, we'll send the image itself to Gemini for processing
                // But for the sake of the analysis call, we'll indicate it's an image
                const reader = new FileReader();
                reader.onloadend = () => {
                    setResumeText(`RESUME_IMAGE_DATA:${reader.result as string}`);
                };
                reader.readAsDataURL(file);
            } else {
                throw new Error('Please upload a PDF or Image file.');
            }
        } catch (err: any) {
            setError('Failed to extract text from resume. Please try a different file.');
            console.error(err);
        } finally {
            setExtracting(false);
        }
    };

    const handleJDImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setJdImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const runAnalysis = async () => {
        if (!resumeText) {
            setError('Please upload your resume first.');
            return;
        }

        setAnalyzing(true);
        setError(null);
        setResult(null);

        // Prepare resume data for the API
        let finalResumeText = resumeText;
        let resumeImage = null;

        if (resumeText.startsWith('RESUME_IMAGE_DATA:')) {
            resumeImage = resumeText.split('RESUME_IMAGE_DATA:')[1];
            finalResumeText = 'IMAGE_UPLOADED'; // Placeholder for text if image is sent
        }

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeText: finalResumeText,
                    resumeImage, // Backend needs to be updated to handle resumeImage if we want to support resume OCR via AI
                    jobDescription: activeTab === 'text' ? jobDescription : '',
                    jdUrl: activeTab === 'url' ? jdUrl : '',
                    jdImage: activeTab === 'image' ? jdImage : null,
                }),
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error);
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Something went wrong during analysis.');
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="hr-reviewer">
            <div className="reviewer-grid">
                {/* Left Panel: Configuration */}
                <div className="side-panel">
                    <section className="card-glass p-6">
                        <h2 className="section-title-small">
                            <FiUploadCloud className="icon-accent" /> 1. Upload Your Resume
                        </h2>

                        <div
                            onClick={() => resumeInputRef.current?.click()}
                            className={`image-upload-zone ${resumeFile ? 'has-image' : ''}`}
                        >
                            {extracting ? (
                                <div className="upload-placeholder">
                                    <FiLoader className="placeholder-icon spin" />
                                    <p className="font-semibold">Extracting text...</p>
                                </div>
                            ) : resumeFile ? (
                                <div className="upload-placeholder">
                                    <FiCheckCircle className="placeholder-icon text-green" />
                                    <p className="font-semibold">{resumeFile.name}</p>
                                    <p className="helper-text">Click to change</p>
                                </div>
                            ) : (
                                <div className="upload-placeholder">
                                    <FiFileText className="placeholder-icon" />
                                    <p className="font-semibold">Drop your resume here</p>
                                    <p className="helper-text">PDF or Image (JPG/PNG)</p>
                                </div>
                            )}
                        </div>
                        <input type="file" ref={resumeInputRef} onChange={handleResumeUpload} accept=".pdf,image/*" className="hidden" />
                    </section>

                    <section className="card-glass p-6 mt-6">
                        <h2 className="section-title-small">
                            <FiTarget className="icon-accent" /> 2. Job details
                        </h2>

                        {/* Tabs */}
                        <div className="tabs-strip">
                            {(['text', 'url', 'image'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                                >
                                    {tab === 'text' && <FiFileText />}
                                    {tab === 'url' && <FiLink />}
                                    {tab === 'image' && <FiImage />}
                                    <span className="capitalize">{tab}</span>
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="tab-viewport">
                            <AnimatePresence mode="wait">
                                {activeTab === 'text' && (
                                    <motion.div
                                        key="text"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                    >
                                        <label className="input-label">Paste Job Description</label>
                                        <textarea
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                            placeholder="Paste the full job requirements here..."
                                            className="textarea"
                                            style={{ height: '200px' }}
                                        />
                                    </motion.div>
                                )}

                                {activeTab === 'url' && (
                                    <motion.div
                                        key="url"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                    >
                                        <label className="input-label">Job Post Link</label>
                                        <input
                                            type="url"
                                            value={jdUrl}
                                            onChange={(e) => setJdUrl(e.target.value)}
                                            placeholder="https://linkedin.com/jobs/view/..."
                                            className="input"
                                        />
                                        <p className="helper-text">Works best with public job postings.</p>
                                    </motion.div>
                                )}

                                {activeTab === 'image' && (
                                    <motion.div
                                        key="image"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                    >
                                        <div
                                            onClick={() => jdImageInputRef.current?.click()}
                                            className={`image-upload-zone ${jdImage ? 'has-image' : ''}`}
                                        >
                                            {jdImage ? (
                                                <div className="image-preview-container">
                                                    <img src={jdImage} alt="JD Preview" className="preview-img" />
                                                    <div className="overlay">Change Image</div>
                                                </div>
                                            ) : (
                                                <div className="upload-placeholder">
                                                    <FiImage className="placeholder-icon" />
                                                    <p className="font-semibold">Upload Image</p>
                                                    <p className="helper-text">Screenshot of job details</p>
                                                </div>
                                            )}
                                        </div>
                                        <input type="file" ref={jdImageInputRef} onChange={handleJDImageUpload} accept="image/*" className="hidden" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            onClick={runAnalysis}
                            disabled={analyzing || extracting || !resumeText || (activeTab === 'text' && !jobDescription) || (activeTab === 'url' && !jdUrl) || (activeTab === 'image' && !jdImage)}
                            className="btn btn-primary btn-lg w-full mt-8"
                        >
                            {analyzing ? (
                                <><FiLoader className="spin" /> Analyzing...</>
                            ) : (
                                <><FiZap /> Analyze Match</>
                            )}
                        </button>

                        {error && <div className="info-badge error mt-4">{error}</div>}
                    </section>
                </div>

                {/* Right Panel: Results */}
                <div className="main-panel">
                    <AnimatePresence mode="wait">
                        {!result && !analyzing && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
                                <div className="empty-icon"><FiCpu /></div>
                                <h3>Ready for Analysis</h3>
                                <p>Upload your resume and provide a job description to get AI feedback.</p>
                            </motion.div>
                        )}

                        {analyzing && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="loading-state">
                                <div className="loader-ring">
                                    <div className="loader-core"><FiCpu /></div>
                                </div>
                                <h3>AI HR Agent is Reviewing...</h3>
                                <div className="progress-bar">
                                    <motion.div className="progress-fill" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 15, ease: "linear" }} />
                                </div>
                            </motion.div>
                        )}

                        {result && (
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="results-view">
                                {/* Score Dashboard */}
                                <div className="score-card">
                                    <div className="score-gauge">
                                        <svg viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--bg-primary)" strokeWidth="8" />
                                            <motion.circle
                                                cx="50" cy="50" r="45" fill="none"
                                                stroke={getScoreColor(result.score)}
                                                strokeWidth="8"
                                                strokeDasharray="283"
                                                initial={{ strokeDashoffset: 283 }}
                                                animate={{ strokeDashoffset: 283 - (283 * result.score) / 100 }}
                                                transition={{ duration: 1.5 }}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="score-text">
                                            <span className="number">{result.score}%</span>
                                            <span className="label">Match</span>
                                        </div>
                                    </div>

                                    <div className="score-summary">
                                        <div className="match-badge" style={{ backgroundColor: getScoreColor(result.score) }}>
                                            {result.matchLevel} Match
                                        </div>
                                        <p className="summary-text">"{result.summary}"</p>
                                    </div>
                                </div>

                                <div className="details-grid">
                                    <div className="card-glass p-6 border-l-green">
                                        <h4><FiCheckCircle /> Key Strengths</h4>
                                        <ul className="list green">
                                            {result.pros.map((pro, i) => <li key={i}>{pro}</li>)}
                                        </ul>
                                    </div>

                                    <div className="card-glass p-6 border-l-ruby">
                                        <h4><FiAlertCircle /> Gaps</h4>
                                        <ul className="list ruby">
                                            {result.cons.map((con, i) => <li key={i}>{con}</li>)}
                                        </ul>
                                    </div>
                                </div>

                                <div className="card-glass p-6">
                                    <h4><FiStar /> Missing Critical Skills</h4>
                                    <div className="skills-tags">
                                        {result.missingSkills.map((skill, i) => <span key={i} className="skill-tag">{skill}</span>)}
                                    </div>
                                </div>

                                <div className="card-glass p-6 improvement-section">
                                    <h4><FiTrendingUp /> Actionable Improvements</h4>
                                    <div className="steps-list">
                                        {result.improvementSuggestions.map((tip, i) => (
                                            <div key={i} className="step-item">
                                                <div className="step-num">{i + 1}</div>
                                                <p>{tip}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button onClick={() => { setResult(null); setResumeFile(null); setResumeText(''); setJobDescription(''); setJdUrl(''); setJdImage(null); }} className="btn btn-secondary w-full mt-4">
                                    New Analysis <FiArrowRight />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <style jsx>{`
                .reviewer-grid { display: grid; grid-template-columns: 1fr; gap: 32px; }
                @media (min-width: 1024px) { .reviewer-grid { grid-template-columns: 1fr 1.5fr; } }
                
                .section-title-small { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; margin-bottom: 24px; }
                .icon-accent { color: var(--accent-primary); }
                
                .tabs-strip { display: flex; background: var(--bg-primary); padding: 4px; border-radius: 8px; margin-bottom: 24px; }
                .tab-btn { 
                    flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; 
                    padding: 8px; border-radius: 6px; font-size: 13px; font-weight: 600; 
                    color: var(--text-tertiary); background: none; border: none; cursor: pointer; transition: all 0.2s;
                }
                .tab-btn.active { background: var(--accent-primary); color: white; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
                
                .input-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-tertiary); margin-bottom: 8px; display: block; }
                .helper-text { font-size: 10px; color: var(--text-tertiary); margin-top: 8px; font-style: italic; }
                
                .image-upload-zone { 
                    border: 2px dashed var(--border-color); border-radius: 16px; padding: 32px; 
                    text-align: center; cursor: pointer; transition: all 0.2s;
                }
                .image-upload-zone:hover { border-color: var(--text-tertiary); }
                .image-upload-zone.has-image { border-color: var(--accent-primary); background: rgba(99, 102, 241, 0.05); }
                .image-preview-container { position: relative; }
                .preview-img { max-height: 200px; margin: 0 auto; border-radius: 8px; box-shadow: var(--shadow-md); }
                .image-preview-container .overlay { 
                    position: absolute; inset: 0; background: rgba(0,0,0,0.5); opacity: 0; 
                    display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 700;
                    border-radius: 8px; transition: 0.2s;
                }
                .image-preview-container:hover .overlay { opacity: 1; }
                .upload-placeholder {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                }
                .placeholder-icon { font-size: 32px; color: var(--text-tertiary); margin-bottom: 12px; }
                .text-green { color: #10b981; }
                
                .empty-state, .loading-state { 
                    height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; 
                    padding: 48px; text-align: center; background: var(--bg-secondary); border-radius: 24px; border: 1px solid var(--border-color);
                }
                .empty-icon { font-size: 48px; color: var(--text-tertiary); margin-bottom: 24px; }
                .loading-state h3 { font-size: 24px; font-weight: 700; margin-bottom: 16px; }
                .loading-state p { font-size: 12px; color: var(--text-tertiary); animation: bounce 1s infinite; }
                
                .loader-ring { position: relative; width: 120px; height: 120px; border: 4px solid var(--accent-primary-20); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 32px; animation: ping 2s infinite; }
                .loader-core { width: 80px; height: 80px; background: var(--accent-primary-10); border: 4px solid var(--accent-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; color: var(--accent-primary); animation: pulse 2s infinite; }
                .progress-bar { width: 100%; max-width: 200px; height: 4px; background: var(--bg-primary); border-radius: 2px; margin-top: 16px; overflow: hidden; }
                .progress-fill { height: 100%; background: var(--accent-primary); }
                
                .score-card { display: flex; flex-direction: column; align-items: center; gap: 32px; padding: 32px; background: var(--bg-secondary); border-radius: 24px; border: 1px solid var(--border-color); margin-bottom: 24px; }
                @media (min-width: 768px) { .score-card { flex-direction: row; } }
                .score-gauge { position: relative; width: 140px; height: 140px; flex-shrink: 0; }
                .score-text { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
                .score-text .number { font-size: 36px; font-weight: 900; }
                .score-text .label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-tertiary); }
                
                .score-summary { flex: 1; }
                .match-badge { display: inline-block; padding: 6px 16px; border-radius: 99px; color: white; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; box-shadow: var(--shadow-lg); }
                .summary-text { font-size: 18px; font-weight: 600; line-height: 1.6; }
                
                .details-grid { display: grid; grid-template-columns: 1fr; gap: 24px; margin-bottom: 24px; }
                @media (min-width: 768px) { .details-grid { grid-template-columns: 1fr 1fr; } }
                .details-grid h4 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
                .border-l-green { border-left: 4px solid #10b981; }
                .border-l-ruby { border-left: 4px solid #ef4444; }
                .details-grid h4 .FiCheckCircle { color: #10b981; }
                .details-grid h4 .FiAlertCircle { color: #ef4444; }
                
                .list { list-style: none; display: flex; flex-direction: column; gap: 12px; padding-left: 0; }
                .list li { font-size: 14px; position: relative; padding-left: 24px; display: flex; align-items: flex-start; }
                .list.green li::before { content: '✓'; position: absolute; left: 0; font-weight: bold; color: #10b981; font-size: 16px; line-height: 1; }
                .list.ruby li::before { content: '✕'; position: absolute; left: 0; font-weight: bold; color: #ef4444; font-size: 16px; line-height: 1; }
                
                .skills-tags { display: flex; flex-wrap: wrap; gap: 8px; }
                .skill-tag { padding: 6px 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; font-size: 12px; font-weight: 500; }
                
                .improvement-section { background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%); }
                .improvement-section h4 { color: #f59e0b; }
                .steps-list { display: flex; flex-direction: column; gap: 16px; }
                .step-item { display: flex; gap: 16px; padding: 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 12px; }
                .step-num { width: 24px; height: 24px; background: rgba(245, 158, 11, 0.1); color: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; flex-shrink: 0; }
                .step-item p { font-size: 14px; font-weight: 500; line-height: 1.5; }
                
                .info-badge { padding: 12px; border-radius: 8px; font-size: 12px; display: flex; align-items: flex-start; gap: 12px; }
                .info-badge.warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
                .info-badge.error { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
                
                .hidden { display: none; }
                .spin { animation: spin 1s linear infinite; }
                
                /* Utility classes */
                .card-glass {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-xl);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
                .textarea, .input {
                    width: 100%;
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-xl);
                    padding: 16px;
                    font-size: 14px;
                    color: var(--text-primary);
                    outline: none;
                    transition: border-color 0.2s;
                    resize: vertical;
                }
                .textarea:focus, .input:focus {
                    border-color: var(--accent-primary);
                }
                .textarea { resize: vertical; }
                
                .btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-weight: 700;
                    transition: all 0.2s;
                    cursor: pointer;
                    border-radius: var(--radius-xl);
                    padding: 12px 24px;
                    font-size: 16px;
                }
                .btn-primary {
                    background: var(--accent-primary);
                    color: white;
                    border: 1px solid var(--accent-primary);
                    box-shadow: var(--shadow-lg);
                }
                .btn-primary:hover {
                    background: var(--accent-dark);
                    border-color: var(--accent-dark);
                }
                .btn-primary:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .btn-secondary {
                    background: transparent;
                    color: var(--text-primary);
                    border: 1px solid var(--border-color);
                }
                .btn-secondary:hover {
                    background: var(--bg-secondary);
                }
                .btn-lg {
                    padding: 16px 24px;
                    font-size: 18px;
                }
                
                /* Keyframes */
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes ping {
                    0% { transform: scale(0.9); opacity: 0.8; }
                    50% { transform: scale(1.0); opacity: 1; }
                    100% { transform: scale(0.9); opacity: 0.8; }
                }
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
                    50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
                }

                .hr-reviewer {
                    animation: fadeIn 0.5s ease-out;
                }
            `}</style>
        </div>
    );
}

function getScoreColor(score: number): string {
    if (score >= 80) return '#10b981'; // green-500
    if (score >= 60) return '#f59e0b'; // amber-500
    if (score >= 40) return '#ef4444'; // red-500
    return '#6b7280'; // gray-500
}
