import React from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import '../styles/Pomodoro.css';

const PomodoroTimer = ({
    timeLeft,
    duration,
    isActive,
    mode,
    completedSessions,
    sessionsBeforeLongBreak,
    onStart,
    onPause,
    onReset,
    onSkip
}) => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    // Calculate stroke dashoffset for progress
    const radius = 180;
    const circumference = 2 * Math.PI * radius;
    const progress = timeLeft / duration;
    const dashoffset = circumference - (progress * circumference);

    const getModeLabel = () => {
        switch (mode) {
            case 'work':
                return 'Çalışma Zamanı';
            case 'break':
                return 'Kısa Mola';
            case 'longBreak':
                return 'Uzun Mola';
            default:
                return 'Odaklan';
        }
    };

    const getModeText = () => {
        switch (mode) {
            case 'work':
                return 'Odaklan';
            case 'break':
                return 'Dinlen';
            case 'longBreak':
                return 'Rahatla';
            default:
                return 'Odaklan';
        }
    };

    return (
        <div className="pomodoro-timer-root">
            <header className="pomodoro-timer-header">
                <h1 className="pomodoro-app-title">Pomodoro Zamanlayıcı</h1>
                <div className="pomodoro-status-badge">
                    {getModeLabel()}
                </div>
            </header>

            <div className="pomodoro-timer-wrapper">
                <svg className="pomodoro-progress-ring" viewBox="0 0 400 400">
                    <circle
                        className="pomodoro-progress-ring-circle"
                        cx="200"
                        cy="200"
                        r={radius}
                    />
                    <circle
                        className="pomodoro-progress-ring-progress"
                        cx="200"
                        cy="200"
                        r={radius}
                        strokeDasharray={circumference}
                        strokeDashoffset={dashoffset}
                        style={{
                            stroke: mode === 'work'
                                ? 'rgba(255, 255, 255, 0.9)'
                                : mode === 'break'
                                    ? 'rgba(16, 185, 129, 0.9)'
                                    : 'rgba(59, 130, 246, 0.9)'
                        }}
                    />
                </svg>
                <div className={`pomodoro-timer-circle ${isActive ? 'active' : ''}`}>
                    <div className="pomodoro-timer-display">
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </div>
                    <div className="pomodoro-timer-label">
                        {getModeText()}
                    </div>
                </div>
            </div>

            <div className="pomodoro-controls">
                <button className="pomodoro-control-btn" onClick={onReset}>
                    <RotateCcw size={20} />
                    Sıfırla
                </button>
                <button className="pomodoro-control-btn primary" onClick={isActive ? onPause : onStart}>
                    {isActive ? (
                        <>
                            <Pause size={24} />
                            Duraklat
                        </>
                    ) : (
                        <>
                            <Play size={24} />
                            Başlat
                        </>
                    )}
                </button>
                <button className="pomodoro-control-btn" onClick={onSkip}>
                    <SkipForward size={20} />
                    Atla
                </button>
            </div>

            <div className="pomodoro-session-info">
                <div className="pomodoro-session-counter">
                    🎯 {completedSessions} / {sessionsBeforeLongBreak} Tamamlandı
                </div>
            </div>
        </div>
    );
};

export default PomodoroTimer;
