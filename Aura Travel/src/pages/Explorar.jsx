import React, { useState } from 'react';

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
        <div style={styles.page} className="anim-fade">
            <header style={styles.header}>
                <h1 style={styles.title}>Explorar</h1>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    style={{ ...styles.filterToggle, backgroundColor: showFilters ? '#6366f1' : '#f1f5f9', color: showFilters ? '#fff' : '#64748b' }}
                >
                    {showFilters ? '✕ Cerrar' : '🔍 Filtros avanzados'}
                </button>
            </header>

            {showFilters && (
                <div style={styles.advancedFilters} className="anim-slide-down">
                    <div style={styles.filterGroup}>
                        <label style={styles.groupLabel}>Presupuesto Máximo: €{budget}</label>
                        <input
                            type="range" min="300" max="3000" step="50"
                            style={styles.rangeInput}
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                        />
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.groupLabel}>Intereses</label>
                        <div style={styles.chipGrid}>
                            {interests.map(i => (
                                <button
                                    key={i}
                                    onClick={() => toggleInterest(i)}
                                    style={{ ...styles.chip, backgroundColor: selectedInterests.includes(i) ? '#6366f1' : '#fff', color: selectedInterests.includes(i) ? '#fff' : '#64748b' }}
                                >
                                    {i}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.groupLabel}>Idiomas sugeridos</label>
                        <div style={styles.chipGrid}>
                            {languages.map(l => (
                                <button
                                    key={l}
                                    onClick={() => toggleLanguage(l)}
                                    style={{ ...styles.chip, backgroundColor: selectedLanguages.includes(l) ? '#6366f1' : '#fff', color: selectedLanguages.includes(l) ? '#fff' : '#64748b' }}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div style={styles.categoryRow}>
                {categorias.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        style={{ ...styles.catBtn, background: activeCategory === cat ? '#6366f1' : '#fff', color: activeCategory === cat ? '#fff' : '#64748b', border: activeCategory === cat ? 'none' : '1px solid #e2e8f0' }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <p style={styles.resultsCount}>{filteredResultados.length} destinos encontrados</p>

            <div style={styles.grid}>
                {filteredResultados.map(res => (
                    <div key={res.id} style={styles.card}>
                        <div style={styles.imgBadge}>⭐ {res.rating}</div>
                        <img src={res.img} alt={res.nombre} style={styles.cardImg} />
                        <div style={styles.cardInfo}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <h3 style={{ margin: 0, fontSize: '18px' }}>{res.nombre}</h3>
                                <span style={{ fontWeight: '800', color: '#6366f1' }}>€{res.precio}</span>
                            </div>
                            <p style={{ margin: '0 0 12px 0', color: '#64748b', fontSize: '14px' }}>📍 {res.pais}</p>
                            <div style={styles.tagGrid}>
                                {res.tags.slice(0, 3).map(t => <span key={t} style={styles.tag}>{t}</span>)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    page: { padding: '20px', paddingBottom: '100px', backgroundColor: '#f8fafc', minHeight: '100vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    title: { fontSize: '28px', fontWeight: '800', margin: 0 },
    filterToggle: { padding: '10px 18px', borderRadius: '14px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '13px' },
    advancedFilters: { backgroundColor: '#fff', borderRadius: '24px', padding: '20px', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
    filterGroup: { marginBottom: '20px' },
    groupLabel: { display: 'block', fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' },
    rangeInput: { width: '100%', accentColor: '#6366f1' },
    chipGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
    chip: { padding: '6px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
    categoryRow: { display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '15px' },
    catBtn: { padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '700', fontSize: '14px' },
    resultsCount: { color: '#64748b', margin: '15px 0', fontSize: '14px', fontWeight: '600' },
    grid: { display: 'flex', flexDirection: 'column', gap: '20px' },
    card: { backgroundColor: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', position: 'relative' },
    imgBadge: { position: 'absolute', top: '15px', right: '15px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '5px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', zIndex: 1 },
    cardImg: { width: '100%', height: '180px', objectFit: 'cover' },
    cardInfo: { padding: '20px' },
    tagGrid: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    tag: { padding: '4px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '10px', fontSize: '11px', fontWeight: '700' }
};

export default Explorar;
