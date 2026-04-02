import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
// Importamos los componentes que creaste por aparte
import Explorar from './Explorar';
import Itinerario from './Itinerario';
import Alertas from './Alertas';
import Perfil from './Perfil';
import './styles/Destinos.css';

const Destinos = () => {
    // Estado para controlar qué vista mostrar
    const [seccionActiva, setSeccionActiva] = useState('inicio');
    const { user } = useContext(UserContext);
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    const handleNavClick = (seccion) => {
        if (!user && (seccion === 'perfil' || seccion === 'itinerario' || seccion === 'alertas')) {
            showNotification(`Necesitas iniciar sesión para ver esta sección.`, "error");
            navigate('/login');
            return;
        }
        setSeccionActiva(seccion);
    };

    const destinosDestacados = [
        { id: 1, nombre: 'Santorini, Grecia', rating: 4.9, img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600' },
        { id: 2, nombre: 'Bali, Indonesia', rating: 4.8, img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600' },
        { id: 3, nombre: 'Cartagena, Colombia', rating: 4.7, img: 'https://images.unsplash.com/photo-1583531172005-814191b8b6c0?w=600' }
    ];

    // Función que decide qué contenido renderizar en el centro
    const renderContent = () => {
        switch (seccionActiva) {
            case 'explorar': return <Explorar />;
            case 'itinerario': return <Itinerario />;
            case 'alertas': return <Alertas />;
            case 'perfil': return <Perfil />;
            default: return (
                <div className="anim-fade">
                    <header className="destinos-header">
                        <div>
                            <p className="destinos-welcome-text">¡Hola de nuevo!</p>
                            <h1 className="destinos-user-name">{user ? user.user_metadata?.name || 'Viajero' : 'Aventurero'}</h1>
                        </div>
                        {user ? (
                            <img src="https://i.pravatar.cc/150?u=ana" alt="Perfil" className="destinos-profile-pic" />
                        ) : (
                            <div className="destinos-profile-pic" style={{ backgroundColor: '#e2e8f0', color: '#64748b' }}>👤</div>
                        )}
                    </header>

                    <div className="destinos-search-container">
                        <input type="text" placeholder="Buscar destinos..." className="destinos-search-input" />
                    </div>

                    <div className="destinos-ia-card">
                        <div className="destinos-ia-icon">✨</div>
                        <div>
                            <h3 className="destinos-ia-title">Aura AI te recomienda</h3>
                            <p className="destinos-ia-subtitle">Basado en tus preferencias, Santorini es perfecta para tu próximo viaje</p>
                            <button className="destinos-ia-button">Explorar con IA</button>
                        </div>
                    </div>

                    <div className="destinos-stats-row">
                        <div className="destinos-stat-card"><span className="destinos-stat-icon">📅</span><h2 className="destinos-stat-value">1</h2><p className="destinos-stat-label">Reserva activa</p></div>
                        <div className="destinos-stat-card"><span className="destinos-stat-icon">📍</span><h2 className="destinos-stat-value">5</h2><p className="destinos-stat-label">Favoritos</p></div>
                        <div className="destinos-stat-card"><span className="destinos-stat-icon">📈</span><h2 className="destinos-stat-value">3</h2><p className="destinos-stat-label">Itinerarios</p></div>
                    </div>

                    <div className="destinos-section-header">
                        <h2 className="destinos-section-title">Destinos destacados</h2>
                        <span className="destinos-view-all">Ver todos</span>
                    </div>

                    <div className="destinos-grid">
                        {destinosDestacados.map(dest => (
                            <div key={dest.id} className="destinos-card">
                                <div className="destinos-img-container">
                                    <img src={dest.img} alt={dest.nombre} className="destinos-img" />
                                    <div className="destinos-rating-badge">⭐ {dest.rating}</div>
                                </div>
                                <div className="destinos-info">
                                    <h3 className="destinos-name">{dest.nombre}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="destinos-container">
            {/* Contenido Dinámico */}
            <div style={{ flex: 1 }}>
                {renderContent()}
            </div>

            {/* Barra de Navegación Inferior Funcional */}
            <nav className="destinos-bottom-nav">
                <div onClick={() => handleNavClick('inicio')} className="destinos-nav-item" style={{ color: seccionActiva === 'inicio' ? '#6366f1' : '#94a3b8' }}>
                    <span className="destinos-nav-icon">🏠</span>
                    <span className="destinos-nav-label">Inicio</span>
                </div>
                <div onClick={() => handleNavClick('explorar')} className="destinos-nav-item" style={{ color: seccionActiva === 'explorar' ? '#6366f1' : '#94a3b8' }}>
                    <span className="destinos-nav-icon">🧭</span>
                    <span className="destinos-nav-label">Explorar</span>
                </div>
                <div onClick={() => handleNavClick('itinerario')} className="destinos-nav-item" style={{ color: seccionActiva === 'itinerario' ? '#6366f1' : '#94a3b8' }}>
                    <span className="destinos-nav-icon">🗺️</span>
                    <span className="destinos-nav-label">Itinerario</span>
                </div>
                <div onClick={() => handleNavClick('alertas')} className="destinos-nav-item" style={{ color: seccionActiva === 'alertas' ? '#6366f1' : '#94a3b8' }}>
                    <span className="destinos-nav-icon">🔔</span>
                    <span className="destinos-nav-label">Alertas</span>
                </div>
                <div onClick={() => handleNavClick('perfil')} className="destinos-nav-item" style={{ color: seccionActiva === 'perfil' ? '#6366f1' : '#94a3b8' }}>
                    <span className="destinos-nav-icon">👤</span>
                    <span className="destinos-nav-label">Perfil</span>
                </div>
            </nav>
        </div>
    );
};

export default Destinos;