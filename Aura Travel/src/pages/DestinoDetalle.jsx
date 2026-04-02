import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import './styles/DestinoDetalle.css';

const DestinoDetalle = ({ destino, onBack }) => {
    const [selectedTab, setSelectedTab] = useState('visión');
    const { user } = useContext(UserContext);
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    // Datos simulados si no se pasan
    const d = destino || {
        id: 1,
        nombre: 'Santorini',
        pais: 'Grecia',
        rating: 4.9,
        precio: 850,
        img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        descripcion: 'Una de las islas más famosas de las Cícladas, conocida por sus icónicas cúpulas azules sobre edificios blancos.',
        clima: '24°C - Soleado',
        idioma: 'Griego, Inglés',
        moneda: 'Euro (€)',
        actividades: ['Atardecer en Oia', 'Tour de Vinos', 'Playas de arena negra'],
        restaurantes: ['Amoudi Bay', 'Selene', 'Metaxi Mas']
    };

    const handleReserve = () => {
        if (!user) {
            showNotification("Necesitas iniciar sesión para reservar tu viaje.", "error");
            navigate('/login');
            return;
        }
        showNotification("¡Viaje reservado con éxito!", "success");
    };

    return (
        <div className="detalle-container anim-fade">
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .anim-fade { animation: fadeIn 0.5s ease-out; }
            `}</style>
            <div className="detalle-hero-section">
                <img src={d.img} alt={d.nombre} className="detalle-hero-img" />
                <button onClick={onBack} className="detalle-back-btn">←</button>
                <div className="detalle-hero-overlay">
                    <div className="detalle-tag">{d.pais}</div>
                    <h1 className="detalle-hero-title">{d.nombre}</h1>
                    <div className="detalle-rating-row">
                        <span>⭐ {d.rating}</span>
                        <span style={{ margin: '0 10px' }}>•</span>
                        <span>€{d.precio} por persona</span>
                    </div>
                </div>
            </div>

            <div className="detalle-content">
                <div className="detalle-tab-row">
                    {['visión', 'detalles', 'clima', 'servicios'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setSelectedTab(tab)}
                            className="detalle-tab-btn"
                            style={{ borderBottom: selectedTab === tab ? '3px solid #6366f1' : 'none', color: selectedTab === tab ? '#6366f1' : '#94a3b8' }}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                <div>
                    {selectedTab === 'visión' && (
                        <div className="anim-fade">
                            <h3 className="detalle-section-title">Sobre el destino</h3>
                            <p className="detalle-desc-text">{d.descripcion} Es el lugar perfecto para escapadas románticas o aventuras inolvidables frente al mar Egeo.</p>

                            <h3 className="detalle-section-title">Lo que no te puedes perder</h3>
                            <div className="detalle-list">
                                {d.actividades.map((act, i) => (
                                    <div key={i} className="detalle-list-item">✨ {act}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedTab === 'detalles' && (
                        <div className="anim-fade detalle-info-grid">
                            <div className="detalle-info-card">
                                <span className="detalle-info-icon">🗣️</span>
                                <div>
                                    <div className="detalle-info-label">Idiomas</div>
                                    <div className="detalle-info-value">{d.idioma}</div>
                                </div>
                            </div>
                            <div className="detalle-info-card">
                                <span className="detalle-info-icon">💰</span>
                                <div>
                                    <div className="detalle-info-label">Moneda</div>
                                    <div className="detalle-info-value">{d.moneda}</div>
                                </div>
                            </div>
                            <div className="detalle-info-card">
                                <span className="detalle-info-icon">🍽️</span>
                                <div>
                                    <div className="detalle-info-label">Gastronomía</div>
                                    <div className="detalle-info-value">Mediterránea</div>
                                </div>
                            </div>
                            <div className="detalle-info-card">
                                <span className="detalle-info-icon">⏱️</span>
                                <div>
                                    <div className="detalle-info-label">Mejor época</div>
                                    <div className="detalle-info-value">Mayo - Septiembre</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedTab === 'clima' && (
                        <div className="anim-fade detalle-climate-card">
                            <div className="detalle-climate-header">
                                <span style={{ fontSize: '40px' }}>☀️</span>
                                <div>
                                    <h2 style={{ margin: 0 }}>{d.clima}</h2>
                                    <p style={{ margin: 0, color: '#64748b' }}>Cielo despejado ahora mismo</p>
                                </div>
                            </div>
                            <div className="detalle-forecast">
                                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie'].map(day => (
                                    <div key={day} className="detalle-day">
                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{day}</div>
                                        <div style={{ fontSize: '18px' }}>☀️</div>
                                        <div style={{ fontSize: '13px', fontWeight: 'bold' }}>26°</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedTab === 'servicios' && (
                        <div className="anim-fade">
                            <h3 className="detalle-section-title">Servicios disponibles</h3>
                            <div className="detalle-services-grid">
                                {['WiFi Gratis', 'Transporte', 'Guía Local', 'Seguro Viaje'].map(s => (
                                    <div key={s} className="detalle-service-item">✅ {s}</div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="detalle-footer">
                <div className="detalle-price-container">
                    <div style={{ fontSize: '13px', color: '#64748b' }}>Precio total</div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b' }}>€{d.precio}</div>
                </div>
                <button onClick={handleReserve} className="detalle-reserve-btn">Reservar Viaje</button>
            </div>
        </div>
    );
};

export default DestinoDetalle;
