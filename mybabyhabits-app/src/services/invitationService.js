// src/services/invitationService.js
import supabase from '../supabase/config';

class InvitationService {
  // Generar código seguro de 6 caracteres
  generateSecureCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin caracteres confusos
    return Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map(byte => chars[byte % chars.length])
      .join('');
  }

  // Crear invitación
  async createInvitation(babyId, role = 'collaborator') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const code = this.generateSecureCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expira en 7 días
      
      const { data, error } = await supabase
        .from('invitations')
        .insert({
          baby_id: babyId,
          code,
          role,
          expires_at: expiresAt.toISOString(),
          created_by: user.id,
          uses_left: 5
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const shareUrl = `${window.location.origin}/join/${code}`;
      
      return {
        code,
        shareUrl,
        qrData: shareUrl,
        expiresAt
      };
    } catch (error) {
      console.error('Error creating invitation:', error);
      throw error;
    }
  }

  // Verificar invitación
  async verifyInvitation(code) {
    try {
      const { data: invitation, error } = await supabase
        .from('invitations')
        .select('*, babies(*)')
        .eq('code', code.toUpperCase())
        .gt('expires_at', new Date().toISOString())
        .gt('uses_left', 0)
        .single();
      
      if (error || !invitation) {
        throw new Error('Invitación inválida o expirada');
      }
      
      return invitation;
    } catch (error) {
      console.error('Error verifying invitation:', error);
      throw error;
    }
  }

  // Aceptar invitación
  async acceptInvitation(code) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Debes iniciar sesión para aceptar la invitación');
      
      // Verificar invitación
      const invitation = await this.verifyInvitation(code);
      
      // Verificar si ya es cuidador
      const { data: existing } = await supabase
        .from('caregivers')
        .select('id')
        .eq('baby_id', invitation.baby_id)
        .eq('user_id', user.id)
        .single();
      
      if (existing) {
        throw new Error('Ya eres cuidador de este bebé');
      }
      
      // Crear relación de cuidador
      const { error: caregiverError } = await supabase
        .from('caregivers')
        .insert({
          baby_id: invitation.baby_id,
          user_id: user.id,
          role: invitation.role
        });
      
      if (caregiverError) throw caregiverError;
      
      // Decrementar usos
      await supabase
        .from('invitations')
        .update({ uses_left: invitation.uses_left - 1 })
        .eq('id', invitation.id);
      
      return invitation.babies;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }

  // Listar invitaciones activas
  async getActiveInvitations(babyId) {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('baby_id', babyId)
        .gt('expires_at', new Date().toISOString())
        .gt('uses_left', 0)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching invitations:', error);
      return [];
    }
  }

  // Revocar invitación
  async revokeInvitation(invitationId) {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ uses_left: 0 })
        .eq('id', invitationId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error revoking invitation:', error);
      throw error;
    }
  }
}

export default new InvitationService();