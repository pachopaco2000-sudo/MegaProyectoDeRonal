import React, { useState } from 'react';

const ReservasAd = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [reservations, setReservations] = useState([
        { id: 'book1', target: 'Santorini', location: 'Grecia', date: '2025-06-15', duration: '2025-06-20', people: 2, status: 'Confirmada', created: '10/2/2025', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80' }
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBooking, setCurrentBooking] = useState(null);
    const [formData, setFormData] = useState({ target: '', location: '', date: '', duration: '', people: 1, status: 'Pendiente' });

    const filtered = reservations.filter(r =>
        r.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (res = null) => {
        if (res) {
            setCurrentBooking(res);
            setFormData({ ...res });
        } else {
            setCurrentBooking(null);
            setFormData({ target: '', location: '', date: '', duration: '', people: 1, status: 'Pendiente' });
        }
        setIsModalOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (currentBooking) {
            setReservations(reservations.map(r => r.id === currentBooking.id ? { ...r, ...formData } : r));
        } else {
            const newRes = {
                ...formData,
                id: 'book' + Date.now(),
                created: new Date().toLocaleDateString(),
                image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=300&q=80'
            };
            setReservations([...reservations, newRes]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Eliminar esta reserva?')) {
            setReservations(reservations.filter(r => r.id !== id));
        }
    };

    return (
        <div style={styles.content}>
            <header style={styles.header}>
                <div>
                    <h2 style={styles.title}>Gestión de Reservas</h2>
                    <p style={styles.subtitle}>Visualiza y administra todas las reservas</p>
                </div>
                <button style={styles.addBtn} onClick={() => handleOpenModal()}>+ Nueva Reserva</button>
            </header>

            <div style={styles.searchContainer}>
                <div style={styles.searchBox}>
                    <span>🔍</span>
                    <input style={styles.input} placeholder="Buscar reservas por destino o ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div style={styles.list}>
                {filtered.map(res => (
                    <div key={res.id} style={styles.card}>
                        <img src={res.image} alt={res.target} style={styles.img} />
                        <div style={styles.info}>
                            <h3 style={styles.name}>{res.target}</h3>
                            <div style={styles.loc}>📍 {res.location}</div>
                            <div style={styles.meta}>
                                📅 {res.date} a {res.duration} • 👥 {res.people} personas
                            </div>
                            <div style={styles.id}>ID: {res.id} • Creada: {res.created}</div>
                        </div>
                        <div style={{ ...styles.badge, backgroundColor: res.status === 'Confirmada' ? '#2dd4bf22' : '#fbbf2422', color: res.status === 'Confirmada' ? '#0d9488' : '#b45309' }}>
                            {res.status}
                        </div>
                        <div style={styles.actions}>
                            <button style={styles.actionBtn} onClick={() => handleOpenModal(res)}>📝</button>
                            <button style={{ ...styles.actionBtn, color: '#f43f5e' }} onClick={() => handleDelete(res.id)}>🗑️</button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3 style={styles.modalTitle}>{currentBooking ? 'Editar Reserva' : 'Nueva Reserva'}</h3>
                        <form onSubmit={handleSave}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Destino</label>
                                <input style={styles.modalInput} value={formData.target} onChange={e => setFormData({ ...formData, target: e.target.value })} required />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Ubicación</label>
                                <input style={styles.modalInput} value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} required />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ ...styles.formGroup, flex: 1 }}>
                                    <label style={styles.label}>F. Inicio</label>
                                    <input type="date" style={styles.modalInput} value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                                </div>
                                <div style={{ ...styles.formGroup, flex: 1 }}>
                                    <label style={styles.label}>F. Fin</label>
                                    <input type="date" style={styles.modalInput} value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} required />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ ...styles.formGroup, flex: 1 }}>
                                    <label style={styles.label}>Personas</label>
                                    <input type="number" min="1" style={styles.modalInput} value={formData.people} onChange={e => setFormData({ ...formData, people: e.target.value })} required />
                                </div>
                                <div style={{ ...styles.formGroup, flex: 1 }}>
                                    <label style={styles.label}>Estado</label>
                                    <select style={styles.modalInput} value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Confirmada">Confirmada</option>
                                        <option value="Cancelada">Cancelada</option>
                                    </select>
                                </div>
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
        backgroundColor: '#fff', borderRadius: '24px', padding: '20px',
        display: 'flex', gap: '20px', border: '1px solid #f1f5f9', alignItems: 'center'
    },
    img: { width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover' },
    info: { flex: 1 },
    name: { margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700' },
    loc: { fontSize: '13px', color: '#64748b', marginBottom: '8px' },
    meta: { fontSize: '13px', color: '#475569', marginBottom: '4px' },
    id: { fontSize: '11px', color: '#94a3b8' },
    badge: { padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '700' },
    actions: { display: 'flex', gap: '8px' },
    actionBtn: {
        width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #f1f5f9',
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
    modalTitle: { fontSize: '20px', fontWeight: '800', marginBottom: '20px', margin: 0 },
    formGroup: { marginBottom: '16px' },
    label: { display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#64748b' },
    modalInput: {
        width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0',
        fontSize: '15px', outline: 'none'
    },
    modalActions: { display: 'flex', gap: '12px', marginTop: '24px' },
    cancelBtn: {
        flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0',
        backgroundColor: '#fff', fontWeight: '600', cursor: 'pointer'
    },
    saveBtn: {
        flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
        backgroundColor: '#6366f1', color: 'white', fontWeight: '600', cursor: 'pointer'
    }
};

export default ReservasAd;
