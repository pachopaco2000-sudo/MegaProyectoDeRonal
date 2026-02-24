import React, { useState } from 'react';
// Importamos los componentes que creaste por aparte
import Explorar from './Explorar';
import Itinerario from './Itinerario';
import Alertas from './Alertas';
import Perfil from './Perfil';

const Destinos = () => {
    // Estado para controlar qué vista mostrar
    const [seccionActiva, setSeccionActiva] = useState('inicio');

    const destinosDestacados = [
        { id: 1, nombre: 'Santorini, Grecia', rating: 4.9, img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600' },
        { id: 2, nombre: 'Bali, Indonesia', rating: 4.8, img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600' },
        { id: 3, nombre: 'Cartagena, Colombia', rating: 4.7, img: 'https://images.unsplash.com/photo-1583531172005-814191b8b6c0?w=600' }
    ];

    // Función que decide qué contenido renderizar en el centro
    const renderContent = () => {
        switch (seccionActiva) {
            case 'explorar': return <Explorar />;
            case 'itinerario': return <Itinerario />;
            case 'alertas': return <Alertas />;
            case 'perfil': return <Perfil />;
            default: return (
                <div className="anim-fade">
                    <header style={styles.header}>
                        <div>
                            <p style={styles.welcomeText}>¡Hola de nuevo!</p>
                            <h1 style={styles.userName}>Ana García</h1>
                        </div>
                        <img src="https://i.pravatar.cc/150?u=ana" alt="Perfil" style={styles.profilePic} />
                    </header>

                    <div style={styles.searchContainer}>
                        <input type="text" placeholder="Buscar destinos..." style={styles.searchInput} />
                    </div>

                    <div style={styles.iaCard}>
                        <div style={styles.iaIcon}>✨</div>
                        <div style={styles.iaContent}>
                            <h3 style={styles.iaTitle}>Aura AI te recomienda</h3>
                            <p style={styles.iaSubtitle}>Basado en tus preferencias, Santorini es perfecta para tu próximo viaje</p>
                            <button style={styles.iaButton}>Explorar con IA</button>
                        </div>
                    </div>

                    <div style={styles.statsRow}>
                        <div style={styles.statCard}><span>📅</span><h2 style={styles.statValue}>1</h2><p style={styles.statLabel}>Reserva activa</p></div>
                        <div style={styles.statCard}><span>📍</span><h2 style={styles.statValue}>5</h2><p style={styles.statLabel}>Favoritos</p></div>
                        <div style={styles.statCard}><span>📈</span><h2 style={styles.statValue}>3</h2><p style={styles.statLabel}>Itinerarios</p></div>
                    </div>

                    <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle}>Destinos destacados</h2>
                        <span style={styles.viewAll}>Ver todos</span>
                    </div>

                    <div style={styles.destinosGrid}>
                        {destinosDestacados.map(dest => (
                            <div key={dest.id} style={styles.destCard}>
                                <div style={styles.destImgContainer}>
                                    <img src={dest.img} alt={dest.nombre} style={styles.destImg} />
                                    <div style={styles.ratingBadge}>⭐ {dest.rating}</div>
                                </div>
                                <div style={styles.destInfo}>
                                    <h3 style={styles.destName}>{dest.nombre}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
    };

    return (
        <div style={styles.container}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .anim-fade { animation: fadeIn 0.4s ease-out forwards; }
            `}</style>

            {/* Contenido Dinámico */}
            <div style={{ flex: 1 }}>
                {renderContent()}
            </div>

            {/* Barra de Navegación Inferior Funcional */}
            <nav style={styles.bottomNav}>
                <div onClick={() => setSeccionActiva('inicio')} style={{ ...styles.navItem, color: seccionActiva === 'inicio' ? '#6366f1' : '#94a3b8' }}>
                    <span style={styles.navIcon}>🏠</span>
                    <span style={styles.navLabel}>Inicio</span>
                </div>
                <div onClick={() => setSeccionActiva('explorar')} style={{ ...styles.navItem, color: seccionActiva === 'explorar' ? '#6366f1' : '#94a3b8' }}>
                    <span style={styles.navIcon}>🧭</span>
                    <span style={styles.navLabel}>Explorar</span>
                </div>
                <div onClick={() => setSeccionActiva('itinerario')} style={{ ...styles.navItem, color: seccionActiva === 'itinerario' ? '#6366f1' : '#94a3b8' }}>
                    <span style={styles.navIcon}>🗺️</span>
                    <span style={styles.navLabel}>Itinerario</span>
                </div>
                <div onClick={() => setSeccionActiva('alertas')} style={{ ...styles.navItem, color: seccionActiva === 'alertas' ? '#6366f1' : '#94a3b8' }}>
                    <span style={styles.navIcon}>🔔</span>
                    <span style={styles.navLabel}>Alertas</span>
                </div>
                <div onClick={() => setSeccionActiva('perfil')} style={{ ...styles.navItem, color: seccionActiva === 'perfil' ? '#6366f1' : '#94a3b8' }}>
                    <span style={styles.navIcon}>👤</span>
                    <span style={styles.navLabel}>Perfil</span>
                </div>
            </nav>
        </div>
    );
};

// ... (Tus estilos se mantienen iguales)
const styles = {
    container: { backgroundColor: '#f8fafc', minHeight: '100vh', padding: '20px 20px 100px 20px', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)', margin: '-20px -20px 20px -20px', padding: '40px 20px 60px 20px', color: 'white', borderBottomLeftRadius: '30px', borderBottomRightRadius: '30px' },
    welcomeText: { fontSize: '14px', opacity: 0.9, margin: 0 },
    userName: { fontSize: '24px', fontWeight: 'bold', margin: 0 },
    profilePic: { width: '45px', height: '45px', borderRadius: '50%', border: '2px solid white' },
    searchContainer: { marginTop: '-45px', marginBottom: '25px' },
    searchInput: { width: '100%', padding: '15px 20px', borderRadius: '15px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontSize: '16px', boxSizing: 'border-box' },
    iaCard: { backgroundColor: '#f3f4ff', borderRadius: '20px', padding: '20px', display: 'flex', gap: '15px', marginBottom: '25px', border: '1px solid #e0e4ff' },
    iaIcon: { width: '40px', height: '40px', backgroundColor: '#6366f1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' },
    iaTitle: { margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold', color: '#1e293b' },
    iaSubtitle: { margin: '0 0 15px 0', fontSize: '13px', color: '#64748b', lineHeight: '1.4' },
    iaButton: { backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    statsRow: { display: 'flex', gap: '15px', marginBottom: '30px' },
    statCard: { flex: 1, backgroundColor: 'white', padding: '15px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' },
    statIcon: { fontSize: '20px', display: 'block', marginBottom: '5px' },
    statValue: { fontSize: '22px', fontWeight: 'bold', margin: '5px 0', color: '#1e293b' },
    statLabel: { fontSize: '12px', color: '#94a3b8', margin: 0 },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
    sectionTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: 0 },
    viewAll: { fontSize: '14px', color: '#6366f1', fontWeight: '600' },
    destinosGrid: { display: 'flex', flexDirection: 'column', gap: '20px' },
    destCard: { backgroundColor: 'white', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
    destImgContainer: { position: 'relative', height: '180px' },
    destImg: { width: '100%', height: '100%', objectFit: 'cover' },
    ratingBadge: { position: 'absolute', top: '15px', right: '15px', backgroundColor: 'white', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold', fontSize: '12px' },
    destInfo: { padding: '15px' },
    destName: { margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#1e293b' },
    bottomNav: { position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white', display: 'flex', justifyContent: 'space-around', padding: '15px 10px', borderTop: '1px solid #f1f5f9', zIndex: 100 },
    navItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'color 0.3s ease' },
    navIcon: { fontSize: '20px', marginBottom: '4px' },
    navLabel: { fontSize: '11px', fontWeight: '600' }
};

export default Destinos;