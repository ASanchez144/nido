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

  // Efecto para verificar la sesión actual y configurar la suscripción a cambios de auth
  useEffect(() => {
    let mounted = true;

    // Verificar sesión actual
    async function getInitialSession() {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (mounted) {
          if (data?.session) {
            setUser(data.session.user);
            await fetchProfile(data.session.user.id);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error al obtener sesión inicial:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    }

    getInitialSession();

    // Suscribirse a cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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
      }
    );

    // Limpiar suscripción al desmontar
    return () => {
      mounted = false;
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Obtener perfil del usuario
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error al obtener perfil:', error);
    }
  };

  // Registrar un nuevo usuario
// Actualizar el método signUp en src/contexts/AuthContext.js
const signUp = async (email, password, firstName, lastName) => {
  try {
    // Paso 1: Registrar el usuario con autorregistro
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
      console.error('Error en supabase.auth.signUp:', error);
      throw error;
    }

    // Si Supabase requiere confirmación de email, el usuario no estará completamente autenticado
    if (data.user?.identities?.length === 0) {
      throw new Error('Este email ya está registrado. Por favor, inicia sesión.');
    }

    if (data.user && !data.session) {
      console.log('Usuario creado pero requiere confirmación de email:', data.user.email);
      // Iniciar sesión manualmente después del registro
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        console.error('Error al iniciar sesión después del registro:', signInError);
        throw signInError;
      }
      
      console.log('Sesión iniciada después del registro:', signInData);
    }

    return data;
  } catch (error) {
    console.error('Error en signUp:', error);
    throw error;
  }
};

  // Iniciar sesión
 // Actualizar el método signIn en src/contexts/AuthContext.js
const signIn = async (email, password) => {
  try {
    console.log('Intentando iniciar sesión con email:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error específico al iniciar sesión:', error);
      
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Por favor, confirma tu email antes de iniciar sesión.');
      } else if (error.message.includes('Invalid login credentials')) {
        throw new Error('Credenciales incorrectas. Verifica tu email y contraseña.');
      } else {
        throw error;
      }
    }

    console.log('Inicio de sesión exitoso:', data);
    return data;
  } catch (error) {
    console.error('Error en signIn:', error);
    throw error;
  }
};
  // Cerrar sesión
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  };

  // Actualizar perfil
  const updateProfile = async (updates) => {
    try {
      // Asegurarse de que el usuario está autenticado
      if (!user) throw new Error('Usuario no autenticado');

      // Actualizar el perfil
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Actualizar el estado local
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  };

  // Valores a exponer en el contexto
  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}