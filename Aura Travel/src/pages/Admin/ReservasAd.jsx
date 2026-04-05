import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

const ReservasAd = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const defaultForm = { destino: '', ubicacion: '', date: '', duration: '', personas: 1, status: 'Pendiente', imagen: '' };
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBooking, setCurrentBooking] = useState(null);
    const [formData, setFormData] = useState(defaultForm);

    useEffect(() => {
        fetchReservas();
    }, []);

    const fetchReservas = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('Reservas')
                .select('*')
                .order('id', { ascending: false });
            
            if (error) throw error;
            setReservations(data || []);
        } catch (error) {
            console.error("Error al obtener reservas:", error);
            alert("Hubo un error al cargar las reservas.");
        } finally {
            setIsLoading(false);
        }
    };

    const filtered = reservations.filter(r =>
        (r.destino || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r?.id || '').toString().includes(searchTerm)
    );

    const handleOpenModal = (res = null) => {
        if (res) {
            setCurrentBooking(res);
            setFormData({ 
                destino: res.destino || '', 
                ubicacion: res.ubicacion || '', 
                date: res.fechaInicio || '', 
                duration: res.fechaFin || '', 
                personas: res.personas || 1, 
                status: res.estado || 'Pendiente',
                imagen: res.imagen || ''
            });
        } else {
            setCurrentBooking(null);
            setFormData(defaultForm);
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = {
                destino: formData.destino,
                ubicacion: formData.ubicacion,
                fechaInicio: formData.date || null,
                fechaFin: formData.duration || null,
                personas: parseInt(formData.personas) || 1,
                estado: formData.status,
                imagen: formData.imagen
            };

            if (currentBooking) {
                const { error } = await supabase.from('Reservas').update(payload).eq('id', currentBooking.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('Reservas').insert([payload]);
                if (error) throw error;
            }
            
            setIsModalOpen(false);
            setFormData(defaultForm);
            fetchReservas();
        } catch (error) {
            console.error("Error guardando reserva:", error);
            alert("No se pudo guardar la reserva. Verifica que las columnas existan en la base de datos.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar esta reserva permanentemente?')) {
            setIsLoading(true);
            try {
                const { error } = await supabase.from('Reservas').delete().eq('id', id);
                if (error) throw error;
                fetchReservas();
            } catch (error) {
                console.error("Error eliminando reserva:", error);
                alert("Hubo un error al eliminar.");
                setIsLoading(false);
            }
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

            {isLoading && reservations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Cargando reservas... ⏳
                </div>
            ) : (
                <div style={styles.list}>
                    {filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No se encontraron reservas.</div>
                    ) : (
                        filtered.map(res => (
                            <div key={res.id} style={styles.card}>
                                <img src={res.imagen || 'https://via.placeholder.com/150'} alt={res.destino} style={styles.img} />
                                <div style={styles.info}>
                                    <h3 style={styles.name}>{res.destino}</h3>
                                    <div style={styles.loc}>📍 {res.ubicacion}</div>
                                    <div style={styles.meta}>
                                        📅 {res.fechaInicio || 'N/A'} a {res.fechaFin || 'N/A'} • 👥 {res.personas} personas
                                    </div>
                                    <div style={styles.id}>ID: #{res.id} | Viajero: {res.correo_usuario || 'Desconocido'}</div>
                                </div>
                                <div style={{ ...styles.badge, backgroundColor: res.estado === 'Confirmada' ? '#2dd4bf22' : (res.estado === 'Cancelada' ? '#f43f5e22' : '#fbbf2422'), color: res.estado === 'Confirmada' ? '#0d9488' : (res.estado === 'Cancelada' ? '#e11d48' : '#b45309') }}>
                                    {res.estado || 'Pendiente'}
                                </div>
                                <div style={styles.actions}>
                                    <button style={styles.actionBtn} onClick={() => handleOpenModal(res)}>📝</button>
                                    <button style={{ ...styles.actionBtn, color: '#f43f5e' }} onClick={() => handleDelete(res.id)}>🗑️</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3 style={styles.modalTitle}>{currentBooking ? 'Editar Reserva' : 'Nueva Reserva'}</h3>
                        <form onSubmit={handleSave}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Destino / Título</label>
                                <input style={styles.modalInput} value={formData.destino} onChange={e => setFormData({ ...formData, destino: e.target.value })} required />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Ubicación</label>
                                <input style={styles.modalInput} value={formData.ubicacion} onChange={e => setFormData({ ...formData, ubicacion: e.target.value })} required />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ ...styles.formGroup, flex: 1 }}>
                                    <label style={styles.label}>F. Inicio</label>
                                    <input type="date" style={styles.modalInput} value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                </div>
                                <div style={{ ...styles.formGroup, flex: 1 }}>
                                    <label style={styles.label}>F. Fin</label>
                                    <input type="date" style={styles.modalInput} value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ ...styles.formGroup, flex: 1 }}>
                                    <label style={styles.label}>Personas</label>
                                    <input type="number" min="1" style={styles.modalInput} value={formData.personas} onChange={e => setFormData({ ...formData, personas: e.target.value })} required />
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
                            <div style={styles.formGroup}>
                                <label style={styles.label}>URL Imagen</label>
                                <input style={styles.modalInput} value={formData.imagen} onChange={e => setFormData({ ...formData, imagen: e.target.value })} />
                            </div>
                            <div style={styles.modalActions}>
                                <button type="button" style={styles.cancelBtn} onClick={() => setIsModalOpen(false)} disabled={isLoading}>Cancelar</button>
                                <button type="submit" style={{...styles.saveBtn, opacity: isLoading ? 0.7 : 1}} disabled={isLoading}>
                                    {isLoading ? 'Guardando...' : 'Guardar'}
                                </button>
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
