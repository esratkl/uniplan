// src/components/avatar/AvatarCreator.jsx
// Ready Player Me Avatar Creator Modal Component

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import '../../styles/AvatarCreator.css';

/**
 * AvatarCreator Component
 * 
 * Props:
 * - isOpen: boolean - Modal açık/kapalı durumu
 * - onClose: () => void - Modal kapatma callback'i
 * - onAvatarReady: (url: string) => void - Avatar hazır olduğunda çağrılan callback (GLB URL ile)
 */
const AvatarCreator = ({ isOpen, onClose, onAvatarReady }) => {
    const iframeRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleMessage = (event) => {
            try {
                // Ready Player Me iframe'inden gelen mesajları dinle
                const data = JSON.parse(event.data);

                // Sadece Ready Player Me kaynaklı mesajları işle
                if (data.source !== 'readyplayerme') {
                    return;
                }

                // Frame hazır olduğunda subscribe ol
                if (data.eventName === 'v1.frame.ready') {
                    if (iframeRef.current?.contentWindow) {
                        iframeRef.current.contentWindow.postMessage(
                            JSON.stringify({
                                target: 'readyplayerme',
                                type: 'subscribe',
                                eventName: 'v1.**',
                            }),
                            '*'
                        );
                    }
                }

                // Avatar export edildiğinde URL'yi al
                if (data.eventName === 'v1.avatar.exported') {
                    const avatarUrl = data.data?.url;
                    if (avatarUrl && onAvatarReady) {
                        onAvatarReady(avatarUrl);
                        // Avatar hazır olduktan sonra modalı kapat
                        setTimeout(() => {
                            onClose();
                        }, 500);
                    }
                }
            } catch (error) {
                // JSON parse hatası veya diğer hatalar için sessizce devam et
                console.warn('AvatarCreator message parse error:', error);
            }
        };

        // Message event listener ekle
        window.addEventListener('message', handleMessage);

        // Cleanup: component unmount veya modal kapandığında listener'ı kaldır
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [isOpen, onClose, onAvatarReady]);

    if (!isOpen) return null;

    return (
        <div className="avatar-creator-overlay" onClick={onClose}>
            <div className="avatar-creator-modal" onClick={(e) => e.stopPropagation()}>
                <div className="avatar-creator-header">
                    <h2 className="avatar-creator-title">Avatar Oluştur</h2>
                    <button
                        className="avatar-creator-close"
                        onClick={onClose}
                        aria-label="Kapat"
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="avatar-creator-content">
                    <iframe
                        ref={iframeRef}
                        src="https://uniplan.readyplayer.me/avatar?frameApi"
                        allow="camera *; microphone *; clipboard-write"
                        className="avatar-creator-iframe"
                        title="Ready Player Me Avatar Creator"
                    />
                </div>
            </div>
        </div>
    );
};

export default AvatarCreator;

