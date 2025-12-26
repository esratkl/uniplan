import React, { useState } from 'react';

const defaultTitle = 'Ruyalarim Gercek Oluyor';
const defaultUploadText = 'Fotograf Yukle';

const initialSlots = [1, 2, 3, 4];

const VisionBoardWidget = () => {
    const [photos, setPhotos] = useState(Array(initialSlots.length).fill(null));

    const handleUpload = (index, file) => {
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            setPhotos((prev) => {
                const next = [...prev];
                next[index] = e.target?.result || null;
                return next;
            });
        };
        reader.readAsDataURL(file);
    };

    const handleDelete = (index) => {
        setPhotos((prev) => {
            const next = [...prev];
            next[index] = null;
            return next;
        });
    };

    return (
        <div className="dashboard-card vision-board-card">
            <div className="vision-board-header">
                <h3 className="vision-board-title">{defaultTitle}</h3>
                <p className="vision-board-subtitle">Hayallerini gorsellestir, motive ol.</p>
            </div>

            <div className="vision-board-grid">
                {initialSlots.map((slot, index) => {
                    const hasPhoto = Boolean(photos[index]);
                    return (
                        <label key={slot} className={`vision-photo-card slot-${slot}`}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleUpload(index, e.target.files?.[0])}
                            />

                            <div className="vision-photo-inner">
                                {!hasPhoto && (
                                    <div className="vision-upload-area">
                                        <div className="vision-upload-icon">
                                            <svg viewBox="0 0 24 24" strokeWidth="2">
                                                <rect x="4" y="4" width="16" height="16" rx="4" ry="4" />
                                                <path d="M9 13l2 2 4-4" />
                                            </svg>
                                        </div>
                                        <span className="vision-upload-text">{defaultUploadText}</span>
                                    </div>
                                )}

                                {hasPhoto && (
                                    <>
                                        <img
                                            src={photos[index]}
                                            alt={`Vision slot ${slot}`}
                                            className="vision-photo-img"
                                        />
                                        <button
                                            type="button"
                                            className="vision-delete-btn"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleDelete(index);
                                            }}
                                            aria-label="Fotografi sil"
                                        >
                                            x
                                        </button>
                                    </>
                                )}
                            </div>
                        </label>
                    );
                })}
            </div>
        </div>
    );
};

export default VisionBoardWidget;
