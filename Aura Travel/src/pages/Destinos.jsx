import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import { supabase } from '../services/supabaseClient';
// Importamos los componentes que creaste por aparte
import Explorar from './Explorar';
import Itinerario from './Itinerario';
import Alertas from './Alertas';
import Perfil from './Perfil';
import BotIA from './BotIA';
import './styles/Destinos.css';

const Destinos = () => {
    // Estado para controlar qué vista mostrar
    const [seccionActiva, setSeccionActiva] = useState('inicio');
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const { user } = useContext(UserContext);
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    const handleNavClick = (seccion) => {
        if (!user && (seccion === 'perfil' || seccion === 'itinerario' || seccion === 'alertas')) {
            setShowLoginPrompt(true);
            return;
        }
        setSeccionActiva(seccion);
    };

    const [destinosDestacados, setDestinosDestacados] = useState([]);

    useEffect(() => {
        const fetchTopDestinos = async () => {
            try {
                const { data } = await supabase
                    .from('Destino')
                    .select('*')
                    .order('rating', { ascending: false })
                    .limit(3);
                if (data) setDestinosDestacados(data);
            } catch (error) {
                console.error("Error fetching top destinos:", error);
            }
        };
        fetchTopDestinos();
    }, []);

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
                            <div key={dest.id} className="destinos-card" onClick={() => navigate(`/destino/${dest.id}`)} style={{cursor: 'pointer'}}>
                                <div className="destinos-img-container">
                                    <img src={dest.imagen || 'https://via.placeholder.com/600'} alt={dest.nombre} className="destinos-img" />
                                    <div className="destinos-rating-badge">⭐ {dest.rating || 4.5}</div>
                                </div>
                                <div className="destinos-info">
                                    <h3 className="destinos-name">{dest.nombre}{dest.pais ? `, ${dest.pais}` : ''}</h3>
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

            {/* Modal de confirmación de Login */}
            {showLoginPrompt && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>Iniciar sesión</h3>
                        <p style={{ color: '#64748b', marginBottom: '20px' }}>Necesitas iniciar sesión para ver tus itinerarios, alertas y perfil.</p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowLoginPrompt(false)} style={styles.cancelBtn}>Quizás luego</button>
                            <button onClick={() => navigate('/login')} style={styles.loginBtn}>Ir a iniciar sesión</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Módulo de Inteligencia Artificial (Solamente visible estéticamente para usuarios) */}
            {user && <BotIA />}
        </div>
    );
};

const styles = {
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { backgroundColor: '#fff', padding: '24px', borderRadius: '16px', width: '320px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
    cancelBtn: { padding: '10px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: 'bold', color: '#64748b' },
    loginBtn: { padding: '10px 16px', border: 'none', borderRadius: '8px', background: '#6366f1', cursor: 'pointer', fontWeight: 'bold', color: '#fff' }
};

export default Destinos;