// src/contexts/BabyContext.js — estable + caregivers por link/email
import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../supabase/config';
import { useAuth } from './AuthContext';

const BabyContext = createContext();
export const useBaby = () => {
  const ctx = useContext(BabyContext);
  if (!ctx) throw new Error('useBaby must be used within a BabyProvider');
  return ctx;
};

export const BabyProvider = ({ children }) => {
  const { user } = useAuth();
  const [babies, setBabies] = useState([]);
  const [currentBaby, setCurrentBaby] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) loadBabies();
    else { setBabies([]); setCurrentBaby(null); setError(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (babies.length > 0 && !currentBaby) setCurrentBaby(babies[0]);
  }, [babies, currentBaby]);

  // READ
  const loadBabies = async () => {
    if (!user) return;
    try {
      setLoading(true); setError(null);
      const { data, error } = await supabase
        .from('babies')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      setBabies(data ?? []);
    } catch (err) {
      setError('Error cargando bebés: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // CREATE
  const addBaby = async (babyData) => {
    if (!user) throw new Error('Usuario no autenticado');
    const name = (babyData?.name ?? '').trim();
    if (!name) throw new Error('El nombre del bebé es requerido');
    if (!babyData?.birthdate) throw new Error('La fecha de nacimiento es requerida');

    try {
      setLoading(true); setError(null);

      const { data: baby, error: bErr } = await supabase
        .from('babies')
        .insert([{
          name,
          birthdate: babyData.birthdate,
          gender: babyData.gender ?? null,
          weight_at_birth: babyData.weight_at_birth ?? null,
          height_at_birth: babyData.height_at_birth ?? null,
          created_by: user.id,
          user_id: user.id
        }])
        .select('*')
        .single();
      if (bErr) throw bErr;

      // asegurar caregiver admin (idempotente)
      const { error: cErr } = await supabase
        .from('caregivers')
        .upsert(
          [{ baby_id: baby.id, user_id: user.id, role: 'admin', created_by: user.id }],
          { onConflict: 'baby_id,user_id', ignoreDuplicates: true }
        );
      if (cErr) throw cErr;

      setBabies(prev => [...prev, baby]);
      if (!currentBaby) setCurrentBaby(baby);
      return baby;
    } catch (err) {
      setError('Error añadiendo bebé: ' + err.message);
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // UPDATE
  const updateBaby = async (babyId, updates) => {
    if (!user) throw new Error('Usuario no autenticado');
    try {
      setLoading(true); setError(null);
      const { data, error } = await supabase
        .from('babies')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', babyId)
        .select('*')
        .single();
      if (error) throw error;
      setBabies(prev => prev.map(b => (b.id === babyId ? data : b)));
      if (currentBaby?.id === babyId) setCurrentBaby(data);
      return data;
    } catch (err) {
      setError('Error actualizando bebé: ' + err.message);
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // DELETE
  const deleteBaby = async (babyId) => {
    if (!user) throw new Error('Usuario no autenticado');
    try {
      setLoading(true); setError(null);
      const { error } = await supabase.from('babies').delete().eq('id', babyId);
      if (error) throw error;
      setBabies(prev => prev.filter(b => b.id !== babyId));
      if (currentBaby?.id === babyId) setCurrentBaby(null);
    } catch (err) {
      setError('Error eliminando bebé: ' + err.message);
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const selectBaby = (babyId) => {
    const baby = babies.find(b => b.id === babyId);
    if (baby) setCurrentBaby(baby);
  };

  // ── CAREGIVERS ────────────────────────────────────────────────────────────

  // Invitar por email (si ya existe user → caregiver; si no → pendiente)
  const inviteCaregiverByEmail = async (babyId, email, role = 'collaborator') => {
    if (!user) throw new Error('Usuario no autenticado');
    const normalized = String(email || '').trim().toLowerCase();
    if (!normalized) throw new Error('Email requerido');
    if (!['admin','collaborator','viewer'].includes(role)) throw new Error('Rol inválido');
    const { error } = await supabase.rpc('add_caregiver_by_email', {
      p_baby_id: babyId,
      p_email: normalized,
      p_role: role
    });
    if (error) throw error;
  };

  // Crear link de invitación
  const createInviteLink = async (babyId, role = 'collaborator', uses = 1, ttlHours = 168) => {
    const { data: code, error } = await supabase.rpc('generate_invitation_code', {
      p_baby_id: babyId,
      p_role: role,
      p_uses: uses,
      p_ttl_hours: ttlHours,
    });
    if (error) throw error;
    const url = new URL(window.location.origin + '/invite');
    url.searchParams.set('code', code);
    url.searchParams.set('baby', babyId);
    url.searchParams.set('role', role);
    return url.toString();
  };

  // Listar confirmados + pendientes
  const listCaregivers = async (babyId) => {
    if (!user || !babyId) return { confirmed: [], pending: [] };

    const { data: confirmed, error: cErr } = await supabase
      .from('caregivers')
      .select(`
        id, role, user_id, baby_id, created_at,
        profiles:user_id ( email, first_name, last_name, avatar_url )
      `)
      .eq('baby_id', babyId)
      .order('created_at', { ascending: true });
    if (cErr) throw cErr;

    const { data: pending, error: pErr } = await supabase
      .from('pending_caregivers')
      .select('id, email, role, invited_by, created_at')
      .eq('baby_id', babyId)
      .order('created_at', { ascending: true });
    if (pErr) throw pErr;

    return { confirmed: confirmed ?? [], pending: pending ?? [] };
  };

  const updateCaregiverRole = async (babyId, userId, newRole) => {
    if (!user) throw new Error('Usuario no autenticado');
    if (!['admin','collaborator','viewer'].includes(newRole)) throw new Error('Rol inválido');
    const { data, error } = await supabase
      .from('caregivers')
      .update({ role: newRole })
      .eq('baby_id', babyId)
      .eq('user_id', userId)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  };

  const removeCaregiver = async (babyId, userId) => {
    if (!user) throw new Error('Usuario no autenticado');
    const { error } = await supabase
      .from('caregivers')
      .delete()
      .eq('baby_id', babyId)
      .eq('user_id', userId);
    if (error) throw error;
  };

  const cancelPendingInvite = async (pendingId) => {
    if (!user) throw new Error('Usuario no autenticado');
    const { error } = await supabase
      .from('pending_caregivers')
      .delete()
      .eq('id', pendingId);
    if (error) throw error;
  };

  // compat
  const getCaregivers = async (babyId) => {
    const { confirmed } = await listCaregivers(babyId);
    return confirmed;
  };

  const value = {
    babies, currentBaby, loading, error,
    loadBabies, addBaby, updateBaby, deleteBaby, selectBaby,
    // caregivers
    inviteCaregiverByEmail, createInviteLink, listCaregivers,
    updateCaregiverRole, removeCaregiver, cancelPendingInvite,
    getCaregivers,
  };

  return <BabyContext.Provider value={value}>{children}</BabyContext.Provider>;
};
