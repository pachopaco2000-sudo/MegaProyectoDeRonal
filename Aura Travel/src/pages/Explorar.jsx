import React from 'react';

const Explorar = () => {
    const categorias = ['Todos', 'Playa', 'Cultural', 'Aventura', 'Naturaleza', 'Ciudad'];
    const resultados = [
        { id: 1, nombre: 'Santorini', pais: 'Grecia', precio: '850', rating: 4.9, tags: ['Romántico', 'Lujo'], img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400' },
        { id: 2, nombre: 'Kyoto', pais: 'Japón', precio: '1200', rating: 4.8, tags: ['Cultura', 'Historia'], img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400' }
    ];

    return (
        <div style={styles.page} className="anim-fade">
            <h1 style={styles.title}>Explorar</h1>
            <div style={styles.searchBar}>🔍 Buscar destinos...</div>
            <div style={styles.filterRow}>
                {categorias.map(cat => (
                    <button key={cat} style={{ ...styles.filterBtn, background: cat === 'Todos' ? '#6366f1' : '#fff', color: cat === 'Todos' ? '#fff' : '#64748b' }}>
                        {cat}
                    </button>
                ))}
            </div>
            <p style={styles.resultsCount}>{resultados.length} destinos encontrados</p>
            {resultados.map(res => (
                <div key={res.id} style={styles.card}>
                    <img src={res.img} alt={res.nombre} style={styles.cardImg} />
                    <div style={styles.cardInfo}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h3 style={{ margin: 0 }}>{res.nombre}</h3>
                            <span style={{ color: '#facc15' }}>⭐ {res.rating}</span>
                        </div>
                        <p style={{ margin: '5px 0', color: '#64748b', fontSize: '14px' }}>📍 {res.pais}</p>
                        <div style={{ display: 'flex', gap: '5px', margin: '10px 0' }}>
                            {res.tags.map(t => <span key={t} style={styles.tag}>{t}</span>)}
                        </div>
                        <p style={{ margin: 0, fontWeight: 'bold', color: '#6366f1' }}>Desde €{res.precio}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

const styles = {
    page: { padding: '20px' },
    title: { fontSize: '28px', fontWeight: '800' },
    searchBar: { padding: '15px', background: '#f1f5f9', borderRadius: '15px', color: '#94a3b8', marginBottom: '20px' },
    filterRow: { display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' },
    filterBtn: { padding: '8px 18px', borderRadius: '20px', border: '1px solid #e2e8f0', cursor: 'pointer', whiteSpace: 'nowrap' },
    resultsCount: { color: '#64748b', margin: '20px 0' },
    card: { display: 'flex', gap: '15px', background: '#fff', borderRadius: '20px', padding: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '15px' },
    cardImg: { width: '100px', height: '100px', borderRadius: '15px', objectFit: 'cover' },
    cardInfo: { flex: 1 },
    tag: { padding: '2px 8px', background: '#ecfdf5', color: '#10b981', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }
};

export default Explorar;