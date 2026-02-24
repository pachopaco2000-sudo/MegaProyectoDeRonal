import React, { useState } from 'react';
import Login from './Login'; // Asegúrate de que el nombre del archivo coincida

const Home = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [goToAuth, setGoToAuth] = useState(false);

    const slides = [
        {
            icon: '📍',
            title: 'Descubre destinos únicos',
            description: 'Explora lugares increíbles recomendados especialmente para ti con IA local que respeta tu privacidad.',
            color: 'linear-gradient(135deg, #818cf8, #6366f1)'
        },
        {
            icon: '❤️',
            title: 'Planifica tu viaje perfecto',
            description: 'Crea itinerarios personalizados, optimiza rutas y colabora en tiempo real con tus compañeros de viaje.',
            color: 'linear-gradient(135deg, #a78bfa, #2dd4bf)'
        },
        {
            icon: '🛡️',
            title: 'Seguridad y privacidad',
            description: 'Tu información está protegida. IA ejecutándose localmente sin exponer tus datos personales.',
            color: 'linear-gradient(135deg, #2dd4bf, #6366f1)'
        }
    ];

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            setGoToAuth(true); // Al llegar al final de los slides, manda a Login
        }
    };

    const handleSkip = () => {
        setGoToAuth(true); // Saltar manda directo a Login
    };

    // Si el estado es true, renderizamos el componente Login en lugar del Home
    if (goToAuth) {
        return <Login />;
    }

    return (
        <div style={styles.container}>
            <style>{`
                @keyframes slideIn { 
                    from { opacity: 0; transform: translateX(30px) scale(0.9); } 
                    to { opacity: 1; transform: translateX(0) scale(1); } 
                }
                @keyframes float { 
                    0% { transform: translateY(0px); } 
                    50% { transform: translateY(-15px); } 
                    100% { transform: translateY(0px); } 
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .slide-content { animation: slideIn 0.6s cubic-bezier(0.23, 1, 0.32, 1); }
                .floating { animation: float 3.5s ease-in-out infinite; }
                .fade-in { animation: fadeIn 0.5s ease-in; }
            `}</style>

            <div style={styles.header} className="fade-in">
                <div style={styles.stepsContainer}>
                    {slides.map((_, index) => (
                        <div
                            key={index}
                            style={{
                                ...styles.stepDot,
                                backgroundColor: index === currentSlide ? '#6366f1' : '#e2e8f0',
                                width: index === currentSlide ? '32px' : '10px'
                            }}
                        />
                    ))}
                </div>
                <button onClick={handleSkip} style={styles.skipBtn}>Saltar</button>
            </div>

            <div key={currentSlide} className="slide-content" style={styles.content}>
                <div className="floating" style={{ ...styles.iconBox, background: slides[currentSlide].color }}>
                    <span style={{ fontSize: '55px' }}>{slides[currentSlide].icon}</span>
                </div>
                <h1 style={styles.title}>{slides[currentSlide].title}</h1>
                <p style={styles.subtitle}>{slides[currentSlide].description}</p>
            </div>

            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }} className="fade-in">
                <button
                    onClick={handleNext}
                    style={styles.nextBtn}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                    {currentSlide === slides.length - 1 ? 'Empezar' : 'Siguiente'}
                    <span style={{ marginLeft: '10px' }}>›</span>
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '50px 24px',
        backgroundColor: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        boxSizing: 'border-box'
    },
    header: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    stepsContainer: { display: 'flex', gap: '8px' },
    stepDot: { height: '6px', borderRadius: '10px', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' },
    skipBtn: {
        background: '#f8fafc',
        border: '1px solid #f1f5f9',
        padding: '10px 20px',
        borderRadius: '24px',
        color: '#64748b',
        cursor: 'pointer',
        fontWeight: '700',
        fontSize: '14px',
        transition: 'all 0.2s'
    },
    content: { textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    iconBox: {
        width: '130px', height: '130px', borderRadius: '35px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 40px',
        boxShadow: '0 25px 35px -10px rgba(99, 102, 241, 0.35)',
        transition: 'all 0.5s'
    },
    title: { fontSize: '32px', color: '#0f172a', marginBottom: '18px', fontWeight: '900', letterSpacing: '-0.5px' },
    subtitle: { fontSize: '17px', color: '#475569', lineHeight: '1.6', maxWidth: '340px', margin: '0 auto' },
    nextBtn: {
        width: '100%', maxWidth: '420px', padding: '20px',
        backgroundColor: '#6366f1', color: 'white', border: 'none',
        borderRadius: '20px', fontSize: '19px', fontWeight: '800',
        cursor: 'pointer', display: 'flex', justifyContent: 'center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)'
    }
};

export default Home;