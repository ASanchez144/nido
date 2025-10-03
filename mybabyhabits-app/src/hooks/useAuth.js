// hooks/useAuth.js
import { useState, useEffect, useContext, createContext } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    user: null,
    profile: null,
    session: null,
    loading: true
  });

  const refreshProfile = async () => {
    if (!state.user) return;
    
    const { profile } = await authService.getUserProfile(state.user.id);
    setState(prev => ({ ...prev, profile }));
  };

  const signInWithGoogle = async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const { error } = await authService.signInWithGoogle();
      if (error) throw error;
      // Profile will be updated through auth state change listener
    } catch (error) {
      console.error('Sign in with Google failed:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const signUpWithGoogle = async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const { error } = await authService.signUpWithGoogle();
      if (error) throw error;
      // Profile will be updated through auth state change listener
    } catch (error) {
      console.error('Sign up with Google failed:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const signInWithEmail = async (email, password) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const { error } = await authService.signInWithEmail(email, password);
      if (error) throw error;
    } catch (error) {
      console.error('Sign in with email failed:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const signUpWithEmail = async (email, password, fullName) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const { error } = await authService.signUpWithEmail(email, password, fullName);
      if (error) throw error;
    } catch (error) {
      console.error('Sign up with email failed:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const { error } = await authService.signOut();
      if (error) throw error;
      
      setState({
        user: null,
        profile: null,
        session: null,
        loading: false
      });
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  };

  const updateProfile = async (updates) => {
    try {
      const { error } = await authService.updateProfile(updates);
      if (error) throw error;
      
      await refreshProfile();
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await authService.resetPassword(email);
      if (error) throw error;
    } catch (error) {
      console.error('Reset password failed:', error);
      throw error;
    }
  };

  const updatePassword = async (password) => {
    try {
      const { error } = await authService.updatePassword(password);
      if (error) throw error;
    } catch (error) {
      console.error('Update password failed:', error);
      throw error;
    }
  };

  // Initialize auth state and listen for changes
  useEffect(() => {
    let mounted = true;

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { session } = await authService.getSession();
        
        if (mounted) {
          if (session?.user) {
            const { profile } = await authService.getUserProfile(session.user.id);
            setState({
              user: session.user,
              profile,
              session,
              loading: false
            });
          } else {
            setState({
              user: null,
              profile: null,
              session: null,
              loading: false
            });
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false
          });
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.email);

        if (session?.user) {
          // User signed in or session refreshed
          const { profile } = await authService.getUserProfile(session.user.id);
          setState({
            user: session.user,
            profile,
            session,
            loading: false
          });
        } else {
          // User signed out
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false
          });
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Computed values
  const isPremium = state.profile?.is_premium || false;
  const daysRemaining = state.profile?.days_remaining || 0;
  const isTrialing = state.profile?.subscription_status === 'trialing';

  const value = {
    ...state,
    signInWithGoogle,
    signUpWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    refreshProfile,
    isPremium,
    daysRemaining,
    isTrialing
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;