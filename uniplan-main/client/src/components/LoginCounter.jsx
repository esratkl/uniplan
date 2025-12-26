import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginCounter = ({ variant = 'card' }) => {
    const { user } = useAuth();
    const [count, setCount] = useState(0);

    useEffect(() => {
        const userKey = user?.id || 'guest';
        const storageKey = `loginCount_${userKey}`;
        const sessionKey = `loginCount_incremented_${userKey}`;

        // Only increment once per session load
        if (!sessionStorage.getItem(sessionKey)) {
            const current = parseInt(localStorage.getItem(storageKey) || '0', 10);
            const next = Number.isFinite(current) ? current + 1 : 1;
            localStorage.setItem(storageKey, String(next));
            sessionStorage.setItem(sessionKey, 'true');
            setCount(next);
        } else {
            const current = parseInt(localStorage.getItem(storageKey) || '0', 10);
            setCount(Number.isFinite(current) ? current : 0);
        }
    }, [user]);

    // Compact variant - dijital saatin yanında gösterilecek
    if (variant === 'compact') {
        return (
            <div className="login-counter-compact">
                <div className="login-counter-compact-header">
                    <span className="login-counter-compact-flame">🔥</span>
                    <span className="login-counter-compact-title">Giris Sayaci</span>
                </div>
                <div className="login-counter-compact-number">{count}</div>
                <div className="login-counter-compact-label">gun</div>
            </div>
        );
    }

    return (
        <div className={`dashboard-card login-counter-card ${variant === 'circle' ? 'login-counter-circle' : ''}`}>
            <div className="login-counter-title">Giris Sayaci</div>
            <div className="login-counter-flame">🔥</div>
            <div className="login-counter-number">{count}</div>
            <div className="login-counter-label">Toplam Giris</div>
        </div>
    );
};

export default LoginCounter;
