// src/contexts/AuthContext.js — con auto-canjeo de invitaciones por código
import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../supabase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

const getInviteCodeFromURL = () => {
  try {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    // también aceptamos /join/:code
    if (!code) {
      const m = window.location.pathname.match(/^\/join\/([^/]+)/i);
      if (m && m[1]) return m[1];
    }
    return code ? code.trim() : null;
  } catch {
    return null;
  }
};

const stripCodeFromURL = () => {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete('code');
    if (url.pathname.startsWith('/join/')) url.pathname = '/invite';
    window.history.replaceState({}, '', url.toString());
  } catch {}
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sesión inicial + listener
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session ?? null);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session ?? null);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Si llega ?code=... (o /join/:code)
  useEffect(() => {
    const codeFromURL = getInviteCodeFromURL();
    if (!codeFromURL) return;

    localStorage.setItem('pendingInviteCode', codeFromURL);

    if (!session || !user) {
      // no hay sesión → manda a login
      stripCodeFromURL();
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    } else {
      // hay sesión → canjea ya
      (async () => {
        try {
          await supabase.rpc('redeem_invitation_code', { p_code: codeFromURL });
          localStorage.removeItem('pendingInviteCode');
          stripCodeFromURL();
          if (window.location.pathname.startsWith('/invite') || window.location.pathname.startsWith('/join')) {
            window.location.replace('/');
          }
        } catch (e) {
          console.error('[Auth] Error canjeando invitación desde URL:', e);
          stripCodeFromURL();
        }
      })();
    }
  }, [session, user]);

  // Tras login/registro: canjear código pendiente
  useEffect(() => {
    if (!session || !user) return;
    const pending = localStorage.getItem('pendingInviteCode');
    if (!pending) return;

    (async () => {
      try {
        await supabase.rpc('redeem_invitation_code', { p_code: pending });
      } catch (e) {
        console.error('[Auth] Error canjeando invitación pendiente:', e);
      } finally {
        localStorage.removeItem('pendingInviteCode');
        if (['/login', '/register'].includes(window.location.pathname)) {
          window.location.replace('/');
        }
      }
    })();
  }, [session, user]);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUp = async (email, password, firstName, lastName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName } }
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = { user, session, loading, signIn, signUp, signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
