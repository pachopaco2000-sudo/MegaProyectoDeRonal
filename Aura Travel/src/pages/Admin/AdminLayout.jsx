import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { label: 'Dashboard', icon: '📊', path: '/admin' },
        { label: 'Destinos', icon: '📍', path: '/admin/destinos' },
        { label: 'Restaurantes', icon: '🍴', path: '/admin/restaurantes' },
        { label: 'Actividades', icon: '🏄', path: '/admin/actividades' },
        { label: 'Usuarios', icon: '👥', path: '/admin/usuarios' },
        { label: 'Reservas', icon: '📅', path: '/admin/reservas' },
        { label: 'Alertas', icon: '🔔', path: '/admin/alertas' }
    ];

    return (
        <div style={styles.container}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');
                * { box-sizing: border-box; }
                .sidebar-item:hover { background: rgba(99, 102, 241, 0.1); color: #6366f1 !important; }
            `}</style>

            <aside style={styles.sidebar}>
                <div style={styles.logoSection}>
                    <div style={styles.logoIcon}>✈️</div>
                    <div>
                        <h1 style={styles.logoText}>Aura Travel</h1>
                        <span style={styles.logoSubtext}>Panel Admin</span>
                    </div>
                </div>

                <nav style={styles.nav}>
                    {menuItems.map((item) => (
                        <div
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            className="sidebar-item"
                            style={{
                                ...styles.navItem,
                                background: location.pathname === item.path ? '#6366f1' : 'transparent',
                                color: location.pathname === item.path ? '#fff' : '#64748b',
                                boxShadow: location.pathname === item.path ? '0 10px 15px -3px rgba(99, 102, 241, 0.4)' : 'none'
                            }}
                        >
                            <span style={{ fontSize: '18px' }}>{item.icon}</span>
                            <span style={{ fontWeight: '600' }}>{item.label}</span>
                        </div>
                    ))}
                </nav>

                <div style={styles.bottomNav}>
                    <button onClick={() => navigate('/')} style={styles.backBtn}>
                        <span style={{ marginRight: '8px' }}>←</span> Volver a App
                    </button>
                </div>
            </aside>

            <main style={styles.mainContent}>
                <Outlet />
            </main>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: '"Outfit", sans-serif',
    },
    sidebar: {
        width: '260px',
        backgroundColor: '#fff',
        borderRight: '1px solid #f1f5f9',
        padding: '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 100
    },
    logoSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '40px',
        padding: '0 10px'
    },
    logoIcon: {
        fontSize: '24px',
        background: '#6366f1',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px',
        color: 'white'
    },
    logoText: { fontSize: '20px', fontWeight: '800', margin: 0, color: '#0f172a' },
    logoSubtext: { fontSize: '12px', color: '#94a3b8', fontWeight: '600' },
    nav: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        borderRadius: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        fontSize: '15px'
    },
    bottomNav: {
        marginTop: 'auto',
        padding: '20px 0'
    },
    backBtn: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        color: '#64748b',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s'
    },
    mainContent: {
        flex: 1,
        marginLeft: '260px',
        width: 'calc(100% - 260px)'
    }
};

export default AdminLayout;
