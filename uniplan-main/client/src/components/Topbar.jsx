import React, { useState, useEffect } from 'react';
import { MessageCircle, Bell, ChevronDown, LogOut, User, Settings, Sparkles, Calendar, CheckSquare, Clock, Search, Plus, Zap, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar3D from './avatar/Avatar3D';
import { directChatAPI } from '../services/api';
import '../styles/Avatar3D.css';

const Topbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();
    const { user, signOut } = useAuth();

    // localStorage'dan avatar URL'sini yükle
    useEffect(() => {
        const savedAvatarUrl = localStorage.getItem('userAvatarUrl');
        if (savedAvatarUrl) {
            setAvatarUrl(savedAvatarUrl);
        }

        // Storage event listener - diğer tab'lardan gelen değişiklikleri dinle
        const handleStorageChange = (e) => {
            if (e.key === 'userAvatarUrl') {
                setAvatarUrl(e.newValue);
            }
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Okunmamış mesaj sayısını ve bildirimleri çek
    useEffect(() => {
        const fetchUnreadMessages = async () => {
            try {
                const chats = await directChatAPI.getAll();
                const totalUnread = chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
                setUnreadMessages(totalUnread);

                // Son mesajlardan bildirim oluştur
                const recentNotifications = chats
                    .filter(chat => chat.unreadCount > 0)
                    .map((chat, index) => ({
                        id: `msg-${index}`,
                        title: 'Yeni mesaj',
                        message: `${chat.otherUser?.name || 'Birisi'} size mesaj gönderdi`,
                        time: 'Şimdi',
                        read: false,
                        type: 'message'
                    }));

                setNotifications(recentNotifications);
            } catch (error) {
                console.error('Unread messages fetch error:', error);
            }
        };

        if (user) {
            fetchUnreadMessages();
            // Her 30 saniyede bir güncelle
            const interval = setInterval(fetchUnreadMessages, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    const markAsRead = (id) => {
        setNotifications(notifications.map(notif =>
            notif.id === id ? { ...notif, read: true } : notif
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    };

    const clearAllNotifications = () => {
        setNotifications([]);
        setIsNotificationsOpen(false);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    // Kullanıcı adını ve baş harflerini al
    const displayName = user?.full_name || user?.name || user?.email?.split('@')[0] || 'Kullanıcı';
    const initials = displayName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="topbar">
            {/* Search Bar */}
            <motion.div
                className="topbar-search-container"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Search size={18} className="topbar-search-icon" />
                <input
                    type="text"
                    placeholder="Ara: Görevler, Etkinlikler, Notlar..."
                    className="topbar-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </motion.div>

            {/* Quick Action Buttons */}
            <div className="topbar-quick-actions">
                <motion.button
                    className="quick-action-btn quick-action-ai"
                    onClick={() => navigate('/dashboard')}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Sparkles size={16} />
                    <span>AI Asistan</span>
                </motion.button>

                <motion.button
                    className="quick-action-btn quick-action-stats"
                    onClick={() => navigate('/dashboard')}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <TrendingUp size={16} />
                    <span>İstatistikler</span>
                </motion.button>

                <motion.button
                    className="quick-action-btn quick-action-focus"
                    onClick={() => navigate('/dashboard/pomodoro')}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Zap size={16} />
                    <span>Odak Modu</span>
                </motion.button>
            </div>

            <div className="topbar-actions">
                <div className="icon-btn" onClick={() => navigate('/dashboard/chat')} style={{ cursor: 'pointer' }}>
                    <MessageCircle size={20} />
                    {unreadMessages > 0 && <div className="badge">{unreadMessages}</div>}
                </div>

                <div style={{ position: 'relative' }}>
                    <div className="icon-btn" onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} style={{ cursor: 'pointer' }}>
                        <Bell size={20} />
                        {unreadCount > 0 && <div className="badge">{unreadCount}</div>}
                    </div>

                    <AnimatePresence>
                        {isNotificationsOpen && (
                            <motion.div
                                className="notifications-dropdown"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.2 }}
                                style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 8px)',
                                    right: 0,
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-lg)',
                                    boxShadow: 'var(--shadow-xl)',
                                    minWidth: '360px',
                                    maxWidth: '400px',
                                    maxHeight: '500px',
                                    overflow: 'hidden',
                                    zIndex: 1000
                                }}
                            >
                                <div style={{
                                    padding: '1rem 1.25rem',
                                    borderBottom: '1px solid var(--border-color)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                                        Bildirimler
                                    </h3>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={markAllAsRead}
                                                style={{
                                                    fontSize: '0.75rem',
                                                    padding: '0.25rem 0.75rem',
                                                    background: 'var(--color-primary)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: 'var(--radius-sm)',
                                                    cursor: 'pointer',
                                                    fontWeight: 500
                                                }}
                                            >
                                                Tümünü Okundu İşaretle
                                            </button>
                                        )}
                                        {notifications.length > 0 && (
                                            <button
                                                onClick={clearAllNotifications}
                                                style={{
                                                    fontSize: '0.75rem',
                                                    padding: '0.25rem 0.75rem',
                                                    background: 'transparent',
                                                    color: 'var(--text-muted)',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    cursor: 'pointer',
                                                    fontWeight: 500
                                                }}
                                            >
                                                Temizle
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {notifications.length === 0 ? (
                                        <div style={{
                                            padding: '2rem',
                                            textAlign: 'center',
                                            color: 'var(--text-muted)',
                                            fontSize: '0.9rem'
                                        }}>
                                            <Bell size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                            <p>Henüz bildiriminiz yok</p>
                                        </div>
                                    ) : (
                                        notifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                onClick={() => markAsRead(notif.id)}
                                                style={{
                                                    padding: '1rem 1.25rem',
                                                    borderBottom: '1px solid var(--border-color)',
                                                    cursor: 'pointer',
                                                    background: notif.read ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                                                    transition: 'background 0.2s',
                                                    position: 'relative'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = notif.read ? 'transparent' : 'rgba(99, 102, 241, 0.05)'}
                                            >
                                                {!notif.read && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        left: '0.5rem',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        width: '8px',
                                                        height: '8px',
                                                        borderRadius: '50%',
                                                        background: 'var(--color-primary)'
                                                    }} />
                                                )}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.25rem' }}>
                                                    <h4 style={{
                                                        fontSize: '0.9rem',
                                                        fontWeight: 600,
                                                        margin: 0,
                                                        color: 'var(--text-main)',
                                                        paddingLeft: !notif.read ? '1rem' : 0
                                                    }}>
                                                        {notif.title}
                                                    </h4>
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                                        {notif.time}
                                                    </span>
                                                </div>
                                                <p style={{
                                                    fontSize: '0.85rem',
                                                    color: 'var(--text-muted)',
                                                    margin: 0,
                                                    paddingLeft: !notif.read ? '1rem' : 0
                                                }}>
                                                    {notif.message}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="user-profile-container" style={{ position: 'relative' }}>
                    <div
                        className="user-profile"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        {avatarUrl ? (
                            <div className="avatar avatar-3d-wrapper">
                                <Avatar3D
                                    avatarUrl={avatarUrl}
                                    size={40}
                                    autoRotate={false}
                                    interactionPrompt="none"
                                    className="avatar-3d-topbar"
                                />
                            </div>
                        ) : (
                            <div className="avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{initials}</div>
                        )}
                        <div className="user-info">
                            <span className="user-name">{displayName}</span>
                            <span className="user-role">Öğrenci</span>
                        </div>
                        <ChevronDown size={16} style={{ transition: 'transform 0.2s', transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                    </div>

                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                className="user-dropdown"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="dropdown-item" onClick={() => { navigate('/dashboard/profile'); setIsDropdownOpen(false); }}>
                                    <User size={16} /> Profil
                                </div>
                                <div className="dropdown-item" onClick={() => { navigate('/dashboard/settings'); setIsDropdownOpen(false); }}>
                                    <Settings size={16} /> Ayarlar
                                </div>
                                <div className="dropdown-item" onClick={() => { navigate('/dashboard/profile'); setIsDropdownOpen(false); }}>
                                    <Sparkles size={16} /> Avatarlar
                                </div>
                                <div className="dropdown-divider"></div>
                                <div className="dropdown-item danger" onClick={handleLogout}>
                                    <LogOut size={16} /> Çıkış Yap
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Topbar;