import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CheckCircle,
    Calendar,
    Users,
    BarChart3,
    Bell,
    Target,
    Zap,
    Clock,
    Trophy,
    Star,
    ArrowRight,
    Play,
    MessageSquare,
    Sparkles
} from 'lucide-react';
import '../styles/LandingPage.css';

const LandingPage = () => {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navigationLinks = [
        { name: 'Takvim', href: '#calendar' },
        { name: 'Görevler', href: '#tasks' },
        { name: 'Pomodoro', href: '#pomodoro' },
        { name: 'Sohbet', href: '#chat' },
        { name: 'Gruplar', href: '#groups' }
    ];

    const scrollToSection = (id) => {
        const element = document.querySelector(id);
        if (element) {
            const offset = 80; // navbar height
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    const stats = [
        { value: '50K+', label: 'Aktif Kullanıcı' },
        { value: '1M+', label: 'Tamamlanan Görev' },
        { value: '%98', label: 'Memnuniyet' },
        { value: '24/7', label: 'Destek' }
    ];

    return (
        <div className="landing-wrapper">
            {/* Navbar */}
            <motion.nav
                className="landing-navbar"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                    background: scrollY > 50 ? 'rgba(17, 24, 39, 0.95)' : 'transparent',
                    backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none'
                }}
            >
                <div className="landing-nav-content">
                    <div className="landing-logo">
                        <Sparkles size={28} />
                        <span>UniPlan</span>
                    </div>
                    <nav className="landing-nav-links">
                        {navigationLinks.map((link, index) => (
                            <a
                                key={index}
                                href={link.href}
                                onClick={(e) => {
                                    e.preventDefault();
                                    scrollToSection(link.href);
                                }}
                                className="nav-link"
                            >
                                {link.name}
                            </a>
                        ))}
                    </nav>
                    <div className="landing-nav-actions">
                        <Link to="/login" className="nav-btn nav-btn-ghost">
                            Giriş Yap
                        </Link>
                        <Link to="/register" className="nav-btn nav-btn-primary">
                            Ücretsiz Başla
                        </Link>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-gradient"></div>
                <div className="hero-content">
                    <motion.div
                        className="hero-badge"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Star size={16} fill="#f59e0b" color="#f59e0b" />
                        <span>Türkiye'nin #1 Planlama Platformu</span>
                    </motion.div>

                    <motion.h1
                        className="hero-title"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Planlamanın
                        <span className="hero-title-gradient"> Yeni Çağı</span>
                    </motion.h1>

                    <motion.p
                        className="hero-subtitle"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        Hayallerinizi gerçeğe dönüştürün. UniPlan ile zamanınızı verimli kullanın,
                        hedeflerinize ulaşın ve başarıya giden yolda her adımda bir adım önde olun.
                    </motion.p>

                    <motion.div
                        className="hero-cta"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <Link to="/register" className="cta-btn cta-btn-primary">
                            <span>Hemen Başla</span>
                            <ArrowRight size={20} />
                        </Link>
                        <button className="cta-btn cta-btn-secondary">
                            <Play size={20} />
                            <span>Demo İzle</span>
                        </button>
                    </motion.div>

                    <motion.div
                        className="hero-stats"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                    >
                        {stats.map((stat, index) => (
                            <div key={index} className="hero-stat-item">
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Decorative Elements */}
                <div className="hero-decoration hero-decoration-1"></div>
                <div className="hero-decoration hero-decoration-2"></div>
                <div className="hero-decoration hero-decoration-3"></div>
            </section>

            {/* Feature Showcase Section */}
            <section className="feature-showcase-section">
                <div className="showcase-container">
                    {/* Calendar Feature */}
                    <motion.div
                        id="calendar"
                        className="showcase-item"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="showcase-content">
                            <div className="showcase-badge">
                                <Calendar size={16} />
                                <span>Akıllı Takvim</span>
                            </div>
                            <h2 className="showcase-title">Planlarınızı Renklendir</h2>
                            <p className="showcase-description">
                                Tüm etkinliklerinizi tek bir yerde görüntüleyin. Emoji desteği, detaylı notlar ve
                                özelleştirilebilir renkler ile takvim deneyiminizi kişiselleştirin.
                            </p>
                            <ul className="showcase-features">
                                <li>
                                    <CheckCircle size={20} />
                                    <span>Aylık takvim görünümü ile planlarınıza genel bakış</span>
                                </li>
                                <li>
                                    <CheckCircle size={20} />
                                    <span>Her ay için farklı emoji ve renk temaları</span>
                                </li>
                                <li>
                                    <CheckCircle size={20} />
                                    <span>Detaylı not ve etkinlik ekleme</span>
                                </li>
                            </ul>
                        </div>
                        <motion.div
                            className="showcase-image"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <img src="/screenshots/calendar.png" alt="Akıllı Takvim" />
                        </motion.div>
                    </motion.div>

                    {/* Tasks Feature */}
                    <motion.div
                        id="tasks"
                        className="showcase-item showcase-item-reverse"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.div
                            className="showcase-image"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <img src="/screenshots/tasks.png" alt="Görev Yönetimi" />
                        </motion.div>
                        <div className="showcase-content">
                            <div className="showcase-badge">
                                <CheckCircle size={16} />
                                <span>Görev Yönetimi</span>
                            </div>
                            <h2 className="showcase-title">Görevlerinizi Organize Edin</h2>
                            <p className="showcase-description">
                                Yaklaşan, önemli ve diğer görevlerinizi kategorilere ayırın. İlerlemenizi takip edin
                                ve verimliliğinizi artırın.
                            </p>
                            <ul className="showcase-features">
                                <li>
                                    <CheckCircle size={20} />
                                    <span>Görev kategorileri: Yaklaşan, Önemli, Diğer</span>
                                </li>
                                <li>
                                    <CheckCircle size={20} />
                                    <span>İlerleme takibi ve tamamlanma yüzdesi</span>
                                </li>
                                <li>
                                    <CheckCircle size={20} />
                                    <span>Çalışma, Özel, Günler ve Sosyal kategorileri</span>
                                </li>
                            </ul>
                        </div>
                    </motion.div>

                    {/* Pomodoro Feature */}
                    <motion.div
                        id="pomodoro"
                        className="showcase-item"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="showcase-content">
                            <div className="showcase-badge">
                                <Clock size={16} />
                                <span>Pomodoro Timer</span>
                            </div>
                            <h2 className="showcase-title">Odaklanmanın Gücünü Keşfedin</h2>
                            <p className="showcase-description">
                                Pomodoro tekniği ile çalışma sürenizi optimize edin. 25 dakikalık odaklanma
                                seansları, kısa ve uzun molalarla verimliliğinizi maksimuma çıkarın.
                            </p>
                            <ul className="showcase-features">
                                <li>
                                    <CheckCircle size={20} />
                                    <span>25 dakika çalışma, 5 dakika mola sistemi</span>
                                </li>
                                <li>
                                    <CheckCircle size={20} />
                                    <span>Tamamlanan ve toplam oda ilerleme takibi</span>
                                </li>
                                <li>
                                    <CheckCircle size={20} />
                                    <span>Özelleştirilebilir arka plan desenleri ve renkler</span>
                                </li>
                            </ul>
                        </div>
                        <motion.div
                            className="showcase-image"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <img src="/screenshots/pomodoro.png" alt="Pomodoro Timer" />
                        </motion.div>
                    </motion.div>

                    {/* Chat Feature */}
                    <motion.div
                        id="chat"
                        className="showcase-item showcase-item-reverse"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.div
                            className="showcase-image"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <img src="/screenshots/chat.png" alt="Anlık Mesajlaşma" />
                        </motion.div>
                        <div className="showcase-content">
                            <div className="showcase-badge">
                                <MessageSquare size={16} />
                                <span>Anlık Mesajlaşma</span>
                            </div>
                            <h2 className="showcase-title">Arkadaşlarınızla Bağlantıda Kalın</h2>
                            <p className="showcase-description">
                                Gerçek zamanlı mesajlaşma ile arkadaşlarınızla iletişimde kalın. Çevrimiçi
                                durumları görün ve anında sohbet edin.
                            </p>
                            <ul className="showcase-features">
                                <li>
                                    <CheckCircle size={20} />
                                    <span>Gerçek zamanlı mesajlaşma sistemi</span>
                                </li>
                                <li>
                                    <CheckCircle size={20} />
                                    <span>Çevrimiçi/çevrimdışı durum göstergesi</span>
                                </li>
                                <li>
                                    <CheckCircle size={20} />
                                    <span>Favori arkadaşlarınızı işaretleyin</span>
                                </li>
                            </ul>
                        </div>
                    </motion.div>

                    {/* Groups Feature */}
                    <motion.div
                        id="groups"
                        className="showcase-item"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="showcase-content">
                            <div className="showcase-badge">
                                <Users size={16} />
                                <span>Grup Yönetimi</span>
                            </div>
                            <h2 className="showcase-title">Takımınızla Birlikte Çalışın</h2>
                            <p className="showcase-description">
                                Grup sohbetleri oluşturun, yönetin ve takım arkadaşlarınızla işbirliği yapın. Proje
                                grupları, sosyal gruplar ve daha fazlası için ideal.
                            </p>
                            <ul className="showcase-features">
                                <li>
                                    <CheckCircle size={20} />
                                    <span>Tümü, Sahiplenmiş ve Yönetici filtre seçenekleri</span>
                                </li>
                                <li>
                                    <CheckCircle size={20} />
                                    <span>Grup üye sayısı ve son aktivite takibi</span>
                                </li>
                                <li>
                                    <CheckCircle size={20} />
                                    <span>Admin rozetleri ve grup arama özelliği</span>
                                </li>
                            </ul>
                        </div>
                        <motion.div
                            className="showcase-image"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <img src="/screenshots/groups.png" alt="Grup Yönetimi" />
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section">
                <div className="testimonials-container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="section-badge">
                            <MessageSquare size={16} />
                            <span>Kullanıcı Yorumları</span>
                        </div>
                        <h2 className="section-title">
                            Binlerce Kullanıcı
                            <span className="title-gradient"> Neden Seviyor</span>
                        </h2>
                    </motion.div>

                    <div className="testimonials-grid">
                        {[
                            {
                                name: 'Ayşe Yılmaz',
                                role: 'Üniversite Öğrencisi',
                                text: 'UniPlan sayesinde derslerim ve ödevlerim artık çok daha organize. Hayatımı değiştirdi!',
                                rating: 5
                            },
                            {
                                name: 'Mehmet Demir',
                                role: 'Proje Yöneticisi',
                                text: 'Takımımla birlikte çalışmak hiç bu kadar kolay olmamıştı. Harika bir platform.',
                                rating: 5
                            },
                            {
                                name: 'Zeynep Kaya',
                                role: 'Freelancer',
                                text: 'Pomodoro timer ve görev yönetimi özellikleri iş akışımı 2 katına çıkardı.',
                                rating: 5
                            }
                        ].map((testimonial, index) => (
                            <motion.div
                                key={index}
                                className="testimonial-card"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                            >
                                <div className="testimonial-stars">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                                    ))}
                                </div>
                                <p className="testimonial-text">"{testimonial.text}"</p>
                                <div className="testimonial-author">
                                    <div className="author-avatar">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="author-name">{testimonial.name}</div>
                                        <div className="author-role">{testimonial.role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-gradient"></div>
                <motion.div
                    className="cta-content"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="cta-icon">
                        <Trophy size={48} color="#f59e0b" />
                    </div>
                    <h2 className="cta-title">Başarıya Giden Yolculuğunuz Burada Başlıyor</h2>
                    <p className="cta-subtitle">
                        50,000'den fazla kullanıcı UniPlan ile hedeflerine ulaştı. Sıra sizde!
                    </p>
                    <div className="cta-buttons">
                        <Link to="/register" className="cta-btn cta-btn-primary cta-btn-large">
                            <span>Ücretsiz Hesap Oluştur</span>
                            <ArrowRight size={20} />
                        </Link>
                    </div>
                    <div className="cta-note">✓ Kredi kartı gerektirmez  •  ✓ Ücretsiz plan süresiz</div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-main">
                        <div className="footer-brand">
                            <div className="footer-logo">
                                <Sparkles size={32} />
                                <span>UniPlan</span>
                            </div>
                            <p className="footer-tagline">
                                Hayatınızı organize edin,<br />hedeflerinize ulaşın.
                            </p>
                        </div>

                        <div className="footer-links">
                            <div className="footer-column">
                                <h4>Ürün</h4>
                                <a href="#features">Özellikler</a>
                                <a href="#pricing">Fiyatlandırma</a>
                                <a href="#updates">Güncellemeler</a>
                            </div>
                            <div className="footer-column">
                                <h4>Şirket</h4>
                                <a href="#about">Hakkımızda</a>
                                <a href="#blog">Blog</a>
                                <a href="#careers">Kariyer</a>
                            </div>
                            <div className="footer-column">
                                <h4>Destek</h4>
                                <a href="#help">Yardım Merkezi</a>
                                <a href="#contact">İletişim</a>
                                <a href="#status">Durum</a>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>© 2024 UniPlan. Tüm hakları saklıdır.</p>
                        <div className="footer-legal">
                            <a href="#privacy">Gizlilik</a>
                            <a href="#terms">Şartlar</a>
                            <a href="#cookies">Çerezler</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
