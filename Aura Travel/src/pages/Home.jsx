import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import './styles/Home.css';

const Home = () => {
    const { user } = useContext(UserContext);
    const [currentSlide, setCurrentSlide] = useState(0);
    const navigate = useNavigate();

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
            navigate('/destinos');
        }
    };

    const handleSkip = () => {
        navigate('/destinos');
    };

    return (
        <div className="home-page-wrapper">
            <div className="home-main-layout">
                {/* Lado Izquierdo: Visual (Desktop) */}
                <div className="desktop-hero home-hero-side">
                    <div className="home-hero-overlay" style={{ background: slides[currentSlide].color + '44' }} />
                    <img
                        key={slides[currentSlide].image}
                        src={slides[currentSlide].image}
                        alt="Destino"
                        className="hero-image home-hero-img"
                    />
                    <div className="home-hero-text-content">
                        <h2 className="home-hero-brand">Aura Travel</h2>
                        <p className="home-hero-slogan">Tu próximo destino, impulsado por IA.</p>
                    </div>
                </div>

                {/* Lado Derecho: Contenido Interactivo */}
                <div className="main-container home-container">
                    {/* Blobs solo visibles en el lado derecho o móvil */}
                    <div className="bg-blob" style={{
                        top: '-5%', right: '-5%', width: '250px', height: '250px',
                        backgroundColor: slides[currentSlide].decoration
                    }} />

                    <div className="home-header fade-in">
                        <div className="home-steps-container">
                            {slides.map((_, index) => (
                                <div
                                    key={index}
                                    className="home-step-dot"
                                    style={{
                                        backgroundColor: index === currentSlide ? '#6366f1' : '#e2e8f0',
                                        width: index === currentSlide ? '32px' : '8px',
                                        opacity: index === currentSlide ? 1 : 0.5
                                    }}
                                />
                            ))}
                        </div>
                        
                        <div className="home-auth-group">
                            {!user ? (
                                <>
                                    <button onClick={() => navigate('/login')} className="btn-auth login">Iniciar Sesión</button>
                                    <button onClick={() => navigate('/login', { state: { mode: 'register' } })} className="btn-auth register">Registrarse</button>
                                </>
                            ) : (
                                <button onClick={handleSkip} className="home-skip-btn">Explorar</button>
                            )}
                        </div>
                    </div>

                    <div key={currentSlide} className="slide-content home-content">
                        <div className="floating home-icon-box" style={{ background: slides[currentSlide].color }}>
                            <span style={{ fontSize: '64px' }}>{slides[currentSlide].icon}</span>
                        </div>
                        <h1 className="home-title">{slides[currentSlide].title}</h1>
                        <p className="home-subtitle">{slides[currentSlide].description}</p>
                    </div>

                    <div className="home-footer fade-in">
                        <button onClick={handleNext} className="home-next-btn">
                            {currentSlide === slides.length - 1 ? '¡Comenzar Aventura!' : 'Continuar'}
                            <span style={{ marginLeft: '12px', fontSize: '24px' }}>→</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
