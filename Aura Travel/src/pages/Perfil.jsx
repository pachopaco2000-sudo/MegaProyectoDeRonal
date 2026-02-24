import React from 'react';

const Perfil = () => (
    <div className="anim-fade">
        <div style={styles.header}>
            <img src="https://i.pravatar.cc/150?u=ana" alt="Ana" style={styles.avatar} />
            <h2 style={{ margin: '10px 0 5px' }}>Ana García</h2>
            <p style={{ margin: 0, opacity: 0.8 }}>ana.garcia@example.com</p>
            <span style={styles.userBadge}>Usuario</span>
        </div>
        <div style={{ padding: '20px' }}>
            <div style={styles.section}>
                <h4>👤 Información Personal</h4>
                <div style={styles.item}>Nombre: Ana García</div>
                <div style={styles.item}>Correo: ana.garcia@example.com</div>
            </div>
            <div style={styles.section}>
                <h4>⚙️ Preferencias</h4>
                <div style={styles.item}>Notificaciones: Activadas</div>
                <div style={styles.item}>Idioma: Español</div>
            </div>
            <button style={styles.logoutBtn}>Cerrar Sesión</button>
        </div>
    </div>
);

const styles = {
    header: { background: 'linear-gradient(135deg, #6366f1, #a855f7)', padding: '50px 20px', textAlign: 'center', color: '#fff' },
    avatar: { width: '100px', height: '100px', borderRadius: '50%', border: '4px solid #fff' },
    userBadge: { background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '10px', fontSize: '12px', marginTop: '10px', display: 'inline-block' },
    section: { background: '#fff', borderRadius: '20px', padding: '20px', marginBottom: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
    item: { padding: '10px 0', borderBottom: '1px solid #f1f5f9', color: '#475569' },
    logoutBtn: { width: '100%', padding: '15px', color: 'red', fontWeight: 'bold', border: 'none', background: '#fee2e2', borderRadius: '15px', cursor: 'pointer' }
};

export default Perfil;