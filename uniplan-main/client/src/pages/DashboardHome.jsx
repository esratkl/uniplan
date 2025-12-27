import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle,
    Calendar,
    Clock,
    Target,
    Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VisionBoardWidget from '../components/VisionBoardWidget';
import ProgressRing from '../components/ProgressRing';
import TodayMoodWidget from '../components/TodayMoodWidget';
import LoginCounter from '../components/LoginCounter';
import DigitalClock from '../components/DigitalClock';

import WeeklyPerformance from '../components/WeeklyPerformance';
import { dashboardAPI } from '../services/api';

const DashboardHome = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [dashboardStats, setDashboardStats] = useState({
        pendingTodos: 0,
        todayEvents: 0,
        focusFormatted: '0dk',
        progressPercent: 0,
        weeklyScores: [null, null, null, null, null, null, null]
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const stats = await dashboardAPI.getStats();
                setDashboardStats(stats);
            } catch (error) {
                console.error('Dashboard stats fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100
            }
        }
    };

    const stats = [
        {
            title: 'Bekleyen Gorevler',
            value: loading ? '...' : String(dashboardStats.pendingTodos),
            label: 'Tamamlanacak',
            icon: <CheckCircle size={24} />,
            link: '/dashboard/todo',
            variant: 'pending'
        },
        {
            title: 'Bugunku Plan',
            value: loading ? '...' : String(dashboardStats.todayEvents),
            label: 'Etkinlik',
            icon: <Calendar size={24} />,
            link: '/dashboard/calendar',
            variant: 'today'
        },
        {
            title: 'Odaklanma Suresi',
            value: loading ? '...' : dashboardStats.focusFormatted,
            label: 'Bugun',
            icon: <Clock size={24} />,
            link: '/dashboard/pomodoro',
            variant: 'focus'
        },
    ];

    const displayName = user?.full_name || user?.name || user?.email?.split('@')[0] || 'Kullanici';

    return (
        <motion.div
            className="dashboard-home"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >


            <div className="dashboard-stack">
                {/* Welcome Section - En üstte */}
                <motion.div className="welcome-section welcome-centered" variants={itemVariants} style={{ marginBottom: '1rem' }}>
                    <div className="welcome-text">
                        <h1>Hos geldin, {displayName}!</h1>
                        <p>Bugun harika isler basarmaya hazir misin?</p>
                    </div>
                </motion.div>

                {/* Dijital Saat ve Giriş Sayacı - Yan yana */}
                <motion.div className="top-row clock-counter-row" variants={itemVariants}>
                    <motion.div variants={itemVariants} style={{ flex: 1 }}>
                        <DigitalClock />
                    </motion.div>
                    <motion.div variants={itemVariants} className="login-counter-side">
                        <LoginCounter variant="compact" />
                    </motion.div>
                </motion.div>

                <motion.div variants={itemVariants} style={{ margin: '0 auto 1.5rem', width: '100%', maxWidth: '1350px' }}>
                    <TodayMoodWidget />
                </motion.div>

                <motion.div
                    className="stats-grid"
                    variants={itemVariants}
                    style={{ width: '100%', margin: '0 auto 2.5rem', maxWidth: '1350px' }}
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            className={`stat-card widget widget-${stat.variant}`}
                            whileHover={{ y: -6, scale: 1.01 }}
                            onClick={() => navigate(stat.link)}
                        >
                            <div className="widget-content">
                                <div className="icon-container">
                                    {stat.icon}
                                </div>
                                <div className="widget-text-content">
                                    <h2 className="widget-title">{stat.title}</h2>
                                    <div className="widget-value">{stat.value}</div>
                                    <p className="widget-label">{stat.label}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            <div className="dashboard-main-grid">
                <motion.div className="dashboard-left-column" variants={itemVariants}>
                    <motion.div variants={itemVariants}>
                        <ProgressRing
                            percent={dashboardStats.progressPercent}
                            label="Basari"
                            encouragement={
                                dashboardStats.progressPercent >= 80 ? "Muhtesem gidiyorsun!" :
                                    dashboardStats.progressPercent >= 50 ? "Harika gidiyorsun!" :
                                        dashboardStats.progressPercent >= 25 ? "Devam et, yapabilirsin!" :
                                            "Hadi baslayalim!"
                            }
                        />
                    </motion.div>

                    <motion.div variants={itemVariants} style={{ marginTop: '1rem' }}>
                        <WeeklyPerformance />
                    </motion.div>
                </motion.div>

                <motion.div className="dashboard-right-column" variants={itemVariants}>
                    <VisionBoardWidget />
                    <motion.div className="dashboard-card daily-focus daily-focus-square" variants={itemVariants} style={{ marginTop: '1rem' }}>
                        <div className="focus-header">
                            <Target size={24} color="var(--color-primary)" />
                            <h3>Gunun Sozu</h3>
                        </div>
                        <blockquote className="quote-text">
                            "Basari, her gun tekrarlanan kucuk cabalarin toplamidir."
                        </blockquote>
                        <div className="quote-author">- Robert Collier</div>

                        <div className="focus-tip">
                            <strong>Ipucu:</strong> En zor gorevini gunun ilk saatlerinde tamamlamayi dene.
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default DashboardHome;
