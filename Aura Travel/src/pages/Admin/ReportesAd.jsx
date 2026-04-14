import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useNotification } from '../../context/NotificationContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ReportesAd = () => {
    const { showNotification } = useNotification();
    const [isGenerating, setIsGenerating] = useState(false);

    // Función universal para parsear JSON a CSV y descargar
    const downloadCSV = (dataArray, filename) => {
        if (!dataArray || dataArray.length === 0) {
            showNotification("No hay datos para generar el reporte.", "warning");
            return;
        }

        const headers = Object.keys(dataArray[0]);
        const csvRows = [];

        // Encabezados
        csvRows.push(headers.join(','));

        // Filas
        for (const row of dataArray) {
            const values = headers.map(header => {
                let cellValue = row[header] === null || row[header] === undefined ? '' : row[header];
                
                // Limpiar strings con comas o saltos de línea para que no rompan el CSV
                if (typeof cellValue === 'string') {
                    cellValue = cellValue.replace(/"/g, '""');
                    if (cellValue.search(/("|,|\n)/g) >= 0) {
                        cellValue = `"${cellValue}"`;
                    }
                }
                return cellValue;
            });
            csvRows.push(values.join(','));
        }

        const csvString = csvRows.join('\n');
        const blob = new Blob(["\uFEFF" + csvString], { type: 'text/csv;charset=utf-8;' }); 
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Función universal para parsear JSON a PDF y descargar
    const downloadPDF = (dataArray, title, filename) => {
        if (!dataArray || dataArray.length === 0) {
            showNotification("No hay datos para generar el PDF.", "warning");
            return;
        }

        const doc = new jsPDF('landscape');
        
        // Estilos de Título
        doc.setFontSize(18);
        doc.setTextColor(40);
        doc.text(`Aura Travel - ${title}`, 14, 22);
        
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 30);

        const tableColumn = Object.keys(dataArray[0]);
        const tableRows = [];

        dataArray.forEach(item => {
            const rowData = [];
            tableColumn.forEach(key => {
                rowData.push(item[key] === null || item[key] === undefined ? '' : String(item[key]));
            });
            tableRows.push(rowData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 3 },
            headStyles: { fillColor: [79, 70, 229] }, // Color primario #4f46e5
        });

        doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    // Reporte 1: Estado Económico y Reservas
    const generarReporteReservas = async (format) => {
        setIsGenerating(true);
        try {
            const { data: reservas, error: errRes } = await supabase.from('Reservas').select('*');
            if (errRes) {
                console.error("Error Reservas:", errRes);
                throw errRes;
            }

            const { data: destinos, error: errDest } = await supabase.from('Destino').select('nombre,precio');
            if (errDest) {
                console.error("Error Destino:", errDest);
                throw errDest;
            }

            const precioMap = {};
            destinos.forEach(d => { precioMap[d.nombre] = parseFloat(d.precio) || 0; });

            const reporteData = reservas.map(r => {
                const precioUnidad = precioMap[r.destino] || 0;
                const totalEstimado = precioUnidad * (r.personas || 1);
                
                return {
                    ID_Trans: String(r.id).substring(0,8),
                    Usuario: r.correo_usuario.split('@')[0],
                    Destino: r.destino,
                    Estado: r.estado,
                    Pax: r.personas || 1,
                    Salida: r.fechaInicio || 'N/A',
                    Retorno: r.fechaFin || 'N/A',
                    Total: `€${totalEstimado.toFixed(2)}`
                };
            });

            if (format === 'csv') downloadCSV(reporteData, 'AuraTravel_Reporte_Financiero');
            if (format === 'pdf') downloadPDF(reporteData, 'Reporte Financiero y de Reservas', 'AuraTravel_Reporte_Financiero');
            
            showNotification(`Reporte (${format.toUpperCase()}) generado con éxito.`, "success");
        } catch (error) {
            console.error(error);
            showNotification("Fallo al contactar la base de datos.", "error");
        } finally {
            setIsGenerating(false);
        }
    };

    // Reporte 2: Catálogo de Destinos
    const generarReporteDestinos = async (format) => {
        setIsGenerating(true);
        try {
            const { data, error } = await supabase.from('Destino').select('*').order('rating', { ascending: false });
            if (error) throw error;

            const reporteData = data.map(d => ({
                Nombre: d.nombre,
                Pais: d.pais,
                Latitud: d.latitud || 'S/N',
                Longitud: d.longitud || 'S/N',
                Precio: `€${d.precio || 0}`,
                Rating: d.rating,
                Destacado: d.destacado ? 'SI' : 'NO'
            }));

            if (format === 'csv') downloadCSV(reporteData, 'AuraTravel_Catalogo');
            if (format === 'pdf') downloadPDF(reporteData, 'Catálogo Táctico de Destinos', 'AuraTravel_Catalogo');
            
            showNotification(`Catálogo exportado (${format.toUpperCase()}).`, "success");
        } catch (error) {
            showNotification("No se pudieron obtener los destinos.", "error");
        } finally {
            setIsGenerating(false);
        }
    };

    // Reporte 3: Demografía de Usuarios
    const generarReporteUsuarios = async (format) => {
        setIsGenerating(true);
        try {
            const { data, error } = await supabase.from('Usuarios').select('*');
            if (error) throw error;

            const reporteData = data.map(u => ({
                Nombre: u.nombre,
                Email: u.correo,
                Rol: u.rol || 'Cliente',
                Idioma: u.idioma || 'es',
                Moneda: u.moneda || 'EUR',
                Registro: new Date(u.created_at).toLocaleDateString()
            }));

            if (format === 'csv') downloadCSV(reporteData, 'AuraTravel_Usuarios');
            if (format === 'pdf') downloadPDF(reporteData, 'Demografía de Viajeros', 'AuraTravel_Usuarios');
            
            showNotification(`Base exportada (${format.toUpperCase()}).`, "success");
        } catch (error) {
            showNotification("Falló la obtención de usuarios.", "error");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div>
                    <h2 style={styles.title}>Motor Analítico de Reportes</h2>
                    <p style={styles.subtitle}>Extrae datos en crudo (CSV) o reportes limpios listos para imprimir (PDF).</p>
                </div>
            </header>

            <div style={styles.grid}>
                {/* Carta 1 */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div style={{ ...styles.iconBox, background: '#e0e7ff', color: '#4f46e5' }}>💰</div>
                        <h3 style={styles.cardTitle}>Impacto Financiero</h3>
                    </div>
                    <p style={styles.cardText}>
                        Calcula el total potencial económico cruzando los destinos elegidos por las personas que viajan.
                    </p>
                    <div style={styles.btnRow}>
                        <button onClick={() => generarReporteReservas('csv')} disabled={isGenerating} style={styles.btnSmCSV}>📄 CSV</button>
                        <button onClick={() => generarReporteReservas('pdf')} disabled={isGenerating} style={styles.btnSmPDF}>📑 PDF</button>
                    </div>
                </div>

                {/* Carta 2 */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div style={{ ...styles.iconBox, background: '#dcfce7', color: '#16a34a' }}>🗺️</div>
                        <h3 style={styles.cardTitle}>Rendimiento Destinos</h3>
                    </div>
                    <p style={styles.cardText}>
                        Extrae la tabla técnica de destinos totales, revelando coordenadas, tarifas y rating.
                    </p>
                    <div style={styles.btnRow}>
                        <button onClick={() => generarReporteDestinos('csv')} disabled={isGenerating} style={{...styles.btnSmCSV, background: '#16a34a'}}>📄 CSV</button>
                        <button onClick={() => generarReporteDestinos('pdf')} disabled={isGenerating} style={{...styles.btnSmPDF, color: '#16a34a', borderColor: '#16a34a'}}>📑 PDF</button>
                    </div>
                </div>

                {/* Carta 3 */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div style={{ ...styles.iconBox, background: '#f3e8ff', color: '#9333ea' }}>👥</div>
                        <h3 style={styles.cardTitle}>Demografía Viajeros</h3>
                    </div>
                    <p style={styles.cardText}>
                        Obtén la base general segmentable de tus viajeros para tus campañas de Email Marketing CRM.
                    </p>
                    <div style={styles.btnRow}>
                        <button onClick={() => generarReporteUsuarios('csv')} disabled={isGenerating} style={{...styles.btnSmCSV, background: '#9333ea'}}>📄 CSV</button>
                        <button onClick={() => generarReporteUsuarios('pdf')} disabled={isGenerating} style={{...styles.btnSmPDF, color: '#9333ea', borderColor: '#9333ea'}}>📑 PDF</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '40px', fontFamily: '"Outfit", sans-serif', color: '#0f172a' },
    header: { marginBottom: '40px' },
    title: { fontSize: '28px', fontWeight: '800', margin: 0 },
    subtitle: { color: '#64748b', marginTop: '6px', fontSize: '15px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' },
    card: { 
        background: '#fff', borderRadius: '24px', padding: '30px',
        border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.02)',
        display: 'flex', flexDirection: 'column'
    },
    cardHeader: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' },
    iconBox: { width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' },
    cardTitle: { margin: 0, fontSize: '18px', fontWeight: '700' },
    cardText: { margin: '0 0 24px 0', fontSize: '14px', color: '#64748b', flex: 1, lineHeight: '1.6' },
    btnRow: { display: 'flex', gap: '10px' },
    btnSmCSV: {
        flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
        background: '#4f46e5', color: '#fff', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    btnSmPDF: {
        flex: 1, padding: '10px', borderRadius: '10px', border: '2px solid #4f46e5',
        background: 'transparent', color: '#4f46e5', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
    }
};

export default ReportesAd;
