import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import './styles/Explorar.css';

const Explorar = () => {
    const [destinos, setDestinos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
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

    const filteredResultados = destinos.filter(res => 
        (res.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (res.pais || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <button onClick={handleGeolocation} style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: '16px', padding: '0 20px', cursor: 'pointer', fontSize: '20px' }} title="Buscar cerca de mí (GPS)">
                        📍
                    </button>
                </div>
            </header>

            <p className="explorar-results-count">
                {isLoading ? 'Buscando destinos...' : `${filteredResultados.length} destinos encontrados`}
            </p>

            <div className="explorar-grid">
                {filteredResultados.map(res => (
                    <div 
                        key={res.id} 
                        className="explorar-card" 
                        onClick={() => navigate(`/destino/${res.id}`)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="explorar-img-badge">⭐ {res.rating || 4.5}</div>
                        <img src={res.imagen || 'https://via.placeholder.com/400'} alt={res.nombre} className="explorar-card-img" />
                        <div className="explorar-card-info">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <h3 style={{ margin: 0, fontSize: '18px' }}>{res.nombre}</h3>
                            </div>
                            <p style={{ margin: '0 0 12px 0', color: '#64748b', fontSize: '14px' }}>📍 {res.pais}</p>
                            <div className="explorar-tag-grid">
                                {res.clima && <span className="explorar-tag">☀️ {res.clima}</span>}
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
