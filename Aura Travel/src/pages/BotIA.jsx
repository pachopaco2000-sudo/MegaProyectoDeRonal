import React, { useState, useEffect, useRef, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { GoogleGenerativeAI } from '@google/generative-ai';

const botCss = `
  @keyframes popInMessage {
    0% { opacity: 0; transform: scale(0.8) translateY(15px) perspective(500px) rotateX(-20deg); }
    70% { transform: scale(1.02) translateY(-2px) perspective(500px) rotateX(5deg); }
    100% { opacity: 1; transform: scale(1) translateY(0) perspective(500px) rotateX(0deg); }
  }
  .chat-window {
      transform-origin: bottom right;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: absolute;
      bottom: 75px; right: 0;
  }
  .chat-window.open {
      opacity: 1; transform: scale(1) translateY(0); pointer-events: auto;
  }
  .chat-window.closed {
      opacity: 0; transform: scale(0) translateY(100px); pointer-events: none;
  }
  .chat-fab {
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: absolute;
      bottom: 0; right: 0;
  }
  .chat-fab.hidden {
      opacity: 0; transform: scale(0) rotate(-180deg); pointer-events: none;
  }
  .msg-tooltip {
    position: absolute;
    bottom: 75px;
    right: 0;
    background: white;
    color: #0f172a;
    padding: 10px 16px;
    border-radius: 18px;
    border-bottom-right-radius: 4px;
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    animation: tooltipFade 0.5s ease-out forwards;
    z-index: 100;
    border: 1px solid rgba(0,0,0,0.05);
  }
  @keyframes tooltipFade {
    from { opacity: 0; transform: translateY(10px) scale(0.9); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes tooltipOut {
    to { opacity: 0; transform: translateY(5px) scale(0.95); }
  }
  .msg-tooltip.dying {
    animation: tooltipOut 0.4s ease-in forwards;
  }
  .msg-anim {
    animation: popInMessage 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }
`;

const BotIA = () => {
    const { user, profile } = useContext(UserContext);
    const [isOpen, setIsOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(true);
    const [isDying, setIsDying] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: `¡Hola${profile?.nombre ? ' ' + profile.nombre : ''}! Soy Aura, tu asistente de viajes inteligente. ¿A qué rincón del mundo te gustaría escapar hoy?` }
    ]);
    const [inputStr, setInputStr] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [conocimiento, setConocimiento] = useState([]);
    const messagesEndRef = useRef(null);
    const chatRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Manejo del Tooltip inicial
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsDying(true);
            setTimeout(() => setShowTooltip(false), 400); // Dar tiempo a la animación de salida
        }, 4000);
        return () => clearTimeout(timer);
    }, []);

    // Carga de la "Base de Conocimiento Local"
    useEffect(() => {
        import('../services/supabaseClient').then(({ supabase }) => {
            supabase.from('Destino').select('*').then(({ data }) => {
                if (data) setConocimiento(data);
            });
        });
        
        // Listener interactivo para control remoto desde otras pantallas
        const handleOpenModal = () => setIsOpen(true);
        window.addEventListener('open-aura-ai', handleOpenModal);
        
        return () => window.removeEventListener('open-aura-ai', handleOpenModal);
    }, []);

    const initChat = async () => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey || apiKey === 'ACA_VA_TU_CLAVE_DE_GEMINI') return false;

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const promptContext = `Eres Aura AI, el asistente experto planificador de viajes de 'Aura Travel'. 
REGLAS:
1. Recomienda viajes de esta base de datos real: ${JSON.stringify(conocimiento)}.
2. Si el usuario no ha iniciado sesión (Invitado), anímalo a crear una cuenta en la sección "Registrarse" del Home para guardar sus itinerarios.
3. El ID de Usuario actual es: ${profile?.nombre || user?.email || 'Aventurero Invitado'} | Presupuesto: ${profile?.presupuesto || 'No definido (Sugiere opciones variadas)'}.`;

            chatRef.current = model.startChat({
                history: [
                    { role: "user", parts: [{ text: "[SISTEMA INTERNO]: " + promptContext + "\n\nHola, despierta, Aura." }] },
                    { role: "model", parts: [{ text: "¡Hola! Mis sistemas están listos. He analizado el contexto. Estoy lista para conversar sobre cualquier cosa y ayudarte a navegar por Aura Travel." }] },
                ],
            });
            return true;
        } catch (e) {
            console.error("Error iniciando Gemini:", e);
            return false;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputStr.trim()) return;

        const newMsg = { sender: 'user', text: inputStr };
        setMessages(prev => [...prev, newMsg]);
        setInputStr('');
        setIsTyping(true);

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey || apiKey === 'ACA_VA_TU_CLAVE_DE_GEMINI') {
            setTimeout(() => {
                setMessages(prev => [...prev, { sender: 'bot', text: '¡Ups! Mi red neuronal está apagada temporalmente. Por favor configura tu variable `VITE_GEMINI_API_KEY` en tu archivo .env.local para poder conversar con mi cerebro real.' }]);
                setIsTyping(false);
            }, 1000);
            return;
        }

        try {
            // Lazy load para asegurar instancia de Chat inclusive si la base de datos de destinos falla en cargar
            if (!chatRef.current) {
                const initialized = await initChat();
                if (!initialized) {
                    setMessages(prev => [...prev, { sender: 'bot', text: 'Error fatal conectando a la API neuronal (Revisa la consola o asegúrate que tu LLAVE sea válida).' }]);
                    setIsTyping(false);
                    return;
                }
            }

            if (chatRef.current) {
                // Send real LLM Message
                const result = await chatRef.current.sendMessage(newMsg.text);
                const rawText = result.response.text();
                // Limpiamos la sintaxis de markdown (negritas, cursivas, listas con asterisco) que trae Gemini
                const cleanText = rawText.replace(/[*#]/g, '');
                
                setMessages(prev => [...prev, { sender: 'bot', text: cleanText }]);
            }
        } catch (error) {
            console.error("Detalle Error Gemini:", error);
            const msgError = error?.message || 'Error Desconocido';
            setMessages(prev => [...prev, { sender: 'bot', text: `Algo anduvo mal en mis sinapsis. Verifica tu API Key de Gemini. (Error técnico: ${msgError})` }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, width: '340px', height: '560px', pointerEvents: 'none' }}>
            <style>{botCss}</style>

            {/* BOTÓN FLOTANTE */}
            <div className={`chat-fab ${isOpen ? 'hidden' : ''}`} style={{ position: 'absolute', bottom: 0, right: 0 }}>
                {showTooltip && (
                    <div className={`msg-tooltip ${isDying ? 'dying' : ''}`}>
                        ¡Hola! ¿Tienes alguna duda? ✨
                    </div>
                )}
                <button style={{...styles.fab, pointerEvents: isOpen ? 'none' : 'auto'}} onClick={() => setIsOpen(true)}>
                    <span>✨</span>
                </button>
            </div>

            {/* VENTANA DEL CHAT */}
            <div className={`chat-window ${isOpen ? 'open' : 'closed'}`} style={{...styles.chatWindow, pointerEvents: isOpen ? 'auto' : 'none'}}>
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
                        <div key={idx} className="msg-anim" style={{ 
                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            backgroundColor: msg.sender === 'user' ? '#6366f1' : '#f1f5f9',
                            color: msg.sender === 'user' ? 'white' : '#334155',
                            padding: '10px 14px',
                            borderRadius: '16px',
                            borderBottomRightRadius: msg.sender === 'user' ? '4px' : '16px',
                            borderBottomLeftRadius: msg.sender === 'bot' ? '4px' : '16px',
                            maxWidth: '85%',
                            fontSize: '14px',
                            marginBottom: '10px',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
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
        </div>
    );
};

const styles = {
    fab: {
        width: '60px',
        height: '60px',
        borderRadius: '30px',
        background: 'linear-gradient(135deg, var(--aura-primary), var(--aura-accent))',
        color: 'white',
        border: '2px solid rgba(255,255,255,0.5)',
        boxShadow: '0 8px 25px rgba(99, 102, 241, 0.5)',
        cursor: 'pointer',
        fontSize: '28px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: 'pulse 3s infinite'
    },
    chatWindow: {
        width: '340px',
        height: '480px',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.8)'
    },
    header: {
        background: 'linear-gradient(135deg, var(--aura-primary), #a78bfa)',
        color: 'white',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    closeBtn: {
        background: 'rgba(255,255,255,0.2)',
        border: 'none',
        color: 'white',
        width: '28px',
        height: '28px',
        borderRadius: '14px',
        fontSize: '14px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'var(--transition-smooth)'
    },
    messageList: {
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
    },
    inputArea: {
        padding: '16px',
        borderTop: '1px solid rgba(0,0,0,0.05)',
        display: 'flex',
        gap: '10px',
        background: 'rgba(255,255,255,0.5)'
    },
    input: {
        flex: 1,
        padding: '12px 16px',
        borderRadius: '16px',
        border: '1px solid rgba(0,0,0,0.1)',
        outline: 'none',
        fontSize: '14px',
        background: 'white'
    },
    sendBtn: {
        background: 'var(--aura-primary)',
        color: 'white',
        border: 'none',
        borderRadius: '16px',
        width: '45px',
        height: '45px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '18px',
        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
        transition: 'var(--transition-smooth)'
    }
};

export default BotIA;
