import React, { useState } from 'react';
import './styles/Explorar.css';

const Explorar = () => {
    const [showFilters, setShowFilters] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [budget, setBudget] = useState(2000);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [selectedLanguages, setSelectedLanguages] = useState([]);

    const categorias = ['Todos', 'Playa', 'Cultural', 'Aventura', 'Naturaleza', 'Ciudad'];
    const interests = ['Fotografía', 'Gastronomía', 'Historia', 'Senderismo', 'Vida Nocturna', 'Relajación'];
    const languages = ['Español', 'Inglés', 'Francés', 'Italiano', 'Alemán', 'Japonés'];

    const resultados = [
        { id: 1, nombre: 'Santorini', pais: 'Grecia', precio: 850, rating: 4.9, tags: ['Romántico', 'Lujo', 'Fotografía'], languages: ['Inglés', 'Griego'], img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400' },
        { id: 2, nombre: 'Kyoto', pais: 'Japón', precio: 1200, rating: 4.8, tags: ['Cultura', 'Historia', 'Gastronomía'], languages: ['Inglés', 'Japonés'], img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400' },
        { id: 3, nombre: 'Bali', pais: 'Indonesia', precio: 600, rating: 4.7, tags: ['Aventura', 'Naturaleza', 'Relajación'], languages: ['Inglés', 'Indonesio'], img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400' },
        { id: 4, nombre: 'Roma', pais: 'Italia', precio: 950, rating: 4.9, tags: ['Historia', 'Gastronomía', 'Arquitectura'], languages: ['Italiano', 'Inglés'], img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400' }
    ];

    const toggleInterest = (interest) => {
        setSelectedInterests(prev =>
            prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
        );
    };

    const toggleLanguage = (lang) => {
        setSelectedLanguages(prev =>
            prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
        );
    };

    const filteredResultados = resultados.filter(res => {
        const matchesCategory = activeCategory === 'Todos' || res.tags.includes(activeCategory);
        const matchesBudget = res.precio <= budget;
        const matchesInterests = selectedInterests.length === 0 || selectedInterests.some(i => res.tags.includes(i));
        const matchesLanguages = selectedLanguages.length === 0 || selectedLanguages.some(l => res.languages.includes(l));
        return matchesCategory && matchesBudget && matchesInterests && matchesLanguages;
    });

    return (
        <div className="explorar-page anim-fade">
            <header className="explorar-header">
                <h1 className="explorar-title">Explorar</h1>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="explorar-filter-toggle"
                    style={{ backgroundColor: showFilters ? '#6366f1' : '#f1f5f9', color: showFilters ? '#fff' : '#64748b' }}
                >
                    {showFilters ? '✕ Cerrar' : '🔍 Filtros avanzados'}
                </button>
            </header>

            {showFilters && (
                <div className="explorar-advanced-filters anim-slide-down">
                    <div className="explorar-filter-group">
                        <label className="explorar-group-label">Presupuesto Máximo: €{budget}</label>
                        <input
                            type="range" min="300" max="3000" step="50"
                            className="explorar-range-input"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                        />
                    </div>

                    <div className="explorar-filter-group">
                        <label className="explorar-group-label">Intereses</label>
                        <div className="explorar-chip-grid">
                            {interests.map(i => (
                                <button
                                    key={i}
                                    onClick={() => toggleInterest(i)}
                                    className="explorar-chip"
                                    style={{ backgroundColor: selectedInterests.includes(i) ? '#6366f1' : '#fff', color: selectedInterests.includes(i) ? '#fff' : '#64748b' }}
                                >
                                    {i}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="explorar-filter-group">
                        <label className="explorar-group-label">Idiomas sugeridos</label>
                        <div className="explorar-chip-grid">
                            {languages.map(l => (
                                <button
                                    key={l}
                                    onClick={() => toggleLanguage(l)}
                                    className="explorar-chip"
                                    style={{ backgroundColor: selectedLanguages.includes(l) ? '#6366f1' : '#fff', color: selectedLanguages.includes(l) ? '#fff' : '#64748b' }}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="explorar-category-row">
                {categorias.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className="explorar-cat-btn"
                        style={{ background: activeCategory === cat ? '#6366f1' : '#fff', color: activeCategory === cat ? '#fff' : '#64748b', border: activeCategory === cat ? 'none' : '1px solid #e2e8f0' }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <p className="explorar-results-count">{filteredResultados.length} destinos encontrados</p>

            <div className="explorar-grid">
                {filteredResultados.map(res => (
                    <div key={res.id} className="explorar-card">
                        <div className="explorar-img-badge">⭐ {res.rating}</div>
                        <img src={res.img} alt={res.nombre} className="explorar-card-img" />
                        <div className="explorar-card-info">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <h3 style={{ margin: 0, fontSize: '18px' }}>{res.nombre}</h3>
                                <span style={{ fontWeight: '800', color: '#6366f1' }}>€{res.precio}</span>
                            </div>
                            <p style={{ margin: '0 0 12px 0', color: '#64748b', fontSize: '14px' }}>📍 {res.pais}</p>
                            <div className="explorar-tag-grid">
                                {res.tags.slice(0, 3).map(t => <span key={t} className="explorar-tag">{t}</span>)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Explorar;
