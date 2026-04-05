import React, { useState, useEffect, useRef, useContext } from 'react';
import { UserContext } from '../context/UserContext';

const BotIA = () => {
    const { user, profile } = useContext(UserContext);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: '¡Hola! Soy Aura, tu IA de viajes local. ¿Qué destino tienes en mente?' }
    ]);
    const [inputStr, setInputStr] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!inputStr.trim()) return;

        const newMsg = { sender: 'user', text: inputStr };
        setMessages(prev => [...prev, newMsg]);
        setInputStr('');
        setIsTyping(true);

        const query = newMsg.text.toLowerCase();
        
        // Simulación de IA Local con Motor Lógico Lexical Basado en Preferencias (RF-04, RF-21)
        setTimeout(() => {
            let reply = "Interesante. Puedo buscar opciones perfectas para ti.";
            
            // Lógica Heurística
            if (query.includes('playa') || query.includes('sol') || query.includes('mar')) {
                reply = `Ya que mencionas la playa, y tu presupuesto ajustado es ${profile?.presupuesto || 'Estándar'}, te recomiendo mirar Santorini o las costas de Colombia en el Explorador.`;
            } else if (query.includes('frio') || query.includes('nieve') || query.includes('montaña')) {
                reply = `Si buscas climas fríos, los Alpes Suizos tienen excelentes actividades de aventura en nuestra plataforma.`;
            } else if (query.includes('comida') || query.includes('restaurante') || query.includes('comer')) {
                reply = `Para perfiles gastronómicos, Kyoto tiene 3 restaurantes 5 estrellas registrados en el destino.`;
            } else if (query.includes('resumen') || query.includes('itinerario')) {
                reply = `Generando resumen del viaje: Tu itinerario se basa en un perfil de aventura. Se recomienda llevar ropa ligera y notificar al hotel si llegas de madrugada.`;
            }

            setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
            setIsTyping(false);
        }, 1500 + Math.random() * 1000); // Simulando delay de cómputo de tensores locales
    };

    return (
        <div style={styles.container(isOpen)}>
            {!isOpen ? (
                <button style={styles.fab} onClick={() => setIsOpen(true)}>
                    <span>✨</span>
                </button>
            ) : (
                <div style={styles.chatWindow}>
                    <div style={styles.header}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px' }}>✨</span>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 'bold' }}>Aura AI</span>
                                <span style={{ fontSize: '10px', opacity: 0.8 }}>(Modelo Local Conectado)</span>
                            </div>
                        </div>
                        <button style={styles.closeBtn} onClick={() => setIsOpen(false)}>✕</button>
                    </div>
                    
                    <div style={styles.messageList}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{ 
                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                backgroundColor: msg.sender === 'user' ? '#6366f1' : '#f1f5f9',
                                color: msg.sender === 'user' ? 'white' : '#334155',
                                padding: '10px 14px',
                                borderRadius: '16px',
                                borderBottomRightRadius: msg.sender === 'user' ? '4px' : '16px',
                                borderBottomLeftRadius: msg.sender === 'bot' ? '4px' : '16px',
                                maxWidth: '85%',
                                fontSize: '14px',
                                marginBottom: '10px'
                            }}>
                                {msg.text}
                            </div>
                        ))}
                        {isTyping && (
                            <div style={{ alignSelf: 'flex-start', backgroundColor: '#f1f5f9', padding: '10px 14px', borderRadius: '16px', color: '#94a3b8', fontSize: '12px' }}>
                                Generando recomendación...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div style={styles.inputArea}>
                        <input 
                            type="text" 
                            style={styles.input} 
                            placeholder="Háblame de tu viaje ideal..." 
                            value={inputStr}
                            onChange={(e) => setInputStr(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button style={styles.sendBtn} onClick={handleSend}>➤</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: (isOpen) => ({
        position: 'fixed',
        bottom: '80px',
        right: '20px',
        zIndex: 9999,
    }),
    fab: {
        width: '56px',
        height: '56px',
        borderRadius: '28px',
        backgroundColor: '#6366f1',
        color: 'white',
        border: 'none',
        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
        cursor: 'pointer',
        fontSize: '24px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    chatWindow: {
        width: '320px',
        height: '450px',
        backgroundColor: '#fff',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #e2e8f0'
    },
    header: {
        backgroundColor: '#6366f1',
        color: 'white',
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    closeBtn: {
        background: 'transparent',
        border: 'none',
        color: 'white',
        fontSize: '18px',
        cursor: 'pointer'
    },
    messageList: {
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
    },
    inputArea: {
        padding: '12px',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        gap: '8px'
    },
    input: {
        flex: 1,
        padding: '12px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        outline: 'none',
        fontSize: '14px'
    },
    sendBtn: {
        backgroundColor: '#6366f1',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        width: '45px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '18px'
    }
};

export default BotIA;
