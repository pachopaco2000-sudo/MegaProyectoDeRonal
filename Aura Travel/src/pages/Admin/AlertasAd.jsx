import React, { useState } from 'react';

const AlertasAd = () => {
    const alerts = [
        { id: 1, title: 'Nueva reserva recibida', message: 'Ana García ha reservado un viaje a Santorini.', time: 'Hace 5 min', type: 'info', icon: '🔔' },
        { id: 2, title: 'Error en servidor', message: 'Se detectó un error al cargar los destinos.', time: 'Hace 30 min', type: 'error', icon: '⚠️' }
    ];

    return (
        <div style={styles.content}>
            <header style={styles.header}>
                <div>
                    <h2 style={styles.title}>Centro de Alertas</h2>
                    <p style={styles.subtitle}>Notificaciones del sistema</p>
                </div>
            </header>

            <div style={styles.list}>
                {alerts.map(alert => (
                    <div key={alert.id} style={styles.card}>
                        <div style={{ ...styles.icon, backgroundColor: alert.type === 'error' ? '#f43f5e15' : '#6366f115', color: alert.type === 'error' ? '#f43f5e' : '#6366f1' }}>
                            {alert.icon}
                        </div>
                        <div style={styles.info}>
                            <h3 style={styles.name}>{alert.title}</h3>
                            <p style={styles.msg}>{alert.message}</p>
                            <span style={styles.time}>{alert.time}</span>
                        </div>
                    </div>
                ))}
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
