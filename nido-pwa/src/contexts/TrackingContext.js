// src/contexts/TrackingContext.js — versión sólida (RLS-safe, tipos normalizados)
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import supabase from '../supabase/config';
import { useAuth } from './AuthContext';
import { useBaby } from './BabyContext';

const TrackingContext = createContext();

export const useTracking = () => {
  const context = useContext(TrackingContext);
  if (!context) throw new Error('useTracking must be used within a TrackingProvider');
  return context;
};

export const TrackingProvider = ({ children }) => {
  const { user } = useAuth();
  const { currentBaby } = useBaby();

  // Estados principales
  const [currentFeedingSession, setCurrentFeedingSession] = useState(null);
  const [currentSleepSession, setCurrentSleepSession] = useState(null);
  const [todayData, setTodayData] = useState({
    feedingSessions: [],
    sleepSessions: [],
    diaperEvents: [],
    weightEntries: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ────────────────────────────────────────────────────────────────────────────────
  // Helpers

  const clearData = () => {
    setTodayData({ feedingSessions: [], sleepSessions: [], diaperEvents: [], weightEntries: [] });
    setCurrentFeedingSession(null);
    setCurrentSleepSession(null);
    setError(null);
  };

  const normalizeBreast = (t) => {
    const v = (t || '').toLowerCase();
    // valores permitidos por el CHECK de la BD
    if (['left', 'right', 'both', 'bottle', 'food'].includes(v)) return v;
    if (v === 'breastfeeding') {
      // si tu UI solo manda “breastfeeding”, persistimos el último lado o 'left'
      const key = currentBaby ? `lastBreast_${currentBaby.id}` : 'lastBreast';
      return (localStorage.getItem(key) || 'left');
    }
    // fallback seguro
    return 'bottle';
  };

  // ────────────────────────────────────────────────────────────────────────────────
  // Cargar datos cuando cambia el bebé/usuario

  const loadTodayData = useCallback(async () => {
    if (!currentBaby) return;
    try {
      setLoading(true);
      setError(null);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [feedRes, sleepRes, diaperRes, weightRes] = await Promise.all([
        supabase.from('feeding_sessions')
          .select('*')
          .eq('baby_id', currentBaby.id)
          .gte('start_time', today.toISOString())
          .lt('start_time', tomorrow.toISOString())
          .order('start_time', { ascending: false }),
        supabase.from('sleep_sessions')
          .select('*')
          .eq('baby_id', currentBaby.id)
          .gte('start_time', today.toISOString())
          .lt('start_time', tomorrow.toISOString())
          .order('start_time', { ascending: false }),
        supabase.from('diaper_events')
          .select('*')
          .eq('baby_id', currentBaby.id)
          .gte('timestamp', today.toISOString())
          .lt('timestamp', tomorrow.toISOString())
          .order('timestamp', { ascending: false }),
        supabase.from('weight_entries')
          .select('*')
          .eq('baby_id', currentBaby.id)
          .order('timestamp', { ascending: false })
          .limit(7),
      ]);

      if (feedRes.error) throw feedRes.error;
      if (sleepRes.error) throw sleepRes.error;
      if (diaperRes.error) throw diaperRes.error;
      if (weightRes.error) throw weightRes.error;

      setTodayData({
        feedingSessions: feedRes.data || [],
        sleepSessions: sleepRes.data || [],
        diaperEvents: diaperRes.data || [],
        weightEntries: weightRes.data || [],
      });
    } catch (err) {
      console.error('TrackingContext: Error cargando datos del día:', err);
      setError('Error cargando datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [currentBaby]);

  const loadActiveSessions = useCallback(async () => {
    if (!currentBaby) return;
    try {
      const [feedingRes, sleepRes] = await Promise.all([
        supabase.from('feeding_sessions')
          .select('*')
          .eq('baby_id', currentBaby.id)
          .is('end_time', null)
          .order('start_time', { ascending: false })
          .maybeSingle(),
        supabase.from('sleep_sessions')
          .select('*')
          .eq('baby_id', currentBaby.id)
          .is('end_time', null)
          .order('start_time', { ascending: false })
          .maybeSingle(),
      ]);
      if (feedingRes.error) throw feedingRes.error;
      if (sleepRes.error) throw sleepRes.error;
      setCurrentFeedingSession(feedingRes.data || null);
      setCurrentSleepSession(sleepRes.data || null);
    } catch (error) {
      console.error('TrackingContext: Error cargando sesiones activas:', error);
    }
  }, [currentBaby]);

  useEffect(() => {
    if (currentBaby && user) {
      checkAndCloseOldSessions().then(() => {
        loadTodayData();
        loadActiveSessions();
      });
    } else {
      clearData();
    }
  }, [currentBaby, user, loadTodayData, loadActiveSessions]);

  // ────────────────────────────────────────────────────────────────────────────────
  // Cierre automático de sesiones colgadas

  const checkAndCloseOldSessions = async () => {
    if (!currentBaby) return false;
    try {
      // Feeding: 6h
      const feedingCutoff = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
      const { data: oldFeedings } = await supabase.from('feeding_sessions')
        .select('*')
        .eq('baby_id', currentBaby.id)
        .is('end_time', null)
        .lt('start_time', feedingCutoff);

      if (oldFeedings?.length) {
        for (const s of oldFeedings) {
          await supabase.from('feeding_sessions')
            .update({
              end_time: new Date(new Date(s.start_time).getTime() + 30 * 60000).toISOString(),
              notes: 'Sesión cerrada automáticamente (>6h)',
              updated_at: new Date().toISOString()
            })
            .eq('id', s.id);
        }
      }

      // Sleep: 18h
      const sleepCutoff = new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString();
      const { data: oldSleeps } = await supabase.from('sleep_sessions')
        .select('*')
        .eq('baby_id', currentBaby.id)
        .is('end_time', null)
        .lt('start_time', sleepCutoff);

      if (oldSleeps?.length) {
        for (const s of oldSleeps) {
          await supabase.from('sleep_sessions')
            .update({
              end_time: new Date(new Date(s.start_time).getTime() + 10 * 60 * 60 * 1000).toISOString(),
              notes: 'Sesión cerrada automáticamente (>18h)',
              updated_at: new Date().toISOString()
            })
            .eq('id', s.id);
        }
      }
      return (oldFeedings?.length || oldSleeps?.length) ? true : false;
    } catch (e) {
      console.error('🔄 Error verificando sesiones antiguas:', e);
      return false;
    }
  };

  // ────────────────────────────────────────────────────────────────────────────────
  // Alimentación

  const startFeedingSession = async (...args) => {
    if (!currentBaby || !user) throw new Error('Bebé o usuario no disponible');
    if (currentFeedingSession) throw new Error('Ya hay una sesión de alimentación activa');
  
    // ── Parser robusto de argumentos ──────────────────────────────────────────────
    let type, side, amount, note;
  
    const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
    const isStr = (v) => typeof v === 'string';
    const TYPES = new Set(['breastfeeding','bottle','food']);
    const SIDES = new Set(['left','right','both']);
  
    if (args.length === 1 && isObj(args[0])) {
      // { type, side, amount, note }
      ({ type, side, amount, note } = args[0]);
    } else if (args.length >= 1 && isStr(args[0])) {
      const a0 = args[0].toLowerCase();
      if (TYPES.has(a0)) {
        // Formato: (type, side?, amount?, note?)
        type   = a0;
        side   = isStr(args[1]) ? args[1] : undefined;
        amount = args[2];
        note   = args[3];
      } else {
        // Formato legacy: (side, amount?, note?)
        side   = a0;
        amount = args[1];
        note   = args[2];
      }
    }
  
    // ── Normalización de breast ──────────────────────────────────────────────────
    const normalizeBreast = (t, s) => {
      const tv = (t || '').toLowerCase();
      const sv = (s || '').toLowerCase();
      if (SIDES.has(sv)) return sv;          // left|right|both
      if (tv === 'bottle' || tv === 'food') return tv;
      if (tv === 'breastfeeding') {
        const key = `lastBreast_${currentBaby.id}`;
        return sv || localStorage.getItem(key) || 'left';
      }
      // si no sabemos, elegimos bottle por seguridad
      return sv || 'bottle';
    };
    const breast = normalizeBreast(type, side);
  
    // ── Normalización de amount (numérico o null) ────────────────────────────────
    const amountNum = (amount === '' || amount === undefined || amount === null)
      ? null
      : Number(amount);
    if (amountNum !== null && Number.isNaN(amountNum)) {
      // No bloquees si el usuario pulsa “pecho” sin cantidad
      // pero sí si viene un texto mismapeado
      throw new Error('Cantidad (amount) inválida. Debe ser número o vacío.');
    }
  
    try {
      const payload = {
        baby_id: currentBaby.id,
        caregiver_id: user.id,
        user_id: user.id,
        created_by: user.id,
        start_time: new Date().toISOString(),
        end_time: null,
        duration: null,
        breast,                   // left|right|both|bottle|food
        amount: amountNum,        // number|null
        note: (note?.trim() || null),
        updated_at: new Date().toISOString()
      };
  
      const { data, error } = await supabase
        .from('feeding_sessions')
        .insert([payload])
        .select('*')
        .single();
  
      if (error) throw error;
  
      if (breast === 'left' || breast === 'right' || breast === 'both') {
        localStorage.setItem(`lastBreast_${currentBaby.id}`, breast);
      }
  
      setCurrentFeedingSession(data);
      await loadTodayData();
      return data;
    } catch (err) {
      console.error('🍼 TrackingContext: Error en startFeedingSession:', err);
      throw err;
    }
  };
  
  
  

  const endFeedingSession = async (sessionId, notes = '') => {
    if (!currentBaby || !user) throw new Error('Bebé o usuario no disponible');
  
    try {
      // 1) Resolver la sesión a cerrar
      let session = null;
  
      // a) si pasas id, usamos ése
      if (sessionId) {
        const { data, error } = await supabase
          .from('feeding_sessions')
          .select('*')
          .eq('id', sessionId)
          .maybeSingle();
        if (error) throw error;
        session = data;
      }
  
      // b) si no había id o no existe, usa la sesión activa en memoria
      if (!session && currentFeedingSession) {
        session = currentFeedingSession;
      }
  
      // c) si aún no hay, busca la última abierta en BD (por seguridad)
      if (!session) {
        const { data, error } = await supabase
          .from('feeding_sessions')
          .select('*')
          .eq('baby_id', currentBaby.id)
          .eq('caregiver_id', user.id)
          .is('end_time', null)
          .order('start_time', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        session = data;
      }
  
      if (!session) {
        throw new Error('No hay sesión de alimentación activa para cerrar');
      }
  
      // 2) Calcular duración en minutos
      const start = new Date(session.start_time);
      const end = new Date();
      const durationMin = Math.max(1, Math.round((end - start) / 60000)); // al menos 1 min
  
      // 3) Cerrar sesión
      const { data: updated, error: updErr } = await supabase
        .from('feeding_sessions')
        .update({
          end_time: end.toISOString(),
          duration: durationMin,
          note: notes?.trim() || session.note || null, // unificamos en 'note'
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id)
        .select('*')
        .single();
  
      if (updErr) throw updErr;
  
      setCurrentFeedingSession(null);
      await loadTodayData();
      return updated;
    } catch (err) {
      console.error('🍼 TrackingContext: Error en endFeedingSession:', err);
      throw err;
    }
  };
  

  // ────────────────────────────────────────────────────────────────────────────────
  // Sueño

  const startSleepSession = async () => {
    if (!currentBaby || !user) throw new Error('Bebé o usuario no disponible');
    if (currentSleepSession) throw new Error('Ya hay una sesión de sueño activa');

    try {
      const payload = {
        baby_id: currentBaby.id,
        caregiver_id: user.id,
        user_id: user.id,
        created_by: user.id,
        start_time: new Date().toISOString(),
        end_time: null,
        duration: null,
        note: null,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('sleep_sessions')
        .insert([payload])
        .select('*')
        .single();

      if (error) throw error;

      setCurrentSleepSession(data);
      await loadTodayData();
      return data;
    } catch (err) {
      console.error('😴 TrackingContext: Error en startSleepSession:', err);
      throw err;
    }
  };

  const endSleepSession = async (sessionId, notes = '') => {
    if (!sessionId) throw new Error('ID de sesión requerido');
    try {
      const { data, error } = await supabase
        .from('sleep_sessions')
        .update({
          end_time: new Date().toISOString(),
          notes: notes?.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select('*')
        .single();

      if (error) throw error;

      setCurrentSleepSession(null);
      await loadTodayData();
      return data;
    } catch (err) {
      console.error('😴 TrackingContext: Error en endSleepSession:', err);
      throw err;
    }
  };

  // ────────────────────────────────────────────────────────────────────────────────
  // Pañal

  const addDiaperEvent = async (type, notes = '') => {
    if (!currentBaby || !user) throw new Error('Bebé o usuario no disponible');
    if (!['wet', 'dirty', 'mixed'].includes((type || '').toLowerCase())) {
      throw new Error('Tipo de pañal inválido');
    }
    try {
      const payload = {
        baby_id: currentBaby.id,
        caregiver_id: user.id,
        user_id: user.id,
        created_by: user.id,
        type: type.toLowerCase(),
        timestamp: new Date().toISOString(),
        notes: notes?.trim() || null,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('diaper_events')
        .insert([payload])
        .select('*')
        .single();

      if (error) throw error;

      await loadTodayData();
      return data;
    } catch (err) {
      console.error('💩 TrackingContext: Error en addDiaperEvent:', err);
      throw err;
    }
  };

  // ────────────────────────────────────────────────────────────────────────────────
  // Peso

  const addWeightEntry = async (weightGrams, notes = '') => {
    if (!currentBaby || !user) throw new Error('Bebé o usuario no disponible');
    const w = parseInt(weightGrams, 10);
    if (!w || w <= 0) throw new Error('Peso inválido');

    try {
      const payload = {
        baby_id: currentBaby.id,
        // OJO: en weight_entries NO hay caregiver_id
        weight_grams: w,
        timestamp: new Date().toISOString(),
        notes: notes?.trim() || null,
        created_by: user.id,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('weight_entries')
        .insert([payload])
        .select('*')
        .single();

      if (error) throw error;

      await loadTodayData();
      return data;
    } catch (err) {
      console.error('⚖️ TrackingContext: Error en addWeightEntry:', err);
      throw err;
    }
  };

  // ────────────────────────────────────────────────────────────────────────────────
  // Realtime

  useEffect(() => {
    if (!currentBaby) return;
    const channel = supabase.channel(`tracking:${currentBaby.id}`);
    const reload = () => { loadTodayData(); loadActiveSessions(); };
    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feeding_sessions', filter: `baby_id=eq.${currentBaby.id}` }, reload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sleep_sessions',  filter: `baby_id=eq.${currentBaby.id}` }, reload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'diaper_events',   filter: `baby_id=eq.${currentBaby.id}` }, reload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'weight_entries',  filter: `baby_id=eq.${currentBaby.id}` }, reload)
      .subscribe();
    return () => { try { supabase.removeChannel(channel); } catch (e) {} };
  }, [currentBaby, loadTodayData, loadActiveSessions]);

  // ────────────────────────────────────────────────────────────────────────────────
  // Stats/util

  const getDuration = (startTime, endTime = null) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end - start;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    };

  const getTodayStats = () => {
    const feedingCount = todayData.feedingSessions.length;
    const completedFeedings = todayData.feedingSessions.filter(s => s.end_time).length;

    const sleepCount = todayData.sleepSessions.length;
    const completedSleep = todayData.sleepSessions.filter(s => s.end_time).length;
    const totalSleepTime = todayData.sleepSessions
      .filter(s => s.end_time)
      .reduce((total, s) => total + (new Date(s.end_time) - new Date(s.start_time)), 0);

    const diaperCount = todayData.diaperEvents.length;
    const wetCount = todayData.diaperEvents.filter(e => e.type === 'wet').length;
    const dirtyCount = todayData.diaperEvents.filter(e => e.type === 'dirty').length;
    const mixedCount = todayData.diaperEvents.filter(e => e.type === 'mixed').length;

    return {
      feeding: { total: feedingCount, completed: completedFeedings, active: !!currentFeedingSession },
      sleep:   { total: sleepCount,   completed: completedSleep,   totalTimeMs: totalSleepTime,
                 totalTimeFormatted: totalSleepTime ? getDuration(Date.now() - totalSleepTime, Date.now()) : '0m',
                 active: !!currentSleepSession },
      diaper:  { total: diaperCount, wet: wetCount, dirty: dirtyCount, mixed: mixedCount },
      weight:  { entries: todayData.weightEntries.length, latest: todayData.weightEntries[0] || null }
    };
  };

  const stats = useMemo(() => getTodayStats(), [todayData, currentFeedingSession, currentSleepSession]);

  const value = {
    // estados
    currentFeedingSession, currentSleepSession, todayData, loading, error, isOnline,
    // alimentación
    startFeedingSession, endFeedingSession,
    // sueño
    startSleepSession, endSleepSession,
    // pañal
    addDiaperEvent,
    // peso
    addWeightEntry,
    // util
    loadTodayData, loadActiveSessions, getDuration, getTodayStats, checkAndCloseOldSessions,
    // stats
    stats
  };

  return <TrackingContext.Provider value={value}>{children}</TrackingContext.Provider>;
};
