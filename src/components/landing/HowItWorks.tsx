'use client';

import { motion } from 'framer-motion';
import { FiEdit3, FiLayout, FiDownload } from 'react-icons/fi';

const steps = [
    {
        icon: <FiEdit3 />,
        title: 'Fill Your Details',
        description:
            'Enter your experience, education, skills, and more. Our smart editor makes it quick and easy.',
    },
    {
        icon: <FiLayout />,
        title: 'Choose a Template',
        description:
            'Pick a template that matches your style and industry. Customize colors, fonts, and layout.',
    },
    {
        icon: <FiDownload />,
        title: 'Download & Apply',
        description:
            'Export as a polished PDF ready for applications. Check your ATS score before sending.',
    },
];

export default function HowItWorks() {
    return (
        <section className="how-section" id="how-it-works">
            <div className="container">
                <motion.div
                    className="section-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="section-label">How It Works</span>
                    <h2 className="section-title">
                        Three Steps to Your{' '}
                        <span className="gradient-text">Dream Job</span>
                    </h2>
                    <p className="section-description">
                        Creating a professional, ATS-friendly resume has never been easier.
                    </p>
                </motion.div>

                <div className="steps-grid">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            className="step-card"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                        >
                            <div className="step-number">{index + 1}</div>
                            <h3>{step.title}</h3>
                            <p>{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
