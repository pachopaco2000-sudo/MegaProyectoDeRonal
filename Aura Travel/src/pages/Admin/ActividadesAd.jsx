import React, { useState } from 'react';

const ActividadesAd = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activities, setActivities] = useState([
        { id: 1, name: 'Tour en Catamarán', type: 'Aventura', price: 120, duration: '4h', location: 'Santorini', status: 'Activo', image: 'https://images.unsplash.com/photo-1544551763-47a0159c9638?auto=format&fit=crop&w=300&q=80' },
        { id: 2, name: 'Clase de Cocina Griega', type: 'Cultural', price: 85, duration: '3h', location: 'Mykonos', status: 'Activo', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=300&q=80' },
        { id: 3, name: 'Senderismo Volcánico', type: 'Naturaleza', price: 45, duration: '6h', location: 'Santorini', status: 'Inactivo', image: 'https://images.unsplash.com/photo-1544084801-16ef237636e0?auto=format&fit=crop&w=300&q=80' }
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentActivity, setCurrentActivity] = useState(null);
    const [formData, setFormData] = useState({ name: '', type: 'Aventura', price: '', duration: '', location: '', status: 'Activo', image: '' });

    const filtered = activities.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (activity = null) => {
        if (activity) {
            setCurrentActivity(activity);
            setFormData({ ...activity });
        } else {
            setCurrentActivity(null);
            setFormData({ name: '', type: 'Aventura', price: '', duration: '', location: '', status: 'Activo', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=300&q=80' });
        }
        setIsModalOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (currentActivity) {
            setActivities(activities.map(a => a.id === currentActivity.id ? { ...a, ...formData } : a));
        } else {
            setActivities([...activities, { ...formData, id: Date.now() }]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Deseas eliminar esta actividad?')) {
            setActivities(activities.filter(a => a.id !== id));
        }
    };

    return (
        <div style={styles.content}>
            <header style={styles.header}>
                <div>
                    <h2 style={styles.title}>Gestión de Actividades</h2>
                    <p style={styles.subtitle}>Administra los tours y experiencias para los usuarios</p>
                </div>
                <button style={styles.addBtn} onClick={() => handleOpenModal()}>+ Nueva Actividad</button>
            </header>

            <div style={styles.searchContainer}>
                <div style={styles.searchBox}>
                    <span>🔍</span>
                    <input
                        style={styles.input}
                        placeholder="Buscar por nombre o ubicación..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div style={styles.list}>
                {filtered.map(act => (
                    <div key={act.id} style={styles.card}>
                        <img src={act.image} alt={act.name} style={styles.img} />
                        <div style={styles.info}>
                            <div style={styles.nameRow}>
                                <h3 style={styles.name}>{act.name}</h3>
                                <span style={{ ...styles.badge, backgroundColor: act.status === 'Activo' ? '#2dd4bf22' : '#f43f5e22', color: act.status === 'Activo' ? '#0d9488' : '#e11d48' }}>
                                    {act.status}
                                </span>
                            </div>
                            <div style={styles.loc}>📍 {act.location} • ⏱️ {act.duration}</div>
                            <div style={styles.meta}>
                                <span style={styles.type}>{act.type}</span>
                                <span style={styles.price}>€{act.price}</span>
                            </div>
                        </div>
                        <div style={styles.actions}>
                            <button style={styles.actionBtn} onClick={() => handleOpenModal(act)}>📝</button>
                            <button style={{ ...styles.actionBtn, color: '#f43f5e' }} onClick={() => handleDelete(act.id)}>🗑️</button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3 style={styles.modalTitle}>{currentActivity ? 'Editar Actividad' : 'Nueva Actividad'}</h3>
                        <form onSubmit={handleSave}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Nombre de la Actividad</label>
                                <input style={styles.modalInput} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div style={styles.formGrid}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Tipo</label>
                                    <select style={styles.modalInput} value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option value="Aventura">Aventura</option>
                                        <option value="Cultural">Cultural</option>
                                        <option value="Naturaleza">Naturaleza</option>
                                        <option value="Gastronomía">Gastronomía</option>
                                        <option value="Relajación">Relajación</option>
                                    </select>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Precio (€)</label>
                                    <input type="number" style={styles.modalInput} value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                                </div>
                            </div>
                            <div style={styles.formGrid}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Ubicación</label>
                                    <input style={styles.modalInput} value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} required />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Duración (ej: 4h)</label>
                                    <input style={styles.modalInput} value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} required />
                                </div>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>URL Imagen</label>
                                <input style={styles.modalInput} value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Estado</label>
                                <select style={styles.modalInput} value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                </select>
                            </div>
                            <div style={styles.modalActions}>
                                <button type="button" style={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancelar</button>
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
        backgroundColor: '#6366f1', color: 'white', border: 'none', padding: '12px 24px',
        borderRadius: '16px', fontWeight: '700', cursor: 'pointer'
    },
    searchContainer: { marginBottom: '24px' },
    searchBox: {
        backgroundColor: '#f1f5f9', borderRadius: '16px', padding: '12px 20px',
        display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #e2e8f0'
    },
    input: { background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: '15px' },
    list: { display: 'flex', flexDirection: 'column', gap: '16px' },
    card: {
        backgroundColor: '#fff', borderRadius: '24px', padding: '16px',
        display: 'flex', gap: '20px', border: '1px solid #f1f5f9', alignItems: 'center'
    },
    img: { width: '100px', height: '100px', borderRadius: '20px', objectFit: 'cover' },
    info: { flex: 1 },
    nameRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' },
    name: { margin: 0, fontSize: '18px', fontWeight: '700' },
    badge: { padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700' },
    loc: { fontSize: '14px', color: '#64748b', marginBottom: '8px' },
    meta: { display: 'flex', gap: '12px', alignItems: 'center' },
    type: { backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', color: '#475569', fontWeight: '600' },
    price: { color: '#6366f1', fontWeight: '800', fontSize: '16px' },
    actions: { display: 'flex', gap: '8px' },
    actionBtn: {
        width: '38px', height: '38px', borderRadius: '12px', border: '1px solid #f1f5f9',
        backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    modalOverlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
    },
    modal: {
        backgroundColor: '#fff', padding: '30px', borderRadius: '24px',
        width: '450px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
    },
    modalTitle: { fontSize: '22px', fontWeight: '800', marginBottom: '20px', margin: 0 },
    formGroup: { marginBottom: '16px' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
    label: { display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#64748b' },
    modalInput: {
        width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0',
        fontSize: '15px', outline: 'none', boxSizing: 'border-box'
    },
    modalActions: { display: 'flex', gap: '12px', marginTop: '24px' },
    cancelBtn: {
        flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0',
        backgroundColor: '#fff', fontWeight: '600', cursor: 'pointer'
    },
    saveBtn: {
        flex: 1, padding: '14px', borderRadius: '12px', border: 'none',
        backgroundColor: '#6366f1', color: 'white', fontWeight: '600', cursor: 'pointer'
    }
};

export default ActividadesAd;
