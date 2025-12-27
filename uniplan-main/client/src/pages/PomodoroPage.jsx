import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Maximize2, Minimize2, Settings, X } from 'lucide-react';
import PomodoroTimer from '../components/PomodoroTimer';
import PomodoroSettings from '../components/PomodoroSettings';
import '../styles/Pomodoro.css';

const PomodoroPage = () => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [duration, setDuration] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('work'); // 'work', 'break', 'longBreak'
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Settings
    const [workDuration, setWorkDuration] = useState(25);
    const [breakDuration, setBreakDuration] = useState(5);
    const [longBreakDuration, setLongBreakDuration] = useState(15);
    const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState(4);

    // Background & Theme
    const [bgColor, setBgColor] = useState('#1e40af');
    const [pattern, setPattern] = useState('none');
    const [wallpaper, setWallpaper] = useState('none');
    const [soundType, setSoundType] = useState('none');
    const [volume, setVolume] = useState(50);

    // İstatistikler
    const [completedSessions, setCompletedSessions] = useState(0);
    const [totalFocusSeconds, setTotalFocusSeconds] = useState(0);

    const timerRef = useRef(null);
    const audioRef = useRef(null);
    const audioContextRef = useRef(null);
    const gainNodeRef = useRef(null);
    const currentSoundRef = useRef(null);

    // Sound URLs map
    const soundUrls = useRef({
        rain: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg',
        jazz: '/sounds/jazz.mp3',
        classical: '/sounds/classical.mp3',
        piano: '/sounds/piano.mp3',
        instrumental: '/sounds/instrumental.mp3',
        cafe: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
        lofi: '/sounds/lofi.mp3',
        guitar: '/sounds/guitar.mp3'
    });

    const stopSound = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
    }, []);



    const handleTimerComplete = useCallback(() => {
        setIsActive(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        setCompletedSessions((prev) => {
            const newCompletedSessions = prev + 1;

            if (mode === 'work') {
                setTotalFocusSeconds((current) => current + duration);

                // Uzun mola kontrolü
                if (newCompletedSessions % sessionsBeforeLongBreak === 0) {
                    setMode('longBreak');
                    setTimeLeft(longBreakDuration * 60);
                    setDuration(longBreakDuration * 60);
                } else {
                    setMode('break');
                    setTimeLeft(breakDuration * 60);
                    setDuration(breakDuration * 60);
                }
            } else {
                setMode('work');
                setTimeLeft(workDuration * 60);
                setDuration(workDuration * 60);
            }

            return newCompletedSessions;
        });

        // Bildirim göster
        const currentMode = mode;
        const message = currentMode === 'work'
            ? 'Harika İş! Mola Zamanı 🎉'
            : 'Mola Bitti! Çalışmaya Başla 💪';
        console.log(message);
        if (window.Notification && Notification.permission === 'granted') {
            new Notification('Pomodoro', { body: message });
        }
    }, [mode, duration, sessionsBeforeLongBreak, longBreakDuration, breakDuration, workDuration]);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setIsActive(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isActive, timeLeft]);

    useEffect(() => {
        if (timeLeft === 0 && !isActive) {
            handleTimerComplete();
        }
    }, [timeLeft, isActive, handleTimerComplete]);

    const volumeRef = useRef(volume);

    useEffect(() => {
        volumeRef.current = volume;
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
        }
    }, [volume]);

    // Cleanup gainNodeRef if present (not used anymore but for cleanliness)

    const playSound = useCallback((type) => {

        stopSound();
        if (type === 'none') return;

        const url = soundUrls.current[type];


        if (url) {
            try {
                const audio = new Audio(url);
                audio.loop = true;
                audio.volume = volumeRef.current / 100;



                const playPromise = audio.play();

                if (playPromise !== undefined) {
                    playPromise
                        .catch(error => {
                            console.error("Audio play failed:", error);
                        });
                }

                audioRef.current = audio;
            } catch (err) {
                console.error("Error creating Audio object:", err);
            }
        } else {

        }
    }, [stopSound]);

    useEffect(() => {

        if (soundType !== 'none') {
            playSound(soundType);
        } else {

            stopSound();
        }

        return () => {
            stopSound();
        };
    }, [soundType, playSound, stopSound]);

    const resetTimer = () => {
        setIsActive(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (mode === 'work') {
            setTimeLeft(workDuration * 60);
            setDuration(workDuration * 60);
        } else if (mode === 'break') {
            setTimeLeft(breakDuration * 60);
            setDuration(breakDuration * 60);
        } else {
            setTimeLeft(longBreakDuration * 60);
            setDuration(longBreakDuration * 60);
        }
    };

    const skipSession = () => {
        setIsActive(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (mode === 'work') {
            setCompletedSessions((prev) => {
                const newCompletedSessions = prev + 1;
                if (newCompletedSessions % sessionsBeforeLongBreak === 0) {
                    setMode('longBreak');
                    setTimeLeft(longBreakDuration * 60);
                    setDuration(longBreakDuration * 60);
                } else {
                    setMode('break');
                    setTimeLeft(breakDuration * 60);
                    setDuration(breakDuration * 60);
                }
                return newCompletedSessions;
            });
        } else {
            setMode('work');
            setTimeLeft(workDuration * 60);
            setDuration(workDuration * 60);
        }
    };


    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const updateSettings = (key, value) => {
        switch (key) {
            case 'workDuration':
                setWorkDuration(value);
                if (mode === 'work' && !isActive) {
                    setTimeLeft(value * 60);
                    setDuration(value * 60);
                }
                break;
            case 'breakDuration':
                setBreakDuration(value);
                if (mode === 'break' && !isActive) {
                    setTimeLeft(value * 60);
                    setDuration(value * 60);
                }
                break;
            case 'longBreakDuration':
                setLongBreakDuration(value);
                if (mode === 'longBreak' && !isActive) {
                    setTimeLeft(value * 60);
                    setDuration(value * 60);
                }
                break;
            case 'sessionsBeforeLongBreak':
                setSessionsBeforeLongBreak(value);
                break;
            case 'bgColor':
                setBgColor(value);
                setWallpaper('none');
                break;
            case 'pattern':
                setPattern(value);
                setWallpaper('none');
                break;
            case 'wallpaper':
                setWallpaper(value);
                setPattern('none');
                break;
            case 'soundType':
                setSoundType(value);
                break;
            case 'volume':
                setVolume(value);
                if (gainNodeRef.current) {
                    gainNodeRef.current.gain.value = value / 100;
                }
                break;
        }
    };

    const totalFocusMinutes = Math.round(totalFocusSeconds / 60);

    const containerStyle = {
        '--pomodoro-bg-color': bgColor,
    };

    return (
        <div
            className={`pomodoro-container ${isFullscreen ? 'fullscreen' : ''}`}
            style={containerStyle}
            data-pattern={pattern}
            data-wallpaper={wallpaper}
        >
            <div className="pomodoro-background-layer" />
            <div className="pomodoro-pattern-layer" />
            <div className="pomodoro-gradient-overlay" />
            <div className="pomodoro-floating-shapes">
                <div className="shape" />
                <div className="shape" />
                <div className="shape" />
            </div>

            {!isFullscreen && (
                <div className="pomodoro-top-controls">
                    <button className="fullscreen-toggle" onClick={() => setShowSettings(!showSettings)}>
                        <Settings size={18} />
                        <span>Ayarlar</span>
                    </button>
                    <button className="fullscreen-toggle" onClick={toggleFullscreen}>
                        <Maximize2 size={18} />
                        <span>Tam Ekran</span>
                    </button>
                </div>
            )}

            {isFullscreen && (
                <div className="pomodoro-bottom-controls">
                    <button className="pomodoro-icon-btn" onClick={() => setShowSettings(!showSettings)}>
                        <Settings size={20} />
                    </button>
                    <button className="pomodoro-icon-btn" onClick={toggleFullscreen}>
                        <Minimize2 size={20} />
                    </button>
                </div>
            )}

            <div className="pomodoro-app-container">
                <div className="pomodoro-glass-card">
                    <PomodoroTimer
                        timeLeft={timeLeft}
                        duration={duration}
                        isActive={isActive}
                        mode={mode}
                        completedSessions={completedSessions}
                        sessionsBeforeLongBreak={sessionsBeforeLongBreak}
                        onStart={() => setIsActive(true)}
                        onPause={() => setIsActive(false)}
                        onReset={resetTimer}
                        onSkip={skipSession}
                    />

                    {!isFullscreen && (
                        <div className="pomodoro-stats-row">
                            <div className="pomodoro-stat-card">
                                <div className="stat-icon focus">
                                    <span>🎯</span>
                                </div>
                                <div>
                                    <div className="stat-label">Tamamlanan</div>
                                    <div className="stat-value">
                                        {completedSessions} / {sessionsBeforeLongBreak}
                                    </div>
                                </div>
                            </div>
                            <div className="pomodoro-stat-card">
                                <div className="stat-icon time">
                                    <span>⏱️</span>
                                </div>
                                <div>
                                    <div className="stat-label">Toplam Odak</div>
                                    <div className="stat-value">
                                        {totalFocusMinutes}
                                        <span className="stat-unit"> dk</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <PomodoroSettings
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                workDuration={workDuration}
                breakDuration={breakDuration}
                longBreakDuration={longBreakDuration}
                sessionsBeforeLongBreak={sessionsBeforeLongBreak}
                bgColor={bgColor}
                pattern={pattern}
                wallpaper={wallpaper}
                soundType={soundType}
                volume={volume}
                onUpdateSettings={updateSettings}
            />
        </div>
    );
};

export default PomodoroPage;
