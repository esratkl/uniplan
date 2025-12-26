import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import CalendarModal from '../components/CalendarModal';
import '../styles/Calendar.css';

const monthThemes = {
    0: { name: 'Ocak', theme: 'january', icon: '❄️', colors: { bg: '#4a5ccc', day: '#ffffff', weekend: '#93a8ff', text: '#ffffff' } },
    1: { name: 'Şubat', theme: 'february', icon: '💕', colors: { bg: '#e91e63', day: '#ffffff', weekend: '#ff6fa0', text: '#ffffff' } },
    2: { name: 'Mart', theme: 'march', icon: '🌸', colors: { bg: '#0288d1', day: '#ffffff', weekend: '#4fc3f7', text: '#ffffff' } },
    3: { name: 'Nisan', theme: 'april', icon: '🌷', colors: { bg: '#00897b', day: '#ffffff', weekend: '#4db6ac', text: '#ffffff' } },
    4: { name: 'Mayıs', theme: 'may', icon: '🌺', colors: { bg: '#d81b60', day: '#ffffff', weekend: '#f06292', text: '#ffffff' } },
    5: { name: 'Haziran', theme: 'june', icon: '☀️', colors: { bg: '#1976d2', day: '#ffffff', weekend: '#64b5f6', text: '#ffffff' } },
    6: { name: 'Temmuz', theme: 'july', icon: '🏖️', colors: { bg: '#f57c00', day: '#ffffff', weekend: '#ffb74d', text: '#ffffff' } },
    7: { name: 'Ağustos', theme: 'august', icon: '🌻', colors: { bg: '#fbc02d', day: '#ffffff', weekend: '#ff8f00', text: '#ffffff' } },
    8: { name: 'Eylül', theme: 'september', icon: '🍂', colors: { bg: '#8e24aa', day: '#ffffff', weekend: '#ba68c8', text: '#ffffff' } },
    9: { name: 'Ekim', theme: 'october', icon: '🎃', colors: { bg: '#d84315', day: '#ffffff', weekend: '#ff8a65', text: '#ffffff' } },
    10:{ name: 'Kasım', theme: 'november', icon: '🍁', colors: { bg: '#6d4c41', day: '#ffffff', weekend: '#a1887f', text: '#ffffff' } },
    11:{ name: 'Aralık', theme: 'december', icon: '🎄', colors: { bg: '#2e7d32', day: '#ffffff', weekend: '#c62828', text: '#ffffff' } }
};

const weekdayLabels = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

const CalendarPage = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [events, setEvents] = useState({}); // { "YYYY-MM-DD": { title, description, emoji } }

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sunday
    const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Monday start
    const theme = monthThemes[currentDate.getMonth()];
    const year = currentDate.getFullYear();

    const floatingIcons = useMemo(
        () =>
            Array.from({ length: 24 }, () => ({
                left: Math.random() * 100,
                top: Math.random() * 100,
                delay: Math.random() * 6,
                size: 34 + Math.random() * 36,
                rotate: Math.random() * 360
            })),
        [theme.theme]
    );

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDayClick = (day) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDate(dateStr);
        setIsModalOpen(true);
    };

    const handleSaveEvent = (date, data) => {
        setEvents((prev) => ({
            ...prev,
            [date]: data
        }));
    };

    const dayCells = useMemo(() => {
        const cells = [];

        for (let i = 0; i < startDay; i++) {
            cells.push(<div key={`empty-${i}`} className="day-cell placeholder" aria-hidden="true" />);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
            const event = events[dateStr];
            const dayOfWeek = (startDay + day - 1) % 7;
            const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Cmt / Paz

            cells.push(
                <motion.div
                    key={day}
                    className={`day-cell ${isToday ? 'today' : ''} ${isWeekend ? 'weekend' : ''}`}
                    onClick={() => handleDayClick(day)}
                    whileHover={{ scale: 1.05, rotate: 0.5 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: day * 0.01 }}
                >
                    <div className="day-cell-top">
                        <span className="day-number">{day}</span>
                        {event?.emoji && <span className="day-emoji">{event.emoji}</span>}
                    </div>
                    {event?.title && <div className="day-event">{event.title}</div>}
                    {event?.description && <div className="day-note">{event.description}</div>}
                </motion.div>
            );
        }

        return cells;
    }, [startDay, daysInMonth, currentDate, events]);

    return (
        <div
            className={`calendar-shell theme-${theme.theme}`}
            style={{
                '--calendar-accent': theme.colors.bg,
                '--calendar-weekend': theme.colors.weekend,
                '--calendar-day': theme.colors.day,
                '--calendar-contrast': theme.colors.text
            }}
        >
            <div className="calendar-floating-icons">
                {floatingIcons.map((icon, idx) => (
                    <span
                        key={idx}
                        className="background-icon floating"
                        style={{
                            left: `${icon.left}%`,
                            top: `${icon.top}%`,
                            animationDelay: `${icon.delay}s`,
                            fontSize: `${icon.size}px`,
                            transform: `rotate(${icon.rotate}deg)`
                        }}
                    >
                        {theme.icon}
                    </span>
                ))}
            </div>

            <div className="calendar-frame glass-panel">
            <div className="calendar-header">
                    <div>
                        <p className="calendar-kicker">
                            <Sparkles size={16} /> Aylık Takvim
                        </p>
                <h1 className="calendar-title">
                            {theme.icon} {theme.name} {year} {theme.icon}
                </h1>
                        <p className="calendar-subtitle">Planlarını renklendir, notlarını sakla.</p>
                    </div>

                    <div className="calendar-actions">
                        <button className="nav-btn hover:scale-110 hover:shadow-2xl transition-all duration-300" onClick={handlePrevMonth} aria-label="Önceki Ay">
                            <ChevronLeft size={22} />
                    </button>
                        <div className="month-pill">
                            {theme.name} {year}
                        </div>
                        <button className="nav-btn hover:scale-110 hover:shadow-2xl transition-all duration-300" onClick={handleNextMonth} aria-label="Sonraki Ay">
                            <ChevronRight size={22} />
                    </button>
                </div>
            </div>

            <div className="calendar-grid">
                    {weekdayLabels.map((day) => (
                        <div key={day} className="weekday-header">
                            {day}
                        </div>
                ))}
                    {dayCells}
                </div>
            </div>

            <CalendarModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                date={selectedDate}
                initialData={selectedDate ? events[selectedDate] : null}
                onSave={handleSaveEvent}
            />
        </div>
    );
};

export default CalendarPage;
