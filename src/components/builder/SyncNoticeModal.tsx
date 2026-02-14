'use client';

import { useState, useEffect } from 'react';
import { FiCloud, FiClock, FiZap, FiX } from 'react-icons/fi';

export default function SyncNoticeModal() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const hasSeenNotice = localStorage.getItem('cv-creator-sync-notice');
        if (!hasSeenNotice) {
            setIsVisible(true);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('cv-creator-sync-notice', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="modal-overlay">
            <div className="sync-modal">
                <button className="close-btn" onClick={handleClose}>
                    <FiX />
                </button>

                <div className="sync-modal-icon">
                    <FiCloud />
                </div>

                <h2>Magic Sync Enabled</h2>
                <p className="subtitle">Your resume is now accessible anywhere with a simple link.</p>

                <div className="feature-list">
                    <div className="feature-item">
                        <div className="item-icon"><FiClock /></div>
                        <div>
                            <strong>3-Day Expiration</strong>
                            <p>Sync links stay active for 3 days. Visiting the link resets the timer!</p>
                        </div>
                    </div>

                    <div className="feature-item">
                        <div className="item-icon"><FiZap /></div>
                        <div>
                            <strong>Auto-Save to Cloud</strong>
                            <p>All updates are instantly saved to your magic link. Edit on mobile, finish on laptop.</p>
                        </div>
                    </div>
                </div>

                <button className="btn btn-primary btn-lg" onClick={handleClose} style={{ width: '100%', marginTop: 24 }}>
                    Got it!
                </button>
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    padding: 20px;
                }
                .sync-modal {
                    background: var(--bg-secondary);
                    padding: 40px 32px;
                    border-radius: var(--radius-lg);
                    max-width: 440px;
                    width: 100%;
                    text-align: center;
                    position: relative;
                    box-shadow: var(--shadow-xl);
                    animation: modalIn 0.4s ease-out;
                }
                @keyframes modalIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .close-btn {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    background: none;
                    border: none;
                    color: var(--text-tertiary);
                    cursor: pointer;
                    font-size: 20px;
                }
                .sync-modal-icon {
                    font-size: 48px;
                    color: var(--accent-primary);
                    margin-bottom: 20px;
                }
                h2 {
                    font-size: 24px;
                    font-weight: 800;
                    margin-bottom: 8px;
                }
                .subtitle {
                    color: var(--text-secondary);
                    margin-bottom: 32px;
                    font-size: 14px;
                }
                .feature-list {
                    text-align: left;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .feature-item {
                    display: flex;
                    gap: 16px;
                }
                .item-icon {
                    font-size: 20px;
                    color: var(--accent-primary);
                    margin-top: 2px;
                }
                .feature-item strong {
                    display: block;
                    font-size: 15px;
                    margin-bottom: 2px;
                }
                .feature-item p {
                    font-size: 13px;
                    color: var(--text-secondary);
                    line-height: 1.5;
                }
            `}</style>
        </div>
    );
}
