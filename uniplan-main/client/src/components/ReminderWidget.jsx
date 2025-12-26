import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, X, GripHorizontal } from 'lucide-react';

const ReminderWidget = () => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <motion.div
            className="reminder-widget"
            drag
            dragMomentum={false}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="reminder-header">
                <div className="reminder-title">
                    <Bell size={16} color="var(--color-secondary)" />
                    <span>Hatırlatıcılar</span>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <GripHorizontal size={16} style={{ cursor: 'grab', opacity: 0.5 }} />
                    <X
                        size={16}
                        style={{ cursor: 'pointer', opacity: 0.5 }}
                        onClick={() => setIsVisible(false)}
                    />
                </div>
            </div>
            <div className="reminder-content">
                <div className="reminder-item">
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div>
                    <div style={{ flex: 1 }}>Proje Teslimi</div>
                    <span className="reminder-time">14:00</span>
                </div>
                <div className="reminder-item">
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></div>
                    <div style={{ flex: 1 }}>Dişçi Randevusu</div>
                    <span className="reminder-time">16:30</span>
                </div>
                <div className="reminder-item">
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                    <div style={{ flex: 1 }}>Alışveriş</div>
                    <span className="reminder-time">18:00</span>
                </div>
            </div>
        </motion.div>
    );
};

export default ReminderWidget;
