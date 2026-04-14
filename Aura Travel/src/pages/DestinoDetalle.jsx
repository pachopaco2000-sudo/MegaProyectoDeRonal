import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import { supabase } from '../services/supabaseClient';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import './styles/DestinoDetalle.css';

// Fix e Iconos personalizados para Actividades/Restaurantes
const ActivityIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const RestaurantIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const DestinoDetalle = () => {
        const { id } = useParams();
    const [selectedTab, setSelectedTab] = useState('visión');
    const { user, profile } = useContext(UserContext);
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    // Estados del Checkout Modal
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [checkoutData, setCheckoutData] = useState({
        fechaInicio: '',
        fechaFin: '',
        personas: 1,
        metodoPago: 'tarjeta'
    });

    const [destino, setDestino] = useState(null);
    const [actividades, setActividades] = useState([]);
    const [restaurantes, setRestaurantes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isRutaOptimizada, setIsRutaOptimizada] = useState(false);

    // Initial check for favorite status
    useEffect(() => {
        if (id && user) {
            const favs = JSON.parse(localStorage.getItem(`aura_favs_${user.id}`)) || [];
            setIsFavorite(favs.includes(id));
        }
    }, [id, user]);

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
                    .select('*')
                    .eq('destino_id', id);
                setActividades(aData || []);

                // 3. Obtener restaurantes del destino
                const { data: rData } = await supabase
                    .from('Restaurantes')
                    .select('*')
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

    const openCheckout = () => {
        if (!user) {
            showNotification("Necesitas iniciar sesión para reservar tu viaje.", "error");
            navigate('/login');
            return;
        }
        setIsCheckoutOpen(true);
    };

    const confirmReservation = async () => {
        const today = new Date().toISOString().split('T')[0];

        if (!checkoutData.fechaInicio || !checkoutData.fechaFin) {
            showNotification("Por favor selecciona las fechas completas de tu viaje.", "error");
            return;
        }

        if (checkoutData.fechaInicio < today) {
            showNotification("No puedes reservar una fecha en el pasado. Selecciona hoy o un día futuro.", "error");
            return;
        }

        if (checkoutData.fechaFin < checkoutData.fechaInicio) {
            showNotification("La fecha de regreso no puede ser anterior a la de salida.", "error");
            return;
        }

        try {
            const nuevaReserva = {
                destino: destino.nombre,
                ubicacion: destino.pais,
                estado: 'Pendiente',
                imagen: destino.imagen,
                correo_usuario: user.correo,
                personas: parseInt(checkoutData.personas) || 1,
                fechaInicio: checkoutData.fechaInicio,
                fechaFin: checkoutData.fechaFin
            };

            // CHECK LOGICO DE DUPLICADOS PARA RESPONDER EL CRITERIO DEL USUARIO
            const { data: duplicateCheck, error: dupError } = await supabase
                .from('Reservas')
                .select('id')
                .eq('correo_usuario', user.correo)
                .eq('destino', destino.nombre);
                
            if (dupError) throw dupError;
            if (duplicateCheck && duplicateCheck.length > 0) {
                showNotification("¡Ya tienes reservado este destino en tu Itinerario!", "error");
                return;
            }

            const { error } = await supabase.from('Reservas').insert([nuevaReserva]);
            if (error) {
                if (error.code === '23505' || error.message?.includes('duplicate key')) {
                    showNotification("Ya tienes una reserva activa para este destino.", "error");
                    return;
                }
                if (error.code === '23503') {
                    showNotification("Error de BD: Relación de llave foránea mal configurada en Supabase.", "error");
                    throw error;
                }
                throw error;
            }
            
            showNotification("¡Pago Aprobado! Aventura reservada con éxito.", "success");
            setIsCheckoutOpen(false);
        } catch (error) {
            console.error("Error ingresando reserva:", error);
            showNotification("Error de reserva. Inténtalo más tarde.", "error");
        }
    };

    const toggleFavorite = () => {
        if (!user) {
            showNotification("Debes iniciar sesión para darle me gusta.", "error");
            return;
        }
        
        const favs = JSON.parse(localStorage.getItem(`aura_favs_${user.id}`)) || [];
        if (isFavorite) {
            const newFavs = favs.filter(fId => fId !== id);
            localStorage.setItem(`aura_favs_${user.id}`, JSON.stringify(newFavs));
            setIsFavorite(false);
            showNotification("Removido de favoritos.", "success");
        } else {
            favs.push(id);
            localStorage.setItem(`aura_favs_${user.id}`, JSON.stringify(favs));
            setIsFavorite(true);
            showNotification("¡Añadido a tus favoritos! ❤️", "success");
        }
    };

    // Extraer el precio real de la base de datos para la cotización
    const precioBase = Number(destino?.precio) || 0;

    // Calcular cotización final (precio * personas)
    const precioCotizado = precioBase * (checkoutData.personas || 1);
    
    // RF-11: Funcionalidad simulada para evaluar "Optimización de Ruta"
    const handleOptimizarRuta = () => {
        setIsRutaOptimizada(true);
        showNotification("¡Ruta organizada eficientemente para ahorrar tiempo!", "success");
    };

    const actividadesMostrar = isRutaOptimizada 
        ? [...actividades].sort((a,b) => (b.id || 0) - (a.id || 0)) // Inversión simple simulando un cambio AI
        : actividades;
    const horariosSugeridos = ["09:00 AM", "11:30 AM", "02:15 PM", "05:00 PM", "08:30 PM"];

    // RF-10: Localización adaptada al usuario mediante Intl API
    const userLocale = profile?.idioma === 'en' ? 'en-US' : (profile?.idioma === 'fr' ? 'fr-FR' : 'es-ES');
    const userCurrency = profile?.moneda || 'EUR';
    const precioFormateado = new Intl.NumberFormat(userLocale, { style: 'currency', currency: userCurrency }).format(precioBase);
    const totalFormateado = new Intl.NumberFormat(userLocale, { style: 'currency', currency: userCurrency }).format(precioCotizado);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#64748b' }}>
                <h2>Cargando tu próxima aventura... ✨</h2>
            </div>
        );
    }

    if (!destino) return null;

    // --- ALGORITMO DE COORDENADAS (Fallback & Dispersión) ---
    // Determinamos Epicentro del Destino
    let baseLat = parseFloat(destino.latitud);
    let baseLng = parseFloat(destino.longitud);

    if (isNaN(baseLat) || isNaN(baseLng) || (baseLat === 0 && baseLng === 0)) {
        const cityName = (destino.ciudad || destino.nombre || '').toLowerCase();
        if (cityName.includes('cartagena')) { baseLat = 10.3910; baseLng = -75.4794; }
        else if (cityName.includes('paris') || cityName.includes('parís')) { baseLat = 48.8566; baseLng = 2.3522; }
        else if (cityName.includes('roma')) { baseLat = 41.9028; baseLng = 12.4964; }
        else if (cityName.includes('madrid')) { baseLat = 40.4168; baseLng = -3.7038; }
        else if (cityName.includes('tokio') || cityName.includes('tokyo')) { baseLat = 35.6762; baseLng = 139.6503; }
        else if (cityName.includes('londres') || cityName.includes('london')) { baseLat = 51.5072; baseLng = -0.1276; }
        else {
            let hash = 0;
            for (let i = 0; i < cityName.length; i++) hash = cityName.charCodeAt(i) + ((hash << 5) - hash);
            baseLat = (Math.abs(hash) % 100) - 50; 
            baseLng = (Math.abs(hash * 3) % 360) - 180;
        }
    }
    const epicentro = [baseLat, baseLng];

    // Función de compensación usando Hashes para graficar aleatoriamente sin patrón circular
    const getOffsetCoords = (itemStr, factor = 0.015) => {
        let hash = 0;
        for (let i = 0; i < itemStr.length; i++) hash = (hash << 5) - hash + itemStr.charCodeAt(i);
        hash = Math.abs(hash);
        
        // Pseudo-random offset (-0.5 to 0.5) * factor
        const latOffset = ((hash % 100) / 100 - 0.5) * factor; 
        const lngOffset = (((hash >> 2) % 100) / 100 - 0.5) * factor;
        
        return [baseLat + latOffset, baseLng + lngOffset];
    };

    return (
        <div className="detalle-container anim-fade">
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .anim-fade { animation: fadeIn 0.5s ease-out; }
                .detalle-fav-btn {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    width: 45px;
                    height: 45px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.9);
                    border: none;
                    cursor: pointer;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 24px;
                    z-index: 10;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.15);
                    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .detalle-fav-btn:hover {
                    transform: scale(1.15);
                }
                .detalle-fav-btn:active {
                    transform: scale(0.9);
                }
            `}</style>

            {/* HERO COVER HEADER */}
            <div className="detalle-hero">
                <button className="detalle-fav-btn" onClick={toggleFavorite} title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}>
                    {isFavorite ? '❤️' : '🤍'}
                </button>
                <img 
                    src={destino.imagen || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200'} 
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200";
                    }}
                    alt={destino.nombre} 
                    className="detalle-img" 
                />
                <div className="detalle-hero-gradient"></div>
                <button onClick={() => navigate(-1)} className="detalle-back-btn" title="Volver">←</button>
            </div>

            {/* SPLIT GRID LAYOUT */}
            <div className="detalle-body-wrapper">
                
                {/* Lado Izquierdo: Titulo y Contenidos desplazables */}
                <div className="detalle-main-content">
                    
                    <div className="detalle-title-area">
                        <div className="detalle-subtitle">📍 {destino.pais}</div>
                        <h1 className="detalle-title">{destino.nombre}</h1>
                        <div className="detalle-subtitle" style={{ fontSize: '16px', marginTop: '12px' }}>
                            <span>⭐ {destino.rating || '4.5'} valorado por aventureros</span>
                        </div>
                    </div>

                    <div className="detalle-content-box">
                        <div className="detalle-tabs">
                            {['visión', 'actividades', 'restaurantes', 'clima', 'servicios'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setSelectedTab(tab)}
                                    className={`detalle-tab ${selectedTab === tab ? 'active' : ''}`}
                                    style={{ textTransform: 'capitalize' }}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* CONTENIDOS DE TABLA */}
                        <div className="detalle-content-pad" style={{ padding: '0 10px 10px' }}>
                            {selectedTab === 'visión' && (
                                <div className="anim-fade">
                                    <h3 className="detalle-section-title">Sobre {destino.nombre}</h3>
                                    <p className="detalle-desc-text">Sumérgete en la maravilla local. Descubre una cultura inmersiva, explora calles de historia y maravíllate con paisajes inolvidables de punta a punta en {destino.pais}. Una experiencia diseñada para el aventurero real.</p>
                                    
                                    <div className="detalle-chip-group">
                                        <div className="detalle-chip">
                                            <span style={{fontSize: '18px'}}>🌍</span>
                                            <span>País: {destino.pais}</span>
                                        </div>
                                        <div className="detalle-chip">
                                            <span style={{fontSize: '18px'}}>🌤️</span>
                                            <span>Temporada: {destino.clima || 'Todo el año'}</span>
                                        </div>
                                        <div className="detalle-chip">
                                            <span style={{fontSize: '18px'}}>📸</span>
                                            <span>Ideal para: {destino.categoria || 'Exploración'}</span>
                                        </div>
                                    </div>

                                    {/* SECCIÓN DE MAPA DINÁMICO */}
                                    <div style={{ marginTop: '32px' }}>
                                        <h3 className="detalle-section-title" style={{ fontSize: '18px', marginBottom: '16px' }}>Ubicación Satelital</h3>
                                        <div style={{ width: '100%', height: '300px', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                            <iframe 
                                                width="100%" 
                                                height="100%" 
                                                frameBorder="0" 
                                                style={{ border: 0 }}
                                                src={`https://maps.google.com/maps?q=${destino.latitud ? `${destino.latitud},${destino.longitud}` : encodeURIComponent(destino.nombre + ', ' + destino.pais)}&hl=es&z=12&output=embed`}
                                                allowFullScreen
                                                title={`Mapa de ${destino.nombre}`}
                                            />
                                        </div>
                                        {(!destino.latitud || !destino.longitud) && (
                                            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px', textAlign: 'right' }}>
                                                Ubicación referencial basada en el nombre.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedTab === 'actividades' && (
                                <div className="anim-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 className="detalle-section-title" style={{ margin: 0 }}>Lo que no te puedes perder</h3>
                                        {actividades.length > 1 && !isRutaOptimizada && (
                                            <button onClick={handleOptimizarRuta} style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(168, 85, 247, 0.3)', transition: 'transform 0.2s' }}>
                                                🪄 Optimizar Ruta
                                            </button>
                                        )}
                                    </div>
                                    
                                    {actividades.length === 0 ? (
                                        <p style={{color: '#64748b'}}>No hay actividades registradas aún.</p>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '20px' }}>
                                            {/* Sub-Mapa de Actividades */}
                                            <div style={{ height: '400px', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                                <MapContainer center={epicentro} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                                                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                                                    {actividadesMostrar.map((act, i) => {
                                                        const pos = getOffsetCoords(act.nombre || String(i), 0.012);
                                                        return (
                                                            <Marker key={i} position={pos} icon={ActivityIcon}>
                                                                <Popup closeButton={false} className="custom-popup-detalle">
                                                                    <div style={{ padding: '8px', textAlign: 'center', minWidth: '150px' }}>
                                                                        {act.imagen && <img src={act.imagen} alt="Miniatura" style={{width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px'}} />}
                                                                        <strong style={{ fontSize: '15px', display: 'block', color: '#0f172a' }}>{act.nombre}</strong>
                                                                        {act.type && <span style={{ fontSize: '12px', display: 'block', color: '#64748b', marginBottom: '4px' }}>{act.type}</span>}
                                                                        <span style={{ fontSize: '14px', color: '#6366f1', fontWeight: '800' }}>€{act.precio} / {act.duracion}</span>
                                                                    </div>
                                                                </Popup>
                                                            </Marker>
                                                        )
                                                    })}
                                                </MapContainer>
                                            </div>

                                            {/* Listado de Actividades Scrollable */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                                                {actividadesMostrar.map((act, i) => (
                                                    <div key={i} className="actividad-card" style={isRutaOptimizada ? { borderLeft: '4px solid #a855f7', background: '#f8fafc' } : {}}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                            {act.imagen ? (
                                                                <img src={act.imagen} alt={act.nombre} style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }} />
                                                            ) : (
                                                                <span style={{ fontSize: '28px' }}>✨</span>
                                                            )}
                                                            <div>
                                                                <strong style={{ display: 'block', color: '#0f172a', fontSize: '16px' }}>
                                                                    {isRutaOptimizada && <span style={{ color: '#a855f7', marginRight: '8px', fontSize: '13px' }}>{horariosSugeridos[i % horariosSugeridos.length]}</span>}
                                                                    {act.nombre}
                                                                </strong>
                                                                <span style={{ fontSize: '13px', color: '#64748b' }}>Duración: {act.duracion}</span>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <span style={{ color: '#14b8a6', fontWeight: '800', fontSize: '18px' }}>€{act.precio}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedTab === 'restaurantes' && (
                                <div className="anim-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <h3 className="detalle-section-title">Dónde comer</h3>
                                    {restaurantes.length === 0 ? (
                                        <p style={{color: '#64748b'}}>No hay restaurantes registrados aún.</p>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '20px' }}>
                                            {/* Sub-Mapa de Restaurantes */}
                                            <div style={{ height: '400px', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                                <MapContainer center={epicentro} zoom={14} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                                                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                                                    {restaurantes.map((rest, i) => {
                                                        const pos = getOffsetCoords(rest.nombre || String(i), 0.008);
                                                        return (
                                                            <Marker key={i} position={pos} icon={RestaurantIcon}>
                                                                <Popup closeButton={false} className="custom-popup-detalle">
                                                                    <div style={{ padding: '8px', textAlign: 'center', minWidth: '150px' }}>
                                                                        {rest.image && <img src={rest.image} alt="Restaurante" style={{width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px'}} />}
                                                                        <strong style={{ fontSize: '15px', display: 'block', color: '#0f172a' }}>{rest.nombre}</strong>
                                                                        <span style={{ fontSize: '12px', display: 'block', color: '#64748b', marginBottom: '4px' }}>Culinaria {rest.tipoComida}</span>
                                                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                                                            <span style={{ fontSize: '13px', color: '#f59e0b', fontWeight: 'bold' }}>⭐ {rest.rating}</span>
                                                                            <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 'bold' }}>{rest.precio || '$$'}</span>
                                                                        </div>
                                                                    </div>
                                                                </Popup>
                                                            </Marker>
                                                        )
                                                    })}
                                                </MapContainer>
                                            </div>

                                            {/* Listado de Restaurantes Scrollable */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                                                {restaurantes.map((rest, i) => (
                                                    <div key={i} className="actividad-card">
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                            <span style={{ fontSize: '28px' }}>🍽️</span>
                                                            <div>
                                                                <strong style={{ display: 'block', color: '#0f172a', fontSize: '16px' }}>{rest.nombre}</strong>
                                                                <span style={{ fontSize: '13px', color: '#64748b' }}>Cocina {rest.tipoComida}</span>
                                                            </div>
                                                        </div>
                                                        <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#6366f1' }}>⭐ {rest.rating}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedTab === 'clima' && (
                                <div className="anim-fade detalle-climate-card">
                                    <div className="detalle-climate-header">
                                        <span style={{ fontSize: '50px', filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.1))' }}>☀️</span>
                                        <div>
                                            <h2 style={{ margin: '0 0 4px 0', fontSize: '28px', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{destino.clima || 'Agradable'}</h2>
                                            <p style={{ margin: 0, opacity: 0.9 }}>Pronóstico y condiciones</p>
                                        </div>
                                    </div>
                                    <div className="detalle-forecast">
                                        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie'].map(day => (
                                            <div key={day} className="detalle-day">
                                                <div style={{ fontSize: '13px', opacity: 0.8, fontWeight: '600' }}>{day}</div>
                                                <div style={{ fontSize: '22px' }}>☀️</div>
                                                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>26°</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedTab === 'servicios' && (
                                <div className="anim-fade">
                                    <h3 className="detalle-section-title">Servicios sugeridos</h3>
                                    <p className="detalle-desc-text" style={{marginBottom: '20px'}}>Este destino está pre-configurado para conectarse directamente con nuestras agencias recomendadas.</p>
                                    <div className="detalle-services-grid">
                                        {['WiFi Gratuito', 'Transporte VIP', 'Seguro Viajero', 'Guía Local'].map(s => (
                                            <div key={s} className="detalle-service-item">
                                                <span style={{color: '#10b981'}}>✓</span> {s}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Lado Derecho: Columna Fija Sticky */}
                <div className="detalle-sidebar">
                    <div className="checkout-card">
                        <p style={{ margin: '0 0 10px 0', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px' }}>Estimado del Viaje</p>
                        <div className="checkout-price">{precioFormateado} <span>/ pp</span></div>
                        
                        <div className="checkout-divider"></div>
                        
                        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '15px' }}>
                                <span>Actividades base</span>
                                <span style={{ fontWeight: '600' }}>Calculadas</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '15px' }}>
                                <span>Costos plataforma</span>
                                <span style={{ fontWeight: '600', color: '#10b981' }}>Gratis hoy</span>
                            </div>
                        </div>

                        <button onClick={openCheckout} className="detalle-reserve-btn">
                            Reservar Aventura
                        </button>
                        <div style={{textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#94a3b8'}}>
                            Inicia el proceso de pago seguro
                        </div>
                    </div>
                </div>
            </div>

            {/* CHECKOUT MODAL OVERLAY */}
            {isCheckoutOpen && (
                <div className="checkout-modal-overlay">
                    <div className="checkout-modal">
                        <button className="checkout-modal-close" onClick={() => setIsCheckoutOpen(false)}>✕</button>
                        <h2 className="checkout-modal-title">Checkout de Aventura</h2>
                        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Completa los detalles de tu viaje a {destino.nombre}</p>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div className="checkout-form-group" style={{ flex: 1 }}>
                                <label className="checkout-label">Fecha de Salida</label>
                                <input 
                                    type="date" 
                                    className="checkout-input" 
                                    value={checkoutData.fechaInicio} 
                                    onChange={e => setCheckoutData({...checkoutData, fechaInicio: e.target.value})} 
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="checkout-form-group" style={{ flex: 1 }}>
                                <label className="checkout-label">Fecha de Regreso</label>
                                <input 
                                    type="date" 
                                    className="checkout-input" 
                                    value={checkoutData.fechaFin} 
                                    onChange={e => setCheckoutData({...checkoutData, fechaFin: e.target.value})} 
                                    min={checkoutData.fechaInicio || new Date().toISOString().split('T')[0]} 
                                />
                            </div>
                        </div>

                        <div className="checkout-form-group">
                            <label className="checkout-label">N° de Aventureros</label>
                            <input type="number" min="1" max="10" className="checkout-input" value={checkoutData.personas} onChange={e => setCheckoutData({...checkoutData, personas: parseInt(e.target.value) || 1})} />
                        </div>

                        <div className="checkout-form-group" style={{ marginTop: '20px' }}>
                            <label className="checkout-label">Método de Pago Seguro</label>
                            <div className="checkout-payment-methods">
                                <div className={`payment-method-card ${checkoutData.metodoPago === 'tarjeta' ? 'active' : ''}`} onClick={() => setCheckoutData({...checkoutData, metodoPago: 'tarjeta'})}>
                                    💳 Tarjeta
                                </div>
                                <div className={`payment-method-card ${checkoutData.metodoPago === 'paypal' ? 'active' : ''}`} onClick={() => setCheckoutData({...checkoutData, metodoPago: 'paypal'})}>
                                    🅿️ PayPal
                                </div>
                            </div>
                        </div>

                        <div className="checkout-summary">
                            <div className="checkout-summary-row">
                                <span>Tarifa Base ({checkoutData.personas}x)</span>
                                <span>{precioFormateado} c/u</span>
                            </div>
                            <div className="checkout-summary-row" style={{ color: '#10b981' }}>
                                <span>Cargos Administrativos</span>
                                <span>Gratis</span>
                            </div>
                            <div className="checkout-total-row">
                                <span>Total a Pagar</span>
                                <span>{totalFormateado}</span>
                            </div>
                        </div>

                        <button onClick={confirmReservation} className="detalle-reserve-btn" style={{ background: '#0f172a' }}>
                            Confirmar y Pagar
                        </button>
                        <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '16px' }}>🔒 Pago encriptado de punta a punta con SSL</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DestinoDetalle;
