import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import './styles/Login.css';

const Login = () => {
    const { login, signup } = useContext(UserContext);
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    const location = useLocation();

    const [mode, setMode] = useState(location.state?.mode || 'login');

    // Estados para validación
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    // Validación simple
    const isFormValid = mode === 'login'
        ? email.includes('@') && password.length > 5
        : name.length > 2 && email.includes('@') && password.length > 5;

    const handleSubmit = async () => {
        if (!isFormValid) {
            showNotification("Rellena los campos correctamente (Contraseña min. 6)", "error");
            return;
        }
        try {
            if (mode === 'register') {
                const { error } = await signup(email, password, name);
                if (error) throw error;
                showNotification("¡Cuenta creada! Revisa tu email o inicia sesión.", "success");
                setMode('login'); 
            } else if (mode === 'login') {
                const { error } = await login(email, password);
                if (error) throw error;
                showNotification(`¡Bienvenido de vuelta!`, "success");
                navigate('/destinos');
            } else {
                showNotification("Instrucciones enviadas al correo", "success");
                setMode('login');
            }
        } catch (error) {
            showNotification("Error: " + error.message, "error");
        }
    };

    return (
        <div className="login-auth-container">
            <div className="login-info-side anim-right">
                <div className="login-badge">✨ Aura Travel</div>
                <h1 className="login-hero-title">
                    {mode === 'login' ? 'Bienvenido a' : mode === 'register' ? 'Únete a' : 'Recupera tu'}
                    <br />
                    <span style={{ color: '#6366f1' }}>Aura Travel</span>
                </h1>
                <p className="login-hero-sub">La plataforma más avanzada para planificar tus viajes con inteligencia artificial.</p>
                <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800" alt="Travel" className="login-hero-img" />
            </div>

            <div className="login-form-side">
                <div className="login-card anim-up">
                    <h2 className="login-card-title">{mode === 'login' ? 'Iniciar Sesión' : mode === 'register' ? 'Crear Cuenta' : 'Recuperar'}</h2>

                    <div className="login-tabs">
                        <button onClick={() => setMode('login')} className="login-tab" style={{ color: mode === 'login' ? '#6366f1' : '#94a3b8', borderBottom: mode === 'login' ? '3px solid #6366f1' : '3px solid transparent' }}>Ingresar</button>
                        <button onClick={() => setMode('register')} className="login-tab" style={{ color: mode === 'register' ? '#6366f1' : '#94a3b8', borderBottom: mode === 'register' ? '3px solid #6366f1' : '3px solid transparent' }}>Registro</button>
                    </div>

                    <div>
                        {mode === 'register' && <input type="text" className="login-input" placeholder="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} />}
                        <input type="email" className="login-input" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} />
                        {mode !== 'recover' && <input type="password" className="login-input" placeholder="Contraseña (min. 6)" value={password} onChange={(e) => setPassword(e.target.value)} />}
                    </div>

                    <button
                        onClick={handleSubmit}
                        className={`login-main-btn ${!isFormValid ? 'btn-disabled' : ''}`}
                    >
                        {mode === 'login' ? 'Entrar ahora' : mode === 'register' ? 'Crear cuenta' : 'Enviar instrucciones'}
                    </button>

                    <div className="login-divider">
                        <div className="login-line"></div>
                        <span style={{ padding: '0 10px', fontSize: '12px', color: '#94a3b8' }}>o continúa con</span>
                        <div className="login-line"></div>
                    </div>
                    <button className="login-google-btn">Google</button>
                </div>
            </div>
        </div>
    );
};

export default Login;