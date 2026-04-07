import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useNotification } from '../../context/NotificationContext';

const AlertasAd = () => {
    const { showNotification } = useNotification();
    const [alerts, setAlerts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAlertas = async () => {
            try {
                const { data, error } = await supabase
                    .from('Alertas')
                    .select('*')
                    .order('fecha', { ascending: false });
                
                if (error) throw error;
                // Si la base de datos está vacía, mostrar mensaje
                setAlerts(data || []);
            } catch (error) {
                console.error("Error cargando alertas:", error);
                showNotification("Hubo un error cargando las alertas.", "error");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAlertas();
    }, []);

    const formatTime = (dateString) => {
        if (!dateString) return 'Reciente';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={styles.content}>
            <header style={styles.header}>
                <div>
                    <h2 style={styles.title}>Centro de Alertas</h2>
                    <p style={styles.subtitle}>Notificaciones del sistema en tiempo real</p>
                </div>
            </header>

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
