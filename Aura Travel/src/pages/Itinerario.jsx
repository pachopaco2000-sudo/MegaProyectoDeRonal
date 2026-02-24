import React from 'react';

const Itinerario = () => (
    <div className="anim-fade">
        <div style={styles.banner}>
            <h1 style={{ margin: 0, fontSize: '24px' }}>Mi Itinerario</h1>
            <div style={styles.itCard}>
                <h3>Escapada Mediterránea</h3>
                <p>📅 2026-06-15 - 2026-06-25</p>
                <p>👥 2 colaboradores</p>
            </div>
        </div>
        <div style={{ padding: '20px' }}>
            <button style={styles.shareBtn}>🔗 Compartir enlace</button>
            <div style={styles.timeline}>
                <div style={styles.day}>
                    <div style={styles.dot}>1</div>
                    <div>
                        <h4 style={{ margin: 0 }}>Santorini, Grecia</h4>
                        <p style={{ fontSize: '14px', color: '#64748b' }}>3 días • Jun 15-18</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const styles = {
    banner: { background: 'linear-gradient(135deg, #6366f1, #a855f7)', padding: '40px 20px 80px', color: '#fff' },
    itCard: { background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '20px', marginTop: '20px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' },
    shareBtn: { width: '100%', padding: '15px', borderRadius: '15px', border: 'none', background: '#6366f1', color: '#fff', fontWeight: 'bold', marginTop: '-40px', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)' },
    timeline: { marginTop: '30px' },
    day: { display: 'flex', gap: '15px', alignItems: 'center', padding: '15px', background: '#fff', borderRadius: '15px', marginBottom: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
    dot: { width: '30px', height: '30px', background: '#6366f1', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }
};

export default Itinerario;