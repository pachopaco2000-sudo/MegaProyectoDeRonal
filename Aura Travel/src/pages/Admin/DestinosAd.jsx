import React, { useState } from 'react';

const DestinosAd = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [destinos, setDestinos] = useState([
        { id: 1, nombre: 'Santorini', pais: 'Grecia', descripcion: 'Una isla paradisíaca conocida por sus atardeceres icónicos, arquitectura blanca y azul.', categoria: 'Playa', rating: 4.9, precio: 850, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80', destacado: true },
        { id: 2, nombre: 'Machu Picchu', pais: 'Perú', descripcion: 'Ciudadela inca del siglo XV ubicada en las montañas de los Andes.', categoria: 'Aventura', rating: 4.9, precio: 650, image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=300&q=80', destacado: true },
        { id: 3, nombre: 'Islandia', pais: 'Islandia', descripcion: 'Tierra de fuego y hielo, con glaciares, géiseres, cascadas y auroras boreales.', categoria: 'Naturaleza', rating: 4.9, precio: 1100, image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80', destacado: false },
        { id: 4, nombre: 'Kyoto', pais: 'Japón', descripcion: 'Antigua capital imperial de Japón, famosa por sus templos budistas y jardines.', categoria: 'Cultural', rating: 4.8, precio: 1200, image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=300&q=80', destacado: true },
        { id: 5, nombre: 'Bali', pais: 'Indonesia', descripcion: 'Isla tropical conocida por sus templos hindúes, terrazas de arroz y playas.', categoria: 'Playa', rating: 4.8, precio: 700, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=300&q=80', destacado: false }
    ]);

    const [currentDestino, setCurrentDestino] = useState(null);
    const [newDestino, setNewDestino] = useState({
        nombre: '', pais: '', descripcion: '', categoria: '', precio: '', image: '', lat: '', lng: '', tags: ''
    });

    const handleOpenModal = (destino = null) => {
        if (destino) {
            setCurrentDestino(destino);
            setNewDestino({ ...destino, tags: destino.tags || '' });
        } else {
            setCurrentDestino(null);
            setNewDestino({ nombre: '', pais: '', descripcion: '', categoria: '', precio: '', image: '', lat: '', lng: '', tags: '' });
        }
        setIsModalOpen(true);
    };

    const handleSaveDestino = (e) => {
        e.preventDefault();
        if (currentDestino) {
            setDestinos(destinos.map(d => d.id === currentDestino.id ? { ...d, ...newDestino } : d));
        } else {
            const id = destinos.length + 1;
            setDestinos([...destinos, { ...newDestino, id: id, rating: 4.5, destacado: false }]);
        }
        setIsModalOpen(false);
        setNewDestino({ nombre: '', pais: '', descripcion: '', categoria: '', precio: '', image: '', lat: '', lng: '', tags: '' });
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Estás seguro de eliminar este destino?')) {
            setDestinos(destinos.filter(d => d.id !== id));
        }
    };

    const filteredDestinos = destinos.filter(d =>
        d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.pais.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={styles.content}>
            <header style={styles.header}>
                <div>
                    <h2 style={styles.title}>Gestión de Destinos</h2>
                    <p style={styles.subtitle}>Administra todos los destinos turísticos</p>
                </div>
                <button onClick={() => handleOpenModal()} style={styles.addBtn}>
                    <span style={{ fontSize: '20px', marginRight: '8px' }}>+</span> Nuevo Destino
                </button>
            </header>

            <div style={styles.searchContainer}>
                <div style={styles.searchBox}>
                    <span style={{ color: '#94a3b8' }}>🔍</span>
                    <input
                        type="text"
                        placeholder="Buscar destinos..."
                        style={styles.input}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div style={styles.destinosList}>
                {filteredDestinos.map(destino => (
                    <div key={destino.id} style={styles.destinoCard}>
                        <img src={destino.image} alt={destino.nombre} style={styles.destImg} />
                        <div style={styles.destInfo}>
                            <h3 style={styles.destName}>{destino.nombre}</h3>
                            <div style={styles.destLoc}>📍 {destino.pais}</div>
                            <p style={styles.destDesc}>{destino.descripcion}</p>
                            <div style={styles.destTags}>
                                <span style={{ ...styles.tag, backgroundColor: '#2dd4bf22', color: '#0d9488' }}>{destino.categoria}</span>
                                <span style={styles.tagRating}>⭐ {destino.rating}</span>
                                <span style={styles.tagPrice}>€{destino.precio}</span>
                                {destino.destacado && <span style={styles.tagFeatured}>Destacado</span>}
                            </div>
                        </div>
                        <div style={styles.destActions}>
                            <button style={styles.actionBtn} onClick={() => handleOpenModal(destino)}>📝</button>
                            <button onClick={() => handleDelete(destino.id)} style={{ ...styles.actionBtn, color: '#f43f5e' }}>🗑️</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL DESTINO */}
            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h3 style={{ margin: 0 }}>{currentDestino ? 'Editar Destino' : 'Nuevo Destino'}</h3>
                            <button onClick={() => setIsModalOpen(false)} style={styles.closeBtn}>✕</button>
                        </div>
                        <form onSubmit={handleSaveDestino} style={styles.form}>
                            <div style={styles.formGrid}>
                                <div style={styles.field}>
                                    <label style={styles.label}>Nombre del destino</label>
                                    <input required style={styles.formInput} placeholder="Santorini" value={newDestino.nombre} onChange={e => setNewDestino({ ...newDestino, nombre: e.target.value })} />
                                </div>
                                <div style={styles.field}>
                                    <label style={styles.label}>País</label>
                                    <input required style={styles.formInput} placeholder="Grecia" value={newDestino.pais} onChange={e => setNewDestino({ ...newDestino, pais: e.target.value })} />
                                </div>
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Descripción</label>
                                <textarea required style={styles.formTextarea} placeholder="Descripción del destino..." value={newDestino.descripcion} onChange={e => setNewDestino({ ...newDestino, descripcion: e.target.value })} />
                            </div>
                            <div style={styles.formGrid}>
                                <div style={styles.field}>
                                    <label style={styles.label}>Categoría</label>
                                    <select required style={styles.formInput} value={newDestino.categoria} onChange={e => setNewDestino({ ...newDestino, categoria: e.target.value })}>
                                        <option value="">Seleccionar</option>
                                        <option value="Playa">Playa</option>
                                        <option value="Aventura">Aventura</option>
                                        <option value="Naturaleza">Naturaleza</option>
                                        <option value="Cultural">Cultural</option>
                                    </select>
                                </div>
                                <div style={styles.field}>
                                    <label style={styles.label}>Precio (€)</label>
                                    <input required type="number" style={styles.formInput} placeholder="850" value={newDestino.precio} onChange={e => setNewDestino({ ...newDestino, precio: e.target.value })} />
                                </div>
                            </div>
                            <div style={styles.formGrid}>
                                <div style={styles.field}>
                                    <label style={styles.label}>Latitud</label>
                                    <input style={styles.formInput} placeholder="36.3932" value={newDestino.lat} onChange={e => setNewDestino({ ...newDestino, lat: e.target.value })} />
                                </div>
                                <div style={styles.field}>
                                    <label style={styles.label}>Longitud</label>
                                    <input style={styles.formInput} placeholder="25.4615" value={newDestino.lng} onChange={e => setNewDestino({ ...newDestino, lng: e.target.value })} />
                                </div>
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>URL de imagen</label>
                                <input required style={styles.formInput} placeholder="https://..." value={newDestino.image} onChange={e => setNewDestino({ ...newDestino, image: e.target.value })} />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Tags (separados por coma)</label>
                                <input style={styles.formInput} placeholder="Romántico, Lujo, Fotografía" value={newDestino.tags} onChange={e => setNewDestino({ ...newDestino, tags: e.target.value })} />
                            </div>
                            <div style={styles.modalFooter}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.cancelBtn}>Cancelar</button>
                                <button type="submit" style={styles.saveBtn}>Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    content: { padding: '40px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    title: { fontSize: '28px', fontWeight: '800', margin: 0 },
    subtitle: { color: '#64748b', marginTop: '4px' },
    addBtn: {
        backgroundColor: '#6366f1', color: 'white', border: 'none',
        padding: '12px 24px', borderRadius: '16px', fontWeight: '700',
        cursor: 'pointer', display: 'flex', alignItems: 'center',
        boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)'
    },
    searchContainer: { marginBottom: '24px' },
    searchBox: {
        backgroundColor: '#f1f5f9', borderRadius: '16px', padding: '12px 20px',
        display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #e2e8f0'
    },
    input: { background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: '15px' },
    destinosList: { display: 'flex', flexDirection: 'column', gap: '16px' },
    destinoCard: {
        backgroundColor: '#fff', borderRadius: '24px', padding: '16px',
        display: 'flex', gap: '20px', border: '1px solid #f1f5f9', alignItems: 'center'
    },
    destImg: { width: '120px', height: '120px', borderRadius: '20px', objectFit: 'cover' },
    destInfo: { flex: 1 },
    destName: { margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700' },
    destLoc: { fontSize: '13px', color: '#64748b', marginBottom: '8px' },
    destDesc: { fontSize: '14px', color: '#475569', lineHeight: '1.5', margin: '0 0 12px 0', maxWidth: '600px' },
    destTags: { display: 'flex', gap: '10px', alignItems: 'center' },
    tag: { padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' },
    tagRating: { fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' },
    tagPrice: { color: '#6366f1', fontWeight: '700', fontSize: '14px' },
    tagFeatured: {
        backgroundColor: '#6366f1', color: 'white', padding: '4px 10px',
        borderRadius: '8px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase'
    },
    destActions: { display: 'flex', gap: '8px' },
    actionBtn: {
        width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #f1f5f9',
        backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    // Modal Styles
    modalOverlay: {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
    },
    modal: {
        backgroundColor: '#fff', borderRadius: '24px', width: '100%', maxWidth: '600px',
        padding: '30px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
    },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    closeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    field: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '14px', fontWeight: '600', color: '#475569' },
    formInput: {
        padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0',
        fontSize: '15px', backgroundColor: '#f8fafc'
    },
    formTextarea: {
        padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0',
        fontSize: '15px', backgroundColor: '#f8fafc', minHeight: '80px', fontFamily: 'inherit'
    },
    modalFooter: { display: 'flex', gap: '12px', marginTop: '10px' },
    cancelBtn: {
        flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0',
        backgroundColor: '#fff', fontWeight: '700', cursor: 'pointer'
    },
    saveBtn: {
        flex: 1, padding: '14px', borderRadius: '12px', border: 'none',
        backgroundColor: '#6366f1', color: 'white', fontWeight: '700', cursor: 'pointer'
    }
};

export default DestinosAd;