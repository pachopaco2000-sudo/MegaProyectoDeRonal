import React from 'react';

const Alertas = () => (
    <div style={{ padding: '20px' }} className="anim-fade">
        <h1 style={{ fontSize: '26px', fontWeight: '800' }}>Alertas y Notificaciones</h1>
        <div style={styles.aiToggle}>
            <div>
                <h4 style={{ margin: 0 }}>Alertas IA personalizadas</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Recibe recomendaciones basadas en tu perfil</p>
            </div>
            <div style={styles.switch}></div>
        </div>
        <h3 style={{ marginTop: '30px' }}>Recientes</h3>
        <div style={styles.alertCard}>
            <span style={{ fontSize: '24px' }}>📉</span>
            <div>
                <p style={{ margin: 0 }}><b>¡El precio de Santorini bajó un 15%!</b></p>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Hace 2 horas</span>
            </div>
        </div>
        <div style={styles.alertCard}>
            <span style={{ fontSize: '24px' }}>✨</span>
            <div>
                <p style={{ margin: 0 }}><b>Kyoto es perfecto para ti</b> según tu perfil.</p>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Hace 2 horas</span>
            </div>
        </div>
    </div>
);

const styles = {
    aiToggle: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8fafc', borderRadius: '15px', border: '1px solid #e2e8f0' },
    switch: { width: '40px', height: '20px', background: '#6366f1', borderRadius: '10px' },
    alertCard: { display: 'flex', gap: '15px', padding: '15px', border: '1px solid #f1f5f9', borderRadius: '15px', marginBottom: '10px' }
};

export default Alertas;