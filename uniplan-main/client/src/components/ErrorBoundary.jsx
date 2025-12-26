// Error Boundary Component
import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Hata durumunda fallback UI göster
            return (
                <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: 'var(--text-main)'
                }}>
                    <h2>Bir şeyler ters gitti</h2>
                    <p>Lütfen sayfayı yenileyin.</p>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false, error: null });
                            window.location.reload();
                        }}
                        style={{
                            marginTop: '1rem',
                            padding: '0.75rem 1.5rem',
                            background: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer'
                        }}
                    >
                        Sayfayı Yenile
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

