import React, { useState } from 'react';

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
        <div style={styles.container} className="anim-fade">
            <style>{`
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .anim-fade { animation: slideUp 0.5s ease-out forwards; }
                .hover-scale { transition: transform 0.3s ease; }
                .hover-scale:hover { transform: scale(1.02); }
            `}</style>
            <header style={styles.header}>
                <h1 style={styles.title}>Experiencias Unificadas</h1>
                <p style={styles.subtitle}>Descubre actividades únicas seleccionadas por expertos</p>
            </header>

            <div style={styles.filterSection}>
                <div style={styles.filterRow}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveFilter(cat)}
                            style={{
                                ...styles.filterBtn,
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

            <div style={styles.grid}>
                {filtered.map(act => (
                    <div key={act.id} style={styles.card} className="hover-scale">
                        <div style={styles.imgContainer}>
                            <img src={act.img} alt={act.name} style={styles.img} />
                            <div style={styles.categoryBadge}>{act.category}</div>
                            <div style={styles.priceBadge}>Desde €{act.price}</div>
                        </div>
                        <div style={styles.cardContent}>
                            <div style={styles.metaRow}>
                                <span style={styles.location}>📍 {act.location}</span>
                                <span style={styles.rating}>⭐ {act.rating}</span>
                            </div>
                            <h3 style={styles.actName}>{act.name}</h3>
                            <div style={styles.footerRow}>
                                <span style={styles.duration}>⏱️ {act.duration}</span>
                                <button style={styles.bookBtn}>Reservar ahora</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
const styles = {
    container: { padding: '30px 20px', backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '100px' },
    header: { marginBottom: '30px', textAlign: 'center' },
    title: { fontSize: '32px', fontWeight: '800', color: '#1e293b', margin: '0 0 10px 0' },
    subtitle: { color: '#64748b', fontSize: '16px', margin: 0 },
    filterSection: { marginBottom: '30px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' },
    filterRow: { display: 'flex', gap: '12px', padding: '5px' },
    filterBtn: {
        padding: '10px 20px', borderRadius: '14px', border: 'none',
        fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap',
        transition: 'all 0.3s ease'
    },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' },
    card: { backgroundColor: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' },
    imgContainer: { position: 'relative', height: '220px' },
    img: { width: '100%', height: '100%', objectFit: 'cover' },
    categoryBadge: { position: 'absolute', top: '15px', left: '15px', backgroundColor: 'rgba(99, 102, 241, 0.9)', color: '#fff', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '700' },
    priceBadge: { position: 'absolute', bottom: '15px', right: '15px', backgroundColor: '#fff', padding: '6px 12px', borderRadius: '10px', fontSize: '14px', fontWeight: '800', color: '#1e293b' },
    cardContent: { padding: '20px' },
    metaRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
    location: { fontSize: '13px', color: '#64748b', fontWeight: '600' },
    rating: { fontSize: '14px', fontWeight: '700', color: '#facc15' },
    actName: { fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: '0 0 15px 0', lineHeight: '1.4' },
    footerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    duration: { fontSize: '13px', color: '#94a3b8', fontWeight: '600' },
    bookBtn: { backgroundColor: '#6366f1', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }
};
export default Actividades;