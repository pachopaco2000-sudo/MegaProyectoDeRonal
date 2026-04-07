import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import './styles/Explorar.css';

const Explorar = () => {
    const [destinos, setDestinos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
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
            navigator.geolocation.getCurrentPosition((position) => {
                // RF-12: Uso de GPS sin transmitir datos exactos al servidor backend central
                setSearchTerm('Europa'); // Mock heurístico
                alert(`Coordenadas ubicadas: Lat ${position.coords.latitude.toFixed(2)}, Lon ${position.coords.longitude.toFixed(2)}.\nFiltro de zona aplicado.`);
            }, () => {
                alert("Habilita el GPS del navegador para descubrir destinos cerca de ti.");
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
        <div className="explorar-page anim-fade">
            <header className="explorar-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '15px' }}>
                <h1 className="explorar-title">Explorar Destinos</h1>
                <div style={{ width: '100%', display: 'flex', gap: '10px' }}>
                    <input 
                        type="text" 
                        placeholder="Buscar por ciudad o país..." 
                        style={{
                            flex: 1,
                            padding: '12px 20px',
                            borderRadius: '16px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#f1f5f9',
                            outline: 'none',
                            fontSize: '15px'
                        }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button onClick={() => setShowFilters(!showFilters)} style={{ background: showFilters ? '#6366f1' : '#fff', color: showFilters ? 'white' : '#64748b', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '0 20px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>
                        ⚙️ Filtros
                    </button>
                    <button onClick={handleGeolocation} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '16px', padding: '0 20px', cursor: 'pointer', fontSize: '20px' }} title="Buscar cerca de mí (GPS)">
                        📍
                    </button>
                </div>

                {/* ADVANCED FILTERS PANEL */}
                {showFilters && (
                    <div className="explorar-advanced-panel">
                        <div className="filter-group">
                            <div className="filter-group-title">Clasificación Mínima</div>
                            <div className="filter-options">
                                <div className={`filter-option ${filterRating === 0 ? 'selected' : ''}`} onClick={() => setFilterRating(0)}>Cualquiera</div>
                                <div className={`filter-option ${filterRating === 4.0 ? 'selected' : ''}`} onClick={() => setFilterRating(4.0)}>4.0+ ⭐</div>
                                <div className={`filter-option ${filterRating === 4.5 ? 'selected' : ''}`} onClick={() => setFilterRating(4.5)}>4.5+ ⭐</div>
                                <div className={`filter-option ${filterRating === 4.8 ? 'selected' : ''}`} onClick={() => setFilterRating(4.8)}>4.8+ ⭐ (Élite)</div>
                            </div>
                        </div>

                        <div className="filter-group">
                            <div className="filter-group-title">Tipo de Clima</div>
                            <div className="filter-options">
                                <div className={`filter-option ${filterClima === null ? 'selected' : ''}`} onClick={() => setFilterClima(null)}>Explorar Todos</div>
                                <div className={`filter-option ${filterClima === 'Soleado' ? 'selected' : ''}`} onClick={() => setFilterClima('Soleado')}>☀️ Soleado</div>
                                <div className={`filter-option ${filterClima === 'Frio' ? 'selected' : ''}`} onClick={() => setFilterClima('Frio')}>❄️ Frío / Nieve</div>
                                <div className={`filter-option ${filterClima === 'Tropical' ? 'selected' : ''}`} onClick={() => setFilterClima('Tropical')}>🌴 Tropical</div>
                            </div>
                        </div>

                        <div className="filter-group">
                            <div className="filter-group-title">Precio Máximo (€)</div>
                            <div className="filter-options" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <input 
                                    type="number" 
                                    placeholder="Ej: 1500" 
                                    value={filterMaxPrecio}
                                    onChange={(e) => setFilterMaxPrecio(e.target.value)}
                                    style={{
                                        padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', outline: 'none'
                                    }}
                                />
                                <span style={{ fontSize: '12px', color: '#64748b' }}>Filtra destinos por debajo de este límite.</span>
                            </div>
                        </div>

                        {(filterRating !== 0 || filterClima !== null || filterMaxPrecio !== '') && (
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                                <button onClick={removeFilters} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' }}>
                                    ✖ Limpiar Filtros
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </header>

            <p className="explorar-results-count">
                {isLoading ? 'Buscando destinos...' : `${filteredResultados.length} destinos encontrados`}
            </p>

            <div className="explorar-grid">
                {filteredResultados.map(res => (
                    <div 
                        key={res.id} 
                        className="explorar-card" 
                        onClick={() => navigate(`/destinos/${res.id}`)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="explorar-img-badge">⭐ {res.rating || 4.5}</div>
                        <div className="explorar-card-img-container">
                            <img src={res.imagen || 'https://via.placeholder.com/600'} alt={res.nombre} className="explorar-card-img" />
                        </div>
                        <div className="explorar-card-info">
                            <h3 className="explorar-card-title">{res.nombre}</h3>
                            <p className="explorar-card-subtitle" style={{marginBottom: '6px'}}>📍 {res.pais}</p>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Categoría: <strong>{res.categoria || "Destino Turístico"}</strong></span>
                            </div>

                            <div className="explorar-tag-grid" style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    {res.clima && <span className="explorar-tag">🌤️ {res.clima}</span>}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '-2px' }}>Precio Base</span>
                                    <span style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>€{res.precio || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {!isLoading && filteredResultados.length === 0 && (
                <div style={{ textAlign: 'center', color: '#64748b', marginTop: '40px' }}>
                    No encontramos destinos que coincidan con tu búsqueda.
                </div>
            )}
        </div>
    );
};

export default Explorar;
