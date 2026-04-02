import React from 'react';
import './styles/Alertas.css';

const Alertas = () => (
    <div style={{ padding: '20px' }} className="anim-fade">
        <h1 style={{ fontSize: '26px', fontWeight: '800' }}>Alertas y Notificaciones</h1>
        <div className="alertas-ai-toggle">
            <div>
                <h4 style={{ margin: 0 }}>Alertas IA personalizadas</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Recibe recomendaciones basadas en tu perfil</p>
            </div>
            <div className="alertas-switch"></div>
        </div>
        <h3 style={{ marginTop: '30px' }}>Recientes</h3>
        <div className="alertas-alert-card">
            <span style={{ fontSize: '24px' }}>📉</span>
            <div>
                <p style={{ margin: 0 }}><b>¡El precio de Santorini bajó un 15%!</b></p>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Hace 2 horas</span>
            </div>
        </div>
        <div className="alertas-alert-card">
            <span style={{ fontSize: '24px' }}>✨</span>
            <div>
                <p style={{ margin: 0 }}><b>Kyoto es perfecto para ti</b> según tu perfil.</p>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Hace 2 horas</span>
            </div>
        </div>
    </div>
);

export default Alertas;