import React, { useState } from 'react';

const moods = [
    {
        key: 'energetic',
        title: 'Enerjik',
        description: 'Harika bir enerji ve motivasyon!',
        emoji: '🌟',
        stars: 5,
        message: 'Harika enerji! Bugun cok verimli olacaksin!'
    },
    {
        key: 'normal',
        title: 'Normal',
        description: 'Dengeli ve sakin bir gun',
        emoji: '🌸',
        stars: 3,
        message: 'Dengeli bir gun seni bekliyor! Adim adim ilerle.'
    },
    {
        key: 'tired',
        title: 'Yorgun',
        description: 'Dinlenme ve bakim zamani',
        emoji: '😴',
        stars: 2,
        message: 'Biraz dinlenme zamani. Kendine iyi bak!'
    }
];

const TodayMoodWidget = () => {
    const [activeMood, setActiveMood] = useState(moods[0]);

    return (
        <div className="dashboard-card today-mood-card">
            <div className="today-mood-header">
                <div className="today-mood-title">Bugun Sen</div>
                <div className="today-mood-subtitle">Bugun nasil hissediyorsun?</div>
            </div>

            <div className="today-mood-grid">
                {moods.map((mood) => (
                    <button
                        key={mood.key}
                        className={`mood-tile mood-${mood.key} ${activeMood.key === mood.key ? 'active' : ''}`}
                        onClick={() => setActiveMood(mood)}
                        type="button"
                    >
                        <div className="mood-icon-wrap">
                            <span className="mood-emoji">{mood.emoji}</span>
                        </div>
                        <div className="mood-name">{mood.title}</div>
                        <div className="mood-desc">{mood.description}</div>
                        <div className="mood-stars">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <span key={i} className={`star ${i <= mood.stars ? 'filled' : ''}`}>⭐</span>
                            ))}
                        </div>
                    </button>
                ))}
            </div>

            <div className="today-mood-message">
                <span className="message-emoji">{activeMood.emoji}</span>
                <span className="message-text">{activeMood.message}</span>
            </div>
        </div>
    );
};

export default TodayMoodWidget;
