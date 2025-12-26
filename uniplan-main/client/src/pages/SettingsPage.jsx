import React, { useState, useEffect } from 'react';
import {
    User,
    Lock,
    Bell,
    Palette,
    Shield,
    Moon,
    Sun,
    Monitor,
    Globe,
    Save,
    Trash2,
    Mail,
    Phone,
    Eye,
    Upload,
    ArrowLeft,
    Check,
    Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Settings.css';

const SettingsPage = () => {
    const { user, signOut, updateUser, changePassword } = useAuth();
    const { theme, setTheme, accentColor, setAccentColor, fontSize, setFontSize } = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Settings States
    const [profileSettings, setProfileSettings] = useState({
        fullName: '',
        username: '',
        email: '',
        bio: '',
        avatarUrl: null
    });

    const [accountSettings, setAccountSettings] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
        securityAlerts: true,
        weeklyDigest: false
    });

    const [appearanceSettings, setAppearanceSettings] = useState({
        theme: theme,
        language: 'tr',
        fontSize: fontSize,
        accentColor: accentColor
    });

    const [privacySettings, setPrivacySettings] = useState({
        profileVisibility: true,
        showEmail: false,
        showActivity: true,
        dataCollection: false,
        searchEngineIndexing: false
    });

    // Initialize state from contexts
    useEffect(() => {
        if (user) {
            setProfileSettings(prev => ({
                ...prev,
                fullName: user.name || user.full_name || '',
                email: user.email || '',
                avatarUrl: user.avatar || null,
                username: user.username || '',
                bio: user.bio || ''
            }));
        }
    }, [user]);

    useEffect(() => {
        setAppearanceSettings(prev => ({
            ...prev,
            theme,
            fontSize,
            accentColor
        }));
    }, [theme, fontSize, accentColor]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast('Dosya boyutu 5MB\'dan küçük olmalıdır.', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = async () => {
                const newAvatar = reader.result;
                setProfileSettings(prev => ({ ...prev, avatarUrl: newAvatar }));

                // Update global user context immediately for avatar
                if (updateUser) {
                    const { error } = await updateUser({ avatar: newAvatar });
                    if (error) {
                        showToast('Avatar güncellenemedi', 'error');
                    } else {
                        showToast('Profil fotoğrafı güncellendi.');
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const saveProfileSettings = async () => {
        setIsLoading(true);

        // Update global user context
        if (updateUser) {
            const { error } = await updateUser({
                name: profileSettings.fullName,
                email: profileSettings.email,
                avatar: profileSettings.avatarUrl,
                username: profileSettings.username,
                bio: profileSettings.bio
            });

            setIsLoading(false);

            if (error) {
                showToast('Hata: ' + (error.message || 'Kaydedilemedi'), 'error');
                return;
            }
        } else {
            setIsLoading(false);
        }

        showToast('Profil ayarları kaydedildi.');
    };

    const saveAccountSettings = async () => {
        if (!accountSettings.currentPassword || !accountSettings.newPassword) {
            showToast('Lütfen mevcut ve yeni şifrenizi girin.', 'error');
            return;
        }

        if (accountSettings.newPassword !== accountSettings.confirmPassword) {
            showToast('Yeni şifreler eşleşmiyor.', 'error');
            return;
        }

        if (accountSettings.newPassword.length < 6) {
            showToast('Yeni şifre en az 6 karakter olmalıdır.', 'error');
            return;
        }

        setIsLoading(true);

        if (changePassword) {
            const { error } = await changePassword(
                accountSettings.currentPassword,
                accountSettings.newPassword
            );

            setIsLoading(false);

            if (error) {
                showToast('Hata: ' + (error.message || 'Şifre değiştirilemedi'), 'error');
                return;
            }

            setAccountSettings({ currentPassword: '', newPassword: '', confirmPassword: '' });
            showToast('Şifreniz başarıyla güncellendi.');
        } else {
            setIsLoading(false);
            showToast('Şifre değiştirme servisi kullanılamıyor.', 'error');
        }
    };

    const saveNotificationSettings = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsLoading(false);
        showToast('Bildirim tercihleri güncellendi.');
    };

    const saveAppearanceSettings = async () => {
        setIsLoading(true);
        // Apply theme settings
        setTheme(appearanceSettings.theme);
        setFontSize(appearanceSettings.fontSize);
        setAccentColor(appearanceSettings.accentColor);

        await new Promise(resolve => setTimeout(resolve, 500));
        setIsLoading(false);
        showToast('Görünüm ayarları kaydedildi.');
    };

    const savePrivacySettings = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsLoading(false);
        showToast('Gizlilik ayarları kaydedildi.');
    };

    const deleteAccount = async () => {
        showToast('Hesap siliniyor...', 'error');
        localStorage.clear();
        await signOut();
        navigate('/');
    };

    return (
        <div className="settings-container">
            {toast && (
                <div className={`settings-toast ${toast.type}`}>
                    {toast.message}
                </div>
            )}

            <div className="settings-header">
                <button
                    onClick={() => navigate(-1)}
                    className="settings-back-btn"
                >
                    <ArrowLeft size={18} />
                    Geri Dön
                </button>

                <div className="settings-title-card">
                    <h1 className="settings-title">⚙️ Ayarlar</h1>
                    <p className="settings-subtitle">Hesap ve tercihlerinizi yönetin</p>
                </div>
            </div>

            <div className="settings-content-wrapper">
                {/* Horizontal Tabs - New Layout */}
                <div className="settings-tabs-horizontal">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`settings-tab-h ${activeTab === 'profile' ? 'active' : ''}`}
                    >
                        <User size={18} />
                        <span>Profil</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('account')}
                        className={`settings-tab-h ${activeTab === 'account' ? 'active' : ''}`}
                    >
                        <Lock size={18} />
                        <span>Hesap</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`settings-tab-h ${activeTab === 'notifications' ? 'active' : ''}`}
                    >
                        <Bell size={18} />
                        <span>Bildirimler</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('appearance')}
                        className={`settings-tab-h ${activeTab === 'appearance' ? 'active' : ''}`}
                    >
                        <Palette size={18} />
                        <span>Görünüm</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('privacy')}
                        className={`settings-tab-h ${activeTab === 'privacy' ? 'active' : ''}`}
                    >
                        <Shield size={18} />
                        <span>Gizlilik</span>
                    </button>
                </div>

                {/* Main Content Area - Single Box */}
                <div className="settings-main-card">
                    <div className="settings-tab-content">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }} // Changed animation to vertical slide
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'profile' && (
                                    <div className="settings-section">
                                        <div className="settings-card-header profile-header">
                                            <div className="settings-card-title">
                                                <User size={24} />
                                                Profil Bilgileri
                                            </div>
                                            <p className="settings-card-desc">Genel profil bilgilerinizi güncelleyin</p>
                                        </div>
                                        <div className="settings-card-body">
                                            {/* Avatar */}
                                            <div className="settings-avatar-section">
                                                <div className="settings-avatar">
                                                    {profileSettings.avatarUrl ? (
                                                        <img src={profileSettings.avatarUrl} alt="Avatar" />
                                                    ) : (
                                                        <div className="settings-avatar-fallback">
                                                            {profileSettings.fullName?.charAt(0) || 'U'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label htmlFor="avatar-upload" className="settings-upload-btn">
                                                        <Upload size={16} />
                                                        Avatar Yükle
                                                    </label>
                                                    <input
                                                        id="avatar-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleAvatarUpload}
                                                    />
                                                    <p className="settings-upload-hint">JPG, PNG veya GIF (Maks. 5MB)</p>
                                                </div>
                                            </div>

                                            <div className="settings-divider" />

                                            {/* Form Fields */}
                                            <div className="settings-form-grid">
                                                <div className="settings-form-group">
                                                    <label>Ad Soyad</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Ad Soyad"
                                                        value={profileSettings.fullName}
                                                        onChange={(e) => setProfileSettings({ ...profileSettings, fullName: e.target.value })}
                                                    />
                                                </div>
                                                <div className="settings-form-group">
                                                    <label>Kullanıcı Adı</label>
                                                    <input
                                                        type="text"
                                                        placeholder="@kullaniciadi"
                                                        value={profileSettings.username}
                                                        onChange={(e) => setProfileSettings({ ...profileSettings, username: e.target.value })}
                                                    />
                                                </div>
                                            </div>



                                            <div className="settings-form-group">
                                                <label>Biyografi</label>
                                                <textarea
                                                    placeholder="Kendiniz hakkında kısa bir açıklama..."
                                                    value={profileSettings.bio}
                                                    onChange={(e) => setProfileSettings({ ...profileSettings, bio: e.target.value })}
                                                    rows={4}
                                                />
                                            </div>

                                            <button onClick={saveProfileSettings} className="settings-save-btn profile-btn">
                                                <Save size={18} />
                                                Profil Ayarlarını Kaydet
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'account' && (
                                    <div className="settings-section">
                                        <div className="settings-card-header account-header">
                                            <div className="settings-card-title">
                                                <Lock size={24} />
                                                Şifre Değiştir
                                            </div>
                                            <p className="settings-card-desc">Hesap güvenliğiniz için şifrenizi güncelleyin</p>
                                        </div>
                                        <div className="settings-card-body">
                                            <div className="settings-form-group">
                                                <label>Mevcut Şifre</label>
                                                <input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={accountSettings.currentPassword}
                                                    onChange={(e) => setAccountSettings({ ...accountSettings, currentPassword: e.target.value })}
                                                />
                                            </div>
                                            <div className="settings-form-grid">
                                                <div className="settings-form-group">
                                                    <label>Yeni Şifre</label>
                                                    <input
                                                        type="password"
                                                        placeholder="••••••••"
                                                        value={accountSettings.newPassword}
                                                        onChange={(e) => setAccountSettings({ ...accountSettings, newPassword: e.target.value })}
                                                    />
                                                </div>
                                                <div className="settings-form-group">
                                                    <label>Yeni Şifre (Tekrar)</label>
                                                    <input
                                                        type="password"
                                                        placeholder="••••••••"
                                                        value={accountSettings.confirmPassword}
                                                        onChange={(e) => setAccountSettings({ ...accountSettings, confirmPassword: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <button onClick={saveAccountSettings} className="settings-save-btn account-btn">
                                                <Save size={18} />
                                                Şifreyi Güncelle
                                            </button>

                                            <div className="settings-divider"></div>

                                            <div className="danger-zone">
                                                <h4 className="danger-title">
                                                    <Trash2 size={20} />
                                                    Tehlikeli Alan
                                                </h4>
                                                <p className="danger-desc">Hesabınızı kalıcı olarak silin. Bu işlem geri alınamaz.</p>
                                                <button onClick={() => setShowDeleteDialog(true)} className="settings-delete-btn">
                                                    Hesabı Sil
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'notifications' && (
                                    <div className="settings-section">
                                        <div className="settings-card-header notifications-header">
                                            <div className="settings-card-title">
                                                <Bell size={24} />
                                                Bildirim Tercihleri
                                            </div>
                                            <p className="settings-card-desc">Hangi bildirimleri almak istediğinizi seçin</p>
                                        </div>
                                        <div className="settings-card-body">
                                            <div className="settings-switch-list">
                                                <div className="settings-switch-item">
                                                    <div>
                                                        <label className="settings-switch-label">Email Bildirimleri</label>
                                                        <p className="settings-switch-desc">Önemli güncellemeler ve aktiviteler hakkında e-posta al</p>
                                                    </div>
                                                    <label className="settings-switch">
                                                        <input
                                                            type="checkbox"
                                                            checked={notificationSettings.emailNotifications}
                                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                                                        />
                                                        <span className="settings-switch-slider" />
                                                    </label>
                                                </div>

                                                <div className="settings-switch-item">
                                                    <div>
                                                        <label className="settings-switch-label">Push Bildirimleri</label>
                                                        <p className="settings-switch-desc">Anlık bildirimler alın</p>
                                                    </div>
                                                    <label className="settings-switch">
                                                        <input
                                                            type="checkbox"
                                                            checked={notificationSettings.pushNotifications}
                                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked })}
                                                        />
                                                        <span className="settings-switch-slider" />
                                                    </label>
                                                </div>

                                                <div className="settings-switch-item">
                                                    <div>
                                                        <label className="settings-switch-label">Güvenlik Uyarıları</label>
                                                        <p className="settings-switch-desc">Hesap güvenliği hakkında bildirimler</p>
                                                    </div>
                                                    <label className="settings-switch">
                                                        <input
                                                            type="checkbox"
                                                            checked={notificationSettings.securityAlerts}
                                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, securityAlerts: e.target.checked })}
                                                        />
                                                        <span className="settings-switch-slider" />
                                                    </label>
                                                </div>

                                                <div className="settings-divider" />

                                                <div className="settings-switch-item">
                                                    <div>
                                                        <label className="settings-switch-label">Pazarlama Emailleri</label>
                                                        <p className="settings-switch-desc">Özel teklifler ve haberler</p>
                                                    </div>
                                                    <label className="settings-switch">
                                                        <input
                                                            type="checkbox"
                                                            checked={notificationSettings.marketingEmails}
                                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, marketingEmails: e.target.checked })}
                                                        />
                                                        <span className="settings-switch-slider" />
                                                    </label>
                                                </div>

                                                <div className="settings-switch-item">
                                                    <div>
                                                        <label className="settings-switch-label">Haftalık Özet</label>
                                                        <p className="settings-switch-desc">Haftalık aktivite özeti alın</p>
                                                    </div>
                                                    <label className="settings-switch">
                                                        <input
                                                            type="checkbox"
                                                            checked={notificationSettings.weeklyDigest}
                                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, weeklyDigest: e.target.checked })}
                                                        />
                                                        <span className="settings-switch-slider" />
                                                    </label>
                                                </div>
                                            </div>

                                            <button onClick={saveNotificationSettings} className="settings-save-btn notifications-btn">
                                                <Save size={18} />
                                                Bildirim Tercihlerini Kaydet
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'appearance' && (
                                    <div className="settings-section">
                                        <div className="settings-card-header appearance-header">
                                            <div className="settings-card-title">
                                                <Palette size={24} />
                                                Görünüm Ayarları
                                            </div>
                                            <p className="settings-card-desc">Uygulama temasını ve renklerini özelleştirin</p>
                                        </div>
                                        <div className="settings-card-body">
                                            {/* Theme Selector */}
                                            <div className="settings-form-group">
                                                <label className="settings-section-label">Tema</label>
                                                <div className="settings-theme-grid">
                                                    <button
                                                        onClick={() => setAppearanceSettings({ ...appearanceSettings, theme: 'light' })}
                                                        className={`settings-theme-btn ${appearanceSettings.theme === 'light' ? 'active' : ''}`}
                                                    >
                                                        <Sun size={24} />
                                                        <p>Açık</p>
                                                    </button>
                                                    <button
                                                        onClick={() => setAppearanceSettings({ ...appearanceSettings, theme: 'dark' })}
                                                        className={`settings-theme-btn ${appearanceSettings.theme === 'dark' ? 'active' : ''}`}
                                                    >
                                                        <Moon size={24} />
                                                        <p>Koyu</p>
                                                    </button>
                                                    <button
                                                        onClick={() => setAppearanceSettings({ ...appearanceSettings, theme: 'system' })}
                                                        className={`settings-theme-btn ${appearanceSettings.theme === 'system' ? 'active' : ''}`}
                                                    >
                                                        <Monitor size={24} />
                                                        <p>Sistem</p>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="settings-divider" />

                                            {/* Language Selector */}
                                            <div className="settings-form-group">
                                                <label className="settings-section-label">
                                                    <Globe size={16} />
                                                    Dil
                                                </label>
                                                <select
                                                    value={appearanceSettings.language}
                                                    onChange={(e) => setAppearanceSettings({ ...appearanceSettings, language: e.target.value })}
                                                    className="settings-select"
                                                >
                                                    <option value="tr">🇹🇷 Türkçe</option>
                                                    <option value="en">🇬🇧 English</option>
                                                    <option value="de">🇩🇪 Deutsch</option>
                                                    <option value="fr">🇫🇷 Français</option>
                                                    <option value="es">🇪🇸 Español</option>
                                                </select>
                                            </div>

                                            {/* Font Size Slider */}
                                            <div className="settings-form-group">
                                                <div className="settings-slider-header">
                                                    <label className="settings-section-label">Yazı Boyutu</label>
                                                    <span className="settings-slider-value">{appearanceSettings.fontSize}px</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="12"
                                                    max="24"
                                                    value={appearanceSettings.fontSize}
                                                    onChange={(e) => setAppearanceSettings({ ...appearanceSettings, fontSize: parseInt(e.target.value) })}
                                                    className="settings-slider"
                                                />
                                                <div className="settings-slider-labels">
                                                    <span>Küçük</span>
                                                    <span>Orta</span>
                                                    <span>Büyük</span>
                                                </div>
                                            </div>

                                            {/* Accent Color */}
                                            <div className="settings-form-group">
                                                <label className="settings-section-label">Vurgu Rengi</label>
                                                <div className="settings-color-grid">
                                                    {[
                                                        { name: 'blue', color: '#3b82f6' },
                                                        { name: 'purple', color: '#a855f7' },
                                                        { name: 'pink', color: '#ec4899' },
                                                        { name: 'green', color: '#10b981' },
                                                        { name: 'orange', color: '#f59e0b' },
                                                        { name: 'red', color: '#ef4444' }
                                                    ].map((color) => (
                                                        <button
                                                            key={color.name}
                                                            onClick={() => setAppearanceSettings({ ...appearanceSettings, accentColor: color.name })}
                                                            className={`settings-color-btn ${appearanceSettings.accentColor === color.name ? 'active' : ''}`}
                                                            style={{ backgroundColor: color.color }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <button onClick={saveAppearanceSettings} className="settings-save-btn appearance-btn">
                                                <Save size={18} />
                                                Görünüm Ayarlarını Kaydet
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'privacy' && (
                                    <div className="settings-section">
                                        <div className="settings-card-header privacy-header">
                                            <div className="settings-card-title">
                                                <Shield size={24} />
                                                Gizlilik Ayarları
                                            </div>
                                            <p className="settings-card-desc">Gizlilik ve veri tercihlerinizi yönetin</p>
                                        </div>
                                        <div className="settings-card-body">
                                            <div className="settings-switch-list">
                                                <div className="settings-switch-item">
                                                    <div className="settings-switch-content">
                                                        <Eye size={20} />
                                                        <div>
                                                            <label className="settings-switch-label">Profil Görünürlüğü</label>
                                                            <p className="settings-switch-desc">Profiliniz herkese açık olsun</p>
                                                        </div>
                                                    </div>
                                                    <label className="settings-switch">
                                                        <input
                                                            type="checkbox"
                                                            checked={privacySettings.profileVisibility}
                                                            onChange={(e) => setPrivacySettings({ ...privacySettings, profileVisibility: e.target.checked })}
                                                        />
                                                        <span className="settings-switch-slider" />
                                                    </label>
                                                </div>

                                                <div className="settings-switch-item">
                                                    <div className="settings-switch-content">
                                                        <Mail size={20} />
                                                        <div>
                                                            <label className="settings-switch-label">Email Göster</label>
                                                            <p className="settings-switch-desc">Email adresiniz profilinizde görünsün</p>
                                                        </div>
                                                    </div>
                                                    <label className="settings-switch">
                                                        <input
                                                            type="checkbox"
                                                            checked={privacySettings.showEmail}
                                                            onChange={(e) => setPrivacySettings({ ...privacySettings, showEmail: e.target.checked })}
                                                        />
                                                        <span className="settings-switch-slider" />
                                                    </label>
                                                </div>

                                                <div className="settings-switch-item">
                                                    <div className="settings-switch-content">
                                                        <Eye size={20} />
                                                        <div>
                                                            <label className="settings-switch-label">Aktivite Göster</label>
                                                            <p className="settings-switch-desc">Aktiviteleriniz görülebilsin</p>
                                                        </div>
                                                    </div>
                                                    <label className="settings-switch">
                                                        <input
                                                            type="checkbox"
                                                            checked={privacySettings.showActivity}
                                                            onChange={(e) => setPrivacySettings({ ...privacySettings, showActivity: e.target.checked })}
                                                        />
                                                        <span className="settings-switch-slider" />
                                                    </label>
                                                </div>

                                                <div className="settings-divider" />

                                                <div className="settings-switch-item">
                                                    <div className="settings-switch-content">
                                                        <Shield size={20} />
                                                        <div>
                                                            <label className="settings-switch-label">Veri Toplama</label>
                                                            <p className="settings-switch-desc">Kullanım verilerinin toplanmasına izin ver</p>
                                                        </div>
                                                    </div>
                                                    <label className="settings-switch">
                                                        <input
                                                            type="checkbox"
                                                            checked={privacySettings.dataCollection}
                                                            onChange={(e) => setPrivacySettings({ ...privacySettings, dataCollection: e.target.checked })}
                                                        />
                                                        <span className="settings-switch-slider" />
                                                    </label>
                                                </div>

                                                <div className="settings-switch-item">
                                                    <div className="settings-switch-content">
                                                        <Globe size={20} />
                                                        <div>
                                                            <label className="settings-switch-label">Arama Motoru İndeksleme</label>
                                                            <p className="settings-switch-desc">Profiliniz arama motorlarında görünsün</p>
                                                        </div>
                                                    </div>
                                                    <label className="settings-switch">
                                                        <input
                                                            type="checkbox"
                                                            checked={privacySettings.searchEngineIndexing}
                                                            onChange={(e) => setPrivacySettings({ ...privacySettings, searchEngineIndexing: e.target.checked })}
                                                        />
                                                        <span className="settings-switch-slider" />
                                                    </label>
                                                </div>
                                            </div>

                                            <button onClick={savePrivacySettings} className="settings-save-btn privacy-btn">
                                                <Save size={18} />
                                                Gizlilik Ayarlarını Kaydet
                                            </button>
                                        </div>
                                    </div>
                                )}

                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Delete Account Dialog */}
                {showDeleteDialog && (
                    <div className="settings-dialog-overlay" onClick={() => setShowDeleteDialog(false)}>
                        <div className="settings-dialog" onClick={(e) => e.stopPropagation()}>
                            <h3 className="settings-dialog-title">Emin misiniz?</h3>
                            <p className="settings-dialog-desc">
                                Bu işlem geri alınamaz. Hesabınız ve tüm verileriniz kalıcı olarak silinecektir.
                            </p>
                            <div className="settings-dialog-actions">
                                <button onClick={() => setShowDeleteDialog(false)} className="settings-dialog-cancel">
                                    İptal
                                </button>
                                <button onClick={deleteAccount} className="settings-dialog-confirm">
                                    Evet, Hesabı Sil
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsPage;
