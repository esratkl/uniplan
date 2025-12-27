import React from 'react';

const ProgressRing = ({ percent = 72, label = 'Basari', encouragement = 'Harika gidiyorsun!', title = 'UniPlan' }) => {
    const radius = 110;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <div className="dashboard-card progress-ring-card">
            <div className="progress-ring-header">
                <div className="progress-ring-logo">
                    ✨ <img src="/uniplan-logo.png" alt="UniPlan" style={{ height: '40px', objectFit: 'contain', verticalAlign: 'middle' }} />
                </div>
                <div className="progress-ring-subtitle">Gunluk Ilerleme Takibi</div>
            </div>

            <div className="progress-ring-wrapper">
                <svg className="progress-ring-svg" viewBox="0 0 240 240">
                    <defs>
                        <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#b794f6" />
                            <stop offset="40%" stopColor="#f687b3" />
                            <stop offset="75%" stopColor="#fb923c" />
                            <stop offset="100%" stopColor="#fbbf24" />
                        </linearGradient>
                    </defs>
                    <circle className="progress-ring-bg" cx="120" cy="120" r={radius} />
                    <circle
                        className="progress-ring-progress"
                        cx="120"
                        cy="120"
                        r={radius}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                    />
                </svg>

                <div className="progress-ring-center">
                    <div className="progress-ring-percentage">{percent}%</div>
                    <div className="progress-ring-icon">🔥</div>
                    <div className="progress-ring-label">{label}</div>
                </div>
            </div>

            <div className="progress-ring-encouragement">🎉 {encouragement}</div>
        </div>
    );
};

export default ProgressRing;
