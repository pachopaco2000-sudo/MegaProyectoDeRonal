import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const Admin = () => {
    const [stats, setStats] = useState([
        { title: 'Usuarios activos', value: '...', change: 'Real-time', icon: '👤', color: '#6366f1' },
        { title: 'Destinos totales', value: '...', change: 'Real-time', icon: '📍', color: '#2dd4bf' },
        { title: 'Reservas totales', value: '...', change: 'Real-time', icon: '📅', color: '#a78bfa' },
        { title: 'Actividades', value: '...', change: 'Real-time', icon: '🎟️', color: '#f43f5e' }
    ]);

    const [popularDestinations, setPopularDestinations] = useState([]);
    const [recentAlerts, setRecentAlerts] = useState([]);

    const chartBars = [45, 52, 48, 61, 70, 86]; // Gráfica estática de ejemplo por ahora

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // 1. Obtener conteos usando { count: 'exact', head: true } para mayor rendimiento
            const { count: countUsuarios } = await supabase.from('Usuarios').select('*', { count: 'exact', head: true });
            const { count: countDestinos } = await supabase.from('Destino').select('*', { count: 'exact', head: true });
            const { count: countReservas } = await supabase.from('Reservas').select('*', { count: 'exact', head: true });
            const { count: countActividades } = await supabase.from('Actividades').select('*', { count: 'exact', head: true });

            setStats([
                { title: 'Usuarios registrados', value: countUsuarios || 0, change: 'Real-time', icon: '👤', color: '#6366f1' },
                { title: 'Destinos totales', value: countDestinos || 0, change: 'Real-time', icon: '📍', color: '#2dd4bf' },
                { title: 'Reservas totales', value: countReservas || 0, change: 'Real-time', icon: '📅', color: '#a78bfa' },
                { title: 'Actividades publicadas', value: countActividades || 0, change: 'Real-time', icon: '🎟️', color: '#f43f5e' }
            ]);

            // 2. Obtener Destinos más populares (Top 5 por rating)
            const { data: topDestinos } = await supabase
                .from('Destino')
                .select('nombre, pais, rating')
                .order('rating', { ascending: false })
                .limit(5);

            if (topDestinos) {
                setPopularDestinations(topDestinos.map((d, i) => ({
                    name: d.nombre,
                    country: d.pais,
                    rating: d.rating || 0,
                    rank: i + 1
                })));
            }

            // 3. Obtener alertas recientes (como una vista de actividad)
            const { data: alertas } = await supabase
                .from('Alertas')
                .select('*')
                .order('fecha', { ascending: false })
                .limit(4);
            
            if (alertas) {
                setRecentAlerts(alertas);
            }

        } catch (error) {
            console.error("Error al cargar datos del Dashboard:", error);
        }
    };

    return (
        <div style={styles.dashboardWrapper}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');
                * { box-sizing: border-box; }
                .card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
                .card:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05); }
                @keyframes grow { from { height: 0; } to { height: var(--h); } }
                .bar { animation: grow 1s ease-out forwards; }
            `}</style>

            <header style={styles.header}>
                <div>
                    <h2 style={styles.title}>Dashboard</h2>
                    <p style={styles.subtitle}>Resumen en tiempo real de Aura Travel</p>
                </div>
                <div style={styles.userProfile}>
                    <div style={styles.avatar}>A</div>
                    <span style={{ fontWeight: '600', color: '#0f172a' }}>Administrador</span>
                </div>
            </header>


            <div style={styles.statsGrid}>
                {stats.map((stat, i) => (
                    <div key={i} className="card" style={styles.statCard}>
                        <div style={styles.statHeader}>
                            <div style={{ ...styles.statIconBox, backgroundColor: stat.color + '15', color: stat.color }}>
                                {stat.icon}
                            </div>
                            <span style={{ ...styles.badge, backgroundColor: '#2dd4bf15', color: '#0d9488' }}>
                                {stat.change}
                            </span>
                        </div>
                        <div style={styles.statValue}>{stat.value}</div>
                        <div style={styles.statTitle}>{stat.title}</div>
                    </div>
                ))}
            </div>


            <div style={styles.middleGrid}>
                <div className="card" style={styles.chartContainer}>
                    <div style={styles.sectionHeader}>
                        <span style={{ color: '#6366f1' }}>📈</span> Tendencias de uso
                    </div>
                    <div style={styles.chartArea}>
                        <div style={styles.yAxis}>
                            <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
                        </div>
                        <div style={styles.barsContainer}>
                            {chartBars.map((h, i) => (
                                <div key={i} style={styles.barWrapper}>
                                    <div
                                        className="bar"
                                        style={{ ...styles.bar, '--h': h + '%', backgroundColor: i === 5 ? '#6366f1' : '#6366f188' }}
                                    />
                                    <span style={styles.barLabel}>{['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'][i]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card" style={styles.rankingContainer}>
                    <div style={styles.sectionHeader}>
                        <span style={{ color: '#2dd4bf' }}>⭐</span> Destinos más valorados
                    </div>
                    {popularDestinations.length === 0 ? (
                        <div style={{ padding: '20px', color: '#94a3b8', textAlign: 'center' }}>Cargando destinos...</div>
                    ) : (
                        <div style={styles.rankList}>
                            {popularDestinations.map((dest, i) => (
                                <div key={i} style={styles.rankItem}>
                                    <div style={styles.rankNumber}>{dest.rank}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '700', color: '#0f172a' }}>{dest.name}</div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{dest.country}</div>
                                    </div>
                                    <div style={styles.ratingBox}>
                                        <span style={{ color: '#fbbf24' }}>★</span>
                                        <span style={{ fontWeight: '700' }}>{dest.rating}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="card" style={styles.activityContainer}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={styles.sectionHeader}>Últimas Alertas del Sistema</h3>
                </div>
                <div style={styles.activityList}>
                    {recentAlerts.length === 0 ? (
                        <div style={{ color: '#94a3b8', textAlign: 'center', padding: '10px' }}>Sin alertas recientes</div>
                    ) : (
                        recentAlerts.map((act, i) => {
                            const date = new Date(act.fecha);
                            return (
                                <div key={act.id} style={styles.activityItem}>
                                    <div style={{ ...styles.activityAvatar, backgroundColor: act.tipo === 'Error' ? '#f43f5e' : '#6366f1' }}>
                                        {act.tipo === 'Error' ? '!' : 'i'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <span style={{ fontWeight: '700', color: '#0f172a' }}>{act.titulo || 'Alerta'}</span>
                                        <span style={{ color: '#64748b', margin: '0 5px' }}>-</span>
                                        <span style={{ color: '#64748b' }}>{act.descripcion}</span>
                                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                                            {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    dashboardWrapper: {
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: '"Outfit", sans-serif',
        color: '#0f172a',
        padding: '40px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px'
    },
    title: { fontSize: '32px', fontWeight: '800', margin: 0 },
    subtitle: { color: '#64748b', marginTop: '4px' },
    userProfile: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: '#fff',
        padding: '10px 20px',
        borderRadius: '20px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        border: '1px solid #f1f5f9'
    },
    avatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: '#6366f1',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '800'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '24px',
        marginBottom: '32px'
    },
    statCard: {
        background: '#fff',
        padding: '24px',
        borderRadius: '24px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.02)'
    },
    statHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    statIconBox: { width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
    badge: { padding: '4px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' },
    statValue: { fontSize: '28px', fontWeight: '800', marginBottom: '4px' },
    statTitle: { color: '#64748b', fontSize: '14px', fontWeight: '500' },
    middleGrid: {
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr',
        gap: '24px',
        marginBottom: '32px'
    },
    chartContainer: {
        background: '#fff',
        padding: '30px',
        borderRadius: '24px',
        height: '400px',
        display: 'flex',
        flexDirection: 'column'
    },
    sectionHeader: { fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 },
    chartArea: { flex: 1, display: 'flex', marginTop: '30px', position: 'relative' },
    yAxis: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: '#94a3b8',
        fontSize: '12px',
        paddingRight: '20px',
        paddingBottom: '30px'
    },
    barsContainer: {
        flex: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingBottom: '30px',
        borderLeft: '1px dashed #e2e8f0',
        borderBottom: '1px dashed #e2e8f0'
    },
    barWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
        height: '100%',
        justifyContent: 'flex-end',
        gap: '12px'
    },
    bar: {
        width: '40px',
        borderRadius: '8px 8px 4px 4px',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
    },
    barLabel: { fontSize: '12px', color: '#94a3b8' },
    rankingContainer: {
        background: '#fff',
        padding: '30px',
        borderRadius: '24px',
        height: '400px',
        overflowY: 'auto'
    },
    rankList: { marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' },
    rankItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '12px',
        borderRadius: '16px',
        background: '#f8fafc'
    },
    rankNumber: {
        width: '28px',
        height: '28px',
        borderRadius: '8px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: '800',
        color: '#64748b',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    ratingBox: { display: 'flex', alignItems: 'center', gap: '4px', background: '#fff', padding: '4px 8px', borderRadius: '10px', fontSize: '13px' },
    activityContainer: {
        background: '#fff',
        padding: '30px',
        borderRadius: '24px'
    },
    activityList: { display: 'flex', flexDirection: 'column', gap: '20px' },
    activityItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        paddingBottom: '16px',
        borderBottom: '1px solid #f1f5f9'
    },
    activityAvatar: {
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: '800',
        fontSize: '20px'
    }
};

export default Admin;
