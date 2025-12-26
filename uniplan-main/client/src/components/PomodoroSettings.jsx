import React from 'react';
import { X } from 'lucide-react';
import '../styles/Pomodoro.css';

const PomodoroSettings = ({
    isOpen,
    onClose,
    workDuration,
    breakDuration,
    longBreakDuration,
    sessionsBeforeLongBreak,
    bgColor,
    pattern,
    wallpaper,
    soundType,
    volume,
    onUpdateSettings
}) => {
    const themes = {
        ocean: '#1e40af',
        sunset: '#c2410c',
        forest: '#15803d',
        purple: '#7e22ce',
        rose: '#be123c',
        cyan: '#0e7490',
        emerald: '#047857',
        amber: '#d97706'
    };

    const patterns = [
        { id: 'none', label: 'Yok', style: { background: '#e5e7eb' } },
        { id: 'dots', label: 'Noktalar', style: { backgroundImage: 'radial-gradient(circle, #000 2px, transparent 2px)', backgroundSize: '20px 20px', backgroundColor: '#e5e7eb' } },
        { id: 'grid', label: 'Izgara', style: { backgroundImage: 'linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)', backgroundSize: '20px 20px', backgroundColor: '#e5e7eb' } },
        { id: 'diagonal', label: 'Çapraz', style: { backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, #000 8px, #000 10px)', backgroundColor: '#e5e7eb' } },
        { id: 'zigzag', label: 'Zigzag', style: { background: 'linear-gradient(135deg, #000 25%, transparent 25%), linear-gradient(225deg, #000 25%, transparent 25%), linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(315deg, #000 25%, #e5e7eb 25%)', backgroundSize: '20px 20px' } },
        { id: 'hexagon', label: 'Altıgen', style: { backgroundImage: 'radial-gradient(circle at 15px 15px, #000 3px, transparent 3px)', backgroundSize: '30px 30px', backgroundColor: '#e5e7eb' } },
        { id: 'cross', label: 'Artı', style: { backgroundImage: 'linear-gradient(#000 3px, transparent 3px), linear-gradient(90deg, #000 3px, transparent 3px)', backgroundSize: '25px 25px', backgroundPosition: 'center center', backgroundColor: '#e5e7eb' } },
        { id: 'circles', label: 'Halkalar', style: { backgroundImage: 'radial-gradient(circle, transparent 6px, #000 6px, #000 8px, transparent 8px)', backgroundSize: '25px 25px', backgroundColor: '#e5e7eb' } },
        { id: 'triangles', label: 'Üçgenler', style: { backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(-45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '20px 20px', backgroundColor: '#e5e7eb' } },
        { id: 'stripes', label: 'Çizgiler', style: { backgroundImage: 'repeating-linear-gradient(90deg, #000, #000 3px, transparent 3px, transparent 15px)', backgroundColor: '#e5e7eb' } },
        { id: 'checkers', label: 'Dama', style: { backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px', backgroundColor: '#e5e7eb' } },
        { id: 'waves', label: 'Dalgalar', style: { backgroundImage: 'repeating-radial-gradient(circle at 0 0, transparent 0, #e5e7eb 10px), repeating-linear-gradient(#000, #000)', backgroundColor: '#e5e7eb', opacity: 0.8 } }
    ];

    const wallpapers = [
        { id: 'bubbles', label: 'Baloncuklar' },
        { id: 'gradient-mesh', label: 'Gradient Mesh' },
        { id: 'stars', label: 'Yıldızlar' },
        { id: 'geometric-shapes', label: 'Şekiller' },
        { id: 'aurora', label: 'Aurora' },
        { id: 'mountains', label: 'Dağlar' },
        { id: 'abstract-waves', label: 'Soyut Dalga' },
        { id: 'particles', label: 'Parçacıklar' }
    ];

    const sounds = [
        { id: 'none', icon: '🔇', label: 'Sessiz' },
        { id: 'rain', icon: '🌧️', label: 'Yağmur' },
        { id: 'waves', icon: '🌊', label: 'Dalga' },
        { id: 'forest', icon: '🌲', label: 'Orman' },
        { id: 'library', icon: '📚', label: 'Kütüphane' },
        { id: 'fireplace', icon: '🔥', label: 'Şömine' },
        { id: 'cafe', icon: '☕', label: 'Kafe' },
        { id: 'thunder', icon: '⛈️', label: 'Gök Gürültüsü' },
        { id: 'wind', icon: '💨', label: 'Rüzgar' }
    ];

    if (!isOpen) return null;

    return (
        <div className={`pomodoro-settings-panel ${isOpen ? 'active' : ''}`}>
            <div className="pomodoro-panel-header">
                <h2 className="pomodoro-panel-title">⚙️ Ayarlar</h2>
                <button className="pomodoro-close-btn" onClick={onClose} aria-label="Kapat">
                    <X size={24} />
                </button>
            </div>

            <div className="pomodoro-setting-group">
                <label className="pomodoro-setting-label" htmlFor="workDuration">
                    ⏱️ Çalışma Süresi (dakika)
                </label>
                <input
                    type="number"
                    id="workDuration"
                    className="pomodoro-setting-input"
                    min="1"
                    max="60"
                    value={workDuration}
                    onChange={(e) => onUpdateSettings('workDuration', parseInt(e.target.value))}
                />
            </div>

            <div className="pomodoro-setting-group">
                <label className="pomodoro-setting-label" htmlFor="breakDuration">
                    ☕ Kısa Mola Süresi (dakika)
                </label>
                <input
                    type="number"
                    id="breakDuration"
                    className="pomodoro-setting-input"
                    min="1"
                    max="30"
                    value={breakDuration}
                    onChange={(e) => onUpdateSettings('breakDuration', parseInt(e.target.value))}
                />
            </div>

            <div className="pomodoro-setting-group">
                <label className="pomodoro-setting-label" htmlFor="longBreakDuration">
                    🌴 Uzun Mola Süresi (dakika)
                </label>
                <input
                    type="number"
                    id="longBreakDuration"
                    className="pomodoro-setting-input"
                    min="1"
                    max="60"
                    value={longBreakDuration}
                    onChange={(e) => onUpdateSettings('longBreakDuration', parseInt(e.target.value))}
                />
            </div>

            <div className="pomodoro-setting-group">
                <label className="pomodoro-setting-label" htmlFor="sessionsBeforeLongBreak">
                    🔄 Uzun Mola İçin Gerekli Oturum
                </label>
                <input
                    type="number"
                    id="sessionsBeforeLongBreak"
                    className="pomodoro-setting-input"
                    min="1"
                    max="10"
                    value={sessionsBeforeLongBreak}
                    onChange={(e) => onUpdateSettings('sessionsBeforeLongBreak', parseInt(e.target.value))}
                />
            </div>

            <div className="pomodoro-setting-group">
                <label className="pomodoro-setting-label" htmlFor="bgColor">
                    🎨 RGB Renk Seçici
                </label>
                <div className="pomodoro-color-picker-wrapper">
                    <input
                        type="color"
                        id="bgColor"
                        className="pomodoro-color-picker-input"
                        value={bgColor}
                        onChange={(e) => onUpdateSettings('bgColor', e.target.value)}
                    />
                    <div className="pomodoro-color-preview" style={{ background: bgColor }} />
                </div>
            </div>

            <div className="pomodoro-setting-group">
                <label className="pomodoro-setting-label">🌟 Hızlı Tema Seçimi</label>
                <div className="pomodoro-theme-grid">
                    {Object.entries(themes).map(([key, color]) => (
                        <div
                            key={key}
                            className={`pomodoro-theme-option ${bgColor === color ? 'active' : ''}`}
                            style={{ background: `linear-gradient(135deg, ${color}, ${adjustColorBrightness(color, 20)})` }}
                            onClick={() => onUpdateSettings('bgColor', color)}
                            title={key.charAt(0).toUpperCase() + key.slice(1)}
                        />
                    ))}
                </div>
            </div>

            <div className="pomodoro-setting-group">
                <label className="pomodoro-setting-label">🔲 Geometrik Desenler</label>
                <div className="pomodoro-pattern-grid">
                    {patterns.map((p) => (
                        <div
                            key={p.id}
                            className={`pomodoro-pattern-option ${pattern === p.id ? 'active' : ''}`}
                            style={p.style}
                            onClick={() => onUpdateSettings('pattern', p.id)}
                        >
                            <span className="pomodoro-pattern-label">{p.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pomodoro-setting-group">
                <label className="pomodoro-setting-label">🎨 Özel Tasarım Duvar Kağıtları</label>
                <div className="pomodoro-wallpaper-grid">
                    {wallpapers.map((w) => (
                        <div
                            key={w.id}
                            className={`pomodoro-wallpaper-option ${wallpaper === w.id ? 'active' : ''}`}
                            data-wallpaper={w.id}
                            onClick={() => onUpdateSettings('wallpaper', w.id)}
                        >
                            <span className="pomodoro-wallpaper-label">{w.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pomodoro-setting-group">
                <label className="pomodoro-setting-label">🔊 Ortam Sesleri</label>
                <div className="pomodoro-sound-grid">
                    {sounds.map((s) => (
                        <div
                            key={s.id}
                            className={`pomodoro-sound-option ${soundType === s.id ? 'active' : ''}`}
                            onClick={() => onUpdateSettings('soundType', s.id)}
                        >
                            <div className="pomodoro-sound-icon">{s.icon}</div>
                            <span className="pomodoro-sound-label">{s.label}</span>
                        </div>
                    ))}
                </div>
                <div className="pomodoro-volume-control">
                    <label className="pomodoro-volume-label" htmlFor="volumeSlider">
                        Ses Seviyesi: <span id="volumeValue">{volume}</span>%
                    </label>
                    <input
                        type="range"
                        id="volumeSlider"
                        className="pomodoro-volume-slider"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => onUpdateSettings('volume', parseInt(e.target.value))}
                    />
                </div>
            </div>
        </div>
    );
};

const adjustColorBrightness = (color, percent) => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255))
        .toString(16).slice(1);
};

export default PomodoroSettings;
