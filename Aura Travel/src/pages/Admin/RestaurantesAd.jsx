import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useNotification } from '../../context/NotificationContext';
import ConfirmModal from '../../components/ConfirmModal';

const RestaurantesAd = () => {
    const { showNotification } = useNotification();
    const [searchTerm, setSearchTerm] = useState('');
    const [restaurants, setRestaurants] = useState([]);
    const [destinos, setDestinos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const defaultForm = { name: '', type: '', price: '$$', rating: 4.5, image: '', destino_id: '' };
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRestaurant, setCurrentRestaurant] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [formData, setFormData] = useState(defaultForm);

    useEffect(() => {
        fetchRestaurantes();
        fetchDestinos();
    }, []);

    const fetchRestaurantes = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('Restaurantes')
                .select('*, Destino:destino_id(nombre)')
                .order('id', { ascending: false });
            
            if (error) throw error;
            setRestaurants(data || []);
        } catch (error) {
            console.error("Error al obtener restaurantes:", error);
            // alert("Hubo un error al obtener la lista de restaurantes.");
            // Supabase podria fallar si la relacion no existe todavia, intentamos basico:
            fallbackFetchRestaurantes();
        } finally {
            setIsLoading(false);
        }
    };

    // Si falla el JOIN porque no hay Foreign Key, hacemos un fetch simple
    const fallbackFetchRestaurantes = async () => {
        try {
            const { data, error } = await supabase.from('Restaurantes').select('*').order('id', { ascending: false });
            if (error) throw error;
            setRestaurants(data || []);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchDestinos = async () => {
        try {
            const { data, error } = await supabase.from('Destino').select('id, nombre, pais');
            if (error) throw error;
            setDestinos(data || []);
        } catch (error) {
            console.error("Error al obtener destinos para el selector:", error);
        }
    };

    const filtered = restaurants.filter(r => 
        (r.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.tipoComida || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (res = null) => {
        if (res) {
            setCurrentRestaurant(res);
            setFormData({ 
                name: res.nombre || '', 
                type: res.tipoComida || '', 
                price: res.precio || '$$', 
                rating: res.rating || 4.5, 
                image: res.imagen || '',
                destino_id: res.destino_id || '' 
            });
        } else {
            setCurrentRestaurant(null);
            setFormData(defaultForm);
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = {
                nombre: formData.name,
                tipo: formData.type,
                precio: isNaN(Number(formData.price)) ? null : Number(formData.price), // asumiendo que db soporta numeric o varchar
                rating: formData.rating,
                imagen: formData.image,
                destino_id: formData.destino_id ? parseInt(formData.destino_id) : null
            };

            // Si el precio de la UI es en $, $$, $$$ lo dejamos como string si la BD lo soporta,
            // pero el create table que dimos tiene precio numeric. Guardaremos un numero y luego lo mapeamos.
            // Para simplificar, si usan $, guardamos null en DB y mostramos $. O mejor adaptamos a numeric:
            // Vamos a intentar guardar formData.price tal cual si el usuario cambio el tipo de DB.
            const payloadAjustado = {
                nombre: formData.name,
                tipoComida: formData.type,
                precio: formData.price,
                rating: parseFloat(formData.rating),
                imagen: formData.image,
                destino_id: formData.destino_id ? parseInt(formData.destino_id) : null
            };

            if (currentRestaurant) {
                const { error } = await supabase.from('Restaurantes').update(payloadAjustado).eq('id', currentRestaurant.id);
                if (error) throw error;
                showNotification("Restaurante actualizado con éxito.", "success");
            } else {
                const { error } = await supabase.from('Restaurantes').insert([payloadAjustado]);
                if (error) throw error;
                showNotification("Restaurante creado con éxito.", "success");
            }
            
            setIsModalOpen(false);
            setFormData(defaultForm);
            fetchRestaurantes();
        } catch (error) {
            console.error("Error guardando restaurante:", error);
            showNotification("No se pudo guardar el restaurante. Asegurate de que la tabla soporte los parámetros correctos.", "error");
        } finally {
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
            const { error } = await supabase.from('Restaurantes').delete().eq('id', itemToDelete);
            if (error) throw error;
            showNotification("Restaurante eliminado.", "success");
            fetchRestaurantes();
        } catch (error) {
            console.error("Error eliminando restaurante:", error);
            showNotification("Hubo un error al eliminar el restaurante.", "error");
        } finally {
            setIsLoading(false);
            setItemToDelete(null);
        }
    };

    return (
        <div style={styles.content}>
            <header style={styles.header}>
                <div>
                    <h2 style={styles.title}>Gestión de Restaurantes</h2>
                    <p style={styles.subtitle}>Administra restaurantes vinculados a destinos</p>
                </div>
                <button style={styles.addBtn} onClick={() => handleOpenModal()}>+ Nuevo Restaurante</button>
            </header>

            <div style={styles.searchContainer}>
                <div style={styles.searchBox}>
                    <span>🔍</span>
                    <input style={styles.input} placeholder="Buscar restaurantes..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </div>
            
            {isLoading && restaurants.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Cargando restaurantes... ⏳
                </div>
            ) : (
                <div style={styles.list}>
                    {filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No se encontraron restaurantes.</div>
                    ) : (
                        filtered.map(res => (
                            <div key={res.id} style={styles.card}>
                                <img src={res.imagen || 'https://via.placeholder.com/150'} alt={res.nombre} style={styles.img} />
                                <div style={styles.info}>
                                    <h3 style={styles.name}>{res.nombre}</h3>
                                    <div style={styles.type}>
                                        {res.tipoComida} 
                                        {res.Destino?.nombre && <span style={{ color: '#0d9488', marginLeft: '5px' }}>📍 {res.Destino.nombre}</span>}
                                    </div>
                                    <div style={styles.meta}>
                                        <span style={styles.price}>{res.precio || 'N/A'}</span>
                                        <span style={styles.rating}>⭐ {res.rating}</span>
                                    </div>
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
                        <h3 style={styles.modalTitle}>{currentRestaurant ? 'Editar Restaurante' : 'Nuevo Restaurante'}</h3>
                        <form onSubmit={handleSave}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Nombre</label>
                                <input style={styles.modalInput} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Destino Asociado</label>
                                <select 
                                    style={styles.modalInput} 
                                    value={formData.destino_id} 
                                    onChange={e => setFormData({ ...formData, destino_id: e.target.value })}
                                >
                                    <option value="">Seleccionar Destino (Opcional)</option>
                                    {destinos.map(d => (
                                        <option key={d.id} value={d.id}>{d.nombre} ({d.pais})</option>
                                    ))}
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Tipo de Cocina</label>
                                <input style={styles.modalInput} value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} required />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Rango de Precio</label>
                                <select 
                                    style={styles.modalInput} 
                                    value={formData.price} 
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    required
                                >
                                    <option value="$">Barato ($)</option>
                                    <option value="$$">Moderado ($$)</option>
                                    <option value="$$$">Caro ($$$)</option>
                                    <option value="$$$$">Lujo ($$$$)</option>
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Calificación (1-5)</label>
                                <input type="number" step="0.1" min="1" max="5" style={styles.modalInput} value={formData.rating} onChange={e => setFormData({ ...formData, rating: e.target.value })} required />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>URL Imagen</label>
                                <input style={styles.modalInput} value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
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

            <ConfirmModal 
                isOpen={!!itemToDelete} 
                title="Eliminar Restaurante" 
                message="¿Estás seguro de que deseas eliminar este restaurante? Esta acción no se puede deshacer."
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
        backgroundColor: '#6366f1', color: 'white', border: 'none', padding: '12px 24px',
        borderRadius: '16px', fontWeight: '700', cursor: 'pointer'
    },
    searchContainer: { marginBottom: '24px' },
    searchBox: {
        backgroundColor: '#f1f5f9', borderRadius: '16px', padding: '12px 20px',
        display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #e2e8f0'
    },
    input: { backgroundColor: 'transparent', border: 'none', outline: 'none', flex: 1, fontSize: '15px', boxSizing: 'border-box', color: '#0f172a' },
    list: { display: 'flex', flexDirection: 'column', gap: '16px' },
    card: {
        backgroundColor: '#fff', borderRadius: '24px', padding: '16px',
        display: 'flex', gap: '20px', border: '1px solid #f1f5f9', alignItems: 'center'
    },
    img: { width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover' },
    info: { flex: 1 },
    name: { margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700' },
    type: { fontSize: '13px', color: '#64748b', marginBottom: '8px' },
    meta: { display: 'flex', gap: '12px' },
    price: { color: '#2dd4bf', fontWeight: '800', fontSize: '12px' },
    rating: { fontSize: '13px', fontWeight: '700' },
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
        width: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
    },
    modalTitle: { fontSize: '20px', fontWeight: '800', marginBottom: '20px', margin: 0 },
    formGroup: { marginBottom: '16px' },
    label: { display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#64748b' },
    modalInput: {
        width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0',
        fontSize: '15px', outline: 'none', boxSizing: 'border-box'
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

export default RestaurantesAd;