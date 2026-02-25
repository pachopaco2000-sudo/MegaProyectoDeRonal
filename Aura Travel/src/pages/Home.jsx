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
            color: 'linear-gradient(135deg, #818cf8, #6366f1)',
            decoration: '#818cf822',
            image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
        },
        {
            icon: '❤️',
            title: 'Planifica tu viaje perfecto',
            description: 'Crea itinerarios personalizados, optimiza rutas y colabora en tiempo real con tus compañeros de viaje.',
            color: 'linear-gradient(135deg, #a78bfa, #2dd4bf)',
            decoration: '#a78bfa22',
            image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80'
        },
        {
            icon: '🛡️',
            title: 'Seguridad y privacidad',
            description: 'Tu información está protegida. IA ejecutándose localmente sin exponer tus datos personales.',
            color: 'linear-gradient(135deg, #2dd4bf, #6366f1)',
            decoration: '#2dd4bf22',
            image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
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
        <div style={styles.pageWrapper}>
            <style>{`
                @keyframes slideIn { 
                    from { opacity: 0; transform: translateY(20px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
                @keyframes float { 
                    0% { transform: translateY(0px) rotate(0deg); } 
                    50% { transform: translateY(-20px) rotate(5deg); } 
                    100% { transform: translateY(0px) rotate(0deg); } 
                }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 0.5; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes kenBurns {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.1); }
                }
                .slide-content { animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
                .floating { animation: float 6s ease-in-out infinite; }
                .fade-in { animation: fadeIn 0.8s ease-out; }
                .bg-blob { 
                    position: absolute; 
                    border-radius: 50%; 
                    filter: blur(80px); 
                    z-index: 0; 
                    animation: pulse 8s ease-in-out infinite;
                }
                .hero-image {
                    animation: kenBurns 20s ease infinite alternate;
                }
                @media (max-width: 900px) {
                    .desktop-hero { display: none !important; }
                    .main-container { width: 100% !important; max-width: 100% !important; border-radius: 0 !important; }
                }
            `}</style>

            <div style={styles.mainLayout}>
                {/* Lado Izquierdo: Visual (Desktop) */}
                <div className="desktop-hero" style={styles.heroSide}>
                    <div style={{ ...styles.heroOverlay, background: slides[currentSlide].color + '44' }} />
                    <img
                        key={slides[currentSlide].image}
                        src={slides[currentSlide].image}
                        alt="Destino"
                        className="hero-image"
                        style={styles.heroImg}
                    />
                    <div style={styles.heroTextContent}>
                        <h2 style={styles.heroBrand}>Aura Travel</h2>
                        <p style={styles.heroSlogan}>Tu próximo destino, impulsado por IA.</p>
                    </div>
                </div>

                {/* Lado Derecho: Contenido Interactivo */}
                <div className="main-container" style={styles.container}>
                    {/* Blobs solo visibles en el lado derecho o móvil */}
                    <div className="bg-blob" style={{
                        top: '-5%', right: '-5%', width: '250px', height: '250px',
                        backgroundColor: slides[currentSlide].decoration
                    }} />

                    <div style={styles.header} className="fade-in">
                        <div style={styles.stepsContainer}>
                            {slides.map((_, index) => (
                                <div
                                    key={index}
                                    style={{
                                        ...styles.stepDot,
                                        backgroundColor: index === currentSlide ? '#6366f1' : '#e2e8f0',
                                        width: index === currentSlide ? '32px' : '8px',
                                        opacity: index === currentSlide ? 1 : 0.5
                                    }}
                                />
                            ))}
                        </div>
                        <button onClick={handleSkip} style={styles.skipBtn}>Saltar</button>
                    </div>

                    <div key={currentSlide} className="slide-content" style={styles.content}>
                        <div className="floating" style={{ ...styles.iconBox, background: slides[currentSlide].color }}>
                            <span style={{ fontSize: '64px' }}>{slides[currentSlide].icon}</span>
                        </div>
                        <h1 style={styles.title}>{slides[currentSlide].title}</h1>
                        <p style={styles.subtitle}>{slides[currentSlide].description}</p>
                    </div>

                    <div style={styles.footer} className="fade-in">
                        <button
                            onClick={handleNext}
                            style={styles.nextBtn}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(99, 102, 241, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(99, 102, 241, 0.3)';
                            }}
                        >
                            {currentSlide === slides.length - 1 ? '¡Comenzar Aventura!' : 'Continuar'}
                            <span style={{ marginLeft: '12px', fontSize: '24px' }}>→</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    pageWrapper: {
        height: '100vh',
        width: '100vw',
        backgroundColor: '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: '"Outfit", "Inter", system-ui, -apple-system, sans-serif',
    },
    mainLayout: {
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
        maxWidth: '1600px',
        maxHeight: '900px',
        borderRadius: '32px',
        margin: '20px',
        overflow: 'hidden',
        position: 'relative'
    },
    heroSide: {
        flex: 1.2,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '60px'
    },
    heroImg: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        zIndex: 1
    },
    heroOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)',
        zIndex: 2,
        transition: 'all 1s ease'
    },
    heroTextContent: {
        position: 'relative',
        zIndex: 3,
        color: 'white'
    },
    heroBrand: { fontSize: '48px', fontWeight: '900', margin: 0, letterSpacing: '-2px' },
    heroSlogan: { fontSize: '20px', opacity: 0.9, fontWeight: '300' },
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '60px 40px',
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden'
    },
    header: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10
    },
    stepsContainer: { display: 'flex', gap: '8px' },
    stepDot: { height: '8px', borderRadius: '10px', transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' },
    skipBtn: {
        background: 'rgba(248, 250, 252, 0.8)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #e2e8f0',
        padding: '10px 24px',
        borderRadius: '30px',
        color: '#64748b',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
        transition: 'all 0.3s ease'
    },
    content: {
        textAlign: 'center',
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        zIndex: 10
    },
    iconBox: {
        width: '140px', height: '140px', borderRadius: '40px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 40px',
        boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.4)',
        transition: 'all 0.5s ease'
    },
    title: {
        fontSize: '34px',
        color: '#0f172a',
        marginBottom: '16px',
        fontWeight: '800',
        letterSpacing: '-1px'
    },
    subtitle: {
        fontSize: '17px',
        color: '#475569',
        lineHeight: '1.6',
        fontWeight: '400'
    },
    footer: {
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 10
    },
    nextBtn: {
        width: '100%',
        padding: '20px',
        backgroundColor: '#6366f1',
        color: 'white',
        border: 'none',
        borderRadius: '20px',
        fontSize: '18px',
        fontWeight: '700',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)'
    }
};

export default Home;
