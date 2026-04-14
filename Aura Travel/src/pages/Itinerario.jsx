import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import { supabase } from '../services/supabaseClient';
import ConfirmModal from '../components/ConfirmModal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
    const [expandedPlanId, setExpandedPlanId] = useState(null);
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

    const toggleExpand = (id) => {
        if (expandedPlanId === id) setExpandedPlanId(null);
        else setExpandedPlanId(id);
    };

    const calcularDias = (inicio, fin) => {
        if (!inicio || !fin) return 3; // Estimado por defecto
        const d1 = new Date(inicio);
        const d2 = new Date(fin);
        const diff = d2 - d1;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
        return days > 0 ? days : 1;
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return 'Por Definir';
        return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    };

    const generateClientReport = () => {
        if (!misReservas || misReservas.length === 0) {
            showNotification("Aún no tienes aventuras para exportar.", "warning");
            return;
        }

        const csvRows = [];
        // Header
        csvRows.push("Ticket ID,Destino,Ubicacion,Estado,Personas,Fecha Inicio,Fecha Regreso");

        misReservas.forEach(r => {
            const row = [
                r.id,
                `"${r.destino}"`,
                `"${r.ubicacion}"`,
                r.estado,
                r.personas || 1,
                r.fechaInicio || 'Pendiente',
                r.fechaFin || 'Pendiente'
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob(["\uFEFF" + csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `AuraTravel_Mis_Aventuras_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification("¡Diario exportado exitosamente!", "success");
    };

    const generateClientReportPDF = () => {
        if (!misReservas || misReservas.length === 0) {
            showNotification("Aún no tienes aventuras para exportar.", "warning");
            return;
        }

        const doc = new jsPDF('landscape');
        
        doc.setFontSize(18);
        doc.setTextColor(40);
        doc.text("Aura Travel - Libro de Viajes", 14, 22);
        
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Pasajero: ${user?.correo}`, 14, 30);
        doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, 14, 38);

        const tableColumn = ["Ticket ID", "Destino", "Zona", "Estado", "Aventureros", "Salida", "Regreso"];
        const tableRows = [];

        misReservas.forEach(r => {
            const ticketRow = [
                String(r.id).substring(0,8),
                r.destino,
                r.ubicacion,
                r.estado,
                r.personas || 1,
                r.fechaInicio ? new Date(r.fechaInicio).toLocaleDateString() : 'Pendiente',
                r.fechaFin ? new Date(r.fechaFin).toLocaleDateString() : 'Pendiente'
            ];
            tableRows.push(ticketRow);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 4 },
            headStyles: { fillColor: [99, 102, 241] } // Color primario de Aura (Indigo)
        });

        doc.save(`AuraTravel_Mis_Aventuras_${new Date().toISOString().split('T')[0]}.pdf`);
        showNotification("¡Diario exportado a PDF!", "success");
    };

    const renderDiaLista = (plan) => {
        const diasTotales = calcularDias(plan.fechaInicio, plan.fechaFin);
        const dias = [];
        
        for (let i = 1; i <= diasTotales; i++) {
            let titulo = "Exploración Libre";
            let desc = "Día para conocer los alrededores a tu ritmo.";
            let icon = "🗺️";

            if (i === 1) {
                titulo = "Llegada al Destino"; desc = "Check-in y aclimatación en " + plan.destino; icon = "🛬";
            } else if (i === diasTotales) {
                titulo = "Regreso a Casa"; desc = "Preparativos finales y vuelta."; icon = "🛫";
            } else if (i === 2) {
                titulo = "Tour Principal"; desc = "Recorrido por los puntos más icónicos."; icon = "📸";
            }

            dias.push(
                <div key={i} className="day-timeline">
                    <div className="day-timeline-node"></div>
                    <h4 className="day-header">Día {i}</h4>
                    <div className="day-activity-card">
                        <div className="day-activity-icon">{icon}</div>
                        <div className="day-activity-info">
                            <h5>{titulo}</h5>
                            <p>{desc}</p>
                        </div>
                    </div>
                </div>
            );
        }
        return dias;
    };

    const renderTicket = (item) => {
        const isExpanded = expandedPlanId === item.id;
        return (
            <div key={item.id} className="ticket-wrapper">
                <div className="ticket-main">
                    <div className="ticket-header">
                        <h3 className="ticket-dest-title">{item.destino}</h3>
                        <span className={`ticket-status ${item.estado.toLowerCase().replace(/\s/g, '')}`}>{item.estado}</span>
                    </div>
                    
                    <div className="ticket-body">
                        <div className="ticket-info-block">
                            <span className="ticket-info-label">País / Zona</span>
                            <span className="ticket-info-value">{item.ubicacion}</span>
                        </div>
                        <div className="ticket-info-block">
                            <span className="ticket-info-label">Fechas</span>
                            <span className="ticket-info-value">
                                {formatearFecha(item.fechaInicio)} - {formatearFecha(item.fechaFin)}
                            </span>
                        </div>
                        <div className="ticket-info-block">
                            <span className="ticket-info-label">Aventureros</span>
                            <span className="ticket-info-value">{item.personas} Pasajero(s)</span>
                        </div>
                    </div>

                    <div className="ticket-actions">
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => toggleExpand(item.id)} className="ticket-expand-btn">
                                {isExpanded ? 'Ocultar Día a Día' : 'Ver Día a Día'}
                            </button>
                            {item.estado === 'Plan Personalizado' && (
                                <button onClick={() => openEditModal(item)} className="ticket-expand-btn" style={{ background: 'transparent' }} title="Editar">✏️</button>
                            )}
                        </div>
                        <div>
                            {item.estado === 'Pendiente' && (
                                <button onClick={() => handleCancelarReserva(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#ef4444', fontWeight: 'bold', marginRight: '10px' }} title="Cancelar orden">Cancelar</button>
                            )}
                            <button onClick={() => handleEliminarPlan(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }} title="Eliminar">🗑️</button>
                        </div>
                    </div>
                </div>
                
                {isExpanded && (
                    <div className="itinerary-details-panel">
                        <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px' }}>Itinerario sugerido para {calcularDias(item.fechaInicio, item.fechaFin)} días en {item.destino}:</p>
                        {renderDiaLista(item)}
                    </div>
                )}
            </div>
        );
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
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={generateClientReport} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>📄 CSV</button>
                        <button onClick={generateClientReportPDF} style={{ background: '#f43f5e', color: '#fff', border: '1px solid #e11d48', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>📑 PDF</button>
                        <button onClick={handleShare} style={{ background: '#fff', color: '#6366f1', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🔗 Compartir</button>
                    </div>
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
                            planesFuturos.map(plan => renderTicket(plan))
                        )}
                    </div>
                )}

                {activeTab === 'historial' && (
                    <div className="anim-fade">
                        {historialViajes.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b', background: '#f8fafc', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
                                <div style={{ fontSize: '40px', marginBottom: '10px' }}>🧳</div>
                                <h3 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>Tu historial está vacío</h3>
                                <p style={{ margin: 0, fontSize: '14px' }}>Aquí aparecerán tus reservas confirmadas con su detalle de itinerario.</p>
                            </div>
                        ) : (
                            historialViajes.map(reserva => renderTicket(reserva))
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