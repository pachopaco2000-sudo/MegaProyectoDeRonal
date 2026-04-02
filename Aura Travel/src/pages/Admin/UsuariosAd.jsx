import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

const UsuariosAd = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const defaultForm = { name: '', email: '', role: 'Usuario', status: 'Activo' };
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState(defaultForm);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('Usuarios')
                .select('*')
                .order('id', { ascending: false });
            
            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            alert("Hubo un error al obtener la lista de usuarios.");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (user = null) => {
        if (user) {
            setCurrentUser(user);
            setFormData({ name: user.name || '', email: user.email || '', role: user.role || 'Usuario', status: user.status || 'Activo' });
        } else {
            setCurrentUser(null);
            setFormData(defaultForm);
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                status: formData.status
            };

            if (currentUser) {
                const { error } = await supabase
                    .from('Usuarios')
                    .update(payload)
                    .eq('id', currentUser.id);
                if (error) throw error;
            } else {
                payload.reservations = 0;
                payload.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
                const { error } = await supabase
                    .from('Usuarios')
                    .insert([payload]);
                if (error) throw error;
            }
            
            setIsModalOpen(false);
            setFormData(defaultForm);
            fetchUsers();
        } catch (error) {
            console.error("Error guardando usuario:", error);
            alert("No se pudo guardar el usuario: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            setIsLoading(true);
            try {
                const { error } = await supabase
                    .from('Usuarios')
                    .delete()
                    .eq('id', id);
                if (error) throw error;
                fetchUsers();
            } catch (error) {
                console.error("Error eliminando usuario:", error);
                alert("Hubo un error al eliminar el usuario");
                setIsLoading(false);
            }
        }
    };

    const handleStatusToggle = async (user) => {
        const newStatus = user.status === 'Activo' ? 'Bloqueado' : 'Activo';
        try {
            const { error } = await supabase
                .from('Usuarios')
                .update({ status: newStatus })
                .eq('id', user.id);
            if (error) throw error;
            fetchUsers();
        } catch (error) {
            console.error("Error al actualizar el estado:", error);
            alert("No se pudo actualizar el estado del usuario.");
        }
    };

    return (
        <div style={styles.content}>
            <header style={styles.header}>
                <div>
                    <h2 style={styles.title}>Gestión de Usuarios</h2>
                    <p style={styles.subtitle}>Administra todos los perfiles en Supabase</p>
                </div>
                <button style={styles.addBtn} onClick={() => handleOpenModal()}>+ Nuevo Usuario</button>
            </header>

            <div style={styles.searchContainer}>
                <div style={styles.searchBox}>
                    <span style={{ color: '#94a3b8' }}>🔍</span>
                    <input
                        type="text"
                        placeholder="Buscar usuarios por nombre o email..."
                        style={styles.input}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {isLoading && users.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Cargando usuarios... ⏳
                </div>
            ) : (
                <div style={styles.list}>
                    {filteredUsers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No se encontraron usuarios.</div>
                    ) : (
                        filteredUsers.map(user => (
                            <div key={user.id} style={styles.userCard}>
                                <div style={{ ...styles.avatar, backgroundColor: user.color || '#6366f1' }}>
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div style={styles.userInfo}>
                                    <div style={styles.nameRow}>
                                        <h3 style={styles.userName}>{user.name}</h3>
                                        <span style={{ ...styles.badge, backgroundColor: user.role === 'Administrador' ? '#6366f1' : '#2dd4bf', color: '#fff' }}>
                                            {user.role}
                                        </span>
                                        <span style={{ ...styles.badge, backgroundColor: user.status === 'Activo' ? '#2dd4bf22' : '#f43f5e22', color: user.status === 'Activo' ? '#0d9488' : '#e11d48' }}>
                                            {user.status}
                                        </span>
                                    </div>
                                    <div style={styles.userEmail}>{user.email}</div>
                                    <div style={styles.userMeta}>{user.reservations || 0} reservas realizadas</div>
                                </div>
                                <div style={styles.actions}>
                                    <button style={styles.actionBtn} onClick={() => handleOpenModal(user)} title="Editar">📝</button>
                                    <button style={styles.actionBtn} onClick={() => handleStatusToggle(user)} title={user.status === 'Activo' ? 'Bloquear' : 'Activar'}>
                                        {user.status === 'Activo' ? '🚫' : '✅'}
                                    </button>
                                    <button style={{ ...styles.actionBtn, color: '#f43f5e' }} onClick={() => handleDelete(user.id)} title="Eliminar">🗑️</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3 style={styles.modalTitle}>{currentUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                        <form onSubmit={handleSave}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Nombre Completo</label>
                                <input
                                    style={styles.modalInput}
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email</label>
                                <input
                                    type="email"
                                    style={styles.modalInput}
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Rol</label>
                                <select
                                    style={styles.modalInput}
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="Usuario">Usuario</option>
                                    <option value="Administrador">Administrador</option>
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Estado</label>
                                <select
                                    style={styles.modalInput}
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="Activo">Activo</option>
                                    <option value="Bloqueado">Bloqueado</option>
                                </select>
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
        borderRadius: '16px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s'
    },
    searchContainer: { marginBottom: '24px' },
    searchBox: {
        backgroundColor: '#f1f5f9', borderRadius: '16px', padding: '12px 20px',
        display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #e2e8f0'
    },
    input: { background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: '15px' },
    list: { display: 'flex', flexDirection: 'column', gap: '16px' },
    userCard: {
        backgroundColor: '#fff', borderRadius: '24px', padding: '20px',
        display: 'flex', gap: '20px', border: '1px solid #f1f5f9', alignItems: 'center',
        transition: 'transform 0.2s',
    },
    avatar: {
        width: '48px', height: '48px', borderRadius: '14px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: '800', fontSize: '20px'
    },
    userInfo: { flex: 1 },
    nameRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' },
    userName: { margin: 0, fontSize: '16px', fontWeight: '700' },
    badge: { padding: '2px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' },
    userEmail: { fontSize: '14px', color: '#64748b', marginBottom: '4px' },
    userMeta: { fontSize: '12px', color: '#94a3b8' },
    actions: { display: 'flex', gap: '10px' },
    actionBtn: {
        width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #f1f5f9',
        backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s'
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
        fontSize: '15px', outline: 'none', transition: 'border-color 0.2s'
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

export default UsuariosAd;
