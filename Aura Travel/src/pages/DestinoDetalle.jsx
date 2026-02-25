import React, { useState } from 'react';

const DestinoDetalle = ({ destino, onBack }) => {
    const [selectedTab, setSelectedTab] = useState('visión');

    // Datos simulados si no se pasan
    const d = destino || {
        id: 1,
        nombre: 'Santorini',
        pais: 'Grecia',
        rating: 4.9,
        precio: 850,
        img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        descripcion: 'Una de las islas más famosas de las Cícladas, conocida por sus icónicas cúpulas azules sobre edificios blancos.',
        clima: '24°C - Soleado',
        idioma: 'Griego, Inglés',
        moneda: 'Euro (€)',
        actividades: ['Atardecer en Oia', 'Tour de Vinos', 'Playas de arena negra'],
        restaurantes: ['Amoudi Bay', 'Selene', 'Metaxi Mas']
    };

    return (
        <div style={styles.container} className="anim-fade">
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .anim-fade { animation: fadeIn 0.5s ease-out; }
                .tab-active { border-bottom: 3px solid #6366f1; color: #6366f1 !important; }
            `}</style>

            <div style={styles.heroSection}>
                <img src={d.img} alt={d.nombre} style={styles.heroImg} />
                <button onClick={onBack} style={styles.backBtn}>←</button>
                <div style={styles.heroOverlay}>
                    <div style={styles.tag}>{d.pais}</div>
                    <h1 style={styles.heroTitle}>{d.nombre}</h1>
                    <div style={styles.ratingRow}>
                        <span>⭐ {d.rating}</span>
                        <span style={{ margin: '0 10px' }}>•</span>
                        <span>€{d.precio} por persona</span>
                    </div>
                </div>
            </div>

            <div style={styles.content}>
                <div style={styles.tabRow}>
                    {['visión', 'detalles', 'clima', 'servicios'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setSelectedTab(tab)}
                            style={{ ...styles.tabBtn, borderBottom: selectedTab === tab ? '3px solid #6366f1' : 'none', color: selectedTab === tab ? '#6366f1' : '#94a3b8' }}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                <div style={styles.tabContent}>
                    {selectedTab === 'visión' && (
                        <div className="anim-fade">
                            <h3 style={styles.sectionTitle}>Sobre el destino</h3>
                            <p style={styles.descText}>{d.descripcion} Es el lugar perfecto para escapadas románticas o aventuras inolvidables frente al mar Egeo.</p>

                            <h3 style={styles.sectionTitle}>Lo que no te puedes perder</h3>
                            <div style={styles.list}>
                                {d.actividades.map((act, i) => (
                                    <div key={i} style={styles.listItem}>✨ {act}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedTab === 'detalles' && (
                        <div className="anim-fade" style={styles.infoGrid}>
                            <div style={styles.infoCard}>
                                <span style={styles.infoIcon}>🗣️</span>
                                <div>
                                    <div style={styles.infoLabel}>Idiomas</div>
                                    <div style={styles.infoValue}>{d.idioma}</div>
                                </div>
                            </div>
                            <div style={styles.infoCard}>
                                <span style={styles.infoIcon}>💰</span>
                                <div>
                                    <div style={styles.infoLabel}>Moneda</div>
                                    <div style={styles.infoValue}>{d.moneda}</div>
                                </div>
                            </div>
                            <div style={styles.infoCard}>
                                <span style={styles.infoIcon}>🍽️</span>
                                <div>
                                    <div style={styles.infoLabel}>Gastronomía</div>
                                    <div style={styles.infoValue}>Mediterránea</div>
                                </div>
                            </div>
                            <div style={styles.infoCard}>
                                <span style={styles.infoIcon}>⏱️</span>
                                <div>
                                    <div style={styles.infoLabel}>Mejor época</div>
                                    <div style={styles.infoValue}>Mayo - Septiembre</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedTab === 'clima' && (
                        <div className="anim-fade" style={styles.climateCard}>
                            <div style={styles.climateHeader}>
                                <span style={{ fontSize: '40px' }}>☀️</span>
                                <div>
                                    <h2 style={{ margin: 0 }}>{d.clima}</h2>
                                    <p style={{ margin: 0, color: '#64748b' }}>Cielo despejado ahora mismo</p>
                                </div>
                            </div>
                            <div style={styles.forecast}>
                                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie'].map(day => (
                                    <div key={day} style={styles.day}>
                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{day}</div>
                                        <div style={{ fontSize: '18px' }}>☀️</div>
                                        <div style={{ fontSize: '13px', fontWeight: 'bold' }}>26°</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedTab === 'servicios' && (
                        <div className="anim-fade">
                            <h3 style={styles.sectionTitle}>Servicios disponibles</h3>
                            <div style={styles.servicesGrid}>
                                {['WiFi Gratis', 'Transporte', 'Guía Local', 'Seguro Viaje'].map(s => (
                                    <div key={s} style={styles.serviceItem}>✅ {s}</div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div style={styles.footer}>
                <div style={styles.priceContainer}>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>Precio total</div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b' }}>€{d.precio}</div>
                </div>
                <button style={styles.reserveBtn}>Reservar Viaje</button>
            </div>
        </div>
    );
};

const styles = {
    container: { backgroundColor: '#fff', minHeight: '100vh', paddingBottom: '100px' },
    heroSection: { position: 'relative', height: '400px', overflow: 'hidden' },
    heroImg: { width: '100%', height: '100%', objectFit: 'cover' },
    backBtn: { position: 'absolute', top: '20px', left: '20px', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    heroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 20px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: '#fff' },
    tag: { display: 'inline-block', padding: '4px 12px', backgroundColor: '#6366f1', borderRadius: '10px', fontSize: '12px', fontWeight: '700', marginBottom: '10px' },
    heroTitle: { fontSize: '32px', fontWeight: '800', margin: '0 0 5px 0' },
    ratingRow: { display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '600', opacity: 0.9 },
    content: { padding: '30px 20px' },
    tabRow: { display: 'flex', gap: '25px', borderBottom: '1px solid #f1f5f9', marginBottom: '25px' },
    tabBtn: { background: 'none', border: 'none', padding: '10px 0', fontSize: '15px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s' },
    sectionTitle: { fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '15px' },
    descText: { color: '#64748b', fontSize: '15px', lineHeight: '1.6', marginBottom: '25px' },
    list: { display: 'flex', flexDirection: 'column', gap: '12px' },
    listItem: { backgroundColor: '#f8fafc', padding: '15px', borderRadius: '16px', fontSize: '14px', fontWeight: '600', color: '#475569' },
    infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
    infoCard: { backgroundColor: '#f8fafc', padding: '15px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '12px' },
    infoIcon: { fontSize: '22px' },
    infoLabel: { fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' },
    infoValue: { fontSize: '14px', fontWeight: '700', color: '#1e293b' },
    climateCard: { backgroundColor: '#eff6ff', padding: '20px', borderRadius: '24px', border: '1px solid #dbeafe' },
    climateHeader: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' },
    forecast: { display: 'flex', justifyContent: 'space-between' },
    day: { textAlign: 'center' },
    servicesGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
    serviceItem: { backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', color: '#166534' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 100 },
    priceContainer: { display: 'flex', flexDirection: 'column' },
    reserveBtn: { backgroundColor: '#1e293b', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: '16px', fontWeight: '700', fontSize: '16px', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(30, 41, 59, 0.3)' }
};

export default DestinoDetalle;
