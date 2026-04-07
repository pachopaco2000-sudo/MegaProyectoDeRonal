import { createContext, useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";

export const UserContext = createContext();

export function UserProvider({ children }) {
    // Para simplificar, user y profile ahora son lo mismo en nuestra lógica personalizada
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('Usuarios')
                .select('*')
                .eq('id', userId)
                .single();
            if (data && !error) {
                setProfile(data);
                setUser(data);
            } else {
                // ID obsoleto o borrado
                localStorage.removeItem('aura_local_id');
                setUser(null);
                setProfile(null);
            }
        } catch (error) {
            console.error("Error al obtener perfil personalizado:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedUserId = localStorage.getItem('aura_local_id');
        if (storedUserId) {
            fetchUserProfile(storedUserId);
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const { data, error } = await supabase
            .from('Usuarios')
            .select('*')
            .eq('correo', email)
            .eq('contraseña', password)
            .single();

        if (error || !data) {
            return { error: { message: "Credenciales inválidas o correo no registrado." } };
        }

        if (data.estado === 'Bloqueado') {
            return { error: { message: "Esta cuenta se encuentra bloqueada por un administrador." } };
        }

        // Login local exitoso
        localStorage.setItem('aura_local_id', data.id);
        setUser(data);
        setProfile(data);
        return { success: true };
    };

    const signup = async (email, password, nombre) => {
        // Verificar que no exista el correo ya
        const { data: existingUser } = await supabase
            .from('Usuarios')
            .select('id')
            .eq('correo', email)
            .maybeSingle();

        if (existingUser) {
            return { error: { message: "El correo ya está en uso." } };
        }

        const { data, error } = await supabase
            .from('Usuarios')
            .insert([{
                correo: email,
                contraseña: password,
                nombre: nombre,
                rol: 'Usuario',
                estado: 'Activo',
                reservas: 0
            }])
            .select()
            .single();

        if (error) {
            return { error: { message: "Fallo en registro directo: " + error.message } };
        }

        // Registro local exitoso (Auto-login)
        if (data) {
            localStorage.setItem('aura_local_id', data.id);
            setUser(data);
            setProfile(data);
        }
        return { success: true };
    };

    const logout = async () => {
        localStorage.removeItem('aura_local_id');
        setUser(null);
        setProfile(null);
    };

    const updateProfile = async (updates) => {
        if (!user) return;
        const { data, error } = await supabase
            .from('Usuarios')
            .update(updates)
            .eq('id', user.id)
            .select();
        
        if (data && !error) {
            setProfile(data[0]);
            setUser(data[0]);
            return { success: true };
        }
        return { error };
    };

    return (
        <UserContext.Provider value={{ user, profile, login, signup, logout, updateProfile, loading }}>
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', color: '#64748b' }}>
                    <h2>Conectando con Aura Travel (Sistema Directo)... 🚀</h2>
                    <p>Verificando credenciales</p>
                </div>
            ) : children}
        </UserContext.Provider>
    );
}
