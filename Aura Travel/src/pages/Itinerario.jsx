import React from 'react';
import './styles/Itinerario.css';

const Itinerario = () => (
    <div className="anim-fade">
        <div className="itinerario-banner">
            <h1 style={{ margin: 0, fontSize: '24px' }}>Mi Itinerario</h1>
            <div className="itinerario-card">
                <h3>Escapada Mediterránea</h3>
                <p>📅 2026-06-15 - 2026-06-25</p>
                <p>👥 2 colaboradores</p>
            </div>
        </div>
        <div style={{ padding: '20px' }}>
            <button className="itinerario-share-btn">🔗 Compartir enlace</button>
            <div className="itinerario-timeline">
                <div className="itinerario-day">
                    <div className="itinerario-dot">1</div>
                    <div>
                        <h4 style={{ margin: 0 }}>Santorini, Grecia</h4>
                        <p style={{ fontSize: '14px', color: '#64748b' }}>3 días • Jun 15-18</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default Itinerario;