import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import '../styles/Auth.css';

const RegisterPage = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Lock body scrolling for auth pages so the outer page shows no scrollbar.
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError('Şifreler eşleşmiyor.');
        }

        setError('');
        setLoading(true);

        try {
            const { error } = await signUp(email, password, {
                full_name: fullName,
                username: email.split('@')[0],
                avatar_url: `https://ui-avatars.com/api/?name=${fullName}&background=random`
            });

            if (error) throw error;

            navigate('/login');
            alert('Kayıt başarılı! Lütfen giriş yapın.');
        } catch (err) {
            // sanitize low-level parsing errors and show friendlier message
            const raw = err && err.message ? err.message : 'Bilinmeyen hata';
            const friendly = raw.includes('body stream') || raw.includes('Failed to execute')
                ? 'Sunucudan beklenmeyen yanıt alındı. Lütfen tekrar deneyin.'
                : raw;
            setError('Kayıt oluşturulamadı: ' + friendly);
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
                        <h2 className="auth-title">Hesap Oluştur</h2>
                        <p className="auth-subtitle">UniPlan ailesine katılın ve hayatınızı düzenleyin.</p>
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
                            <div style={{padding: '0 1.2rem', textAlign: 'center'}}>{error}</div>
                        </motion.div>
                    )}

                    <form className="auth-form register-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Ad Soyad</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Adınız Soyadınız"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>

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

                        <div className="form-group">
                            <label className="form-label">Şifre Tekrar</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-auth" disabled={loading}>
                            {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Zaten hesabınız var mı? <Link to="/login" className="auth-link">Giriş Yap</Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default RegisterPage;
