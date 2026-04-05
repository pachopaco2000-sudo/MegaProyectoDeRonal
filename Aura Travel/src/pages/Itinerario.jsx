import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import { supabase } from '../services/supabaseClient';
import './styles/Itinerario.css';

const Itinerario = () => {
    const { user } = useContext(UserContext);
    const { showNotification } = useNotification();
    const [misReservas, setMisReservas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMisReservas = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('Reservas')
                    .select('*')
                    .eq('correo_usuario', user.email)
                    .order('id', { ascending: false });
                
                if (error) throw error;
                setMisReservas(data || []);
            } catch (error) {
                console.error("Error cargando itinerarios:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMisReservas();

        // RF-20: Colaboración en Grupo vía WebSockets (Suscripción local y en tiempo real)
        const reservasSubscription = supabase
            .channel('custom-all-channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'Reservas', filter: `correo_usuario=eq.${user.email}` },
                (payload) => {
                    console.log('Cambio detectado vía WebSocket:', payload);
                    fetchMisReservas(); // Recarga reactiva en milisegundos
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(reservasSubscription);
        };
    }, [user]);

    if (isLoading) {
        return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Cargando tu diario de viaje... 🗺️</div>;
    }

    if (misReservas.length === 0) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>No tienes viajes programados</h2>
                <p style={{ color: '#64748b' }}>Explora nuestros destinos y empieza tu nueva aventura.</p>
            </div>
        );
    }

    // Mostramos la primera de la lista (más reciente) en el banner
    const viajeActual = misReservas[0];

    const handleShare = () => {
        // RF-19: Generación de Deep Links para compartir itinerarios
        const deepLink = `${window.location.origin}/destinos?share_itinerary=${btoa(user.email)}`;
        navigator.clipboard.writeText(deepLink);
        showNotification("¡Enlace dinámico copiado! Compártelo con tu grupo.", "success");
    };

    return (
        <div className="anim-fade">
            <div className="itinerario-banner">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ margin: 0, fontSize: '24px' }}>Mi Itinerario ({misReservas.length})</h1>
                    <button onClick={handleShare} style={{ background: '#fff', color: '#6366f1', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🔗 Compartir</button>
                </div>
                <div className="itinerario-card" style={{ marginTop: '15px' }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>{viajeActual.destino} - {viajeActual.ubicacion}</h3>
                    <p style={{ margin: '5px 0' }}>📅 {viajeActual.fechaInicio || 'Por definir'} - {viajeActual.fechaFin || 'Por definir'}</p>
                    <p style={{ margin: '5px 0' }}>👥 {viajeActual.personas} personas</p>
                    <div style={{
                        marginTop: '10px', display: 'inline-block', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold',
                        backgroundColor: viajeActual.estado === 'Confirmada' ? '#2dd4bf22' : '#fbbf2422',
                        color: viajeActual.estado === 'Confirmada' ? '#0d9488' : '#b45309'
                    }}>
                        Estado: {viajeActual.estado}
                    </div>
                </div>
            </div>
            
            <div style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 15px 0' }}>Historial de Viajes</h3>
                <div className="itinerario-timeline">
                    {misReservas.map((reserva, index) => (
                        <div key={reserva.id} className="itinerario-day" style={{ marginBottom: '20px' }}>
                            <div className="itinerario-dot" style={{ backgroundColor: index === 0 ? '#6366f1' : '#94a3b8' }}>{index + 1}</div>
                            <div>
                                <h4 style={{ margin: '0 0 4px 0' }}>{reserva.destino}</h4>
                                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                                    {reserva.ubicacion} • {reserva.estado}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Itinerario;