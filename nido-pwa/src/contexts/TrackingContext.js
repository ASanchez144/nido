// src/contexts/TrackingContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import supabase from '../supabase/config';
import { useAuth } from './AuthContext';
import { useBaby } from './BabyContext';

const initialState = {
  feedingSessions: [],
  sleepSessions: [],
  diaperEvents: [],
  weightEntries: [],
  currentFeedingSession: null,
  currentSleepSession: null,
  isLoading: false,
  error: null,
  lastSyncTime: null,
  isOnline: navigator.onLine
};

function trackingReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload };
    
    case 'SET_FEEDING_SESSIONS':
      return { ...state, feedingSessions: action.payload };
    
    case 'ADD_FEEDING_SESSION':
      return {
        ...state,
        feedingSessions: [...state.feedingSessions, action.payload]
      };
    
    case 'UPDATE_FEEDING_SESSION':
      return {
        ...state,
        feedingSessions: state.feedingSessions.map(session =>
          session.id === action.payload.id ? action.payload : session
        ),
        currentFeedingSession: state.currentFeedingSession?.id === action.payload.id 
          ? action.payload 
          : state.currentFeedingSession
      };
    
    case 'DELETE_FEEDING_SESSION':
      return {
        ...state,
        feedingSessions: state.feedingSessions.filter(session => session.id !== action.payload),
        currentFeedingSession: state.currentFeedingSession?.id === action.payload 
          ? null 
          : state.currentFeedingSession
      };
    
    case 'SET_CURRENT_FEEDING_SESSION':
      return { ...state, currentFeedingSession: action.payload };
    
    case 'SET_SLEEP_SESSIONS':
      return { ...state, sleepSessions: action.payload };
    
    case 'ADD_SLEEP_SESSION':
      return {
        ...state,
        sleepSessions: [...state.sleepSessions, action.payload]
      };
    
    case 'UPDATE_SLEEP_SESSION':
      return {
        ...state,
        sleepSessions: state.sleepSessions.map(session =>
          session.id === action.payload.id ? action.payload : session
        ),
        currentSleepSession: state.currentSleepSession?.id === action.payload.id 
          ? action.payload 
          : state.currentSleepSession
      };
    
    case 'DELETE_SLEEP_SESSION':
      return {
        ...state,
        sleepSessions: state.sleepSessions.filter(session => session.id !== action.payload),
        currentSleepSession: state.currentSleepSession?.id === action.payload 
          ? null 
          : state.currentSleepSession
      };
    
    case 'SET_CURRENT_SLEEP_SESSION':
      return { ...state, currentSleepSession: action.payload };
    
    case 'SET_DIAPER_EVENTS':
      return { ...state, diaperEvents: action.payload };
    
    case 'ADD_DIAPER_EVENT':
      return {
        ...state,
        diaperEvents: [...state.diaperEvents, action.payload]
      };
    
    case 'UPDATE_DIAPER_EVENT':
      return {
        ...state,
        diaperEvents: state.diaperEvents.map(event =>
          event.id === action.payload.id ? action.payload : event
        )
      };
    
    case 'DELETE_DIAPER_EVENT':
      return {
        ...state,
        diaperEvents: state.diaperEvents.filter(event => event.id !== action.payload)
      };
    
    case 'SET_WEIGHT_ENTRIES':
      return { ...state, weightEntries: action.payload };
    
    case 'ADD_WEIGHT_ENTRY':
      return {
        ...state,
        weightEntries: [...state.weightEntries, action.payload]
      };
    
    case 'UPDATE_WEIGHT_ENTRY':
      return {
        ...state,
        weightEntries: state.weightEntries.map(entry =>
          entry.id === action.payload.id ? action.payload : entry
        )
      };
    
    case 'DELETE_WEIGHT_ENTRY':
      return {
        ...state,
        weightEntries: state.weightEntries.filter(entry => entry.id !== action.payload)
      };
    
    case 'SET_LAST_SYNC_TIME':
      return { ...state, lastSyncTime: action.payload };
    
    case 'RESET_STATE':
      return { ...initialState, isOnline: state.isOnline };
    
    default:
      return state;
  }
}

const TrackingContext = createContext();

export const useTracking = () => {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error('useTracking must be used within a TrackingProvider');
  }
  return context;
};

export const TrackingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(trackingReducer, initialState);
  const { user } = useAuth();
  const { currentBaby } = useBaby();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
      if (currentBaby) {
        syncData().catch(console.error);
      }
    };
    
    const handleOffline = () => {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: false });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentBaby]);

  // Load data when baby changes
  useEffect(() => {
    if (currentBaby && user) {
      loadDataForBaby();
    } else {
      dispatch({ type: 'RESET_STATE' });
    }
  }, [currentBaby?.id, user?.id]);

  const loadDataForBaby = async () => {
    if (!currentBaby || !user) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      console.log('📥 TrackingContext: Cargando datos para bebé:', currentBaby.name);
      
      // Cargar todas las tablas en paralelo
      const [feedingResult, sleepResult, diaperResult, weightResult] = await Promise.allSettled([
        supabase
          .from('feeding_sessions')
          .select('*')
          .eq('baby_id', currentBaby.id)
          .order('start_time', { ascending: false })
          .limit(100),
        
        supabase
          .from('sleep_sessions')
          .select('*')
          .eq('baby_id', currentBaby.id)
          .order('start_time', { ascending: false })
          .limit(100),
        
        supabase
          .from('diaper_events')
          .select('*')
          .eq('baby_id', currentBaby.id)
          .order('timestamp', { ascending: false })
          .limit(100),
        
        supabase
          .from('weight_entries')
          .select('*')
          .eq('baby_id', currentBaby.id)
          .order('timestamp', { ascending: false })
          .limit(100)
      ]);

      // Procesar resultados, incluso si algunas tablas fallan
      const feedingData = feedingResult.status === 'fulfilled' ? feedingResult.value.data || [] : [];
      const sleepData = sleepResult.status === 'fulfilled' ? sleepResult.value.data || [] : [];
      const diaperData = diaperResult.status === 'fulfilled' ? diaperResult.value.data || [] : [];
      const weightData = weightResult.status === 'fulfilled' ? weightResult.value.data || [] : [];

      console.log('📥 TrackingContext: Datos cargados:', {
        feeding: feedingData.length,
        sleep: sleepData.length,
        diaper: diaperData.length,
        weight: weightData.length
      });

      // Actualizar estado
      dispatch({ type: 'SET_FEEDING_SESSIONS', payload: feedingData });
      dispatch({ type: 'SET_SLEEP_SESSIONS', payload: sleepData });
      dispatch({ type: 'SET_DIAPER_EVENTS', payload: diaperData });
      dispatch({ type: 'SET_WEIGHT_ENTRIES', payload: weightData });

      // Verificar sesiones activas
      const activeFeeding = feedingData.find(session => !session.end_time);
      const activeSleep = sleepData.find(session => !session.end_time);
      
      dispatch({ type: 'SET_CURRENT_FEEDING_SESSION', payload: activeFeeding || null });
      dispatch({ type: 'SET_CURRENT_SLEEP_SESSION', payload: activeSleep || null });

      dispatch({ type: 'SET_LAST_SYNC_TIME', payload: new Date().toISOString() });

    } catch (error) {
      console.error('📥 TrackingContext: Error cargando datos:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al cargar los datos de seguimiento' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Feeding session methods
  const startFeedingSession = async (type, side = null) => {
    if (!currentBaby) throw new Error('No baby selected');

    const now = new Date().toISOString();
    const session = {
      baby_id: currentBaby.id,
      type,
      side,
      start_time: now,
      created_at: now,
      updated_at: now
    };

    try {
      console.log('▶️ TrackingContext: Iniciando sesión de alimentación:', type, side);
      
      const { data, error } = await supabase
        .from('feeding_sessions')
        .insert(session)
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'ADD_FEEDING_SESSION', payload: data });
      dispatch({ type: 'SET_CURRENT_FEEDING_SESSION', payload: data });

      console.log('✅ TrackingContext: Sesión de alimentación iniciada:', data.id);
      return data;
    } catch (error) {
      console.error('❌ TrackingContext: Error iniciando sesión de alimentación:', error);
      throw error;
    }
  };

  const endFeedingSession = async (sessionId, notes = null, amount = null) => {
    try {
      console.log('⏹️ TrackingContext: Finalizando sesión de alimentación:', sessionId);
      
      const now = new Date().toISOString();
      const updates = {
        end_time: now,
        notes,
        amount_ml: amount,
        updated_at: now
      };

      const { data, error } = await supabase
        .from('feeding_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'UPDATE_FEEDING_SESSION', payload: data });
      dispatch({ type: 'SET_CURRENT_FEEDING_SESSION', payload: null });

      console.log('✅ TrackingContext: Sesión de alimentación finalizada:', data.id);
      return data;
    } catch (error) {
      console.error('❌ TrackingContext: Error finalizando sesión de alimentación:', error);
      throw error;
    }
  };

  // Sleep session methods
  const startSleepSession = async (location = null) => {
    if (!currentBaby) throw new Error('No baby selected');

    const now = new Date().toISOString();
    const session = {
      baby_id: currentBaby.id,
      start_time: now,
      location,
      created_at: now,
      updated_at: now
    };

    try {
      console.log('😴 TrackingContext: Iniciando sesión de sueño');
      
      const { data, error } = await supabase
        .from('sleep_sessions')
        .insert(session)
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'ADD_SLEEP_SESSION', payload: data });
      dispatch({ type: 'SET_CURRENT_SLEEP_SESSION', payload: data });

      console.log('✅ TrackingContext: Sesión de sueño iniciada:', data.id);
      return data;
    } catch (error) {
      console.error('❌ TrackingContext: Error iniciando sesión de sueño:', error);
      throw error;
    }
  };

  const endSleepSession = async (sessionId, quality = null, notes = null) => {
    try {
      console.log('⏰ TrackingContext: Finalizando sesión de sueño:', sessionId);
      
      const now = new Date().toISOString();
      const updates = {
        end_time: now,
        quality,
        notes,
        updated_at: now
      };

      const { data, error } = await supabase
        .from('sleep_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'UPDATE_SLEEP_SESSION', payload: data });
      dispatch({ type: 'SET_CURRENT_SLEEP_SESSION', payload: null });

      console.log('✅ TrackingContext: Sesión de sueño finalizada:', data.id);
      return data;
    } catch (error) {
      console.error('❌ TrackingContext: Error finalizando sesión de sueño:', error);
      throw error;
    }
  };

  // Diaper event methods
  const addDiaperEvent = async (type, notes = null) => {
    if (!currentBaby) throw new Error('No baby selected');

    const now = new Date().toISOString();
    const event = {
      baby_id: currentBaby.id,
      type,
      timestamp: now,
      notes,
      created_at: now,
      updated_at: now
    };

    try {
      console.log('💩 TrackingContext: Añadiendo evento de pañal:', type);
      
      const { data, error } = await supabase
        .from('diaper_events')
        .insert(event)
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'ADD_DIAPER_EVENT', payload: data });

      console.log('✅ TrackingContext: Evento de pañal añadido:', data.id);
      return data;
    } catch (error) {
      console.error('❌ TrackingContext: Error añadiendo evento de pañal:', error);
      throw error;
    }
  };

  // Weight entry methods
  const addWeightEntry = async (weightGrams, timestamp = null, notes = null) => {
    if (!currentBaby) throw new Error('No baby selected');

    const now = new Date().toISOString();
    const entry = {
      baby_id: currentBaby.id,
      weight_grams: weightGrams,
      timestamp: timestamp || now,
      notes,
      created_at: now,
      updated_at: now
    };

    try {
      console.log('⚖️ TrackingContext: Añadiendo entrada de peso:', weightGrams, 'gramos');
      
      const { data, error } = await supabase
        .from('weight_entries')
        .insert(entry)
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'ADD_WEIGHT_ENTRY', payload: data });

      console.log('✅ TrackingContext: Entrada de peso añadida:', data.id);
      return data;
    } catch (error) {
      console.error('❌ TrackingContext: Error añadiendo entrada de peso:', error);
      throw error;
    }
  };

  // Update methods
  const updateFeedingSession = async (sessionId, updates) => {
    try {
      console.log('✏️ TrackingContext: Actualizando sesión de alimentación:', sessionId);
      
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('feeding_sessions')
        .update(updateData)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'UPDATE_FEEDING_SESSION', payload: data });

      console.log('✅ TrackingContext: Sesión de alimentación actualizada:', data.id);
      return data;
    } catch (error) {
      console.error('❌ TrackingContext: Error actualizando sesión de alimentación:', error);
      throw error;
    }
  };

  const updateSleepSession = async (sessionId, updates) => {
    try {
      console.log('✏️ TrackingContext: Actualizando sesión de sueño:', sessionId);
      
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('sleep_sessions')
        .update(updateData)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'UPDATE_SLEEP_SESSION', payload: data });

      console.log('✅ TrackingContext: Sesión de sueño actualizada:', data.id);
      return data;
    } catch (error) {
      console.error('❌ TrackingContext: Error actualizando sesión de sueño:', error);
      throw error;
    }
  };

  const updateDiaperEvent = async (eventId, updates) => {
    try {
      console.log('✏️ TrackingContext: Actualizando evento de pañal:', eventId);
      
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('diaper_events')
        .update(updateData)
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'UPDATE_DIAPER_EVENT', payload: data });

      console.log('✅ TrackingContext: Evento de pañal actualizado:', data.id);
      return data;
    } catch (error) {
      console.error('❌ TrackingContext: Error actualizando evento de pañal:', error);
      throw error;
    }
  };

  const updateWeightEntry = async (entryId, updates) => {
    try {
      console.log('✏️ TrackingContext: Actualizando entrada de peso:', entryId);
      
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('weight_entries')
        .update(updateData)
        .eq('id', entryId)
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'UPDATE_WEIGHT_ENTRY', payload: data });

      console.log('✅ TrackingContext: Entrada de peso actualizada:', data.id);
      return data;
    } catch (error) {
      console.error('❌ TrackingContext: Error actualizando entrada de peso:', error);
      throw error;
    }
  };

  // Delete methods
  const deleteFeedingSession = async (sessionId) => {
    try {
      console.log('🗑️ TrackingContext: Eliminando sesión de alimentación:', sessionId);
      
      const { error } = await supabase
        .from('feeding_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      dispatch({ type: 'DELETE_FEEDING_SESSION', payload: sessionId });

      console.log('✅ TrackingContext: Sesión de alimentación eliminada:', sessionId);
    } catch (error) {
      console.error('❌ TrackingContext: Error eliminando sesión de alimentación:', error);
      throw error;
    }
  };

  const deleteSleepSession = async (sessionId) => {
    try {
      console.log('🗑️ TrackingContext: Eliminando sesión de sueño:', sessionId);
      
      const { error } = await supabase
        .from('sleep_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      dispatch({ type: 'DELETE_SLEEP_SESSION', payload: sessionId });

      console.log('✅ TrackingContext: Sesión de sueño eliminada:', sessionId);
    } catch (error) {
      console.error('❌ TrackingContext: Error eliminando sesión de sueño:', error);
      throw error;
    }
  };

  const deleteDiaperEvent = async (eventId) => {
    try {
      console.log('🗑️ TrackingContext: Eliminando evento de pañal:', eventId);
      
      const { error } = await supabase
        .from('diaper_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      dispatch({ type: 'DELETE_DIAPER_EVENT', payload: eventId });

      console.log('✅ TrackingContext: Evento de pañal eliminado:', eventId);
    } catch (error) {
      console.error('❌ TrackingContext: Error eliminando evento de pañal:', error);
      throw error;
    }
  };

  const deleteWeightEntry = async (entryId) => {
    try {
      console.log('🗑️ TrackingContext: Eliminando entrada de peso:', entryId);
      
      const { error } = await supabase
        .from('weight_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      dispatch({ type: 'DELETE_WEIGHT_ENTRY', payload: entryId });

      console.log('✅ TrackingContext: Entrada de peso eliminada:', entryId);
    } catch (error) {
      console.error('❌ TrackingContext: Error eliminando entrada de peso:', error);
      throw error;
    }
  };

  // Sync method
  const syncData = async () => {
    if (!currentBaby || !state.isOnline) return;

    try {
      console.log('🔄 TrackingContext: Sincronizando datos...');
      await loadDataForBaby();
      console.log('✅ TrackingContext: Datos sincronizados exitosamente');
    } catch (error) {
      console.error('❌ TrackingContext: Error sincronizando datos:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al sincronizar los datos' });
    }
  };

  // Utility methods
  const getTodayStats = () => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // Feeding count
    const feedingCount = state.feedingSessions.filter(session => {
      const sessionDate = new Date(session.start_time);
      return sessionDate >= todayStart && sessionDate < todayEnd;
    }).length;

    // Sleep duration
    const todaySleepSessions = state.sleepSessions.filter(session => {
      const sessionDate = new Date(session.start_time);
      return sessionDate >= todayStart && sessionDate < todayEnd && session.end_time;
    });

    const sleepDuration = todaySleepSessions.reduce((total, session) => {
      if (session.end_time) {
        const duration = new Date(session.end_time).getTime() - new Date(session.start_time).getTime();
        return total + duration;
      }
      return total;
    }, 0);

    // Diaper count
    const todayDiapers = state.diaperEvents.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= todayStart && eventDate < todayEnd;
    });

    const diaperCount = {
      wet: todayDiapers.filter(e => e.type === 'wet').length,
      dirty: todayDiapers.filter(e => e.type === 'dirty').length,
      mixed: todayDiapers.filter(e => e.type === 'mixed').length,
      total: todayDiapers.length
    };

    // Last weight
    const lastWeight = state.weightEntries
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    return {
      feedingCount,
      sleepDuration,
      diaperCount,
      lastWeight
    };
  };

  const contextValue = {
    ...state,
    // Feeding methods
    startFeedingSession,
    endFeedingSession,
    updateFeedingSession,
    deleteFeedingSession,
    // Sleep methods
    startSleepSession,
    endSleepSession,
    updateSleepSession,
    deleteSleepSession,
    // Diaper methods
    addDiaperEvent,
    updateDiaperEvent,
    deleteDiaperEvent,
    // Weight methods
    addWeightEntry,
    updateWeightEntry,
    deleteWeightEntry,
    // Sync methods
    syncData,
    // Utility methods
    getTodayStats
  };

  return (
    <TrackingContext.Provider value={contextValue}>
      {children}
    </TrackingContext.Provider>
  );
};