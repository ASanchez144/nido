// services/auth.js
import { supabase } from './supabase';

class AuthService {
  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      return { data: null, error };
    }
  }

  /**
   * Sign up with Google OAuth
   */
  async signUpWithGoogle() {
    // Same as sign in for OAuth - Supabase handles new user creation
    return this.signInWithGoogle();
  }

  /**
   * Sign in with email and password (fallback)
   */
  async signInWithEmail(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in with email:', error);
      return { data: null, error };
    }
  }

  /**
   * Sign up with email and password (fallback)
   */
  async signUpWithEmail(email, password, fullName) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error signing up with email:', error);
      return { data: null, error };
    }
  }

  /**
   * Sign out
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error };
    }
  }

  /**
   * Get current session
   */
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { session, error: null };
    } catch (error) {
      console.error('Error getting session:', error);
      return { session: null, error };
    }
  }

  /**
   * Get current user profile with subscription info
   */
  async getUserProfile(userId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;

      if (!targetUserId) {
        return { profile: null, error: new Error('No user ID provided') };
      }

      const { data, error } = await supabase
        .rpc('get_user_subscription', { user_uuid: targetUserId })
        .single();

      if (error) throw error;

      // Get basic profile info
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url')
        .eq('id', targetUserId)
        .single();

      if (profileError) throw profileError;

      const profile = {
        ...profileData,
        ...data
      };

      return { profile, error: null };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return { profile: null, error };
    }
  }

  /**
   * Check if user has premium access
   */
  async hasPremiumAccess(userId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;

      if (!targetUserId) return false;

      const { data, error } = await supabase
        .rpc('has_premium_access', { user_uuid: targetUserId });

      if (error) throw error;
      return data === true;
    } catch (error) {
      console.error('Error checking premium access:', error);
      return false;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }

  /**
   * Reset password
   */
  async resetPassword(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { data: null, error };
    }
  }

  /**
   * Update password
   */
  async updatePassword(password) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating password:', error);
      return { data: null, error };
    }
  }
}

export const authService = new AuthService();
export default authService;