import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import './styles/Alertas.css';

const Alertas = () => {
    const [misAlertas, setMisAlertas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAlertas = async () => {
            try {
                const { data, error } = await supabase
                    .from('Alertas')
                    .select('*')
                    .order('fecha', { ascending: false })
                    .limit(10); // Mostrar las más recientes
                
                if (error) throw error;
                setMisAlertas(data || []);
            } catch (error) {
                console.error("Error cargando alertas:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAlertas();
    }, []);

    const formatTime = (dateString) => {
        if (!dateString) return 'Recientemente';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{ padding: '20px' }} className="anim-fade">
            <h1 style={{ fontSize: '26px', fontWeight: '800' }}>Alertas y Notificaciones</h1>
            
            <div className="alertas-ai-toggle" style={{ marginBottom: '20px' }}>
                <div>
                    <h4 style={{ margin: 0 }}>Alertas IA personalizadas</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Recibe recomendaciones basadas en tu perfil</p>
                </div>
                <div className="alertas-switch"></div>
            </div>

            <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Recientes</h3>
            
            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                    Consultando notificaciones... ⏳
                </div>
            ) : misAlertas.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8fafc', borderRadius: '16px' }}>
                    <span style={{ fontSize: '30px' }}>📭</span>
                    <p style={{ color: '#64748b', fontWeight: 'bold' }}>No tienes notificaciones nuevas</p>
                    <p style={{ fontSize: '12px', color: '#94a3b8' }}>Te avisaremos cuando bajen los precios o haya novedades.</p>
                </div>
            ) : (
                misAlertas.map(alerta => (
                    <div key={alerta.id} className="alertas-alert-card">
                        <span style={{ fontSize: '24px' }}>
                            {alerta.tipo === 'Error' ? '⚠️' : (alerta.titulo?.toLowerCase().includes('precio') ? '📉' : '✨')}
                        </span>
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: '0 0 4px 0' }}><b>{alerta.titulo}</b></p>
                            <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#334155' }}>{alerta.descripcion}</p>
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{formatTime(alerta.fecha)}</span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default Alertas;