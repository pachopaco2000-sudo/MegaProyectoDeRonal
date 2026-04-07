import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import { supabase } from '../services/supabaseClient';
import ConfirmModal from '../components/ConfirmModal';
import './styles/Itinerario.css';

const Itinerario = () => {
    const { user } = useContext(UserContext);
    const { showNotification } = useNotification();
    const [misReservas, setMisReservas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Nuevos estados para el builder
    const [activeTab, setActiveTab] = useState('planes'); // 'historial' | 'planes'
    const [isBuildModalOpen, setIsBuildModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingPlanId, setEditingPlanId] = useState(null);
    const [newPlan, setNewPlan] = useState({
        destino: '',
        ubicacion: '',
        fechaInicio: '',
        fechaFin: '',
        personas: 1
    });

    // Estado para Aura Confirm
    const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    const fetchMisReservas = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('Reservas')
                .select('*')
                .eq('correo_usuario', user.correo)
                .order('id', { ascending: false });
            
            if (error) throw error;
            setMisReservas(data || []);
        } catch (error) {
            console.error("Error cargando itinerarios:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMisReservas();

        // RF-20: Colaboración en Grupo vía WebSockets (Suscripción local y en tiempo real)
        const reservasSubscription = supabase
            .channel('custom-all-channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'Reservas', filter: `correo_usuario=eq.${user.correo}` },
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

    const handleCrearPlan = async () => {
        if (!newPlan.destino || !newPlan.ubicacion) {
            showNotification("Llena el nombre y ubicación para tu viaje soñado.", "error");
            return;
        }
        setIsSubmitting(true);
        try {
            // CHECK LOGICO DE DUPLICADOS
            const { data: duplicateCheck, error: dupError } = await supabase
                .from('Reservas')
                .select('id')
                .eq('correo_usuario', user.correo)
                .eq('destino', newPlan.destino);
            
            if (dupError) throw dupError;
            
            // Evaluamos si ya existe el plan, previendo que no estamos auto-editándolo
            if (duplicateCheck && duplicateCheck.length > 0) {
                const isSelf = duplicateCheck.some(p => p.id === editingPlanId);
                if (!isSelf || (!editingPlanId && duplicateCheck.length > 0)) {
                    showNotification("¡Ya tienes un itinerario con ese mismo nombre!", "error");
                    setIsSubmitting(false);
                    return;
                }
            }

            const planPayload = {
                destino: newPlan.destino,
                ubicacion: newPlan.ubicacion,
                fechaInicio: newPlan.fechaInicio || null,
                fechaFin: newPlan.fechaFin || null,
                personas: parseInt(newPlan.personas) || 1,
                estado: 'Plan Personalizado',
                correo_usuario: user.correo,
                imagen: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800' // Imagen inspiracional genérica
            };

            if (editingPlanId) {
                const { error } = await supabase.from('Reservas').update(planPayload).eq('id', editingPlanId);
                if (error) throw error;
                showNotification("¡Tu itinerario ha sido editado con éxito! ✏️", "success");
            } else {
                const { error } = await supabase.from('Reservas').insert([planPayload]);
                if (error) throw error;
                showNotification("¡Tu itinerario ha sido creado con éxito! ✨", "success");
            }

            setIsBuildModalOpen(false);
            setEditingPlanId(null);
            setNewPlan({ destino: '', ubicacion: '', fechaInicio: '', fechaFin: '', personas: 1 });
            
            // Forzar actualización visual si WebSockets falla
            fetchMisReservas();
        } catch (error) {
            console.error("Error guardando plan:", error);
            showNotification("Ocurrió un error guardando tu itinerario.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEliminarPlan = (id) => {
        setConfirmConfig({
            isOpen: true,
            title: "¿Eliminar viaje?",
            message: "Esta acción borrará permanentemente este plan de tu itinerario. No podrás recuperarlo.",
            confirmText: "Eliminar",
            onConfirm: async () => {
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                try {
                    const { error } = await supabase.from('Reservas').delete().eq('id', id);
                    if (error) throw error;
                    showNotification("Itinerario eliminado exitosamente. 🗑️", "success");
                    fetchMisReservas();
                } catch (error) {
                    console.error("Error eliminando plan:", error);
                    showNotification("Error al eliminar el itinerario.", "error");
                }
            }
        });
    };

    const handleCancelarReserva = (id) => {
        setConfirmConfig({
            isOpen: true,
            title: "¿Cancelar reservación?",
            message: "Se enviará una solicitud de cancelación al equipo de Aura Travel. El estado cambiará a 'Cancelada'.",
            confirmText: "Sí, Cancelar",
            type: "danger",
            onConfirm: async () => {
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                try {
                    const { error } = await supabase.from('Reservas').update({ estado: 'Cancelada' }).eq('id', id);
                    if (error) throw error;
                    showNotification("Reserva cancelada exitosamente.", "success");
                    fetchMisReservas();
                } catch (error) {
                    console.error("Error cancelando reserva:", error);
                    showNotification("Error al cancelar la reserva.", "error");
                }
            }
        });
    };

    const openEditModal = (plan) => {
        setEditingPlanId(plan.id);
        setNewPlan({
            destino: plan.destino,
            ubicacion: plan.ubicacion,
            fechaInicio: plan.fechaInicio || '',
            fechaFin: plan.fechaFin || '',
            personas: plan.personas || 1
        });
        setIsBuildModalOpen(true);
    };

    const historialViajes = misReservas.filter(r => r.estado !== 'Plan Personalizado');
    const planesFuturos = misReservas.filter(r => r.estado === 'Plan Personalizado');

    if (isLoading) {
        return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Cargando tu diario de viaje... 🗺️</div>;
    }

    const handleShare = () => {
        // RF-19: Generación de Deep Links para compartir itinerarios
        const deepLink = `${window.location.origin}/destinos?share_itinerary=${btoa(user.correo)}`;
        navigator.clipboard.writeText(deepLink);
        showNotification("¡Enlace dinámico copiado! Compártelo con tu grupo.", "success");
    };

    return (
        <div className="anim-fade">
            <ConfirmModal 
                isOpen={confirmConfig.isOpen}
                title={confirmConfig.title}
                message={confirmConfig.message}
                confirmText={confirmConfig.confirmText}
                type={confirmConfig.type || 'danger'}
                onConfirm={confirmConfig.onConfirm}
                onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
            />
            <div className="itinerario-banner">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ margin: 0, fontSize: '24px' }}>Mis Aventuras Aura</h1>
                    <button onClick={handleShare} style={{ background: '#fff', color: '#6366f1', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🔗 Compartir</button>
                </div>
            </div>
            
            <div style={{ padding: '20px' }}>
                {/* TABS DE SECCIÓN */}
                <div className="itinerario-tab-headers">
                    <div className={`itinerario-tab-head ${activeTab === 'planes' ? 'active' : ''}`} onClick={() => setActiveTab('planes')}>
                        Planes e Itinerarios ({planesFuturos.length})
                    </div>
                    <div className={`itinerario-tab-head ${activeTab === 'historial' ? 'active' : ''}`} onClick={() => setActiveTab('historial')}>
                        Historial de Compras ({historialViajes.length})
                    </div>
                </div>

                {activeTab === 'planes' && (
                    <div className="anim-fade">
                        {planesFuturos.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                                Aún no has planeado ningún escape manual.
                            </div>
                        ) : (
                            <div className="itinerario-timeline">
                                {planesFuturos.map((plan, index) => (
                                    <div key={plan.id} className="itinerario-day" style={{ marginBottom: '20px' }}>
                                        <div className="itinerario-dot" style={{ backgroundColor: '#a855f7' }}>📍</div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 4px 0' }}>{plan.destino}</h4>
                                            <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>📌 {plan.ubicacion} • 👥 {plan.personas} Aventureros</p>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#a855f7', background: '#f3e8ff', padding: '4px 8px', borderRadius: '8px' }}>
                                                Plan Guardado
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button onClick={() => openEditModal(plan)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }} title="Editar">✏️</button>
                                                <button onClick={() => handleEliminarPlan(plan.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }} title="Eliminar">🗑️</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'historial' && (
                    <div className="anim-fade">
                        {historialViajes.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b', background: '#f8fafc', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
                                <div style={{ fontSize: '40px', marginBottom: '10px' }}>🧳</div>
                                <h3 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>Tu historial está vacío</h3>
                                <p style={{ margin: 0, fontSize: '14px' }}>Aquí aparecerán tus reservas pagadas una vez que explores destinos y confirmes una reservación comercial.</p>
                            </div>
                        ) : (
                            <div className="itinerario-timeline">
                                {historialViajes.map((reserva, index) => (
                                    <div key={reserva.id} className="itinerario-day" style={{ marginBottom: '20px' }}>
                                        <div className="itinerario-dot" style={{ backgroundColor: '#6366f1' }}>{index + 1}</div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 4px 0' }}>{reserva.destino}</h4>
                                            <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                                                📌 {reserva.ubicacion} {reserva.fechaInicio ? `• 📅 ${reserva.fechaInicio}` : ''}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                            <div style={{
                                                padding: '4px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold',
                                                backgroundColor: reserva.estado === 'Confirmada' ? '#2dd4bf22' : (reserva.estado === 'Cancelada' ? '#fee2e2' : '#fbbf2422'),
                                                color: reserva.estado === 'Confirmada' ? '#0d9488' : (reserva.estado === 'Cancelada' ? '#ef4444' : '#b45309')
                                            }}>
                                                {reserva.estado}
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                {reserva.estado === 'Pendiente' && (
                                                    <button onClick={() => handleCancelarReserva(reserva.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#ef4444', textDecoration: 'underline', fontWeight: 'bold' }} title="Cancelar orden">Cancelar</button>
                                                )}
                                                <button onClick={() => handleEliminarPlan(reserva.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }} title="Eliminar del historial">🗑️</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* FLOATING ACTION BUTTON */}
            <div className="itinerario-fab" onClick={() => {
                setEditingPlanId(null);
                setNewPlan({ destino: '', ubicacion: '', fechaInicio: '', fechaFin: '', personas: 1 });
                setIsBuildModalOpen(true);
            }} title="Crear Viaje Nuevo">
                +
            </div>

            {/* BUILDER MODAL */}
            {isBuildModalOpen && (
                <div className="itinerario-modal-overlay">
                    <div className="itinerario-modal">
                        <button style={{position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center'}} onClick={() => setIsBuildModalOpen(false)}>✕</button>
                        <h2 className="itinerario-modal-title">{editingPlanId ? 'Edita tu Itinerario' : 'Crea tu Aventura'}</h2>
                        
                        <div className="itinerario-form-group">
                            <label className="itinerario-label">¿A dónde quieres ir?</label>
                            <input type="text" className="itinerario-input" placeholder="Ej. Mochileo por Asia" value={newPlan.destino} onChange={e => setNewPlan({...newPlan, destino: e.target.value})} />
                        </div>
                        <div className="itinerario-form-group">
                            <label className="itinerario-label">Ubicación / País</label>
                            <input type="text" className="itinerario-input" placeholder="Ej. Tailandia y Vietnam" value={newPlan.ubicacion} onChange={e => setNewPlan({...newPlan, ubicacion: e.target.value})} />
                        </div>
                        
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div className="itinerario-form-group" style={{ flex: 1 }}>
                                <label className="itinerario-label">Desde</label>
                                <input type="date" className="itinerario-input" value={newPlan.fechaInicio} onChange={e => setNewPlan({...newPlan, fechaInicio: e.target.value})} />
                            </div>
                            <div className="itinerario-form-group" style={{ flex: 1 }}>
                                <label className="itinerario-label">Hasta</label>
                                <input type="date" className="itinerario-input" value={newPlan.fechaFin} onChange={e => setNewPlan({...newPlan, fechaFin: e.target.value})} min={newPlan.fechaInicio} />
                            </div>
                        </div>

                        <div className="itinerario-form-group">
                            <label className="itinerario-label">¿Con cuántos irás?</label>
                            <input type="number" min="1" className="itinerario-input" value={newPlan.personas} onChange={e => setNewPlan({...newPlan, personas: e.target.value})} />
                        </div>

                        <button className="itinerario-btn-submit" onClick={handleCrearPlan} disabled={isSubmitting}>
                            {isSubmitting ? 'Planeando...' : 'Guardar Plano Mágico'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Itinerario;