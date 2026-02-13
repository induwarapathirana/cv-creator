'use client';

import { motion } from 'framer-motion';

const templates = [
    { name: 'Modern', color: '#6366f1', description: 'Clean two-column layout' },
    { name: 'Classic', color: '#059669', description: 'Traditional & elegant' },
    { name: 'Minimal', color: '#1a1a2e', description: 'Typography-focused' },
    { name: 'Executive', color: '#1e3a5f', description: 'Bold & professional' },
    { name: 'Creative', color: '#8b5cf6', description: 'Colorful & unique' },
    { name: 'ATS', color: '#374151', description: 'Maximum compatibility' },
];

export default function TemplateShowcase() {
    return (
        <section className="templates-section" id="templates">
            <div className="container">
                <motion.div
                    className="section-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="section-label">Templates</span>
                    <h2 className="section-title">
                        Professionally Designed{' '}
                        <span className="gradient-text">Templates</span>
                    </h2>
                    <p className="section-description">
                        Each template is optimized for readability and ATS compatibility.
                        Switch between them instantly.
                    </p>
                </motion.div>

                <div className="templates-grid">
                    {templates.map((template, index) => (
                        <motion.div
                            key={template.name}
                            className="template-card"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            {/* Mini preview */}
                            <div style={{ padding: '24px 20px', height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {/* Header */}
                                <div>
                                    <div style={{
                                        height: 14,
                                        width: '55%',
                                        background: template.color,
                                        borderRadius: 3,
                                        marginBottom: 6,
                                    }} />
                                    <div style={{
                                        height: 8,
                                        width: '40%',
                                        background: '#ddd',
                                        borderRadius: 2,
                                        marginBottom: 4,
                                    }} />
                                    <div style={{
                                        display: 'flex',
                                        gap: 8,
                                        marginTop: 6,
                                    }}>
                                        {[50, 60, 40].map((w, i) => (
                                            <div key={i} style={{
                                                height: 6,
                                                width: w,
                                                background: '#e0e0e0',
                                                borderRadius: 2,
                                            }} />
                                        ))}
                                    </div>
                                </div>

                                {/* Divider */}
                                <div style={{ height: 1, background: template.color, opacity: 0.3 }} />

                                {/* Sections */}
                                {[1, 2, 3].map((s) => (
                                    <div key={s}>
                                        <div style={{
                                            height: 8,
                                            width: '35%',
                                            background: template.color,
                                            borderRadius: 2,
                                            marginBottom: 6,
                                            opacity: 0.7,
                                        }} />
                                        <div style={{
                                            height: 6,
                                            width: '90%',
                                            background: '#eee',
                                            borderRadius: 2,
                                            marginBottom: 4,
                                        }} />
                                        <div style={{
                                            height: 6,
                                            width: '75%',
                                            background: '#eee',
                                            borderRadius: 2,
                                            marginBottom: 4,
                                        }} />
                                        <div style={{
                                            height: 6,
                                            width: '85%',
                                            background: '#f0f0f0',
                                            borderRadius: 2,
                                        }} />
                                    </div>
                                ))}
                            </div>

                            <div className="template-card-overlay">
                                <div>
                                    <div className="template-card-name">{template.name}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                                        {template.description}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
