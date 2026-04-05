import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { UserContext } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import './styles/Actividades.css';

const Actividades = () => {
    const [activeFilter, setActiveFilter] = useState('Todos');
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useContext(UserContext);
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    const categories = ['Todos', 'Aventura', 'Cultural', 'Gastronomía', 'Naturaleza'];

    useEffect(() => {
        const fetchActividades = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('Actividades')
                    .select('*, Destino:destino_id(nombre, pais)');
                
                if (error) throw error;
                setActivities(data || []);
            } catch (error) {
                console.error("Error fetching activities:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchActividades();
    }, []);

    const filtered = activeFilter === 'Todos' ? activities : activities.filter(a => a.tipo === activeFilter);

    const handleReserve = async (act) => {
        if (!user) {
            showNotification("Inicia sesión para reservar esta experiencia.", "error");
            navigate('/login');
            return;
        }

        try {
            const nuevaReserva = {
                destino: act.nombre,
                ubicacion: act.Destino ? act.Destino.nombre : 'Actividad Local',
                estado: 'Pendiente',
                imagen: act.imagen,
                correo_usuario: user.email,
                personas: 1
            };

            const { error } = await supabase.from('Reservas').insert([nuevaReserva]);
            if (error) throw error;
            
            showNotification("¡Experiencia reservada exitosamente!", "success");
        } catch (error) {
            console.error("Error reservando actividad:", error);
            showNotification("No pudimos realizar la reserva. Intenta de nuevo.", "error");
        }
    };

    return (
        <div className="actividades-container anim-fade">
            <header className="actividades-header">
                <h1 className="actividades-title">Experiencias Únicas</h1>
                <p className="actividades-subtitle">Descubre actividades seleccionadas por expertos</p>
            </header>

            <div className="actividades-filter-section">
                <div className="actividades-filter-row">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveFilter(cat)}
                            className="actividades-filter-btn"
                            style={{
                                backgroundColor: activeFilter === cat ? '#6366f1' : '#fff',
                                color: activeFilter === cat ? '#fff' : '#64748b',
                                boxShadow: activeFilter === cat ? '0 10px 15px -3px rgba(99, 102, 241, 0.4)' : 'none'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Cargando experiencias...
                </div>
            )}

            {!isLoading && filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No hay actividades disponibles para esta categoría.
                </div>
            )}

            <div className="actividades-grid">
                {filtered.map(act => (
                    <div key={act.id} className="actividades-card hover-scale">
                        <div className="actividades-img-container">
                            <img src={act.imagen || 'https://via.placeholder.com/500'} alt={act.nombre} className="actividades-img" />
                            <div className="actividades-category-badge">{act.tipo}</div>
                            <div className="actividades-price-badge">Desde €{act.precio}</div>
                        </div>
                        <div className="actividades-card-content">
                            <div className="actividades-meta-row">
                                <span className="actividades-location">📍 {act.Destino ? `${act.Destino.nombre}` : 'Múltiples destinos'}</span>
                                <span className="actividades-rating">⭐ 4.8</span>
                            </div>
                            <h3 className="actividades-act-name">{act.nombre}</h3>
                            <div className="actividades-footer-row">
                                <span className="actividades-duration">⏱️ {act.duracion}</span>
                                <button className="actividades-book-btn" onClick={() => handleReserve(act)}>Reservar ahora</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Actividades;