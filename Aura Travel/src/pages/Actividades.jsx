import React, { useState } from 'react';
import './styles/Actividades.css';

const Actividades = () => {
    const [activeFilter, setActiveFilter] = useState('Todos');
    const categories = ['Todos', 'Aventura', 'Cultural', 'Gastronomía', 'Naturaleza'];

    const activities = [
        { id: 1, name: 'Tour en Catamarán al Atardecer', location: 'Santorini, Grecia', price: 120, rating: 4.9, category: 'Aventura', img: 'https://images.unsplash.com/photo-1544551763-47a0159c9638?w=500', duration: '4h' },
        { id: 2, name: 'Clase de Pasta Tradicional', location: 'Roma, Italia', price: 85, rating: 4.8, category: 'Gastronomía', img: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500', duration: '3h' },
        { id: 3, name: 'Senderismo por Capadocia', location: 'Turquía', price: 45, rating: 4.7, category: 'Naturaleza', img: 'https://images.unsplash.com/photo-1516738901171-419b4b9b9a6d?w=500', duration: '6h' },
        { id: 4, name: 'Tour Privado por el Louvre', location: 'París, Francia', price: 150, rating: 4.9, category: 'Cultural', img: 'https://images.unsplash.com/photo-1544084801-16ef237636e0?w=500', duration: '5h' }
    ];

    const filtered = activeFilter === 'Todos' ? activities : activities.filter(a => a.category === activeFilter);

    return (
        <div className="actividades-container anim-fade">
            <header className="actividades-header">
                <h1 className="actividades-title">Experiencias Unificadas</h1>
                <p className="actividades-subtitle">Descubre actividades únicas seleccionadas por expertos</p>
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

            <div className="actividades-grid">
                {filtered.map(act => (
                    <div key={act.id} className="actividades-card hover-scale">
                        <div className="actividades-img-container">
                            <img src={act.img} alt={act.name} className="actividades-img" />
                            <div className="actividades-category-badge">{act.category}</div>
                            <div className="actividades-price-badge">Desde €{act.price}</div>
                        </div>
                        <div className="actividades-card-content">
                            <div className="actividades-meta-row">
                                <span className="actividades-location">📍 {act.location}</span>
                                <span className="actividades-rating">⭐ {act.rating}</span>
                            </div>
                            <h3 className="actividades-act-name">{act.name}</h3>
                            <div className="actividades-footer-row">
                                <span className="actividades-duration">⏱️ {act.duration}</span>
                                <button className="actividades-book-btn">Reservar ahora</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Actividades;