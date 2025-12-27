import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { weeklyPerformanceAPI } from '../services/api';

const days = [
    { key: 'mon', label: 'Pzt' },
    { key: 'tue', label: 'Sal' },
    { key: 'wed', label: 'Car' },
    { key: 'thu', label: 'Per' },
    { key: 'fri', label: 'Cum' },
    { key: 'sat', label: 'Cmt' },
    { key: 'sun', label: 'Paz' }
];

const clampScore = (val) => {
    // Boş string veya boş değer = aktif değil (null)
    if (val === '' || val === null || val === undefined) return null;
    const num = parseFloat(val);
    if (Number.isNaN(num)) return null;
    return Math.min(10, Math.max(0, Math.round(num * 2) / 2));
};

const WeeklyPerformance = () => {
    const [scores, setScores] = useState([null, null, null, null, null, null, null]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const canvasRef = useRef(null);
    const saveTimeoutRef = useRef(null);

    // Backend'den verileri çek
    useEffect(() => {
        const fetchPerformance = async () => {
            try {
                const data = await weeklyPerformanceAPI.get();
                if (data.scores) {
                    setScores(data.scores);
                }
            } catch (error) {
                console.error('Weekly performance fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPerformance();
    }, []);

    // Skorları backend'e kaydet (debounced)
    const saveScores = useCallback(async (newScores) => {
        setSaving(true);
        try {
            await weeklyPerformanceAPI.update(newScores);
        } catch (error) {
            console.error('Weekly performance save error:', error);
        } finally {
            setSaving(false);
        }
    }, []);

    const stats = useMemo(() => {
        const valid = scores.filter((s) => s !== null && s !== undefined);
        const avg = valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
        const bestVal = valid.length ? Math.max(...valid) : null;
        const bestIndex = bestVal !== null ? scores.findIndex((s) => s === bestVal) : -1;
        let mood = 'Iyi basladin! Devam et 🌟';
        if (valid.length === 7) {
            if (avg >= 8) mood = 'Muhtesem bir hafta! 🚀';
            else if (avg >= 6) mood = 'Istikrar guzel, boyle devam 🌱';
            else mood = 'Gelecek hafta daha iyi olacak 💪';
        } else if (valid.length >= 4) {
            mood = 'Guzel gidiyorsun! Haftayi tamamla 🌈';
        }
        return {
            avg: avg.toFixed(1),
            active: valid.length,
            best: bestIndex >= 0 ? days[bestIndex].label : '-',
            mood
        };
    }, [scores]);

    const handleChange = (index, value) => {
        const next = [...scores];
        const safe = clampScore(value);
        next[index] = safe;
        setScores(next);

        // Debounce: 500ms sonra backend'e kaydet
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            saveScores(next);
        }, 500);
    };

    // Component unmount olduğunda timeout'u temizle
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        ctx.clearRect(0, 0, width, height);

        const padding = 50;
        const chartW = width - padding * 2;
        const chartH = height - padding * 2;

        // guides
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        for (let i = 0; i <= 5; i += 1) {
            const y = padding + (chartH / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        const points = scores.map((val, idx) => {
            const x = padding + (chartW / 6) * idx;
            const y = val !== null ? (height - padding) - (val / 10) * chartH : null;
            return { x, y, val };
        });

        // gradient fill
        if (points.some((p) => p.y !== null)) {
            ctx.beginPath();
            let started = false;
            points.forEach((p, idx) => {
                if (p.y !== null) {
                    if (!started) {
                        ctx.moveTo(p.x, height - padding);
                        ctx.lineTo(p.x, p.y);
                        started = true;
                    } else {
                        ctx.lineTo(p.x, p.y);
                    }
                }
            });
            const last = [...points].reverse().find((p) => p.y !== null);
            if (last) {
                ctx.lineTo(last.x, height - padding);
            }
            const fill = ctx.createLinearGradient(0, padding, 0, height - padding);
            fill.addColorStop(0, 'rgba(139, 92, 246, 0.25)');
            fill.addColorStop(1, 'rgba(236, 72, 153, 0.08)');
            ctx.fillStyle = fill;
            ctx.fill();
        }

        // line
        const lg = ctx.createLinearGradient(padding, 0, width - padding, 0);
        lg.addColorStop(0, '#8b5cf6');
        lg.addColorStop(0.5, '#a78bfa');
        lg.addColorStop(1, '#ec4899');
        ctx.strokeStyle = lg;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        let started = false;
        points.forEach((p) => {
            if (p.y !== null) {
                if (!started) {
                    ctx.moveTo(p.x, p.y);
                    started = true;
                } else {
                    ctx.lineTo(p.x, p.y);
                }
            }
        });
        ctx.stroke();

        // points
        points.forEach((p) => {
            if (p.y !== null) {
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
                ctx.fill();

                const pg = ctx.createRadialGradient(p.x - 2, p.y - 2, 0, p.x, p.y, 10);
                pg.addColorStop(0, '#c4b5fd');
                pg.addColorStop(1, '#8b5cf6');
                ctx.fillStyle = pg;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // x labels
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 13px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        points.forEach((p, idx) => {
            ctx.fillText(days[idx].label, p.x, height - padding + 12);
        });
    }, [scores]);

    if (loading) {
        return (
            <div className="dashboard-card weekly-card">
                <div className="weekly-header">
                    <div className="weekly-kicker">
                        <img src="/uniplan-logo.png" alt="UniPlan" style={{ height: '45px', objectFit: 'contain' }} />
                    </div>
                    <div className="weekly-title">Haftalik Performans</div>
                    <div className="weekly-subtitle">Yukleniyor...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-card weekly-card">
            <div className="weekly-header">
                <div className="weekly-kicker">
                    <img src="/uniplan-logo.png" alt="UniPlan" style={{ height: '45px', objectFit: 'contain' }} />
                    {saving && <span style={{ fontSize: '10px', opacity: 0.7, marginLeft: '8px' }}>(kaydediliyor...)</span>}
                </div>
                <div className="weekly-title">Haftalik Performans</div>
                <div className="weekly-subtitle">Pazartesi - Pazar</div>
            </div>

            <div className="weekly-chart">
                <canvas ref={canvasRef} className="weekly-canvas" />
            </div>

            <div className="weekly-inputs">
                {days.map((day, idx) => (
                    <div key={day.key} className="weekly-input">
                        <div className="weekly-day">{day.label}</div>
                        <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.5"
                            value={scores[idx] ?? ''}
                            onChange={(e) => handleChange(idx, e.target.value)}
                            className="weekly-score"
                            placeholder="--"
                        />
                    </div>
                ))}
            </div>

            <div className="weekly-motivation">{stats.mood}</div>

            <div className="weekly-stats">
                <div className="weekly-stat">
                    <div className="weekly-stat-icon">📈</div>
                    <div className="weekly-stat-value">{stats.avg}</div>
                    <div className="weekly-stat-label">Ortalama</div>
                </div>
                <div className="weekly-stat">
                    <div className="weekly-stat-icon">🔥</div>
                    <div className="weekly-stat-value">{stats.active}</div>
                    <div className="weekly-stat-label">Aktif Gun</div>
                </div>
                <div className="weekly-stat">
                    <div className="weekly-stat-icon">⭐</div>
                    <div className="weekly-stat-value">{stats.best}</div>
                    <div className="weekly-stat-label">En Iyi Gun</div>
                </div>
            </div>
        </div>
    );
};

export default WeeklyPerformance;
