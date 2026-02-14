'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <div className="h-32 bg-gray-50 animate-pulse rounded-md" />
});

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, label }: RichTextEditorProps) {
    const modules = useMemo(() => ({
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'clean']
        ]
    }), []);

    const formats = [
        'bold', 'italic', 'underline',
        'list', 'bullet',
        'link'
    ];

    return (
        <div className="rich-text-editor">
            {label && <label className="blocks-label">{label}</label>}
            <div className="quill-wrapper">
                <ReactQuill
                    theme="snow"
                    value={value || ''}
                    onChange={onChange}
                    modules={modules}
                    formats={formats}
                    placeholder={placeholder}
                />
            </div>
            <style jsx global>{`
                .quill-wrapper .ql-container {
                    font-family: var(--font-sans);
                    font-size: 14px;
                    border-bottom-left-radius: var(--radius-md);
                    border-bottom-right-radius: var(--radius-md);
                }
                .quill-wrapper .ql-toolbar {
                    border-top-left-radius: var(--radius-md);
                    border-top-right-radius: var(--radius-md);
                    background: var(--bg-secondary);
                    border-color: var(--border-color);
                }
                .quill-wrapper .ql-container.ql-snow {
                    border-color: var(--border-color);
                }
                .quill-wrapper .ql-editor {
                    min-height: 120px;
                }
                .quill-wrapper .ql-editor p {
                    margin-bottom: 0.5em;
                }
            `}</style>
        </div>
    );
}
