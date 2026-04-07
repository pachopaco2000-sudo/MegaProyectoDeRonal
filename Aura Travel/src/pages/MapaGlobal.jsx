import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../services/supabaseClient';
import { UserContext } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import 'leaflet/dist/leaflet.css';
import './styles/MapaGlobal.css';

// Fix para los iconos de Leaflet en React
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});

const CustomMarkerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const MapaGlobal = () => {
    const { user } = useContext(UserContext);
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    const [destinos, setDestinos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [favsId, setFavsId] = useState([]);

    useEffect(() => {
        if (user) {
            const userFavs = JSON.parse(localStorage.getItem(`aura_favs_${user.id}`)) || [];
            setFavsId(userFavs);
        }

        const fetchAllDestinos = async () => {
            try {
                const { data, error } = await supabase
                    .from('Destino')
                    .select('*');
                if (error) throw error;
                // Dejamos todos los destinos para evitar pantalla vacía
                setDestinos(data || []);
            } catch (error) {
                console.error("Error al cargar mapa:", error);
                showNotification("No se pudieron cargar las coordenadas.", "error");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllDestinos();
    }, [user]);

    const toggleFavorite = (id) => {
        if (!user) {
            showNotification("Necesitas iniciar sesión para tus favoritos.", "error");
            return;
        }
        
        let newFavs = [...favsId];
        if (newFavs.includes(id)) {
            newFavs = newFavs.filter(f => f !== id);
            showNotification("Destino quitado de favoritos.", "success");
        } else {
            newFavs.push(id);
            showNotification("¡Guardado en tus favoritos! ❤️", "success");
        }
        setFavsId(newFavs);
        localStorage.setItem(`aura_favs_${user.id}`, JSON.stringify(newFavs));
    };

    if (isLoading) {
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white' }}>Cargando Mapa Satelital... 🌍</div>;
    }

    return (
        <div className="mapa-global-container anim-fade">
            <div className="mapa-header-overlay">
                <h1 className="mapa-header-title">Exploración Global</h1>
                <p className="mapa-header-desc">Descubre el mundo a tu manera. {destinos.length} destinos detectados.</p>
            </div>

            <button className="mapa-btn-back" onClick={() => navigate(-1)} title="Volver al menú">
                ×
            </button>

            <MapContainer 
                center={[20, 0]} // Centro del mapa (Aprox Atlántico/África)
                zoom={3} 
                style={{ height: '100%', width: '100%', zIndex: 1 }}
                zoomControl={false} // Quitamos para ponerlo en otro lado o dejarlo limpio
            >
                {/* Tile Layer Premium Light/Dark */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {destinos.map((dest) => {
                    const isFav = favsId.includes(dest.id);
                    // Lógica inteligente de respaldo para destinos sin coordenadas guardadas
                    let lat = parseFloat(dest.latitud);
                    let lng = parseFloat(dest.longitud);

                    if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
                        const cityName = (dest.ciudad || dest.nombre || '').toLowerCase();
                        if (cityName.includes('cartagena')) { lat = 10.3910; lng = -75.4794; }
                        else if (cityName.includes('paris') || cityName.includes('parís')) { lat = 48.8566; lng = 2.3522; }
                        else if (cityName.includes('roma')) { lat = 41.9028; lng = 12.4964; }
                        else if (cityName.includes('madrid')) { lat = 40.4168; lng = -3.7038; }
                        else if (cityName.includes('tokio') || cityName.includes('tokyo')) { lat = 35.6762; lng = 139.6503; }
                        else if (cityName.includes('londres') || cityName.includes('london')) { lat = 51.5072; lng = -0.1276; }
                        else if (cityName.includes('oia') || cityName.includes('santorini')) { lat = 36.4618; lng = 25.3753; }
                        else {
                            // Algoritmo pseudo-aleatorio para esparcirlos visualmente alrededor del mundo
                            let hash = 0;
                            for (let i = 0; i < cityName.length; i++) hash = cityName.charCodeAt(i) + ((hash << 5) - hash);
                            lat = (Math.abs(hash) % 100) - 50;  // Latitudes entre -50 y 50
                            lng = (Math.abs(hash * 3) % 360) - 180; // Longitudes entre -180 y 180
                        }
                    }

                    return (
                        <Marker 
                            key={dest.id} 
                            position={[lat, lng]}
                            icon={CustomMarkerIcon}
                        >
                            <Popup closeButton={false}>
                                <div className="mapa-popup-header" style={{ backgroundImage: `url(${dest.imagen || 'https://via.placeholder.com/300'})` }}>
                                    <div className="mapa-popup-gradient"></div>
                                    <button 
                                        className="mapa-popup-fav-btn" 
                                        onClick={(e) => { e.stopPropagation(); toggleFavorite(dest.id); }}
                                    >
                                        {isFav ? '❤️' : '🤍'}
                                    </button>
                                    <h3 className="mapa-popup-title">{dest.nombre}</h3>
                                </div>
                                <div className="mapa-popup-body">
                                    <div className="mapa-popup-loc">📍 {dest.pais}</div>
                                    <div className="mapa-popup-loc" style={{ color: '#fbbf24' }}>⭐ {dest.rating || '4.5'}</div>
                                    <div className="mapa-popup-price">€{dest.precio}</div>
                                    <button 
                                        className="mapa-popup-btn"
                                        onClick={() => navigate(`/destinos/${dest.id}`)}
                                    >
                                        Ver Detalles
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default MapaGlobal;
