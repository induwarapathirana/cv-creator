'use client';

import { useState } from 'react';
import { useResumeStore } from '@/stores/resume-store';
import { analyzeResume } from '@/utils/ats-analyzer';
import { ATSScore } from '@/types/resume';
import { FiX, FiTarget, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

interface ATSPanelProps {
    onClose: () => void;
}

export default function ATSPanel({ onClose }: ATSPanelProps) {
    const resume = useResumeStore((s) => s.getActiveResume());
    const [jobDescription, setJobDescription] = useState('');
    const [score, setScore] = useState<ATSScore | null>(null);

    if (!resume) return null;

    const handleAnalyze = () => {
        const result = analyzeResume(resume, jobDescription || undefined);
        setScore(result);
    };

    const getScoreColor = (value: number) => {
        if (value >= 80) return '#22c55e';
        if (value >= 60) return '#f59e0b';
        return '#ef4444';
    };

    const circumference = 2 * Math.PI * 58;

    return (
        <div className="ats-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>
                    <FiTarget style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    ATS Score Analyzer
                </h3>
                <button className="btn-icon" onClick={onClose} style={{ width: 32, height: 32 }}>
                    <FiX />
                </button>
            </div>

            <div className="input-group" style={{ marginBottom: 16 }}>
                <label>Job Description (Optional)</label>
                <textarea
                    className="textarea"
                    rows={4}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here for keyword matching..."
                />
            </div>

            <button className="btn btn-primary" style={{ width: '100%', marginBottom: 24 }} onClick={handleAnalyze}>
                Analyze Resume
            </button>

            {score && (
                <>
                    {/* Score Circle */}
                    <div className="ats-score-circle">
                        <svg width="140" height="140">
                            <circle cx="70" cy="70" r="58" fill="none" stroke="var(--border-color)" strokeWidth="8" />
                            <circle
                                cx="70" cy="70" r="58" fill="none"
                                stroke={getScoreColor(score.overall)}
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={circumference - (circumference * score.overall) / 100}
                                style={{ transition: 'stroke-dashoffset 1s ease' }}
                            />
                        </svg>
                        <span className="ats-score-value" style={{ color: getScoreColor(score.overall) }}>
                            {score.overall}
                        </span>
                    </div>

                    {/* Category Scores */}
                    {[
                        { label: 'Format', score: score.format },
                        { label: 'Content', score: score.content },
                        { label: 'Keywords', score: score.keywords },
                    ].map((cat) => (
                        <div key={cat.label} className="ats-category">
                            <div className="ats-category-header">
                                <span className="ats-category-label">{cat.label}</span>
                                <span className="ats-category-score" style={{ color: getScoreColor(cat.score) }}>
                                    {cat.score}%
                                </span>
                            </div>
                            <div className="ats-bar">
                                <div className="ats-bar-fill" style={{ width: `${cat.score}%` }} />
                            </div>
                        </div>
                    ))}

                    {/* Keywords */}
                    {score.matchedKeywords.length > 0 && (
                        <div style={{ marginTop: 20, marginBottom: 12 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <FiCheckCircle /> Matched Keywords
                            </div>
                            <div className="keyword-tags">
                                {score.matchedKeywords.map((kw, i) => (
                                    <span key={i} className="keyword-tag matched">{kw}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {score.missingKeywords.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <FiAlertTriangle /> Missing Keywords
                            </div>
                            <div className="keyword-tags">
                                {score.missingKeywords.map((kw, i) => (
                                    <span key={i} className="keyword-tag missing">{kw}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Suggestions */}
                    {score.suggestions.length > 0 && (
                        <div style={{ marginTop: 20 }}>
                            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Suggestions</h4>
                            {score.suggestions.map((s, i) => (
                                <div key={i} className={`ats-suggestion ${s.severity}`}>
                                    <div className="ats-suggestion-msg">{s.message}</div>
                                    {s.action && <div className="ats-suggestion-action">{s.action}</div>}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
