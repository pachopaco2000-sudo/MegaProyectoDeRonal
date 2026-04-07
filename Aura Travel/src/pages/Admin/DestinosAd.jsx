import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useNotification } from '../../context/NotificationContext';
import ConfirmModal from '../../components/ConfirmModal';

const DestinosAd = () => {
    const { showNotification } = useNotification();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [destinos, setDestinos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const defaultForm = {
        nombre: '', pais: '', ciudad: '', descripcion: '', 
        categoria: '', precio: '', imagen: '', 
        latitud: '', longitud: '', tags: '', destacado: false, rating: 4.5
    };

    const [currentDestino, setCurrentDestino] = useState(null);
    const [newDestino, setNewDestino] = useState(defaultForm);

    useEffect(() => {
        fetchDestinos();
    }, []);

    const fetchDestinos = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('Destino')
                .select('*')
                .order('id', { ascending: false });
            
            if (error) throw error;
            setDestinos(data || []);
        } catch (error) {
            console.error("Error al cargar destinos:", error);
            showNotification("Error al cargar los destinos desde la base de datos.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (destino = null) => {
        if (destino) {
            setCurrentDestino(destino);
            setNewDestino({ ...destino, tags: destino.tags || '' });
        } else {
            setCurrentDestino(null);
            setNewDestino(defaultForm);
        }
        setIsModalOpen(true);
    };

    const handleSaveDestino = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const payload = {
                nombre: newDestino.nombre,
                pais: newDestino.pais,
                ciudad: newDestino.ciudad || null,
                descripcion: newDestino.descripcion,
                categoria: newDestino.categoria,
                precio: parseFloat(newDestino.precio),
                imagen: newDestino.imagen,
                latitud: newDestino.latitud ? parseFloat(newDestino.latitud) : null,
                longitud: newDestino.longitud ? parseFloat(newDestino.longitud) : null,
                tags: newDestino.tags || '',
                rating: newDestino.rating || 4.5,
                destacado: newDestino.destacado || false
            };

            if (currentDestino) {
                const { error } = await supabase
                    .from('Destino')
                    .update(payload)
                    .eq('id', currentDestino.id);
                if (error) throw error;
                showNotification("Destino actualizado con éxito.", "success");
            } else {
                const { error } = await supabase
                    .from('Destino')
                    .insert([payload]);
                if (error) throw error;
                showNotification("Destino creado con éxito.", "success");
            }
            
            setIsModalOpen(false);
            setNewDestino(defaultForm);
            fetchDestinos(); // Recargar datos
        } catch (error) {
            console.error("Error guardando destino:", error);
            showNotification("Error al guardar destino: " + error.message, "error");
        } finally {
            // El loading se apaga en fetchDestinos, pero si falla lo apagamos aquí
            setIsLoading(false); 
        }
    };

    const handleDelete = (id) => {
        setItemToDelete(id);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('Destino')
                .delete()
                .eq('id', itemToDelete);
                
            if (error) throw error;
            showNotification("Destino eliminado exitosamente.", "success");
            fetchDestinos();
        } catch (error) {
            console.error("Error eliminando destino:", error);
            showNotification("Hubo un error al eliminar el destino.", "error");
        } finally {
            setIsLoading(false);
            setItemToDelete(null);
        }
    };

    const filteredDestinos = destinos.filter(d =>
        d.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.pais?.toLowerCase().includes(searchTerm.toLowerCase())
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

            {isLoading && destinos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Cargando destinos desde Supabase... ⏳
                </div>
            ) : (
                <div style={styles.destinosList}>
                    {filteredDestinos.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No se encontraron destinos.</div>
                    ) : (
                        filteredDestinos.map(destino => (
                            <div key={destino.id} style={styles.destinoCard}>
                                <img src={destino.imagen} alt={destino.nombre} style={styles.destImg} />
                                <div style={styles.destInfo}>
                                    <h3 style={styles.destName}>{destino.nombre}</h3>
                                    <div style={styles.destLoc}>📍 {destino.ciudad ? `${destino.ciudad}, ` : ''}{destino.pais}</div>
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
                        ))
                    )}
                </div>
            )}

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
                            
                            <div style={styles.formGrid}>
                                <div style={styles.field}>
                                    <label style={styles.label}>Categoría</label>
                                    <select required style={styles.formInput} value={newDestino.categoria} onChange={e => setNewDestino({ ...newDestino, categoria: e.target.value })}>
                                        <option value="">Seleccionar</option>
                                        <option value="Playa">Playa</option>
                                        <option value="Aventura">Aventura</option>
                                        <option value="Naturaleza">Naturaleza</option>
                                        <option value="Cultural">Cultural</option>
                                        <option value="Ciudad">Ciudad</option>
                                    </select>
                                </div>
                                <div style={styles.field}>
                                    <label style={styles.label}>Ciudad</label>
                                    <input style={styles.formInput} placeholder="Oia" value={newDestino.ciudad} onChange={e => setNewDestino({ ...newDestino, ciudad: e.target.value })} />
                                </div>
                            </div>

                            <div style={styles.field}>
                                <label style={styles.label}>Descripción</label>
                                <textarea required style={styles.formTextarea} placeholder="Descripción del destino..." value={newDestino.descripcion} onChange={e => setNewDestino({ ...newDestino, descripcion: e.target.value })} />
                            </div>
                            
                            <div style={styles.formGrid}>
                                <div style={styles.field}>
                                    <label style={styles.label}>Precio (€)</label>
                                    <input required type="number" step="0.01" style={styles.formInput} placeholder="850" value={newDestino.precio} onChange={e => setNewDestino({ ...newDestino, precio: e.target.value })} />
                                </div>
                                <div style={styles.field}>
                                    <label style={styles.label}>URL de imagen</label>
                                    <input required style={styles.formInput} placeholder="https://..." value={newDestino.imagen} onChange={e => setNewDestino({ ...newDestino, imagen: e.target.value })} />
                                </div>
                            </div>
                            
                            <div style={styles.formGrid}>
                                <div style={styles.field}>
                                    <label style={styles.label}>Latitud</label>
                                    <input type="number" step="any" style={styles.formInput} placeholder="36.3932" value={newDestino.latitud} onChange={e => setNewDestino({ ...newDestino, latitud: e.target.value })} />
                                </div>
                                <div style={styles.field}>
                                    <label style={styles.label}>Longitud</label>
                                    <input type="number" step="any" style={styles.formInput} placeholder="25.4615" value={newDestino.longitud} onChange={e => setNewDestino({ ...newDestino, longitud: e.target.value })} />
                                </div>
                            </div>
                            
                            <div style={styles.field}>
                                <label style={styles.label}>Tags (separados por coma)</label>
                                <input style={styles.formInput} placeholder="Romántico, Lujo, Fotografía" value={newDestino.tags} onChange={e => setNewDestino({ ...newDestino, tags: e.target.value })} />
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                                <input 
                                    type="checkbox" 
                                    id="destacado" 
                                    checked={newDestino.destacado} 
                                    onChange={e => setNewDestino({ ...newDestino, destacado: e.target.checked })} 
                                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                />
                                <label htmlFor="destacado" style={{ ...styles.label, cursor: 'pointer', margin: 0 }}>Marcar como destino destacado</label>
                            </div>

                            <div style={styles.modalFooter}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.cancelBtn} disabled={isLoading}>Cancelar</button>
                                <button type="submit" style={{...styles.saveBtn, opacity: isLoading ? 0.7 : 1}} disabled={isLoading}>
                                    {isLoading ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal 
                isOpen={!!itemToDelete} 
                title="Eliminar Destino" 
                message="¿Estás seguro de que deseas eliminar este destino? Esta acción también podría eliminar actividades y restaurantes asociados."
                onConfirm={confirmDelete} 
                onCancel={() => setItemToDelete(null)} 
            />
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
    input: { backgroundColor: 'transparent', border: 'none', outline: 'none', flex: 1, fontSize: '15px', boxSizing: 'border-box', color: '#0f172a' },
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
    modalOverlay: {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
    },
    modal: {
        backgroundColor: '#fff', borderRadius: '24px', width: '100%', maxWidth: '600px',
        padding: '30px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        maxHeight: '90vh', overflowY: 'auto'
    },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    closeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' },
    form: { display: 'flex', flexDirection: 'column', gap: '16px' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', fontWeight: '600', color: '#475569' },
    formInput: {
        padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0',
        fontSize: '14px', backgroundColor: '#f8fafc', boxSizing: 'border-box', width: '100%'
    },
    formTextarea: {
        padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0',
        fontSize: '14px', backgroundColor: '#f8fafc', minHeight: '80px', fontFamily: 'inherit', boxSizing: 'border-box', width: '100%'
    },
    modalFooter: { display: 'flex', gap: '12px', marginTop: '16px' },
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