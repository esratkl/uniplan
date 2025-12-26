import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    CheckSquare,
    Timer,
    MessageSquare,
    Users,
    User,
    Settings,
    ChevronLeft,
    ChevronRight,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Ana Sayfa', path: '/dashboard' },
        { icon: Calendar, label: 'Takvim', path: '/dashboard/calendar' },
        { icon: CheckSquare, label: 'Görevler', path: '/dashboard/todo' },
        { icon: Timer, label: 'Pomodoro', path: '/dashboard/pomodoro' },
        { icon: MessageSquare, label: 'Sohbetler', path: '/dashboard/chat' },
        { icon: Users, label: 'Gruplar', path: '/dashboard/groups' },
        { icon: User, label: 'Profil', path: '/dashboard/profile' },
        { icon: Settings, label: 'Ayarlar', path: '/dashboard/settings' },
    ];

    return (
        <motion.div
            className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}
            initial={false}
            animate={{ width: isCollapsed ? 80 : 260 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className="sidebar-header">
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.div
                            className="logo-container"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="logo-icon">
                                <Zap size={24} color="white" fill="white" />
                            </div>
                            <span className="logo-text">UniPlan</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    className="toggle-btn"
                    onClick={toggleSidebar}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </motion.div>
            </div>

            <nav className="nav-links">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        end={item.path === '/dashboard'}
                    >
                        <item.icon size={20} />
                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "auto" }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
                                >
                                    {item.label}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </NavLink>
                ))}
            </nav>
        </motion.div>
    );
};

export default Sidebar;
