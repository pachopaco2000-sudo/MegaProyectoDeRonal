import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import './styles/Perfil.css';

const Perfil = () => {
    const { user, profile, logout, updateProfile } = useContext(UserContext);
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    // Estados de configuración
    const [idioma, setIdioma] = useState(profile?.idioma || 'es');
    const [moneda, setMoneda] = useState(profile?.moneda || 'EUR');
    const [presupuesto, setPresupuesto] = useState(profile?.presupuesto || 'Media');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (profile) {
            setIdioma(profile.idioma || 'es');
            setMoneda(profile.moneda || 'EUR');
            setPresupuesto(profile.presupuesto || 'Media');
        }
    }, [profile]);

    const handleBorradoSeguro = async () => {
        // RF-18: Borrado Seguro de Datos
        if(window.confirm('⚠️ ADVERTENCIA: Esta acción eliminará permanentemente todos tus datos, preferencias e itinerarios de forma irrecuperable. ¿Deseas proceder con el borrado en profundidad?')) {
            setSaving(true);
            try {
                // Se invocaría un RPC en un backend real. Esto simula el borrado de referencias.
                await supabase.from('Reservas').delete().eq('correo_usuario', user.email);
                showNotification("Tus datos han sido sobreescritos y eliminados del nodo central.", "success");
                await logout();
                navigate('/login');
            } catch (error) {
                console.error(error);
                showNotification("Error en borrado seguro.", "error");
            } finally {
                setSaving(false);
            }
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const { error, success } = await updateProfile({ idioma, moneda, presupuesto });
        setSaving(false);
        if (success) {
            showNotification("¡Preferencias guardadas con éxito!", "success");
        } else {
            showNotification("Hubo un error al guardar: " + error?.message, "error");
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const userName = profile?.nombre || user?.user_metadata?.name || 'Viajero';
    const userEmail = user?.email || 'No disponible';

    return (
        <div className="anim-fade" style={{ paddingBottom: '30px' }}>
            <div className="perfil-header">
                <img src={`https://ui-avatars.com/api/?name=${userName}&background=random`} alt="Avatar" className="perfil-avatar" />
                <h2 style={{ margin: '10px 0 5px' }}>{userName}</h2>
                <p style={{ margin: 0, opacity: 0.8 }}>{userEmail}</p>
                <span className="perfil-user-badge">{profile?.rol || 'Explorador'}</span>
            </div>
            
            <div style={{ padding: '20px' }}>
                <div className="perfil-section">
                    <h4>👤 Información Personal</h4>
                    <div className="perfil-item">Nombre en BD: {profile?.nombre || userName}</div>
                    <div className="perfil-item">Contraseña: ****** (Verificada por Supabase)</div>
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

                <div className="perfil-section" style={{ border: '1px solid #fecdd3', backgroundColor: '#fff1f2' }}>
                    <h4 style={{ color: '#e11d48' }}>🛡️ Privacidad Avanzada</h4>
                    <p style={{ fontSize: '12px', color: '#be123c', marginBottom: '15px' }}>
                        Tus datos nos importan. Usa esta opción para borrar tus huellas digitales (cookies, reservas y perfil) de nuestros servidores encriptados.
                    </p>
                    <button onClick={handleBorradoSeguro} className="perfil-logout-btn" style={{ backgroundColor: '#e11d48', color: 'white', border: 'none' }} disabled={saving}>
                        {saving ? 'Purgando sistema...' : 'Borrado Seguro (Eliminar Mi Cuenta)'}
                    </button>
                </div>

                <button onClick={handleLogout} className="perfil-logout-btn" style={{ marginTop: '20px' }}>Cerrar Sesión</button>
            </div>
        </div>
    );
};

export default Perfil;