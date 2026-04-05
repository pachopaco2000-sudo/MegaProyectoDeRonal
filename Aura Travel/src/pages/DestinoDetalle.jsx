import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import { supabase } from '../services/supabaseClient';
import './styles/DestinoDetalle.css';

const DestinoDetalle = () => {
        const { id } = useParams();
    const [selectedTab, setSelectedTab] = useState('visión');
    const { user, profile } = useContext(UserContext);
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    const [destino, setDestino] = useState(null);
    const [actividades, setActividades] = useState([]);
    const [restaurantes, setRestaurantes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetalle = async () => {
            setIsLoading(true);
            try {
                // 1. Obtener destino
                const { data: dData, error: dError } = await supabase
                    .from('Destino')
                    .select('*')
                    .eq('id', id)
                    .single();
                
                if (dError) throw dError;
                setDestino(dData);

                // 2. Obtener actividades del destino
                const { data: aData } = await supabase
                    .from('Actividades')
                    .select('nombre, precio, duracion, imagen')
                    .eq('destino_id', id);
                setActividades(aData || []);

                // 3. Obtener restaurantes del destino
                const { data: rData } = await supabase
                    .from('Restaurantes')
                    .select('nombre, tipoComida, precio, rating')
                    .eq('destino_id', id);
                setRestaurantes(rData || []);

            } catch (error) {
                console.error("Error al cargar detalles del destino:", error);
                showNotification("No se pudo cargar el destino.", "error");
                navigate('/destinos');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchDetalle();
        }
    }, [id, navigate, showNotification]);

    const handleReserve = async () => {
        if (!user) {
            showNotification("Necesitas iniciar sesión para reservar tu viaje.", "error");
            navigate('/login');
            return;
        }

        try {
            const nuevaReserva = {
                destino: destino.nombre,
                ubicacion: destino.pais,
                estado: 'Pendiente',
                imagen: destino.imagen,
                correo_usuario: user.email,
                personas: 1
            };

            const { error } = await supabase.from('Reservas').insert([nuevaReserva]);
            if (error) throw error;
            
            showNotification("¡Viaje reservado con éxito! Revisa tu itinerario.", "success");
        } catch (error) {
            console.error("Error ingresando reserva:", error);
            showNotification("Error de reserva. Verifica la tabla/columnas.", "error");
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#64748b' }}>
                <h2>Cargando tu próxima aventura... ✨</h2>
            </div>
        );
    }

    if (!destino) return null;

    // Calcular precio promedio o usar uno estático para la reserva
    const precioBase = actividades.reduce((acc, act) => acc + (Number(act.precio) || 0), 0) + 
                             Math.floor((Math.random() * 500) + 300); // Base + actividades
    
    // RF-10: Localización adaptada al usuario mediante Intl API
    const userLocale = profile?.idioma === 'en' ? 'en-US' : (profile?.idioma === 'fr' ? 'fr-FR' : 'es-ES');
    const userCurrency = profile?.moneda || 'EUR';
    const precioFormateado = new Intl.NumberFormat(userLocale, { style: 'currency', currency: userCurrency }).format(precioBase);

    return (
        <div className="detalle-container anim-fade">
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .anim-fade { animation: fadeIn 0.5s ease-out; }
            `}</style>
            <div className="detalle-hero-section">
                <img src={destino.imagen || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'} alt={destino.nombre} className="detalle-hero-img" />
                <button onClick={() => navigate(-1)} className="detalle-back-btn">←</button>
                <div className="detalle-hero-overlay">
                    <div className="detalle-tag">{destino.pais}</div>
                    <h1 className="detalle-hero-title">{destino.nombre}</h1>
                    <div className="detalle-rating-row">
                        <span>⭐ {destino.rating || 'Nuevo'}</span>
                        <span style={{ margin: '0 10px' }}>•</span>
                        <span>{precioFormateado} aprox. por persona</span>
                    </div>
                </div>
            </div>

            <div className="detalle-content">
                <div className="detalle-tab-row">
                    {['visión', 'actividades', 'restaurantes', 'clima', 'servicios'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setSelectedTab(tab)}
                            className="detalle-tab-btn"
                            style={{ borderBottom: selectedTab === tab ? '3px solid #6366f1' : 'none', color: selectedTab === tab ? '#6366f1' : '#94a3b8', textTransform: 'capitalize' }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div>
                    {selectedTab === 'visión' && (
                        <div className="anim-fade">
                            <h3 className="detalle-section-title">Sobre {destino.nombre}</h3>
                            <p className="detalle-desc-text">Descubre la maravilla que este lugar tiene para ofrecerte. Explora su cultura y paisajes inolvidables en {destino.pais}.</p>
                            
                            <div className="detalle-info-grid" style={{marginTop: '20px'}}>
                                <div className="detalle-info-card">
                                    <span className="detalle-info-icon">🗣️</span>
                                    <div><div className="detalle-info-label">País</div><div className="detalle-info-value">{destino.pais}</div></div>
                                </div>
                                <div className="detalle-info-card">
                                    <span className="detalle-info-icon">🌤️</span>
                                    <div><div className="detalle-info-label">Temporada ideal</div><div className="detalle-info-value">{destino.clima || 'Cualquiera'}</div></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedTab === 'actividades' && (
                        <div className="anim-fade">
                            <h3 className="detalle-section-title">Lo que no te puedes perder</h3>
                            {actividades.length === 0 ? (
                                <p style={{color: '#64748b'}}>No hay actividades registradas aún.</p>
                            ) : (
                                <div className="detalle-list">
                                    {actividades.map((act, i) => (
                                        <div key={i} className="detalle-list-item" style={{display:'flex', justifyContent:'space-between'}}>
                                            <span>✨ <strong>{act.nombre}</strong> ({act.duracion})</span>
                                            <span style={{color: '#6366f1', fontWeight: 'bold'}}>€{act.precio}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {selectedTab === 'restaurantes' && (
                        <div className="anim-fade">
                            <h3 className="detalle-section-title">Dónde comer</h3>
                            {restaurantes.length === 0 ? (
                                <p style={{color: '#64748b'}}>No hay restaurantes registrados aún.</p>
                            ) : (
                                <div className="detalle-list">
                                    {restaurantes.map((rest, i) => (
                                        <div key={i} className="detalle-list-item" style={{display:'flex', justifyContent:'space-between'}}>
                                            <span>🍽️ <strong>{rest.nombre}</strong> <span style={{fontSize: '12px', color: '#64748b'}}>({rest.tipoComida})</span></span>
                                            <span>⭐ {rest.rating}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {selectedTab === 'clima' && (
                        <div className="anim-fade detalle-climate-card">
                            <div className="detalle-climate-header">
                                <span style={{ fontSize: '40px' }}>☀️</span>
                                <div>
                                    <h2 style={{ margin: 0 }}>{destino.clima || 'Clima Agradable'}</h2>
                                    <p style={{ margin: 0, color: '#64748b' }}>Condiciones según la temporada</p>
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
                            <h3 className="detalle-section-title">Servicios sugeridos de viaje</h3>
                            <div className="detalle-services-grid">
                                {['WiFi Hotel', 'Transporte Aeropuerto', 'Seguro Viajero'].map(s => (
                                    <div key={s} className="detalle-service-item">✅ {s}</div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="detalle-footer">
                <div className="detalle-price-container">
                    <div style={{ fontSize: '13px', color: '#64748b' }}>Referencia de Paquete</div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b' }}>{precioFormateado}</div>
                </div>
                <button onClick={handleReserve} className="detalle-reserve-btn">Reservar Paquete</button>
            </div>
        </div>
    );
};

export default DestinoDetalle;
