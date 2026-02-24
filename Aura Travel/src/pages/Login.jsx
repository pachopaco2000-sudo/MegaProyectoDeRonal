import React, { useState } from 'react';
import Destinos from './Destinos'; // Importamos la nueva pantalla

const Login = () => {
    const [mode, setMode] = useState('login');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Estados para validación
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    // Validación simple: campos no vacíos y email con @
    const isFormValid = mode === 'login'
        ? email.includes('@') && password.length > 5
        : name.length > 2 && email.includes('@') && password.length > 5;

    const handleSubmit = () => {
        if (!isFormValid) {
            alert("Por favor rellena los campos correctamente (Contraseña min. 6 caracteres)");
            return;
        }

        if (mode === 'register') {
            alert("¡Cuenta creada con éxito! Ahora puedes iniciar sesión.");
            setMode('login'); // Te manda a inicio de sesión tras registrarte
        } else if (mode === 'login') {
            setIsLoggedIn(true); // Te manda a Destinos
        } else {
            alert("Instrucciones enviadas al correo");
            setMode('login');
        }
    };

    if (isLoggedIn) return <Destinos />;

    return (
        <div style={styles.authContainer}>
            <style>{`
                @keyframes slideRight { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                input {
                    all: unset; display: block; width: 100%; padding: 16px; border-radius: 16px;
                    background-color: #f8fafc; border: 1px solid #e2e8f0; box-sizing: border-box;
                    font-size: 15px; transition: all 0.3s ease; margin-bottom: 12px;
                }
                input:focus { border-color: #6366f1 !important; background-color: #fff !important; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
                .anim-right { animation: slideRight 0.8s ease-out forwards; }
                .anim-up { animation: slideUp 0.6s ease-out forwards; }
                .btn-disabled { opacity: 0.5; cursor: not-allowed !important; filter: grayscale(1); }
            `}</style>

            <div style={styles.infoSide} className="anim-right">
                <div style={styles.badge}>✨ Aura Travel</div>
                <h1 style={styles.heroTitle}>
                    {mode === 'login' ? 'Bienvenido a' : mode === 'register' ? 'Únete a' : 'Recupera tu'}
                    <br />
                    <span style={{ color: '#6366f1' }}>Aura Travel</span>
                </h1>
                <p style={styles.heroSub}>La plataforma más avanzada para planificar tus viajes con inteligencia artificial.</p>
                <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800" alt="Travel" style={styles.heroImg} />
            </div>

            <div style={styles.formSide}>
                <div style={styles.card} className="anim-up">
                    <h2 style={styles.cardTitle}>{mode === 'login' ? 'Iniciar Sesión' : mode === 'register' ? 'Crear Cuenta' : 'Recuperar'}</h2>

                    <div style={styles.tabs}>
                        <button onClick={() => setMode('login')} style={{ ...styles.tab, color: mode === 'login' ? '#6366f1' : '#94a3b8', borderBottom: mode === 'login' ? '3px solid #6366f1' : '3px solid transparent' }}>Ingresar</button>
                        <button onClick={() => setMode('register')} style={{ ...styles.tab, color: mode === 'register' ? '#6366f1' : '#94a3b8', borderBottom: mode === 'register' ? '3px solid #6366f1' : '3px solid transparent' }}>Registro</button>
                    </div>

                    <div>
                        {mode === 'register' && <input type="text" placeholder="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} />}
                        <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} />
                        {mode !== 'recover' && <input type="password" placeholder="Contraseña (min. 6)" value={password} onChange={(e) => setPassword(e.target.value)} />}
                    </div>

                    <button
                        onClick={handleSubmit}
                        style={styles.mainBtn}
                        className={!isFormValid ? 'btn-disabled' : ''}
                    >
                        {mode === 'login' ? 'Entrar ahora' : mode === 'register' ? 'Crear cuenta' : 'Enviar instrucciones'}
                    </button>

                    <div style={styles.divider}>
                        <div style={styles.line}></div>
                        <span style={{ padding: '0 10px', fontSize: '12px', color: '#94a3b8' }}>o continúa con</span>
                        <div style={styles.line}></div>
                    </div>
                    <button style={styles.googleBtn}>Google</button>
                </div>
            </div>
        </div>
    );
};

// ... (Los estilos se mantienen igual que tu versión anterior)
const styles = {
    authContainer: { height: '100vh', display: 'flex', backgroundColor: '#fcfcfd', fontFamily: 'system-ui, sans-serif' },
    infoSide: { flex: 1.2, padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: '#fff', borderRight: '1px solid #f1f5f9' },
    formSide: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: '#f8fafc' },
    badge: { background: '#f1f5f9', color: '#6366f1', padding: '8px 16px', borderRadius: '20px', width: 'fit-content', fontWeight: 'bold', fontSize: '13px', marginBottom: '20px' },
    heroTitle: { fontSize: '42px', fontWeight: '800', lineHeight: '1.2', marginBottom: '20px' },
    heroSub: { color: '#64748b', fontSize: '17px', marginBottom: '30px', maxWidth: '450px' },
    heroImg: { width: '100%', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' },
    card: { background: '#fff', padding: '40px', borderRadius: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.05)', width: '100%', maxWidth: '420px' },
    cardTitle: { fontSize: '28px', fontWeight: '800', textAlign: 'center', marginBottom: '10px' },
    tabs: { display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '25px' },
    tab: { border: 'none', background: 'none', padding: '10px 5px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: '0.3s' },
    mainBtn: { width: '100%', padding: '16px', background: 'linear-gradient(135deg, #818cf8, #6366f1)', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: '800', fontSize: '16px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)' },
    divider: { display: 'flex', alignItems: 'center', margin: '25px 0' },
    line: { flex: 1, height: '1px', background: '#f1f5f9' },
    googleBtn: { width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '16px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: '700', color: '#475569' }
};

export default Login;