'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowRight, FiZap } from 'react-icons/fi';

export default function Hero() {
    return (
        <section className="hero">
            <motion.div
                className="hero-badge"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <span className="hero-badge-dot" />
                ATS-Optimized · Free Forever · No Sign-up
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
            >
                Build Resumes That{' '}
                <span className="gradient-text">Get You Hired</span>
            </motion.h1>

            <motion.p
                className="hero-subtitle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
            >
                Create stunning, ATS-friendly resumes with real-time preview, smart
                scoring, and beautiful templates. Your data stays on your device —
                always private, always free.
            </motion.p>

            <motion.div
                className="hero-actions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.7 }}
            >
                <Link href="/builder" className="btn btn-primary btn-lg">
                    <FiZap /> Start Building
                </Link>
                <a href="#templates" className="btn btn-secondary btn-lg">
                    View Templates <FiArrowRight />
                </a>
            </motion.div>

            <motion.div
                className="hero-visual"
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1, delay: 0.9 }}
            >
                <div className="hero-mockup">
                    <div className="hero-mockup-inner">
                        <div className="mockup-sidebar">
                            <div className="mockup-line mockup-line-medium" />
                            <div className="mockup-line mockup-line-short" />
                            <div className="mockup-block" />
                            <div className="mockup-line" />
                            <div className="mockup-line mockup-line-medium" />
                            <div className="mockup-block" />
                            <div className="mockup-line mockup-line-short" />
                            <div className="mockup-line" />
                            <div className="mockup-block" />
                            <div className="mockup-line mockup-line-medium" />
                        </div>
                        <div className="mockup-preview">
                            <div className="mockup-header-block" />
                            <div className="mockup-content-lines">
                                <div className="mockup-line" />
                                <div className="mockup-line mockup-line-medium" />
                                <div className="mockup-line mockup-line-short" />
                            </div>
                            <div style={{ marginTop: 12 }}>
                                <div className="mockup-header-block" style={{ width: '35%', height: 14 }} />
                            </div>
                            <div className="mockup-content-lines">
                                <div className="mockup-line" />
                                <div className="mockup-line mockup-line-medium" />
                                <div className="mockup-line" />
                                <div className="mockup-line mockup-line-short" />
                            </div>
                            <div style={{ marginTop: 12 }}>
                                <div className="mockup-header-block" style={{ width: '30%', height: 14 }} />
                            </div>
                            <div className="mockup-content-lines">
                                <div className="mockup-line mockup-line-medium" />
                                <div className="mockup-line" />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
