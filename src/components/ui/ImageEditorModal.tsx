'use client';

import { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import getCroppedImg from '@/utils/canvasUtils';
import { FiZoomIn, FiZoomOut, FiCheck, FiX } from 'react-icons/fi';

interface ImageEditorModalProps {
    imageSrc: string;
    onCancel: () => void;
    onSave: (croppedImage: string) => void;
}

export default function ImageEditorModal({ imageSrc, onCancel, onSave }: ImageEditorModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        try {
            if (croppedAreaPixels) {
                const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
                if (croppedImage) {
                    onSave(croppedImage);
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 200,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
        }}>
            <div style={{
                width: '100%',
                maxWidth: 500,
                height: 500,
                background: '#1a1a2e',
                borderRadius: 16,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
            }}>
                <div style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ color: 'white', margin: 0, fontSize: 16 }}>Edit Profile Photo</h3>
                    <button onClick={onCancel} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}>
                        <FiX size={20} />
                    </button>
                </div>

                <div style={{ position: 'relative', flex: 1, background: '#000' }}>
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                        cropShape="round"
                        showGrid={false}
                    />
                </div>

                <div style={{ padding: 24, background: '#1a1a2e' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                        <FiZoomOut size={16} color="#999" />
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            style={{ flex: 1, accentColor: '#6366f1' }}
                        />
                        <FiZoomIn size={16} color="#999" />
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button
                            onClick={onCancel}
                            style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: 8,
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'transparent',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: 8,
                                border: 'none',
                                background: '#6366f1',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8
                            }}
                        >
                            <FiCheck size={16} /> Save Photo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
