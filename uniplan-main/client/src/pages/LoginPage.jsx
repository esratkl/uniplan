import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import '../styles/Auth.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Lock body scrolling for auth pages to prevent outer scrollbar.
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error } = await signIn(email, password, rememberMe);
            if (error) throw error;
            navigate('/dashboard');
        } catch (err) {
            const raw = err && err.message ? err.message : 'Bilinmeyen hata';
            const friendly = raw.includes('body stream') || raw.includes('Failed to execute')
                ? 'Sunucudan beklenmeyen yanıt alındı. Lütfen tekrar deneyin.'
                : raw;
            setError('Giriş yapılamadı: ' + friendly);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-background">
                <div className="auth-background-gradient"></div>
            </div>
            
            <div className="auth-content-wrapper">
                <motion.div
                    className="auth-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Link to="/" className="auth-back-button">
                        <ArrowLeft size={20} />
                        <span>Ana Sayfaya Dön</span>
                    </Link>

                    <div className="auth-header">
                        <Link to="/" className="auth-logo">UniPlan</Link>
                        <h2 className="auth-title">Tekrar Hoşgeldiniz</h2>
                        <p className="auth-subtitle">Hesabınıza giriş yapın ve planlamaya başlayın.</p>
                    </div>

                    {error && (
                        <motion.div
                            className="auth-error"
                            role="alert"
                            aria-live="assertive"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <button aria-label="Kapat" className="auth-error-close" onClick={() => setError('')}>×</button>
                            <div style={{padding: '0 1.1rem', textAlign: 'center'}}>{error}</div>
                        </motion.div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">E-posta</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="ornek@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Şifre</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-options">
                            <label className="form-checkbox-label">
                                <input
                                    type="checkbox"
                                    className="form-checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span>Beni hatırla</span>
                            </label>
                            <Link to="#" className="auth-link">Şifremi unuttum</Link>
                        </div>

                        <button type="submit" className="btn btn-primary btn-auth" disabled={loading}>
                            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Hesabınız yok mu? <Link to="/register" className="auth-link">Kayıt Ol</Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
