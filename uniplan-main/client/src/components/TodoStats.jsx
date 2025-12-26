import React from 'react';
import '../styles/Todo.css';

const TodoStats = ({ total, completed }) => {
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    const incomplete = total - completed;

    return (
        <div className="stats-card">
            <div className="donut-chart-container">
                <div
                    className="donut-chart"
                    style={{
                        background: `conic-gradient(var(--color-primary) ${percentage}%, rgba(255, 255, 255, 0.05) ${percentage}% 100%)`
                    }}
                ></div>
                <div className="chart-text">
                    <div className="chart-percent">%{percentage}</div>
                    <div className="chart-label">Tamamlandı</div>
                </div>
            </div>

            <div className="stats-details">
                <div className="stat-item">
                    <div className="stat-value">{completed}</div>
                    <div className="stat-name">Biten</div>
                </div>
                <div className="stat-item">
                    <div className="stat-value">{incomplete}</div>
                    <div className="stat-name">Kalan</div>
                </div>
            </div>
        </div>
    );
};

export default TodoStats;
