'use client';

import { motion } from 'framer-motion';
import {
    FiTarget,
    FiLayout,
    FiDownload,
    FiShield,
    FiSliders,
    FiCopy,
    FiType,
    FiZap,
    FiRefreshCw,
} from 'react-icons/fi';

const features = [
    {
        icon: <FiTarget />,
        title: 'ATS Score Analyzer',
        description:
            'Paste a job description and get an instant ATS compatibility score with actionable suggestions to improve your chances.',
    },
    {
        icon: <FiLayout />,
        title: '6+ Premium Templates',
        description:
            'Choose from professionally designed templates — Modern, Classic, Minimal, Executive, Creative, and a dedicated ATS-optimized layout.',
    },
    {
        icon: <FiRefreshCw />,
        title: 'Real-Time Preview',
        description:
            'See your resume update live as you type. No more guessing — what you see is exactly what you get.',
    },
    {
        icon: <FiDownload />,
        title: 'PDF Export',
        description:
            'Download your resume as a pixel-perfect PDF ready for job applications. Clean formatting guaranteed.',
    },
    {
        icon: <FiShield />,
        title: '100% Private',
        description:
            'Your data never leaves your browser. Everything is stored locally — no accounts, no tracking, no servers.',
    },
    {
        icon: <FiSliders />,
        title: 'Full Customization',
        description:
            'Control every aspect — fonts, colors, spacing, margins. Make your resume truly yours.',
    },
    {
        icon: <FiCopy />,
        title: 'Multiple Resumes',
        description:
            'Create unlimited resumes tailored for different roles. Duplicate and customize for each application.',
    },
    {
        icon: <FiType />,
        title: 'Professional Fonts',
        description:
            'Choose from carefully selected professional fonts that look great on screen and in print.',
    },
    {
        icon: <FiZap />,
        title: 'Drag & Drop Sections',
        description:
            'Reorder your resume sections with drag-and-drop. Show, hide, or rearrange to match any job posting.',
    },
];

const container = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Features() {
    return (
        <section className="features-section" id="features">
            <div className="container">
                <motion.div
                    className="section-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="section-label">Features</span>
                    <h2 className="section-title">
                        Everything You Need to{' '}
                        <span className="gradient-text">Stand Out</span>
                    </h2>
                    <p className="section-description">
                        Powerful tools designed to help you create the perfect resume for
                        every opportunity.
                    </p>
                </motion.div>

                <motion.div
                    className="features-grid"
                    variants={container}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                >
                    {features.map((feature, index) => (
                        <motion.div key={index} className="feature-card" variants={item}>
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
