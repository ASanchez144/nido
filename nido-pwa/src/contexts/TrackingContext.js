// src/contexts/TrackingContext.js - Versión completa y funcional
import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../supabase/config';
import { useAuth } from './AuthContext';
import { useBaby } from './BabyContext';

const TrackingContext = createContext();

export const useTracking = () => {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error('useTracking must be used within a TrackingProvider');
  }
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Detectar estado de conexión
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

  // Cargar datos cuando cambia el bebé actual
  useEffect(() => {
    if (currentBaby && user) {
      console.log('📊 TrackingContext: Cargando datos para bebé:', currentBaby.name);
      checkAndCloseOldSessions().then(() => {
        loadTodayData();
        loadActiveSessions();
      });
    } else {
      console.log('📊 TrackingContext: Limpiando datos de tracking');
      clearData();
    }
  }, [currentBaby, user]);

  const clearData = () => {
    setTodayData({
      feedingSessions: [],
      sleepSessions: [],
      diaperEvents: [],
      weightEntries: []
    });
    setCurrentFeedingSession(null);
    setCurrentSleepSession(null);
    setError(null);
  };

  // Función para verificar y cerrar automáticamente sesiones colgadas
  const checkAndCloseOldSessions = async () => {
    if (!currentBaby) return;

    try {
      console.log('🔄 TrackingContext: Verificando sesiones antiguas...');
      
      // Alimentaciones: Límite de 6 horas (21600000 ms)
      const maxFeedingTime = 6 * 60 * 60 * 1000; 
      const feedingCutoffTime = new Date(Date.now() - maxFeedingTime).toISOString();
      
      // Sueño: Límite de 18 horas (64800000 ms) - los bebés pueden dormir más tiempo
      const maxSleepTime = 18 * 60 * 60 * 1000;
      const sleepCutoffTime = new Date(Date.now() - maxSleepTime).toISOString();

      // Buscar sesiones de alimentación activas antiguas
      const { data: oldFeedings, error: feedingError } = await supabase
        .from('feeding_sessions')
        .select('*')
        .eq('baby_id', currentBaby.id)
        .is('end_time', null)
        .lt('start_time', feedingCutoffTime);

      if (feedingError) {
        console.error('🔄 Error verificando alimentaciones antiguas:', feedingError);
      }

      // Cerrar sesiones de alimentación antiguas
      if (oldFeedings && oldFeedings.length > 0) {
        console.log(`🔄 Cerrando ${oldFeedings.length} sesiones de alimentación antiguas`);
        
        for (const session of oldFeedings) {
          const { error } = await supabase
            .from('feeding_sessions')
            .update({ 
              end_time: new Date(new Date(session.start_time).getTime() + 30 * 60000).toISOString(), // 30 minutos después de inicio
              notes: 'Sesión cerrada automáticamente (más de 6 horas)',
              updated_at: new Date().toISOString()
            })
            .eq('id', session.id);
            
          if (error) {
            console.error('🔄 Error cerrando sesión de alimentación:', error);
          }
        }
      }

      // Buscar sesiones de sueño activas antiguas
      const { data: oldSleepSessions, error: sleepError } = await supabase
        .from('sleep_sessions')
        .select('*')
        .eq('baby_id', currentBaby.id)
        .is('end_time', null)
        .lt('start_time', sleepCutoffTime);

      if (sleepError) {
        console.error('🔄 Error verificando sueño antiguo:', sleepError);
      }

      // Cerrar sesiones de sueño antiguas
      if (oldSleepSessions && oldSleepSessions.length > 0) {
        console.log(`🔄 Cerrando ${oldSleepSessions.length} sesiones de sueño antiguas`);
        
        for (const session of oldSleepSessions) {
          const { error } = await supabase
            .from('sleep_sessions')
            .update({ 
              end_time: new Date(new Date(session.start_time).getTime() + 10 * 60 * 60000).toISOString(), // 10 horas después
              notes: 'Sesión cerrada automáticamente (más de 18 horas)',
              updated_at: new Date().toISOString()
            })
            .eq('id', session.id);
            
          if (error) {
            console.error('🔄 Error cerrando sesión de sueño:', error);
          }
        }
      }

      // Recargar datos actualizados si se cerró alguna sesión
      if ((oldFeedings && oldFeedings.length > 0) || 
          (oldSleepSessions && oldSleepSessions.length > 0)) {
        console.log('🔄 Se cerraron sesiones antiguas, recargando datos...');
        return true; // Indica que se cerraron sesiones
      } else {
        console.log('🔄 No se encontraron sesiones antiguas para cerrar');
        return false;
      }

    } catch (error) {
      console.error('🔄 Error verificando sesiones antiguas:', error);
      return false;
    }
  };

  // ============ FUNCIONES DE CARGA DE DATOS ============

  const loadTodayData = async () => {
    if (!currentBaby) return;

    try {
      setLoading(true);
      setError(null);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      console.log('📊 TrackingContext: Cargando datos de hoy para:', currentBaby.name);

      // Cargar sesiones de alimentación
      const { data: feedingSessions, error: feedError } = await supabase
        .from('feeding_sessions')
        .select('*')
        .eq('baby_id', currentBaby.id)
        .gte('start_time', today.toISOString())
        .lt('start_time', tomorrow.toISOString())
        .order('start_time', { ascending: false });

      // Cargar sesiones de sueño
      const { data: sleepSessions, error: sleepError } = await supabase
        .from('sleep_sessions')
        .select('*')
        .eq('baby_id', currentBaby.id)
        .gte('start_time', today.toISOString())
        .lt('start_time', tomorrow.toISOString())
        .order('start_time', { ascending: false });

      // Cargar eventos de pañal
      const { data: diaperEvents, error: diaperError } = await supabase
        .from('diaper_events')
        .select('*')
        .eq('baby_id', currentBaby.id)
        .gte('timestamp', today.toISOString())
        .lt('timestamp', tomorrow.toISOString())
        .order('timestamp', { ascending: false });

      // Cargar entradas de peso (últimas 7)
      const { data: weightEntries, error: weightError } = await supabase
        .from('weight_entries')
        .select('*')
        .eq('baby_id', currentBaby.id)
        .order('timestamp', { ascending: false })
        .limit(7);

      if (feedError) {
        console.error('📊 Error cargando alimentaciones:', feedError);
        throw feedError;
      }
      if (sleepError) {
        console.error('📊 Error cargando sueño:', sleepError);
        throw sleepError;
      }
      if (diaperError) {
        console.error('📊 Error cargando pañales:', diaperError);
        throw diaperError;
      }
      if (weightError) {
        console.error('📊 Error cargando pesos:', weightError);
        throw weightError;
      }

      console.log('📊 TrackingContext: Datos cargados:', {
        feeding: feedingSessions?.length || 0,
        sleep: sleepSessions?.length || 0,
        diaper: diaperEvents?.length || 0,
        weight: weightEntries?.length || 0
      });

      setTodayData({
        feedingSessions: feedingSessions || [],
        sleepSessions: sleepSessions || [],
        diaperEvents: diaperEvents || [],
        weightEntries: weightEntries || []
      });

    } catch (err) {
      console.error('📊 TrackingContext: Error cargando datos del día:', err);
      setError('Error cargando datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveSessions = async () => {
    if (!currentBaby) return;

    try {
      console.log('📊 TrackingContext: Cargando sesiones activas...');

      // Buscar sesión de alimentación activa
      const { data: activeFeeding } = await supabase
        .from('feeding_sessions')
        .select('*')
        .eq('baby_id', currentBaby.id)
        .is('end_time', null)
        .order('start_time', { ascending: false })
        .limit(1);

      // Buscar sesión de sueño activa
      const { data: activeSleep } = await supabase
        .from('sleep_sessions')
        .select('*')
        .eq('baby_id', currentBaby.id)
        .is('end_time', null)
        .order('start_time', { ascending: false })
        .limit(1);

      setCurrentFeedingSession(activeFeeding?.[0] || null);
      setCurrentSleepSession(activeSleep?.[0] || null);

      console.log('📊 TrackingContext: Sesiones activas:', {
        feeding: !!activeFeeding?.[0],
        sleep: !!activeSleep?.[0]
      });

    } catch (error) {
      console.error('📊 TrackingContext: Error cargando sesiones activas:', error);
    }
  };

  // ============ FUNCIONES DE ALIMENTACIÓN ============

  const startFeedingSession = async (side = 'right') => {
    if (!currentBaby || !user) {
      throw new Error('Bebé o usuario no disponible');
    }

    try {
      console.log('🍼 TrackingContext: Iniciando sesión de alimentación:', side);

      const sessionData = {
        baby_id: currentBaby.id,
        caregiver_id: user.id,
        breast: side,
        start_time: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('feeding_sessions')
        .insert([sessionData])
        .select()
        .single();

      if (error) {
        console.error('🍼 Error iniciando sesión:', error);
        throw error;
      }

      console.log('🍼 TrackingContext: Sesión iniciada:', data);
      setCurrentFeedingSession(data);
      await loadTodayData();

      return data;
    } catch (error) {
      console.error('🍼 TrackingContext: Error en startFeedingSession:', error);
      throw error;
    }
  };

  const endFeedingSession = async (sessionId, notes = '') => {
    if (!sessionId) {
      throw new Error('ID de sesión requerido');
    }

    try {
      console.log('🍼 TrackingContext: Terminando sesión de alimentación:', sessionId);

      const { data, error } = await supabase
        .from('feeding_sessions')
        .update({ 
          end_time: new Date().toISOString(),
          notes: notes.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        console.error('🍼 Error terminando sesión:', error);
        throw error;
      }

      console.log('🍼 TrackingContext: Sesión terminada:', data);
      setCurrentFeedingSession(null);
      await loadTodayData();

      return data;
    } catch (error) {
      console.error('🍼 TrackingContext: Error en endFeedingSession:', error);
      throw error;
    }
  };

  // ============ FUNCIONES DE SUEÑO ============

  const startSleepSession = async () => {
    if (!currentBaby || !user) {
      throw new Error('Bebé o usuario no disponible');
    }

    try {
      console.log('😴 TrackingContext: Iniciando sesión de sueño');

      const sessionData = {
        baby_id: currentBaby.id,
        caregiver_id: user.id,
        start_time: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('sleep_sessions')
        .insert([sessionData])
        .select()
        .single();

      if (error) {
        console.error('😴 Error iniciando sesión:', error);
        throw error;
      }

      console.log('😴 TrackingContext: Sesión de sueño iniciada:', data);
      setCurrentSleepSession(data);
      await loadTodayData();

      return data;
    } catch (error) {
      console.error('😴 TrackingContext: Error en startSleepSession:', error);
      throw error;
    }
  };

  const endSleepSession = async (sessionId, notes = '') => {
    if (!sessionId) {
      throw new Error('ID de sesión requerido');
    }

    try {
      console.log('😴 TrackingContext: Terminando sesión de sueño:', sessionId);

      const { data, error } = await supabase
        .from('sleep_sessions')
        .update({ 
          end_time: new Date().toISOString(),
          notes: notes.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        console.error('😴 Error terminando sesión:', error);
        throw error;
      }

      console.log('😴 TrackingContext: Sesión de sueño terminada:', data);
      setCurrentSleepSession(null);
      await loadTodayData();

      return data;
    } catch (error) {
      console.error('😴 TrackingContext: Error en endSleepSession:', error);
      throw error;
    }
  };

  // ============ FUNCIONES DE PAÑAL ============

  const addDiaperEvent = async (type, notes = '') => {
    if (!currentBaby || !user) {
      throw new Error('Bebé o usuario no disponible');
    }

    if (!['wet', 'dirty', 'mixed'].includes(type)) {
      throw new Error('Tipo de pañal inválido');
    }

    try {
      console.log('💩 TrackingContext: Añadiendo evento de pañal:', type);

      const eventData = {
        baby_id: currentBaby.id,
        caregiver_id: user.id,
        type: type,
        timestamp: new Date().toISOString(),
        notes: notes.trim() || null,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('diaper_events')
        .insert([eventData])
        .select()
        .single();

      if (error) {
        console.error('💩 Error añadiendo evento:', error);
        throw error;
      }

      console.log('💩 TrackingContext: Evento de pañal añadido:', data);
      await loadTodayData();

      return data;
    } catch (error) {
      console.error('💩 TrackingContext: Error en addDiaperEvent:', error);
      throw error;
    }
  };

  // ============ FUNCIONES DE PESO ============

  const addWeightEntry = async (weightGrams, notes = '') => {
    if (!currentBaby || !user) {
      throw new Error('Bebé o usuario no disponible');
    }

    if (!weightGrams || weightGrams <= 0) {
      throw new Error('Peso inválido');
    }

    try {
      console.log('⚖️ TrackingContext: Añadiendo entrada de peso:', weightGrams);

      const entryData = {
        baby_id: currentBaby.id,
        caregiver_id: user.id,
        weight_grams: parseInt(weightGrams),
        timestamp: new Date().toISOString(),
        notes: notes.trim() || null,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('weight_entries')
        .insert([entryData])
        .select()
        .single();

      if (error) {
        console.error('⚖️ Error añadiendo peso:', error);
        throw error;
      }

      console.log('⚖️ TrackingContext: Entrada de peso añadida:', data);
      await loadTodayData();

      return data;
    } catch (error) {
      console.error('⚖️ TrackingContext: Error en addWeightEntry:', error);
      throw error;
    }
  };

  // ============ FUNCIONES DE UTILIDAD ============

  const getDuration = (startTime, endTime = null) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end - start;
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getTodayStats = () => {
    const feedingCount = todayData.feedingSessions.length;
    const completedFeedings = todayData.feedingSessions.filter(s => s.end_time).length;
    
    const sleepCount = todayData.sleepSessions.length;
    const completedSleep = todayData.sleepSessions.filter(s => s.end_time).length;
    
    const totalSleepTime = todayData.sleepSessions
      .filter(s => s.end_time)
      .reduce((total, session) => {
        const start = new Date(session.start_time);
        const end = new Date(session.end_time);
        return total + (end - start);
      }, 0);

    const diaperCount = todayData.diaperEvents.length;
    const wetCount = todayData.diaperEvents.filter(e => e.type === 'wet').length;
    const dirtyCount = todayData.diaperEvents.filter(e => e.type === 'dirty').length;
    const mixedCount = todayData.diaperEvents.filter(e => e.type === 'mixed').length;

    return {
      feeding: {
        total: feedingCount,
        completed: completedFeedings,
        active: !!currentFeedingSession
      },
      sleep: {
        total: sleepCount,
        completed: completedSleep,
        totalTimeMs: totalSleepTime,
        totalTimeFormatted: totalSleepTime > 0 ? getDuration(new Date(Date.now() - totalSleepTime), new Date()) : '0m',
        active: !!currentSleepSession
      },
      diaper: {
        total: diaperCount,
        wet: wetCount,
        dirty: dirtyCount,
        mixed: mixedCount
      },
      weight: {
        entries: todayData.weightEntries.length,
        latest: todayData.weightEntries[0] || null
      }
    };
  };

  // ============ VALOR DEL CONTEXTO ============

  const value = {
    // Estados
    currentFeedingSession,
    currentSleepSession,
    todayData,
    loading,
    error,
    isOnline,
    
    // Funciones de alimentación
    startFeedingSession,
    endFeedingSession,
    
    // Funciones de sueño
    startSleepSession,
    endSleepSession,
    
    // Funciones de pañal
    addDiaperEvent,
    
    // Funciones de peso
    addWeightEntry,
    
    // Funciones de utilidad
    loadTodayData,
    loadActiveSessions,
    getDuration,
    getTodayStats,
    checkAndCloseOldSessions,
    
    // Stats computadas
    stats: getTodayStats()
  };

  return (
    <TrackingContext.Provider value={value}>
      {children}
    </TrackingContext.Provider>
  );
};