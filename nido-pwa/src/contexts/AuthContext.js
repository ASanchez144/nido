// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../supabase/config';

// Crear contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export function useAuth() {
  return useContext(AuthContext);
}

// Proveedor del contexto
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para obtener perfil del usuario
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = No rows found, que es normal para nuevos usuarios
        console.error('Error al obtener perfil:', error);
        return;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error al obtener perfil:', error);
    }
  };

  // Efecto para verificar la sesión actual y configurar la suscripción
  useEffect(() => {
    let mounted = true;
    let authSubscription = null;

    // Función para manejar cambios de auth
    const handleAuthChange = async (event, session) => {
      console.log('🔄 Auth event:', event, session?.user?.email);
      
      if (!mounted) return;

      try {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Error en handleAuthChange:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Función para obtener sesión inicial
    const getInitialSession = async () => {
      try {
        console.log('🔍 Verificando sesión inicial...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error al obtener sesión:', error);
          if (mounted) {
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        console.log('📋 Sesión inicial:', session?.user?.email || 'No hay sesión');
        
        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            await fetchProfile(session.user.id);
          } else {
            setUser(null);
            setProfile(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error en getInitialSession:', error);
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    // Configurar suscripción a cambios de auth
    const setupAuthListener = () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
      authSubscription = subscription;
      return subscription;
    };

    // Ejecutar verificación inicial y configurar listener
    const initializeAuth = async () => {
      setupAuthListener();
      await getInitialSession();
    };

    initializeAuth();

    // Cleanup al desmontar
    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []); // Solo se ejecuta una vez al montar

  // Registrar un nuevo usuario
  const signUp = async (email, password, firstName, lastName) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });

      if (error) {
        throw error;
      }

      // Si el usuario ya existe
      if (data.user?.identities?.length === 0) {
        throw new Error('Este email ya está registrado. Intenta iniciar sesión.');
      }

      // Si requiere confirmación de email
      if (data.user && !data.session) {
        return {
          user: data.user,
          needsConfirmation: true,
          message: 'Revisa tu email para confirmar tu cuenta.'
        };
      }

      return { user: data.user, needsConfirmation: false };
    } catch (error) {
      console.error('Error en signUp:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Iniciar sesión
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error en signIn:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión
  const signOut = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      // Limpiar estado inmediatamente
      setUser(null);
      setProfile(null);
      
      console.log('✅ Sesión cerrada correctamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Restablecer contraseña
  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        throw error;
      }

      return { message: 'Revisa tu email para restablecer tu contraseña.' };
    } catch (error) {
      console.error('Error en resetPassword:', error);
      throw error;
    }
  };

  // Actualizar perfil
  const updateProfile = async (updates) => {
    try {
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert([{ id: user.id, ...updates }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  };

  // Valores del contexto
  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    fetchProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}