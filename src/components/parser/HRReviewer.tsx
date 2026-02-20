'use client';

import { useState, useCallback, useRef } from 'react';
import { HRAnalysisResult } from '@/types/resume';
import { FiCpu, FiFileText, FiLink, FiImage, FiCheckCircle, FiAlertCircle, FiTrendingUp, FiCheck, FiX, FiArrowRight, FiLoader, FiTarget, FiStar, FiZap, FiUploadCloud, FiServer } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { extractTextFromPDF, parseResumeText, extractTextFromImage } from '@/utils/parse-resume';
import { analyzeResume } from '@/utils/ats-analyzer';

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
    const [quotaExceeded, setQuotaExceeded] = useState(false);

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setResumeFile(file);
        setExtracting(true);
        setError(null);
        setResumeText(''); // Clear previous text
        setQuotaExceeded(false);

        try {
            if (file.type === 'application/pdf') {
                const text = await extractTextFromPDF(file);
                setResumeText(text);
            } else if (file.type.startsWith('image/')) {
                const text = await extractTextFromImage(file);
                setResumeText(text);
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
        setQuotaExceeded(false);

        try {
            let finalJobDescription = jobDescription;

            // OCR for JD Image if active
            if (activeTab === 'image' && jdImage) {
                // Convert base64 to Blob/File for extractTextFromImage
                const response = await fetch(jdImage);
                const blob = await response.blob();
                const file = new File([blob], "jd_image.png", { type: blob.type });

                const extractedJD = await extractTextFromImage(file);
                finalJobDescription = extractedJD;
            }

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeText: resumeText,
                    jobDescription: activeTab === 'text' ? finalJobDescription : (activeTab === 'image' ? finalJobDescription : ''),
                    jdUrl: activeTab === 'url' ? jdUrl : '',
                    jdImage: activeTab === 'image' ? (finalJobDescription ? '' : jdImage) : null, // Send image only if OCR fails or as fallback
                }),
            });

            if (response.status === 429) {
                setQuotaExceeded(true);
                throw new Error('AI Quota exceeded. Please use Local Analysis fallback.');
            }

            const data = await response.json();

            if (data.error) throw new Error(data.error);
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Something went wrong during analysis.');
        } finally {
            setAnalyzing(false);
        }
    };

    const runLocalAnalysis = () => {
        if (!resumeText) return;

        setAnalyzing(true);
        setError(null);
        setQuotaExceeded(false);

        try {
            // 1. Prepare Resume Data (Parse text if it's from PDF/Text)
            const cleanText = resumeText.startsWith('RESUME_IMAGE_DATA:') ? 'Image-based resume (Text not extracted)' : resumeText;
            const parsedResume = parseResumeText(cleanText);

            // 2. Run Local ATS Analyzer
            const finalJD = activeTab === 'text' ? jobDescription : (activeTab === 'url' ? jdUrl : 'Image-based JD');
            const atsResult = analyzeResume({
                ...parsedResume,
                id: 'local',
                updatedAt: new Date().toISOString(),
                settings: { template: 'ats', layout: 'standard' }
            } as any, finalJD);

            // 3. Map to HRAnalysisResult
            const mappedResult: HRAnalysisResult = {
                score: atsResult.overall,
                matchLevel: atsResult.overall >= 80 ? 'Excellent' : atsResult.overall >= 60 ? 'Good' : atsResult.overall >= 40 ? 'Fair' : 'Poor',
                summary: `Local analysis completed. Found ${atsResult.matchedKeywords.length} matching keywords and ${atsResult.suggestions.length} suggestions for improvement.`,
                pros: atsResult.suggestions.filter(s => s.severity === 'low').map(s => s.message).slice(0, 5),
                cons: atsResult.suggestions.filter(s => s.severity === 'high').map(s => s.message).slice(0, 4),
                missingSkills: atsResult.missingKeywords.slice(0, 10),
                improvementSuggestions: atsResult.suggestions.map(s => `${s.message}: ${s.action}`).slice(0, 5),
                keywordMatch: {
                    found: atsResult.matchedKeywords,
                    missing: atsResult.missingKeywords
                }
            };

            // Ensure pros/cons have fallback values if empty
            if (mappedResult.pros.length === 0) mappedResult.pros = ['Basic structure present', 'Contact info detected'];
            if (mappedResult.cons.length === 0 && atsResult.overall < 90) mappedResult.cons = ['Missing industry-specific keywords'];

            setResult(mappedResult);
        } catch (err: any) {
            setError('Local analysis failed. Please try again with a different file.');
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="hr-reviewer">
            <div className="reviewer-grid">
                {/* Left Panel: Configuration */}
                <div className="side-panel">
                    <motion.section
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="input-card-modern"
                    >
                        <div className="card-header-modern">
                            <div className="step-indicator">01</div>
                            <div>
                                <h2 className="card-title-modern">Source Resume</h2>
                                <p className="card-subtitle-modern">Upload the document you want to audit</p>
                            </div>
                        </div>

                        <div
                            onClick={() => resumeInputRef.current?.click()}
                            className={`modern-drop-zone ${resumeFile ? 'has-file' : ''} ${extracting ? 'is-loading' : ''}`}
                        >
                            <AnimatePresence mode="wait">
                                {extracting ? (
                                    <motion.div
                                        key="extracting"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="upload-state-content"
                                    >
                                        <div className="spinner-modern"><FiLoader /></div>
                                        <div className="upload-text-group">
                                            <span className="primary-upload-text">Processing Document</span>
                                            <span className="secondary-upload-text">Extracting structure and semantics...</span>
                                        </div>
                                    </motion.div>
                                ) : resumeFile ? (
                                    <motion.div
                                        key="file"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="upload-state-content"
                                    >
                                        <div className="file-icon-box"><FiFileText /></div>
                                        <div className="upload-text-group">
                                            <span className="primary-upload-text file-name-text">{resumeFile.name}</span>
                                            <span className="secondary-upload-text success-text">Successfully Analyzed • Click to swap</span>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="upload-state-content"
                                    >
                                        <div className="upload-icon-box"><FiUploadCloud /></div>
                                        <div className="upload-text-group">
                                            <span className="primary-upload-text">Upload Resume</span>
                                            <span className="secondary-upload-text">PDF, DOCX or High-res images</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <input type="file" ref={resumeInputRef} onChange={handleResumeUpload} accept=".pdf,image/*" className="hidden" />
                    </motion.section>

                    <motion.section
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="input-card-modern mt-8"
                    >
                        <div className="card-header-modern">
                            <div className="step-indicator">02</div>
                            <div>
                                <h2 className="card-title-modern">Target Role</h2>
                                <p className="card-subtitle-modern">Define the benchmarks for analysis</p>
                            </div>
                        </div>

                        {/* Modern Tabs */}
                        <div className="tabs-container-modern">
                            {(['text', 'url', 'image'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`modern-tab-item ${activeTab === tab ? 'active' : ''}`}
                                >
                                    <div className="tab-icon">
                                        {tab === 'text' && <FiFileText />}
                                        {tab === 'url' && <FiLink />}
                                        {tab === 'image' && <FiImage />}
                                    </div>
                                    <span className="tab-label">{tab}</span>
                                </button>
                            ))}
                        </div>

                        {/* Tab Content Modern */}
                        <div className="tab-content-container">
                            <AnimatePresence mode="wait">
                                {activeTab === 'text' && (
                                    <motion.div
                                        key="text"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="tab-pane-modern"
                                    >
                                        <textarea
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                            placeholder="Paste the requirements, responsibilities and skills here..."
                                            className="modern-textarea"
                                        />
                                    </motion.div>
                                )}

                                {activeTab === 'url' && (
                                    <motion.div
                                        key="url"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="tab-pane-modern"
                                    >
                                        <div className="input-with-icon">
                                            <FiLink className="field-icon" />
                                            <input
                                                type="url"
                                                value={jdUrl}
                                                onChange={(e) => setJdUrl(e.target.value)}
                                                placeholder="https://linkedin.com/jobs/view/..."
                                                className="modern-input-field"
                                            />
                                        </div>
                                        <p className="field-helper">We'll scan the link for role requirements</p>
                                    </motion.div>
                                )}

                                {activeTab === 'image' && (
                                    <motion.div
                                        key="image"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="tab-pane-modern"
                                    >
                                        <div
                                            onClick={() => jdImageInputRef.current?.click()}
                                            className={`modern-mini-dropzone ${jdImage ? 'has-preview' : ''}`}
                                        >
                                            {jdImage ? (
                                                <div className="jd-preview-wrapper">
                                                    <img src={jdImage} alt="JD Preview" className="jd-preview-img" />
                                                    <div className="jd-preview-hover">Swap Image</div>
                                                </div>
                                            ) : (
                                                <div className="upload-state-content mini">
                                                    <FiImage className="upload-icon-mini" />
                                                    <span className="primary-upload-text small">Snap & Upload</span>
                                                </div>
                                            )}
                                        </div>
                                        <input type="file" ref={jdImageInputRef} onChange={handleJDImageUpload} accept="image/*" className="hidden" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="action-footer-modern">
                            {!quotaExceeded ? (
                                <button
                                    onClick={runAnalysis}
                                    disabled={analyzing || extracting || !resumeText || (activeTab === 'text' && !jobDescription) || (activeTab === 'url' && !jdUrl) || (activeTab === 'image' && !jdImage)}
                                    className={`btn-modern-action ${analyzing ? 'is-analyzing' : ''}`}
                                >
                                    {analyzing ? (
                                        <><FiLoader className="spin-fast" /> Orchestrating Analysis...</>
                                    ) : (
                                        <><FiZap /> Launch Audit</>
                                    )}
                                </button>
                            ) : (
                                <div className="quota-recovery-modern">
                                    <div className="quota-notice">
                                        <FiAlertCircle /> <span>AI Capacity Limited</span>
                                    </div>
                                    <button onClick={runLocalAnalysis} className="btn-modern-recovery">
                                        <FiServer /> Switch to Local Engine
                                    </button>
                                    <button onClick={() => setQuotaExceeded(false)} className="btn-modern-retry">
                                        Try Cloud again
                                    </button>
                                </div>
                            )}

                            {error && !quotaExceeded && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="modern-error-toast"
                                >
                                    <FiAlertCircle /> {error}
                                </motion.div>
                            )}
                        </div>
                    </motion.section>
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
                                <h3>{quotaExceeded ? 'Running Local Analysis...' : 'AI HR Agent is Reviewing...'}</h3>
                                <div className="progress-bar">
                                    <motion.div className="progress-fill" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: quotaExceeded ? 2 : 15, ease: "linear" }} />
                                </div>
                            </motion.div>
                        )}

                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="results-view"
                            >
                                {/* Results Header / Score */}
                                <div className="results-header-modern">
                                    <div className="score-viz">
                                        <div className="score-circle-outer">
                                            <svg viewBox="0 0 100 100" className="score-svg-modern">
                                                <circle cx="50" cy="50" r="46" className="score-bg-track" />
                                                <motion.circle
                                                    cx="50" cy="50" r="46"
                                                    className="score-fill-progress"
                                                    strokeDasharray="290"
                                                    initial={{ strokeDashoffset: 290 }}
                                                    animate={{ strokeDashoffset: 290 - (290 * (result?.score || 0)) / 100 }}
                                                    transition={{ duration: 2, ease: "easeOut" }}
                                                    style={{ stroke: getScoreColor(result?.score || 0) }}
                                                />
                                            </svg>
                                            <div className="score-inner-content">
                                                <span className="score-pct">{result?.score}%</span>
                                                <span className="score-label-sub">MATCH</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="summary-banner">
                                        <div className="match-status-tag" style={{ background: `linear-gradient(135deg, ${getScoreColor(result?.score || 0)}, rgba(255,255,255,0.1))` }}>
                                            <FiTarget /> {result?.matchLevel} Matching Accuracy
                                        </div>
                                        <h2 className="analysis-summary-heading">HR Analysis Summary</h2>
                                        <p className="analysis-summary-text">"{result?.summary}"</p>
                                    </div>
                                </div>

                                {/* Main Stats Grid */}
                                <div className="stats-modern-grid">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="analysis-stat-card positive"
                                    >
                                        <div className="stat-header">
                                            <div className="stat-icon-box"><FiCheckCircle /></div>
                                            <h3>Key Strengths</h3>
                                        </div>
                                        <ul className="modern-list positive">
                                            {(result?.pros || []).map((pro, i) => (
                                                <motion.li
                                                    key={i}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.3 + (i * 0.1) }}
                                                >
                                                    {pro}
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="analysis-stat-card negative"
                                    >
                                        <div className="stat-header">
                                            <div className="stat-icon-box"><FiAlertCircle /></div>
                                            <h3>Areas for Improvement</h3>
                                        </div>
                                        <ul className="modern-list negative">
                                            {(result?.cons || []).map((con, i) => (
                                                <motion.li
                                                    key={i}
                                                    initial={{ opacity: 0, x: 10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.3 + (i * 0.1) }}
                                                >
                                                    {con}
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                </div>

                                {/* Skills Breakdown */}
                                <div className="keywords-visualization-modern">
                                    <div className="vis-header">
                                        <div className="vis-title">
                                            <FiZap className="icon-pulse" />
                                            <h3>ATS Keyword Matching</h3>
                                        </div>
                                        <div className="vis-legend">
                                            <span className="legend-item found">Identified</span>
                                            <span className="legend-item missing">In-Demand</span>
                                        </div>
                                    </div>

                                    <div className="pills-container-modern">
                                        {(result?.keywordMatch?.found || []).map((skill, i) => (
                                            <motion.span
                                                key={`found-${i}`}
                                                whileHover={{ scale: 1.05 }}
                                                className="modern-pill pill-found"
                                            >
                                                <FiCheck /> {skill}
                                            </motion.span>
                                        ))}
                                        {(result?.keywordMatch?.missing || []).map((skill, i) => (
                                            <motion.span
                                                key={`missing-${i}`}
                                                whileHover={{ scale: 1.05 }}
                                                className="modern-pill pill-missing"
                                            >
                                                <FiX /> {skill}
                                            </motion.span>
                                        ))}
                                    </div>
                                </div>

                                {/* Actionable Roadmap */}
                                <div className="roadmap-panel">
                                    <div className="roadmap-header">
                                        <div className="roadmap-icon"><FiTrendingUp /></div>
                                        <div>
                                            <h3>Strategic Roadmap</h3>
                                            <p>Optimized steps to secure this role</p>
                                        </div>
                                    </div>

                                    <div className="roadmap-steps-modern">
                                        {(result?.improvementSuggestions || []).map((tip, i) => (
                                            <motion.div
                                                key={i}
                                                className="roadmap-step-card"
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: i * 0.1 }}
                                            >
                                                <div className="step-badge">{i + 1}</div>
                                                <p className="step-content-text">{tip}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <div className="results-actions">
                                    <button onClick={() => { setResult(null); setResumeFile(null); setResumeText(''); setJobDescription(''); setJdUrl(''); setJdImage(null); setQuotaExceeded(false); }} className="btn btn-premium-secondary w-full">
                                        <FiArrowRight /> Start New Audit
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <style jsx>{`
                .reviewer-grid { display: grid; grid-template-columns: 1fr; gap: 40px; padding: 20px; }
                @media (min-width: 1200px) { .reviewer-grid { grid-template-columns: 380px 1fr; gap: 48px; } }
                
                /* MODERN INPUT CARDS */
                .input-card-modern {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 28px;
                    padding: 32px;
                    box-shadow: var(--shadow-xl);
                    position: relative;
                }
                
                .card-header-modern {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 28px;
                }
                
                .step-indicator {
                    width: 32px;
                    height: 32px;
                    background: var(--accent-primary);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: 900;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                }
                
                .card-title-modern { font-size: 18px; font-weight: 800; color: var(--text-primary); }
                .card-subtitle-modern { font-size: 11px; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; }
                
                /* MODERN DROP ZONE */
                .modern-drop-zone {
                    border: 2px dashed var(--border-color);
                    border-radius: 20px;
                    padding: 32px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    background: var(--bg-primary);
                    min-height: 140px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .modern-drop-zone:hover {
                    border-color: var(--accent-primary);
                    background: rgba(99, 102, 241, 0.02);
                    transform: translateY(-2px);
                }
                
                .modern-drop-zone.has-file {
                    border-style: solid;
                    border-color: #10b981;
                    background: rgba(16, 185, 129, 0.03);
                }
                
                .upload-state-content { display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; }
                .upload-state-content.mini { flex-direction: row; gap: 12px; }
                
                .upload-icon-box { 
                    width: 56px; height: 56px; border-radius: 16px; background: rgba(99, 102, 241, 0.1); color: var(--accent-primary);
                    display: flex; align-items: center; justify-content: center; font-size: 24px;
                }
                
                .file-icon-box {
                    width: 56px; height: 56px; border-radius: 16px; background: rgba(16, 185, 129, 0.1); color: #10b981;
                    display: flex; align-items: center; justify-content: center; font-size: 24px;
                }
                
                .spinner-modern { font-size: 32px; color: var(--accent-primary); animation: spin 1s linear infinite; }
                
                .upload-text-group { display: flex; flex-direction: column; gap: 4px; }
                .primary-upload-text { font-size: 14px; font-weight: 700; color: var(--text-primary); }
                .primary-upload-text.small { font-size: 12px; }
                .secondary-upload-text { font-size: 11px; font-weight: 500; color: var(--text-tertiary); }
                .success-text { color: #10b981; font-weight: 700; }
                .file-name-text { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                
                /* MODERN TABS */
                .tabs-container-modern {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                    background: var(--bg-primary);
                    padding: 6px;
                    border-radius: 16px;
                    border: 1px solid var(--border-color);
                    margin-bottom: 24px;
                }
                
                .modern-tab-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    padding: 12px 4px;
                    border-radius: 12px;
                    border: none;
                    background: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: var(--text-tertiary);
                }
                
                .modern-tab-item.active { background: white; color: var(--accent-primary); box-shadow: var(--shadow-md); }
                .tab-icon { font-size: 18px; }
                .tab-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
                
                /* MODERN INPUT FIELDS */
                .tab-pane-modern { position: relative; }
                .modern-textarea {
                    width: 100%;
                    height: 200px;
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: 16px;
                    padding: 18px;
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--text-primary);
                    outline: none;
                    transition: all 0.2s;
                    resize: none;
                }
                .modern-textarea:focus { border-color: var(--accent-primary); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.08); }
                
                .input-with-icon { position: relative; }
                .field-icon { position: absolute; left: 18px; top: 18px; color: var(--text-tertiary); font-size: 18px; }
                .modern-input-field {
                    width: 100%;
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: 16px;
                    padding: 18px 18px 18px 48px;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-primary);
                    outline: none;
                }
                .field-helper { font-size: 10px; color: var(--text-tertiary); margin-top: 10px; font-style: italic; }
                
                .modern-mini-dropzone {
                    border: 1px solid var(--border-color); border-radius: 16px; height: 120px;
                    display: flex; align-items: center; justify-content: center; background: var(--bg-primary);
                    cursor: pointer; overflow: hidden;
                }
                .jd-preview-wrapper { position: relative; width: 100%; height: 100%; }
                .jd-preview-img { width: 100%; height: 100%; object-fit: cover; }
                .jd-preview-hover {
                    position: absolute; inset: 0; background: rgba(0,0,0,0.6); color: white;
                    display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;
                    opacity: 0; transition: 0.2s;
                }
                .jd-preview-wrapper:hover .jd-preview-hover { opacity: 1; }
                .upload-icon-mini { font-size: 20px; color: var(--accent-primary); }
                
                /* MODERN ACTIONS */
                .action-footer-modern { margin-top: 32px; }
                .btn-modern-action {
                    width: 100%; padding: 18px; border-radius: 18px; border: none;
                    background: linear-gradient(135deg, var(--accent-primary) 0%, #4f46e5 100%);
                    color: white; font-size: 15px; font-weight: 800; letter-spacing: 0.02em;
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                    cursor: pointer; transition: all 0.3s; box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
                }
                .btn-modern-action:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(99, 102, 241, 0.4); }
                .btn-modern-action:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }
                
                .spin-fast { animation: spin 0.8s linear infinite; }
                
                .modern-error-toast {
                    margin-top: 16px; padding: 12px; border-radius: 12px; background: rgba(244, 63, 94, 0.1);
                    color: #f43f5e; font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 8px;
                }
                
                .quota-recovery-modern { margin-top: 16px; display: flex; flex-direction: column; gap: 10px; }
                .quota-notice { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: #f59e0b; margin-bottom: 4px; }
                .btn-modern-recovery {
                    width: 100%; padding: 14px; border-radius: 14px; border: none;
                    background: #f59e0b; color: white; font-size: 13px; font-weight: 800;
                    display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;
                }
                .btn-modern-retry { background: none; border: none; font-size: 11px; font-weight: 700; color: var(--text-tertiary); text-decoration: underline; cursor: pointer; }
                
                .empty-state, .loading-state { 
                    height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; 
                    padding: 60px; text-align: center; background: var(--bg-secondary); border-radius: 32px; border: 1px solid var(--border-color);
                    box-shadow: var(--shadow-2xl);
                }
                .empty-icon { font-size: 64px; color: var(--text-tertiary); margin-bottom: 24px; opacity: 0.5; }
                .loading-state h3 { font-size: 24px; font-weight: 700; margin-bottom: 16px; }
                .loading-state p { font-size: 12px; color: var(--text-tertiary); animation: bounce 1s infinite; }
                
                .loader-ring { position: relative; width: 140px; height: 140px; border: 4px solid var(--accent-primary-20); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 40px; animation: ping 2s infinite; }
                .loader-core { width: 90px; height: 90px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px; color: var(--accent-primary); box-shadow: var(--shadow-xl); animation: pulse 2s infinite; }
                .progress-bar { width: 100%; max-width: 200px; height: 4px; background: var(--bg-primary); border-radius: 2px; margin-top: 16px; overflow: hidden; }
                .progress-fill { height: 100%; background: var(--accent-primary); }
                
                /* MODERN RESULTS VIEW */
                .results-view { display: flex; flex-direction: column; gap: 32px; padding-bottom: 40px; }
                
                .results-header-modern { 
                    display: grid; grid-template-columns: 1fr; gap: 32px; padding: 32px; 
                    background: #1e293b; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1);
                    box-shadow: var(--shadow-xl); overflow: hidden; position: relative;
                    color: white;
                }
                @media (min-width: 768px) { .results-header-modern { grid-template-columns: auto 1fr; align-items: center; } }
                
                .score-viz { width: 140px; height: 140px; }
                .score-circle-outer { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
                .score-svg-modern { width: 100%; height: 100%; transform: rotate(-90deg); }
                .score-bg-track { fill: #0f172a; stroke: rgba(255,255,255,0.05); stroke-width: 8; }
                .score-fill-progress { fill: none; stroke-width: 8; stroke-linecap: round; }
                
                .score-inner-content { position: absolute; display: flex; flex-direction: column; align-items: center; }
                .score-pct { font-size: 34px; font-weight: 900; line-height: 1; margin-bottom: 4px; color: white !important; }
                .score-label-sub { font-size: 9px; font-weight: 800; opacity: 0.6; letter-spacing: 0.1em; color: white; }
                
                .summary-banner { flex: 1; }
                .match-status-tag { 
                    display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; 
                    border-radius: 99px; font-size: 11px; font-weight: 800; color: white; margin-bottom: 16px;
                }
                .analysis-summary-heading { font-size: 20px; font-weight: 800; margin-bottom: 12px; color: white; }
                .analysis-summary-text { font-size: 16px; font-weight: 500; line-height: 1.6; opacity: 0.9; font-style: italic; color: rgba(255,255,255,0.8); }
                
                .stats-modern-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
                @media (min-width: 768px) { .stats-modern-grid { grid-template-columns: 1fr 1fr; } }
                
                .analysis-stat-card { 
                    padding: 24px; border-radius: 20px; border: 1px solid var(--border-color);
                    background: var(--bg-secondary); box-shadow: var(--shadow-md); transition: transform 0.2s;
                }
                .analysis-stat-card:hover { transform: translateY(-4px); }
                .analysis-stat-card.positive { border-left: 6px solid #10b981; border-top: 1px solid rgba(16, 185, 129, 0.1); }
                .analysis-stat-card.negative { border-left: 6px solid #f43f5e; border-top: 1px solid rgba(244, 63, 94, 0.1); }
                
                .stat-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
                .stat-icon-box { 
                    width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px;
                }
                .positive .stat-icon-box { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .negative .stat-icon-box { background: rgba(244, 63, 94, 0.1); color: #f43f5e; }
                .stat-header h3 { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-primary); }
                
                .modern-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 14px; }
                .modern-list li { 
                    font-size: 13px; font-weight: 500; display: flex; align-items: flex-start; gap: 10px;
                    padding: 10px; border-radius: 10px; background: var(--bg-primary); color: var(--text-secondary);
                }
                .positive li::before { content: '✦'; color: #10b981; font-weight: 900; }
                .negative li::before { content: '✕'; color: #f43f5e; font-weight: 900; }
                
                .keywords-visualization-modern { 
                    padding: 32px; background: var(--bg-secondary); border-radius: 28px; border: 1px solid var(--border-color);
                    background: linear-gradient(180deg, var(--bg-secondary) 0%, rgba(255,255,255,0.03) 100%);
                    box-shadow: var(--shadow-xl);
                }
                .vis-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
                .vis-title { display: flex; align-items: center; gap: 12px; }
                .vis-title h3 { font-size: 16px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.01em; }
                .icon-pulse { color: #f59e0b; animation: pulse 2s infinite; font-size: 20px; }
                
                .vis-legend { display: flex; gap: 20px; background: var(--bg-primary); padding: 8px 16px; border-radius: 12px; border: 1px solid var(--border-color); }
                .legend-item { font-size: 10px; font-weight: 800; text-transform: uppercase; display: flex; align-items: center; gap: 8px; color: var(--text-tertiary); letter-spacing: 0.05em; }
                .legend-item::before { content: ''; width: 10px; height: 10px; border-radius: 3px; }
                .legend-item.found::before { background: #10b981; box-shadow: 0 0 10px rgba(16, 185, 129, 0.4); }
                .legend-item.missing::before { background: #f43f5e; box-shadow: 0 0 10px rgba(244, 63, 94, 0.4); }
                
                .pills-container-modern { display: flex; flex-wrap: wrap; gap: 10px; }
                .modern-pill { 
                    padding: 8px 14px; border-radius: 14px; font-size: 13px; font-weight: 700; 
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: default; 
                    display: inline-flex; align-items: center; gap: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .modern-pill:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 8px 15px rgba(0,0,0,0.1); }
                
                .pill-found { 
                    color: #065f46; 
                    background: rgba(16, 185, 129, 0.1); 
                    border: 1.5px solid rgba(16, 185, 129, 0.25);
                }
                .pill-found:hover {
                    background: #10b981;
                    color: white;
                    border-color: #10b981;
                }
                
                .pill-missing { 
                    color: #9f1239; 
                    background: rgba(244, 63, 94, 0.08); 
                    border: 1.5px solid rgba(244, 63, 94, 0.2);
                }
                .pill-missing:hover {
                    background: #f43f5e;
                    color: white;
                    border-color: #f43f5e;
                }
                
                .roadmap-panel { 
                    padding: 32px; background: linear-gradient(135deg, var(--bg-secondary) 0%, rgba(245, 158, 11, 0.05) 100%);
                    border-radius: 28px; border: 1px solid var(--border-color);
                    box-shadow: var(--shadow-xl);
                }
                .roadmap-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
                .roadmap-icon { width: 48px; height: 48px; background: #f59e0b; color: white; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3); }
                .roadmap-header h3 { font-size: 20px; font-weight: 800; color: var(--text-primary); }
                .roadmap-header p { font-size: 12px; opacity: 0.6; font-weight: 600; color: var(--text-tertiary); }
                
                .roadmap-steps-modern { display: flex; flex-direction: column; gap: 20px; }
                .roadmap-step-card { 
                    display: flex; gap: 20px; padding: 24px; background: var(--bg-primary); 
                    border-radius: 20px; border: 1px solid rgba(245, 158, 11, 0.1);
                    box-shadow: var(--shadow-sm); transition: all 0.3s;
                    color: var(--text-primary);
                }
                .roadmap-step-card:hover { transform: translateX(8px); border-color: #f59e0b; background: rgba(245, 158, 11, 0.02); }
                .step-badge { 
                    width: 32px; height: 32px; border-radius: 50%; background: #f59e0b; 
                    color: white; font-weight: 900; font-size: 14px; display: flex; align-items: center; 
                    justify-content: center; flex-shrink: 0; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3);
                }
                .step-content-text { font-size: 15px; font-weight: 600; line-height: 1.6; color: var(--text-secondary); }
                
                .results-actions { margin-top: 8px; }
                .btn-premium-secondary { 
                    background: var(--bg-secondary); color: var(--text-primary); border: 2px solid var(--border-color);
                    padding: 16px; font-size: 14px; letter-spacing: 0.05em; text-transform: uppercase;
                }
                .btn-premium-secondary:hover { border-color: var(--accent-primary); color: var(--accent-primary); }
                
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
                .btn-lg {
                    padding: 16px 24px;
                    font-size: 18px;
                }
                .btn-ghost {
                    background: none;
                    border: none;
                    color: var(--accent-primary);
                    text-decoration: underline;
                    cursor: pointer;
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
