// src/contexts/TrackingContext.js
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
  
  const [currentFeedingSession, setCurrentFeedingSession] = useState(null);
  const [currentSleepSession, setCurrentSleepSession] = useState(null);
  const [todayData, setTodayData] = useState({
    feedingSessions: [],
    sleepSessions: [],
    diaperEvents: []
  });
  const [loading, setLoading] = useState(false);

  // Cargar datos cuando cambia el bebé
  useEffect(() => {
    if (currentBaby) {
      loadTodayData();
      loadActiveSessions();
    } else {
      setTodayData({
        feedingSessions: [],
        sleepSessions: [],
        diaperEvents: []
      });
      setCurrentFeedingSession(null);
      setCurrentSleepSession(null);
    }
  }, [currentBaby]);

  const loadTodayData = async () => {
    if (!currentBaby) return;
  
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
  
      const { data: feedingSessions, error: feedError } = await supabase
        .from('feeding_sessions')
        .select('*')
        .eq('baby_id', currentBaby.id)
        .gte('start_time', today.toISOString())
        .lt('start_time', tomorrow.toISOString());
  
      const { data: sleepSessions, error: sleepError } = await supabase
        .from('sleep_sessions')
        .select('*')
        .eq('baby_id', currentBaby.id)
        .gte('start_time', today.toISOString())
        .lt('start_time', tomorrow.toISOString());
  
      const { data: diaperEvents, error: diaperError } = await supabase
        .from('diaper_events')
        .select('*')
        .eq('baby_id', currentBaby.id)
        .gte('timestamp', today.toISOString())
        .lt('timestamp', tomorrow.toISOString());
  
      if (feedError) console.error('Feed error:', feedError);
      if (sleepError) console.error('Sleep error:', sleepError);
      if (diaperError) console.error('Diaper error:', diaperError);
  
      setTodayData({
        feedingSessions: feedingSessions || [],
        sleepSessions: sleepSessions || [],
        diaperEvents: diaperEvents || []
      });
  
    } catch (error) {
      console.error('Error cargando datos del día:', error);
    }
  };

  const loadActiveSessions = async () => {
    if (!currentBaby) return;

    try {
      // Buscar sesión de alimentación activa
      const { data: activeFeeding } = await supabase
        .from('feeding_sessions')
        .select('*')
        .eq('baby_id', currentBaby.id)
        .is('end_time', null)
        .limit(1);

      setCurrentFeedingSession(activeFeeding?.[0] || null);

      // Buscar sesión de sueño activa
      const { data: activeSleep } = await supabase
        .from('sleep_sessions')
        .select('*')
        .eq('baby_id', currentBaby.id)
        .is('end_time', null)
        .limit(1);

      setCurrentSleepSession(activeSleep?.[0] || null);

    } catch (error) {
      console.error('Error cargando sesiones activas:', error);
    }
  };

  const startFeedingSession = async (type, side = null) => {
    if (!currentBaby || !user) throw new Error('Bebé o usuario no disponible');

    try {
      const sessionData = {
        baby_id: currentBaby.id,
        caregiver_id: user.id,
        breast: side === 'left' ? 'left' : 'right',
        start_time: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('feeding_sessions')
        .insert([sessionData])
        .select()
        .single();

      if (error) throw error;

      setCurrentFeedingSession(data);
      loadTodayData();

      return data;
    } catch (error) {
      console.error('Error iniciando sesión de alimentación:', error);
      throw error;
    }
  };

  const endFeedingSession = async (sessionId) => {
    try {
      const { data, error } = await supabase
        .from('feeding_sessions')
        .update({ 
          end_time: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      setCurrentFeedingSession(null);
      loadTodayData();

      return data;
    } catch (error) {
      console.error('Error terminando sesión de alimentación:', error);
      throw error;
    }
  };

  const startSleepSession = async () => {
    if (!currentBaby || !user) throw new Error('Bebé o usuario no disponible');

    try {
      const sessionData = {
        baby_id: currentBaby.id,
        caregiver_id: user.id,
        start_time: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('sleep_sessions')
        .insert([sessionData])
        .select()
        .single();

      if (error) throw error;

      setCurrentSleepSession(data);
      loadTodayData();

      return data;
    } catch (error) {
      console.error('Error iniciando sesión de sueño:', error);
      throw error;
    }
  };

  const endSleepSession = async (sessionId) => {
    try {
      const { data, error } = await supabase
        .from('sleep_sessions')
        .update({ 
          end_time: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      setCurrentSleepSession(null);
      loadTodayData();

      return data;
    } catch (error) {
      console.error('Error terminando sesión de sueño:', error);
      throw error;
    }
  };

  const addDiaperEvent = async (type, stoolDetails = null) => {
    if (!currentBaby || !user) throw new Error('Bebé o usuario no disponible');

    try {
      const eventData = {
        baby_id: currentBaby.id,
        caregiver_id: user.id,
        type: type,
        timestamp: new Date().toISOString()
      };

      // Añadir detalles de caca si se proporcionan
      if (stoolDetails && (type === 'dirty' || type === 'mixed')) {
        if (stoolDetails.color) eventData.stool_color = stoolDetails.color;
        if (stoolDetails.texture) eventData.stool_texture = stoolDetails.texture;
        if (stoolDetails.hasMucus !== undefined) eventData.has_mucus = stoolDetails.hasMucus;
      }

      const { data, error } = await supabase
        .from('diaper_events')
        .insert([eventData])
        .select()
        .single();

      if (error) throw error;

      loadTodayData();

      return data;
    } catch (error) {
      console.error('Error agregando evento de pañal:', error);
      throw error;
    }
  };

  const getTodayStats = () => {
    const feedingCount = todayData.feedingSessions.length;
    
    const sleepDuration = todayData.sleepSessions
      .filter(s => s.end_time)
      .reduce((total, session) => {
        const start = new Date(session.start_time);
        const end = new Date(session.end_time);
        return total + (end - start);
      }, 0);
  
    const diaperCount = {
      total: todayData.diaperEvents.length,
      wet: todayData.diaperEvents.filter(e => e.type === 'wet').length,
      dirty: todayData.diaperEvents.filter(e => e.type === 'dirty').length,
      mixed: todayData.diaperEvents.filter(e => e.type === 'mixed').length
    };
  
    return {
      feedingCount,
      sleepDuration,
      diaperCount
    };
  };

  const value = {
    currentFeedingSession,
    currentSleepSession,
    todayData,
    loading,
    startFeedingSession,
    endFeedingSession,
    startSleepSession,
    endSleepSession,
    addDiaperEvent,
    getTodayStats,
    loadTodayData
  };

  return (
    <TrackingContext.Provider value={value}>
      {children}
    </TrackingContext.Provider>
  );
};