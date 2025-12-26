import React, { useEffect, useState } from 'react';

const days = ['Pazar', 'Pazartesi', 'Sali', 'Carsamba', 'Persembe', 'Cuma', 'Cumartesi'];
const months = ['Ocak', 'Subat', 'Mart', 'Nisan', 'Mayis', 'Haziran', 'Temmuz', 'Agustos', 'Eylul', 'Ekim', 'Kasim', 'Aralik'];

const DigitalClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    const seconds = String(time.getSeconds()).padStart(2, '0');
    const dateStr = `${time.getDate()} ${months[time.getMonth()]} ${time.getFullYear()}`;
    const dayStr = days[time.getDay()];

    return (
        <div className="dashboard-card digital-clock-card">
            <div className="clock-title">Dijital Saat</div>
            <div className="clock-time">
                <div className="clock-segment">{hours}</div>
                <div className="clock-separator">:</div>
                <div className="clock-segment">{minutes}</div>
                <div className="clock-separator">:</div>
                <div className="clock-segment">{seconds}</div>
            </div>
            <div className="clock-date">{dateStr}</div>
            <div className="clock-day">{dayStr}</div>
        </div>
    );
};

export default DigitalClock;
