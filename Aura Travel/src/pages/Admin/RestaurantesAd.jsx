import React, { useState } from 'react';

const RestaurantesAd = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [restaurants, setRestaurants] = useState([
        { id: 1, name: 'Ambrosia Restaurant', type: 'Mediterránea', price: '$$$', rating: 4.8, image: 'https://images.unsplash.com/photo-1517248135467-4c7ed9d8747a?auto=format&fit=crop&w=300&q=80' },
        { id: 2, name: 'Sunset Taverna', type: 'Mariscos', price: '$$', rating: 4.6, image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=300&q=80' },
        { id: 3, name: 'Kikunoi', type: 'Japonesa', price: '$$$$', rating: 4.9, image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=300&q=80' }
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRestaurant, setCurrentRestaurant] = useState(null);
    const [formData, setFormData] = useState({ name: '', type: '', price: '$$', rating: 4.5, image: '' });

    const filtered = restaurants.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleOpenModal = (res = null) => {
        if (res) {
            setCurrentRestaurant(res);
            setFormData({ ...res });
        } else {
            setCurrentRestaurant(null);
            setFormData({ name: '', type: '', price: '$$', rating: 4.5, image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=300&q=80' });
        }
        setIsModalOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (currentRestaurant) {
            setRestaurants(restaurants.map(r => r.id === currentRestaurant.id ? { ...r, ...formData } : r));
        } else {
            setRestaurants([...restaurants, { ...formData, id: Date.now() }]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Eliminar este restaurante?')) {
            setRestaurants(restaurants.filter(r => r.id !== id));
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
            <div style={styles.list}>
                {filtered.map(res => (
                    <div key={res.id} style={styles.card}>
                        <img src={res.image} alt={res.name} style={styles.img} />
                        <div style={styles.info}>
                            <h3 style={styles.name}>{res.name}</h3>
                            <div style={styles.type}>{res.type}</div>
                            <div style={styles.meta}>
                                <span style={styles.price}>{res.price}</span>
                                <span style={styles.rating}>⭐ {res.rating}</span>
                            </div>
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
                        <h3 style={styles.modalTitle}>{currentRestaurant ? 'Editar Restaurante' : 'Nuevo Restaurante'}</h3>
                        <form onSubmit={handleSave}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Nombre</label>
                                <input style={styles.modalInput} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Tipo de Cocina</label>
                                <input style={styles.modalInput} value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} required />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Rango de Precio</label>
                                <select style={styles.modalInput} value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })}>
                                    <option value="$">$ (Económico)</option>
                                    <option value="$$">$$ (Medio)</option>
                                    <option value="$$$">$$$ (Caro)</option>
                                    <option value="$$$$">$$$$ (Lujo)</option>
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

export default RestaurantesAd;