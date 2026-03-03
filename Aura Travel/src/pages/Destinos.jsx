import React, { useState } from 'react';
import Explorar from './Explorar';
import Itinerario from './Itinerario';
import Alertas from './Alertas';
import Perfil from './Perfil';

const Destinos = () => {
    const [seccionActiva, setSeccionActiva] = useState('inicio');

    const destinosDestacados = [
        { id: 1, nombre: 'Santorini, Grecia', rating: 4.9, img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600', precio: '€850' },
        { id: 2, nombre: 'Bali, Indonesia', rating: 4.8, img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600', precio: '€1,200' },
        { id: 3, nombre: 'Cartagena, Colombia', rating: 4.7, img: 'https://images.unsplash.com/photo-1583531172005-814191b8b6c0?w=600', precio: '€750' }
    ];

    const renderContent = () => {
        switch (seccionActiva) {
            case 'explorar': return <Explorar />;
            case 'itinerario': return <Itinerario />;
            case 'alertas': return <Alertas />;
            case 'perfil': return <Perfil />;
            default: return (
                <div className="anim-fade" style={{ paddingBottom: '20px' }}>
                    {/* Header Premium */}
                    <header style={styles.header}>
                        <div style={styles.headerContent}>
                            <div>
                                <p style={styles.welcomeText}>¡Hola de nuevo!</p>
                                <h1 style={styles.userName}>Ana García</h1>
                            </div>
                            <div style={styles.profileWrapper}>
                                <img src="https://i.pravatar.cc/150?u=ana" alt="Perfil" style={styles.profilePic} />
                                <div style={styles.onlineBadge}></div>
                            </div>
                        </div>
                    </header>

                    <div style={styles.mainContent}>
                        {/* Search Bar con Icono */}
                        <div style={styles.searchContainer}>
                            <div style={styles.searchInputWrapper}>
                                <span style={styles.searchIcon}>🔍</span>
                                <input type="text" placeholder="¿A dónde quieres ir?" style={styles.searchInput} />
                            </div>
                        </div>


                        <div style={styles.iaCard}>
                            <div style={styles.iaIconWrapper}>✨</div>
                            <div style={styles.iaContent}>
                                <h3 style={styles.iaTitle}>Aura AI Sugerencia</h3>
                                <p style={styles.iaSubtitle}>Santorini tiene un 15% de descuento hoy. ¡Es el momento!</p>
                                <button style={styles.iaButton}>Ver oferta</button>
                            </div>
                        </div>


                        <div style={styles.statsRow}>
                            <div style={styles.statCard}>
                                <div style={{ ...styles.statIconBg, backgroundColor: '#eef2ff' }}>📅</div>
                                <h2 style={styles.statValue}>1</h2>
                                <p style={styles.statLabel}>Reserva</p>
                            </div>
                            <div style={styles.statCard}>
                                <div style={{ ...styles.statIconBg, backgroundColor: '#fdf2f8' }}>📍</div>
                                <h2 style={styles.statValue}>5</h2>
                                <p style={styles.statLabel}>Favoritos</p>
                            </div>
                            <div style={styles.statCard}>
                                <div style={{ ...styles.statIconBg, backgroundColor: '#f0fdf4' }}>📈</div>
                                <h2 style={styles.statValue}>3</h2>
                                <p style={styles.statLabel}>Viajes</p>
                            </div>
                        </div>

                        {/* Sección Destinos */}
                        <div style={styles.sectionHeader}>
                            <h2 style={styles.sectionTitle}>Destinos del Momento</h2>
                            <button style={styles.viewAllBtn}>Ver todos</button>
                        </div>

                        <div style={styles.destinosGrid}>
                            {destinosDestacados.map(dest => (
                                <div key={dest.id} style={styles.destCard}>
                                    <div style={styles.destImgContainer}>
                                        <img src={dest.img} alt={dest.nombre} style={styles.destImg} />
                                        <div style={styles.ratingBadge}>⭐ {dest.rating}</div>
                                        <div style={styles.priceOverlay}>{dest.precio}</div>
                                    </div>
                                    <div style={styles.destInfo}>
                                        <h3 style={styles.destName}>{dest.nombre}</h3>
                                        <p style={styles.destLocation}>Click para ver itinerario</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }
    };

    return (
        <div style={styles.container}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                .anim-fade { animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
                input:focus { outline: none; border: 1.5px solid #6366f1 !important; }
            `}</style>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                {renderContent()}
            </div>


            <nav style={styles.bottomNav}>
                <NavItem active={seccionActiva === 'inicio'} onClick={() => setSeccionActiva('inicio')} icon="🏠" label="Inicio" />
                <NavItem active={seccionActiva === 'explorar'} onClick={() => setSeccionActiva('explorar')} icon="🧭" label="Explorar" />
                <NavItem active={seccionActiva === 'itinerario'} onClick={() => setSeccionActiva('itinerario')} icon="🗺️" label="Plan" />
                <NavItem active={seccionActiva === 'alertas'} onClick={() => setSeccionActiva('alertas')} icon="🔔" label="Alertas" />
                <NavItem active={seccionActiva === 'perfil'} onClick={() => setSeccionActiva('perfil')} icon="👤" label="Perfil" />
            </nav>
        </div>
    );
};


const NavItem = ({ active, onClick, icon, label }) => (
    <div onClick={onClick} style={{ ...styles.navItem, color: active ? '#6366f1' : '#94a3b8' }}>
        <span style={{ fontSize: '22px', transform: active ? 'scale(1.2)' : 'scale(1)', transition: '0.3s' }}>{icon}</span>
        <span style={{ fontSize: '10px', fontWeight: active ? 'bold' : '500', marginTop: '4px' }}>{label}</span>
        {active && <div style={styles.navIndicator}></div>}
    </div>
);

const styles = {
    container: { backgroundColor: '#fcfcfd', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", display: 'flex', flexDirection: 'column' },


    header: {
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        padding: '60px 24px 80px 24px',
        borderBottomLeftRadius: '40px',
        borderBottomRightRadius: '40px',
        boxShadow: '0 10px 30px rgba(79, 70, 229, 0.2)'
    },
    headerContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    welcomeText: { color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: 0, fontWeight: '500' },
    userName: { color: 'white', fontSize: '28px', margin: '4px 0 0 0', fontWeight: '800', letterSpacing: '-0.5px' },
    profileWrapper: { position: 'relative' },
    profilePic: { width: '50px', height: '50px', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.3)', objectFit: 'cover' },
    onlineBadge: { position: 'absolute', bottom: -2, right: -2, width: '12px', height: '12px', backgroundColor: '#22c55e', borderRadius: '50%', border: '2px solid white' },

    mainContent: { padding: '0 24px' },

    // Search Bar
    searchContainer: { marginTop: '-30px', marginBottom: '24px' },
    searchInputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    searchIcon: { position: 'absolute', left: '16px', fontSize: '18px' },
    searchInput: { width: '100%', padding: '18px 18px 18px 48px', borderRadius: '20px', border: 'none', backgroundColor: 'white', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', fontSize: '16px', transition: '0.3s' },

    // IA Card Pro
    iaCard: {
        background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
        borderRadius: '24px', padding: '24px', display: 'flex', gap: '16px', marginBottom: '32px',
        color: 'white', position: 'relative', overflow: 'hidden'
    },
    iaIconWrapper: { width: '48px', height: '48px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' },
    iaTitle: { margin: 0, fontSize: '18px', fontWeight: '700' },
    iaSubtitle: { margin: '8px 0 16px 0', fontSize: '14px', opacity: 0.9, lineHeight: '1.5' },
    iaButton: { backgroundColor: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },

    // Stats
    statsRow: { display: 'flex', gap: '16px', marginBottom: '32px' },
    statCard: { flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' },
    statIconBg: { width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '18px' },
    statValue: { fontSize: '24px', fontWeight: '800', margin: 0, color: '#1e293b' },
    statLabel: { fontSize: '12px', color: '#64748b', margin: '4px 0 0 0', fontWeight: '600' },

    // Destinos Grid
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    sectionTitle: { fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: 0 },
    viewAllBtn: { background: 'none', border: 'none', color: '#6366f1', fontWeight: '700', cursor: 'pointer' },
    destinosGrid: { display: 'flex', flexDirection: 'column', gap: '20px' },
    destCard: { backgroundColor: 'white', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' },
    destImgContainer: { position: 'relative', height: '220px' },
    destImg: { width: '100%', height: '100%', objectFit: 'cover' },
    ratingBadge: { position: 'absolute', top: '16px', right: '16px', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', padding: '6px 12px', borderRadius: '12px', fontWeight: 'bold', fontSize: '12px', color: '#1e293b' },
    priceOverlay: { position: 'absolute', bottom: '16px', left: '16px', backgroundColor: '#6366f1', color: 'white', padding: '6px 14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px' },
    destInfo: { padding: '20px' },
    destName: { margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' },
    destLocation: { margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' },

    // Bottom Nav
    bottomNav: { position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', display: 'flex', justifyContent: 'space-around', padding: '12px 16px 24px 16px', borderTop: '1px solid #f1f5f9', zIndex: 100 },
    navItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', flex: 1, position: 'relative' },
    navIndicator: { position: 'absolute', bottom: '-8px', width: '4px', height: '4px', backgroundColor: '#6366f1', borderRadius: '50%' }
};

export default Destinos;