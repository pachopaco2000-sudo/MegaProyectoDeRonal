import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import { supabase } from '../services/supabaseClient';
import ConfirmModal from '../components/ConfirmModal';
import './styles/Perfil.css';

const Perfil = () => {
    const { user, profile, logout, updateProfile } = useContext(UserContext);
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    const userName = profile?.nombre || user?.user_metadata?.nombre || 'Viajero';
    const userEmail = profile?.correo || user?.email || 'No disponible';

    // Estados de configuración
    const [name, setName] = useState(userName);
    const [idioma, setIdioma] = useState(profile?.idioma || 'es');
    const [moneda, setMoneda] = useState(profile?.moneda || 'EUR');
    const [presupuesto, setPresupuesto] = useState(profile?.presupuesto || 'Media');
    const [saving, setSaving] = useState(false);
    
    // Estados para Aura Confirm
    const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    // Estados para Seguridad (Password)
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [passwordSaving, setPasswordSaving] = useState(false);

    useEffect(() => {
        if (profile) {
            setName(profile.nombre || userName);
            setIdioma(profile.idioma || 'es');
            setMoneda(profile.moneda || 'EUR');
            setPresupuesto(profile.presupuesto || 'Media');
        }
    }, [profile]);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        
        if (currentPass !== profile.contraseña) {
            showNotification("La contraseña actual es incorrecta.", "error");
            return;
        }

        if (newPass.length < 6) {
            showNotification("La nueva contraseña debe tener al menos 6 caracteres.", "error");
            return;
        }

        if (newPass !== confirmPass) {
            showNotification("Las nuevas contraseñas no coinciden.", "error");
            return;
        }

        setPasswordSaving(true);
        try {
            const { error, success } = await updateProfile({ contraseña: newPass });
            if (success) {
                showNotification("¡Contraseña actualizada con éxito!", "success");
                setCurrentPass('');
                setNewPass('');
                setConfirmPass('');
            } else {
                showNotification("Error: " + error.message, "error");
            }
        } catch (err) {
            showNotification("Fallo en la conexión.", "error");
        } finally {
            setPasswordSaving(false);
        }
    };


    const handleBorradoSeguro = async () => {
        setConfirmConfig({
            isOpen: true,
            title: "¿Borrado en profundidad?",
            message: "⚠️ ADVERTENCIA: Esta acción eliminará permanentemente todos tus datos, preferencias e itinerarios. No hay vuelta atrás.",
            confirmText: "Borrar Todo",
            onConfirm: async () => {
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                setSaving(true);
                try {
                    await supabase.from('Reservas').delete().eq('correo_usuario', user.email);
                    showNotification("Tus datos han sido eliminados del nodo central.", "success");
                    executeLogout(); // Función auxiliar para limpiar y salir
                } catch (error) {
                    console.error(error);
                    showNotification("Error en borrado seguro.", "error");
                } finally {
                    setSaving(false);
                }
            }
        });
    };

    const handleSave = async () => {
        setSaving(true);
        const { error, success } = await updateProfile({ nombre: name, idioma, moneda, presupuesto });
        setSaving(false);
        if (success) {
            showNotification("¡Preferencias guardadas con éxito!", "success");
        } else {
            showNotification("Hubo un error al guardar: " + error?.message, "error");
        }
    };

    const executeLogout = () => {
        logout().catch(e => console.error("Logout asíncrono falló:", e));
        localStorage.clear(); 
        sessionStorage.clear();
        window.location.href = '/';
    };

    const handleLogout = () => {
        setConfirmConfig({
            isOpen: true,
            title: "¿Ya te vas?",
            message: "Te estaremos esperando para tu próxima gran aventura en Aura Travel. ¡Vuelve pronto!",
            confirmText: "Cerrar Sesión",
            type: "primary",
            onConfirm: () => {
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                executeLogout();
            }
        });
    };

    return (
        <div className="anim-fade" style={{ paddingBottom: '30px' }}>
            <ConfirmModal 
                isOpen={confirmConfig.isOpen}
                title={confirmConfig.title}
                message={confirmConfig.message}
                confirmText={confirmConfig.confirmText}
                type={confirmConfig.type || 'danger'}
                onConfirm={confirmConfig.onConfirm}
                onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
            />
            <div className="perfil-header" style={{ position: 'relative' }}>
                <button 
                    onClick={handleLogout} 
                    style={{ position: 'absolute', top: '15px', right: '15px', background: '#dc2626', color: 'white', border: '1px solid #b91c1c', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', zIndex: 99999, transition: 'all 0.3s ease' }}
                >
                    🚪 Cerrar Sesión
                </button>
                <img src={`https://ui-avatars.com/api/?name=${name}&background=random`} alt="Avatar" className="perfil-avatar" />
                <h2 style={{ margin: '10px 0 5px' }}>{name}</h2>
                <p style={{ margin: 0, opacity: 0.8 }}>{userEmail}</p>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                    <span className="perfil-user-badge">{profile?.rol || 'Explorador'}</span>
                    
                    {profile?.rol === 'admin' && (
                        <button 
                            onClick={() => navigate('/admin')}
                            style={{ background: '#0f172a', color: 'white', border: '1px solid #334155', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', transition: 'all 0.2s' }}
                        >
                            <span>⚙️</span> Ir al Panel de Administración
                        </button>
                    )}
                </div>
            </div>
            
            <div style={{ padding: '20px' }}>
                <div className="perfil-section">
                    <h4>👤 Información Personal</h4>
                    <div className="perfil-form-group">
                        <label className="perfil-label">Nombre Completo</label>
                        <input 
                            type="text" 
                            className="perfil-select" 
                            value={name} 
                            onChange={e => setName(e.target.value)}
                            style={{ 
                                width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', marginBottom: '15px'
                            }}
                            placeholder="Tu nombre público"
                        />
                        <label className="perfil-label">Correo Electrónico (Registrado en BD)</label>
                        <input 
                            type="email" 
                            className="perfil-select" 
                            value={userEmail} 
                            disabled
                            style={{ 
                                width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', backgroundColor: '#f8fafc', color: '#94a3b8'
                            }}
                            title="Por seguridad, el correo solo puede cambiarse desde soporte técnico."
                        />
                    </div>
                </div>

                <div className="perfil-section">
                    <h4>⚙️ Preferencias Básicas</h4>
                    
                    <div className="perfil-form-group">
                        <label className="perfil-label">Idioma</label>
                        <select className="perfil-select" value={idioma} onChange={e => setIdioma(e.target.value)}>
                            <option value="es">Español</option>
                            <option value="en">Inglés</option>
                            <option value="fr">Francés</option>
                        </select>
                    </div>

                    <div className="perfil-form-group">
                        <label className="perfil-label">Moneda Principal</label>
                        <select className="perfil-select" value={moneda} onChange={e => setMoneda(e.target.value)}>
                            <option value="EUR">Euros (€)</option>
                            <option value="USD">Dólares ($)</option>
                            <option value="COP">Pesos Colombianos</option>
                        </select>
                    </div>

                    <div className="perfil-form-group">
                        <label className="perfil-label">Nivel de Presupuesto</label>
                        <select className="perfil-select" value={presupuesto} onChange={e => setPresupuesto(e.target.value)}>
                            <option value="Económico">Económico (Low Cost)</option>
                            <option value="Media">Estándar (Media)</option>
                            <option value="Lujo">Premium (Lujo)</option>
                        </select>
                    </div>

                    <button 
                        onClick={handleSave} 
                        className="perfil-save-btn"
                        disabled={saving}
                    >
                        {saving ? 'Guardando...' : 'Guardar Preferencias'}
                    </button>
                </div>

                <div className="perfil-section">
                    <h4>🛡️ Seguridad</h4>
                    <form onSubmit={handlePasswordChange}>
                        <div className="perfil-form-group">
                            <label className="perfil-label">Contraseña Actual</label>
                            <input 
                                type="password" 
                                className="perfil-select" 
                                value={currentPass} 
                                onChange={e => setCurrentPass(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', marginBottom: '10px' }}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div className="perfil-form-group">
                                <label className="perfil-label">Nueva Contraseña</label>
                                <input 
                                    type="password" 
                                    className="perfil-select" 
                                    value={newPass} 
                                    onChange={e => setNewPass(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
                                    placeholder="Nueva clave"
                                    required
                                />
                            </div>
                            <div className="perfil-form-group">
                                <label className="perfil-label">Confirmar Nueva</label>
                                <input 
                                    type="password" 
                                    className="perfil-select" 
                                    value={confirmPass} 
                                    onChange={e => setConfirmPass(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
                                    placeholder="Confirmar"
                                    required
                                />
                            </div>
                        </div>
                        <button 
                            type="submit"
                            className="perfil-save-btn" 
                            style={{ marginTop: '15px', background: '#0f172a' }}
                            disabled={passwordSaving}
                        >
                            {passwordSaving ? 'Actualizando...' : 'Actualizar Contraseña'}
                        </button>
                    </form>
                </div>

                <div className="perfil-section" style={{ border: '1px solid #fecdd3', backgroundColor: '#fff1f2' }}>
                    <h4 style={{ color: '#e11d48' }}>🛡️ Privacidad Avanzada</h4>
                    <p style={{ fontSize: '12px', color: '#be123c', marginBottom: '15px' }}>
                        Tus datos nos importan. Usa esta opción para borrar tus huellas digitales (cookies, reservas y perfil) de nuestros servidores encriptados.
                    </p>
                    <button onClick={handleBorradoSeguro} className="perfil-logout-btn" style={{ backgroundColor: '#e11d48', color: 'white', border: 'none' }} disabled={saving}>
                        {saving ? 'Purgando sistema...' : 'Borrado Seguro (Eliminar Mi Cuenta)'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Perfil;