import { createContext, useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";

export const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('Usuarios')
                .select('*')
                .eq('id', userId)
                .single();
            if (data && !error) setProfile(data);
        } catch (error) {
            console.error("Error silencioso al obtener perfil:", error);
        }
    };

    useEffect(() => {
        // Obtener la sesión actual al cargar
        supabase.auth.getSession().then(async ({ data: { session }, error }) => {
            if (!error) {
                setSession(session);
                setUser(session?.user || null);
                if (session?.user) await fetchUserProfile(session.user.id);
            }
            setLoading(false);
        }).catch(() => setLoading(false));

        // Escuchar cambios de autenticación en tiempo real
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            try {
                setSession(session);
                setUser(session?.user || null);
                if (session?.user) {
                    await fetchUserProfile(session.user.id);
                } else {
                    setProfile(null);
                }
            } finally {
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email, password) => {
        return supabase.auth.signInWithPassword({ email, password });
    };

    const signup = async (email, password, name) => {
        return supabase.auth.signUp({ 
            email, 
            password,
            options: { data: { name } }
        });
    };

    const logout = async () => {
        await supabase.auth.signOut();
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
            return { success: true };
        }
        return { error };
    };

    return (
        <UserContext.Provider value={{ user, session, profile, login, signup, logout, updateProfile, loading }}>
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', color: '#64748b' }}>
                    <h2>Conectando con Aura Travel... ✈️</h2>
                    <p>Verificando credenciales</p>
                </div>
            ) : children}
        </UserContext.Provider>
    );
}
