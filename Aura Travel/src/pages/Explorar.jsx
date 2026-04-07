import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import './styles/Explorar.css';
import { calculateDistance } from '../services/geoUtils';
import { useNotification } from '../context/NotificationContext';

const Explorar = () => {
    const { showNotification } = useNotification();
    const [destinos, setDestinos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [userLoc, setUserLoc] = useState(null);
    
    // Filtros avanzados
    const [showFilters, setShowFilters] = useState(false);
    const [filterRating, setFilterRating] = useState(0);
    const [filterClima, setFilterClima] = useState(null);
    const [filterMaxPrecio, setFilterMaxPrecio] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchDestinos = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('Destino')
                    .select('*')
                    .order('rating', { ascending: false });
                
                if (error) throw error;
                // Inicialmente, sin distancia
                setDestinos(data || []);
            } catch (error) {
                console.error("Error cargando destinos en Explorar:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDestinos();
    }, []);

    const handleGeolocation = () => {
        if ("geolocation" in navigator) {
            showNotification("🚀 Buscando destinos cerca de ti...", "success");
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                setUserLoc({ lat: latitude, lng: longitude });

                // Calcular distancias y reordenar
                const sorted = [...destinos].map(d => ({
                    ...d,
                    distancia: calculateDistance(latitude, longitude, d.latitud, d.longitud)
                })).sort((a, b) => {
                    const distA = a.distancia === Infinity ? 999999 : a.distancia;
                    const distB = b.distancia === Infinity ? 999999 : b.distancia;
                    return distA - distB;
                });

                setDestinos(sorted);
                showNotification("🎯 Lista de destinos actualizada por proximidad.", "success");
            }, () => {
                showNotification("📍 Por favor, habilita el GPS para esta función.", "error");
            });
        }
    };

    const filteredResultados = destinos.filter(res => {
        const matchesSearch = (res.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                               (res.pais || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRating = filterRating === 0 || (res.rating && res.rating >= filterRating);
        // Algunos climas son "Soleado", "Tropical", etc. Un match parcial sirve.
        const matchesClima = !filterClima || (res.clima || '').toLowerCase().includes(filterClima.toLowerCase());
        const matchesMaxPrecio = filterMaxPrecio === '' || (res.precio && res.precio <= parseFloat(filterMaxPrecio));

        return matchesSearch && matchesRating && matchesClima && matchesMaxPrecio;
    });

    const removeFilters = () => {
        setFilterRating(0);
        setFilterClima(null);
        setFilterMaxPrecio('');
    };

    return (
        <div className="explorar-page">
            {/* BACKGROUND DECORATION */}
            <div className="aura-bg-container">
                <div className="aura-blob"></div>
                <div className="aura-blob"></div>
            </div>

            <div className="explorar-content-wrapper">
                <header className="explorar-header">
                    <h1 className="explorar-title">Explorar Destinos</h1>
                    
                    <div className="explorar-search-group">
                        <input 
                            type="text" 
                            className="explorar-search-input-fancy"
                            placeholder="Buscar por ciudad o país..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button 
                            className={`explorar-icon-btn btn-filters ${showFilters ? 'active' : ''}`}
                            onClick={() => setShowFilters(!showFilters)}
                            title="Filtros Avanzados"
                        >
                            {showFilters ? '✕' : '⚙️'}
                        </button>
                        <button 
                            className="explorar-icon-btn btn-gps"
                            onClick={handleGeolocation} 
                            title="Destinos cerca de mí (GPS)"
                        >
                            📍
                        </button>
                    </div>

                    {/* ADVANCED FILTERS PANEL */}
                    {showFilters && (
                        <div className="explorar-advanced-panel">
                            <div className="filter-group">
                                <div className="filter-group-title">Clasificación Mínima</div>
                                <div>
                                    {[0, 4.0, 4.5, 4.8].map(r => (
                                        <div 
                                            key={r}
                                            className={`fancy-option ${filterRating === r ? 'selected' : ''}`} 
                                            onClick={() => setFilterRating(r)}
                                        >
                                            {r === 0 ? 'Cualquiera' : `${r}+ ⭐`}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-group">
                                <div className="filter-group-title">Tipo de Clima</div>
                                <div>
                                    {['Explorar Todos', 'Soleado', 'Frio', 'Tropical'].map(c => {
                                        const val = c === 'Explorar Todos' ? null : c;
                                        return (
                                            <div 
                                                key={c}
                                                className={`fancy-option ${filterClima === val ? 'selected' : ''}`} 
                                                onClick={() => setFilterClima(val)}
                                            >
                                                {c === 'Explorar Todos' ? 'Todos' : c === 'Soleado' ? '☀️ Soleado' : c === 'Frio' ? '❄️ Frío' : '🌴 Tropical'}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="filter-group">
                                <div className="filter-group-title">Precio Máximo (€)</div>
                                <input 
                                    type="number" 
                                    className="fancy-input"
                                    placeholder="Ej: 1500" 
                                    value={filterMaxPrecio}
                                    onChange={(e) => setFilterMaxPrecio(e.target.value)}
                                />
                            </div>

                            {(filterRating !== 0 || filterClima !== null || filterMaxPrecio !== '') && (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
                                    <button onClick={removeFilters} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                                        ✖ Limpiar Filtros
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </header>

                <div className="explorar-main-layout">
                    {/* LEFT SIDE: SEARCH RESULTS */}
                    <div className="explorar-results-side">
                        <div className="explorar-results-count">
                            {isLoading ? 'Buscando destinos de ensueño...' : `${filteredResultados.length} joyas encontradas`}
                        </div>
                        <div className="explorar-grid">
                            {filteredResultados.map((res, index) => (
                                <div 
                                    key={res.id} 
                                    className="explorar-card" 
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                    onClick={() => navigate(`/destinos/${res.id}`)}
                                >
                                    <div className="explorar-img-wrapper">
                                        <div className="explorar-rating-chip">⭐ {res.rating || 4.5}</div>
                                        {res.distancia && res.distancia < 20000 && (
                                            <div className="explorar-rating-chip" style={{ left: '20px', right: 'auto', background: '#10b981', color: 'white' }}>
                                                📍 {res.distancia.toFixed(0)} km
                                            </div>
                                        )}
                                        <img src={res.imagen || 'https://via.placeholder.com/600'} alt={res.nombre} className="explorar-card-img" />
                                        <div className="explorar-img-overlay"></div>
                                    </div>

                                    <div className="explorar-info-body">
                                        <h3 className="explorar-dest-name">{res.nombre}</h3>
                                        <div className="explorar-dest-loc">📍 {res.pais}</div>
                                        
                                        <div className="explorar-badge-row">
                                            <span className="aura-chip primary">{res.categoria || "Destino Turístico"}</span>
                                            {res.distancia && res.distancia < 500 && <span className="aura-chip" style={{ background: '#ecfdf5', color: '#059669' }}>✨ Aventura Próxima</span>}
                                        </div>

                                        <div className="explorar-price-footer">
                                            <div>
                                                <span className="price-label">Desde</span>
                                                <div className="price-value">€{res.precio || 0}</div>
                                            </div>
                                            <button className="aura-chip primary" style={{ cursor: 'pointer', border: 'none' }}>Explorar →</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>


                        {!isLoading && filteredResultados.length === 0 && (
                            <div style={{ textAlign: 'center', color: '#64748b', marginTop: '80px', background: 'white', padding: '40px', borderRadius: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                                <h3>No encontramos destinos</h3>
                                <p>Intenta ajustar tus filtros para descubrir nuevas aventuras.</p>
                            </div>
                        )}
                    </div>

                    {/* RIGHT SIDE: SIDEBAR (Only visible on Desktop) */}
                    <aside className="explorar-sidebar">
                        <div className="sidebar-title-group">
                            <div className="sidebar-ai-badge">✨</div>
                            <span className="sidebar-label">Aura AI Recomienda</span>
                        </div>
                        
                        <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '10px' }}>
                            Basado en tendencias globales y tus búsquedas recientes.
                        </p>

                        {/* Recomendaciones Rápidas */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {destinos.slice(0, 3).map(fav => (
                                <div 
                                    key={`side-${fav.id}`} 
                                    className="sidebar-card"
                                    onClick={() => navigate(`/destinos/${fav.id}`)}
                                >
                                    <img src={fav.imagen} alt={fav.nombre} className="sidebar-card-img" />
                                    <div className="sidebar-card-info">
                                        <h4 className="sidebar-card-name">{fav.nombre}</h4>
                                        <span className="sidebar-card-loc">{fav.pais}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Banner Promocional */}
                        <div className="sidebar-promo-banner">
                            <h3 className="promo-title">Club Elite Aura</h3>
                            <p className="promo-desc">
                                Únete para obtener acceso a destinos secretos y descuentos exclusivos.
                            </p>
                            <button className="promo-btn" onClick={() => navigate('/login')}>Saber más</button>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default Explorar;
