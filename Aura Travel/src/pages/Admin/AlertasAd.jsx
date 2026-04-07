import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useNotification } from '../../context/NotificationContext';

const AlertasAd = () => {
    const { showNotification } = useNotification();
    const [alerts, setAlerts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Formulario para nueva alerta
    const [newAlert, setNewAlert] = useState({ titulo: '', descripcion: '', tipo: 'Info' });
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchAlertas();
    }, []);

    const fetchAlertas = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('Alertas')
                .select('*')
                .order('fecha', { ascending: false });
            
            if (error) throw error;
            setAlerts(data || []);
        } catch (error) {
            console.error("Error cargando alertas:", error);
            showNotification("Hubo un error cargando las alertas.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateAlert = async (e) => {
        e.preventDefault();
        if (!newAlert.titulo || !newAlert.descripcion) {
            showNotification("Por favor completa el título y la descripción.", "error");
            return;
        }

        setIsCreating(true);
        try {
            const { error } = await supabase.from('Alertas').insert([{
                titulo: newAlert.titulo,
                descripcion: newAlert.descripcion,
                tipo: newAlert.tipo,
                fecha: new Date().toISOString(),
                leida: false
            }]);

            if (error) throw error;

            showNotification("🔔 Alerta publicada con éxito a todos los usuarios.", "success");
            setNewAlert({ titulo: '', descripcion: '', tipo: 'Info' });
            fetchAlertas(); // Recargar lista
        } catch (error) {
            console.error("Error creando alerta:", error);
            showNotification("Error al emitir la alerta.", "error");
        } finally {
            setIsCreating(false);
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return 'Reciente';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={styles.content}>
            <header style={styles.header}>
                <div>
                    <h2 style={styles.title}>Centro de Emisión de Alertas</h2>
                    <p style={styles.subtitle}>Envía notificaciones masivas a los viajeros de Aura Travel</p>
                </div>
            </header>

            {/* FORMULARIO DE CREACIÓN */}
            <div style={styles.creationCard}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>🚀 Emitir Nueva Alerta</h3>
                <form onSubmit={handleCreateAlert} style={styles.form}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={styles.field}>
                            <label style={styles.label}>Título de la Alerta</label>
                            <input 
                                type="text" 
                                style={styles.input} 
                                placeholder="Ejem: ¡Oferta en vuelos a Dubai!" 
                                value={newAlert.titulo}
                                onChange={e => setNewAlert({...newAlert, titulo: e.target.value})}
                            />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Importancia / Tipo</label>
                            <select 
                                style={styles.input} 
                                value={newAlert.tipo}
                                onChange={e => setNewAlert({...newAlert, tipo: e.target.value})}
                            >
                                <option value="Info">ℹ️ Informativa (Normal)</option>
                                <option value="Promo">📢 Promoción / Oferta</option>
                                <option value="Error">⚠️ Advertencia / Clima</option>
                            </select>
                        </div>
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>Mensaje Detallado</label>
                        <textarea 
                            style={{ ...styles.input, minHeight: '80px', paddingTop: '12px' }} 
                            placeholder="Describe la novedad..."
                            value={newAlert.descripcion}
                            onChange={e => setNewAlert({...newAlert, descripcion: e.target.value})}
                        ></textarea>
                    </div>
                    <button 
                        type="submit" 
                        style={{ ...styles.publishBtn, opacity: isCreating ? 0.7 : 1 }}
                        disabled={isCreating}
                    >
                        {isCreating ? 'Emitiendo señal...' : '🔔 Publicar Alerta Ahora'}
                    </button>
                </form>
            </div>

            <h3 style={{ margin: '30px 0 20px 0', fontSize: '20px', fontWeight: '800' }}>Historial de Emisiones</h3>

            <div style={styles.list}>
                {isLoading ? (
                    <div style={{ padding: '20px', color: '#64748b' }}>Cargando alertas... ⏳</div>
                ) : alerts.length === 0 ? (
                    <div style={{ padding: '20px', color: '#64748b' }}>No tienes notificaciones por el momento. 🎉</div>
                ) : (
                    alerts.map(alert => (
                        <div key={alert.id} style={styles.card}>
                            <div style={{ ...styles.icon, backgroundColor: alert.tipo === 'Error' ? '#f43f5e15' : '#6366f115', color: alert.tipo === 'Error' ? '#f43f5e' : '#6366f1' }}>
                                {alert.tipo === 'Error' ? '⚠️' : '🔔'}
                            </div>
                            <div style={styles.info}>
                                <h3 style={styles.name}>{alert.titulo || 'Notificación'}</h3>
                                <p style={styles.msg}>{alert.descripcion}</p>
                                <span style={styles.time}>{formatTime(alert.fecha)}</span>
                            </div>
                            {!alert.leida && (
                                <div style={{ width: '10px', height: '10px', backgroundColor: '#6366f1', borderRadius: '50%' }}></div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const styles = {
    content: { padding: '40px' },
    header: { marginBottom: '30px' },
    title: { fontSize: '28px', fontWeight: '800', margin: 0 },
    subtitle: { color: '#64748b', marginTop: '4px' },
    list: { display: 'flex', flexDirection: 'column', gap: '16px' },
    creationCard: {
        backgroundColor: '#fff', borderRadius: '24px', padding: '30px',
        border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
        marginBottom: '20px'
    },
    form: { display: 'flex', flexDirection: 'column', gap: '16px' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', fontWeight: '600', color: '#475569' },
    input: {
        padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0',
        fontSize: '14px', backgroundColor: '#f8fafc', outline: 'none', width: '100%', boxSizing: 'border-box'
    },
    publishBtn: {
        backgroundColor: '#6366f1', color: 'white', border: 'none',
        padding: '14px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer',
        boxShadow: '0 8px 20px -4px rgba(99, 102, 241, 0.4)', transition: 'all 0.3s ease'
    },
    card: {
        backgroundColor: '#fff', borderRadius: '24px', padding: '20px',
        display: 'flex', gap: '20px', border: '1px solid #f1f5f9', alignItems: 'center'
    },
    icon: { width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
    info: { flex: 1 },
    name: { margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700' },
    msg: { fontSize: '14px', color: '#475569', margin: '0 0 8px 0' },
    time: { fontSize: '12px', color: '#94a3b8' }
};

export default AlertasAd;
