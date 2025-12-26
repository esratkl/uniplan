// src/components/avatar/Avatar3D.jsx
// 3D Avatar Renderer Component using @google/model-viewer

import React, { useEffect, useRef, useState, useCallback } from 'react';

// Model-viewer'ı dinamik olarak yükle
let modelViewerLoaded = false;
let modelViewerLoadPromise = null;

const loadModelViewer = () => {
    if (modelViewerLoaded || (typeof customElements !== 'undefined' && customElements.get('model-viewer'))) {
        return Promise.resolve();
    }
    
    if (modelViewerLoadPromise) {
        return modelViewerLoadPromise;
    }
    
    modelViewerLoadPromise = import('@google/model-viewer').then(() => {
        modelViewerLoaded = true;
        return Promise.resolve();
    }).catch((error) => {
        console.warn('Failed to load model-viewer:', error);
        modelViewerLoadPromise = null;
        return Promise.reject(error);
    });
    
    return modelViewerLoadPromise;
};

const Avatar3D = ({ 
    avatarUrl, 
    size = 120, 
    autoRotate = true,
    interactionPrompt = 'none',
    style = {},
    className = ''
}) => {
    const modelViewerRef = useRef(null);
    const containerRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isModelViewerReady, setIsModelViewerReady] = useState(false);
    const [error, setError] = useState(false);
    const [renderAttempted, setRenderAttempted] = useState(false);

    // Model-viewer'ı yükle
    useEffect(() => {
        if (typeof customElements === 'undefined') {
            setError(true);
            return;
        }

        setRenderAttempted(true);
        
        loadModelViewer().then(() => {
            // Custom element'in tanımlanmasını bekle
            let attempts = 0;
            const maxAttempts = 20; // Max 1 saniye bekle
            
            const checkCustomElement = () => {
                if (customElements.get('model-viewer')) {
                    setIsModelViewerReady(true);
                } else if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(checkCustomElement, 50);
                } else {
                    console.warn('Model-viewer custom element not found after timeout');
                    setError(true);
                }
            };
            checkCustomElement();
        }).catch(() => {
            setError(true);
        });
    }, []);

    // useRef ve useEffect ile DOM'a direkt model-viewer ekle
    // TÜM HOOK'LAR ERKEN RETURN'LERDEN ÖNCE ÇAĞRILMALI
    useEffect(() => {
        if (!containerRef.current || !isModelViewerReady || !avatarUrl || error) {
            return;
        }

        const container = containerRef.current;
        
        // Eğer zaten bir model-viewer varsa, temizle
        const existingViewer = container.querySelector('model-viewer');
        if (existingViewer) {
            existingViewer.remove();
        }

        // Loading state'i sıfırla
        setIsLoaded(false);

        try {
            // Yeni model-viewer elementi oluştur
            const modelViewer = document.createElement('model-viewer');
            modelViewer.setAttribute('src', avatarUrl);
            modelViewer.setAttribute('alt', '3D Avatar');
            modelViewer.setAttribute('auto-rotate', autoRotate ? 'true' : 'false');
            modelViewer.setAttribute('auto-rotate-delay', '0');
            modelViewer.setAttribute('rotation-per-second', '30deg');
            modelViewer.setAttribute('interaction-prompt', interactionPrompt);
            modelViewer.setAttribute('camera-controls', 'true');
            modelViewer.setAttribute('touch-action', 'pan-y');
            modelViewer.setAttribute('shadow-intensity', '1');
            modelViewer.setAttribute('environment-image', 'neutral');
            modelViewer.setAttribute('exposure', '1');
            modelViewer.setAttribute('ar', 'true');
            modelViewer.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
            
            // Stil ayarları
            modelViewer.style.width = '100%';
            modelViewer.style.height = '100%';
            modelViewer.style.backgroundColor = 'transparent';
            
            // Poster için loading spinner ekle
            const posterDiv = document.createElement('div');
            posterDiv.setAttribute('slot', 'poster');
            posterDiv.style.width = '100%';
            posterDiv.style.height = '100%';
            posterDiv.style.display = 'flex';
            posterDiv.style.alignItems = 'center';
            posterDiv.style.justifyContent = 'center';
            posterDiv.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.1))';
            posterDiv.style.borderRadius = '50%';
            
            const spinner = document.createElement('div');
            spinner.style.width = '40px';
            spinner.style.height = '40px';
            spinner.style.border = '3px solid rgba(99, 102, 241, 0.3)';
            spinner.style.borderTopColor = 'rgb(99, 102, 241)';
            spinner.style.borderRadius = '50%';
            spinner.style.animation = 'spin 1s linear infinite';
            
            posterDiv.appendChild(spinner);
            modelViewer.appendChild(posterDiv);
            
            // Container'a ekle
            container.appendChild(modelViewer);
            
            // Ref'i güncelle
            modelViewerRef.current = modelViewer;
            
            // Load event listener ekle
            const handleLoad = () => {
                setIsLoaded(true);
            };
            modelViewer.addEventListener('load', handleLoad);
            
            // Error handling
            const handleError = () => {
                console.warn('Model-viewer failed to load avatar');
                setError(true);
            };
            modelViewer.addEventListener('error', handleError);
            
            // Cleanup
            return () => {
                if (modelViewer) {
                    modelViewer.removeEventListener('load', handleLoad);
                    modelViewer.removeEventListener('error', handleError);
                    if (modelViewer.parentNode) {
                        modelViewer.remove();
                    }
                }
            };
        } catch (err) {
            console.warn('Avatar3D DOM manipulation error:', err);
            setError(true);
        }
    }, [avatarUrl, isModelViewerReady, autoRotate, interactionPrompt, error]);

    // Fallback component
    const renderFallback = useCallback(() => (
        <div 
            className={`avatar-3d-container ${className}`}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.1))',
                borderRadius: '50%',
                border: '2px solid var(--border-color)',
                ...style
            }}
        >
            <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(99, 102, 241, 0.3)',
                borderTopColor: 'var(--color-primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }} />
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    ), [size, className, style]);

    // Erken return'ler - hook'lardan sonra
    if (!avatarUrl) {
        return null;
    }

    // Hata durumunda fallback göster
    if (error) {
        return renderFallback();
    }

    // Model-viewer henüz yüklenmediyse, yüklenmesini bekle
    if (!isModelViewerReady) {
        return renderFallback();
    }

    // Container div'i render et
    return (
        <div 
            ref={containerRef}
            className={`avatar-3d-container ${className}`}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '50%',
                ...style
            }}
        >
            {!isLoaded && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.1))',
                    borderRadius: '50%',
                    zIndex: 1
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid rgba(99, 102, 241, 0.3)',
                        borderTopColor: 'rgb(99, 102, 241)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                </div>
            )}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .avatar-3d-container model-viewer {
                    --poster-color: transparent;
                }
            `}</style>
        </div>
    );
};

export default Avatar3D;

