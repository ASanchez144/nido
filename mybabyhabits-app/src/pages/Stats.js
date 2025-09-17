// src/pages/Stats.js
import React, { useState, useEffect } from 'react';
import { useTracking } from '../contexts/TrackingContext';
import { useBaby } from '../contexts/BabyContext';
import './Stats.css';

const Stats = () => {
  const { todayData, getStoolColorLabel, getStoolTextureLabel } = useTracking();
  const { currentBaby } = useBaby();
  const [weekData, setWeekData] = useState({
    feedingSessions: [],
    sleepSessions: [],
    diaperEvents: []
  });

  // Cargar datos de la semana
  useEffect(() => {
    if (currentBaby) {
      loadWeekData();
    }
  }, [currentBaby]);

  const loadWeekData = async () => {
    if (!currentBaby) return;

    try {
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);

      const supabase = (await import('../supabase/config')).default;

      const [feedingResult, sleepResult, diaperResult] = await Promise.allSettled([
        supabase
          .from('feeding_sessions')
          .select('*')
          .eq('baby_id', currentBaby.id)
          .gte('start_time', weekAgo.toISOString())
          .order('start_time', { ascending: false }),
        
        supabase
          .from('sleep_sessions')
          .select('*')
          .eq('baby_id', currentBaby.id)
          .gte('start_time', weekAgo.toISOString())
          .order('start_time', { ascending: false }),
        
        supabase
          .from('diaper_events')
          .select('*')
          .eq('baby_id', currentBaby.id)
          .gte('timestamp', weekAgo.toISOString())
          .order('timestamp', { ascending: false })
      ]);

      setWeekData({
        feedingSessions: feedingResult.status === 'fulfilled' ? feedingResult.value.data || [] : [],
        sleepSessions: sleepResult.status === 'fulfilled' ? sleepResult.value.data || [] : [],
        diaperEvents: diaperResult.status === 'fulfilled' ? diaperResult.value.data || [] : []
      });

    } catch (error) {
      console.error('Error cargando datos de la semana:', error);
    }
  };

  // Calcular estadísticas de alimentación
  const calculateFeedingStats = () => {
    const leftBreastSessions = weekData.feedingSessions.filter(s => s.side === 'left').length;
    const rightBreastSessions = weekData.feedingSessions.filter(s => s.side === 'right').length;
    const bothBreastSessions = weekData.feedingSessions.filter(s => !s.side || s.side === 'both').length;
    
    const total = leftBreastSessions + rightBreastSessions + bothBreastSessions;
    
    if (total === 0) {
      return { leftBreast: 0, rightBreast: 0, bothBreasts: 0, totalToday: '0m', average: '0m', count: 0 };
    }

    const leftPercent = Math.round((leftBreastSessions / total) * 100);
    const rightPercent = Math.round((rightBreastSessions / total) * 100);
    const bothPercent = Math.round((bothBreastSessions / total) * 100);

    // Calcular duración total de hoy
    const todayFeedings = todayData.feedingSessions.filter(s => s.end_time);
    const totalTodayMinutes = todayFeedings.reduce((total, session) => {
      const start = new Date(session.start_time);
      const end = new Date(session.end_time);
      return total + Math.floor((end - start) / (1000 * 60));
    }, 0);

    // Calcular promedio semanal
    const weekFeedings = weekData.feedingSessions.filter(s => s.end_time);
    const totalWeekMinutes = weekFeedings.reduce((total, session) => {
      const start = new Date(session.start_time);
      const end = new Date(session.end_time);
      return total + Math.floor((end - start) / (1000 * 60));
    }, 0);
    const averageMinutes = weekFeedings.length > 0 ? Math.floor(totalWeekMinutes / weekFeedings.length) : 0;

    return {
      leftBreast: leftPercent,
      rightBreast: rightPercent,
      bothBreasts: bothPercent,
      totalToday: formatDuration(totalTodayMinutes),
      average: formatDuration(averageMinutes),
      count: todayData.feedingSessions.length
    };
  };

  // Calcular estadísticas de sueño
  const calculateSleepStats = () => {
    const todaySleepSessions = todayData.sleepSessions.filter(s => s.end_time);
    
    const totalTodayMinutes = todaySleepSessions.reduce((total, session) => {
      const start = new Date(session.start_time);
      const end = new Date(session.end_time);
      return total + Math.floor((end - start) / (1000 * 60));
    }, 0);

    const averageNapMinutes = todaySleepSessions.length > 0 
      ? Math.floor(totalTodayMinutes / todaySleepSessions.length) 
      : 0;

    return {
      totalToday: formatDuration(totalTodayMinutes),
      naps: todaySleepSessions.length,
      averageNap: formatDuration(averageNapMinutes),
      quality: totalTodayMinutes > 240 ? 'Buena' : totalTodayMinutes > 120 ? 'Regular' : 'Poca'
    };
  };

  // Calcular estadísticas de pañales - CORREGIDO PARA CONTAR "AMBOS" CORRECTAMENTE
  const calculateDiaperStats = () => {
    const wetCount = todayData.diaperEvents.filter(e => e.type === 'wet').length;
    const dirtyCount = todayData.diaperEvents.filter(e => e.type === 'dirty').length;
    const mixedCount = todayData.diaperEvents.filter(e => e.type === 'mixed').length;
    
    // Buscar último pañal con caca
    const lastDirtyEvent = todayData.diaperEvents
      .filter(e => e.type === 'dirty' || e.type === 'mixed')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    
    let lastPoop = 'Nunca';
    if (lastDirtyEvent) {
      const now = new Date();
      const eventTime = new Date(lastDirtyEvent.timestamp);
      const diffMinutes = Math.floor((now - eventTime) / (1000 * 60));
      
      if (diffMinutes < 60) {
        lastPoop = `${diffMinutes} min`;
      } else {
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        lastPoop = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
      }
    }

    return {
      wet: wetCount + mixedCount, // "Ambos" cuenta como mojado también
      dirty: dirtyCount + mixedCount, // "Ambos" cuenta como caca también
      total: wetCount + dirtyCount + mixedCount,
      lastPoop
    };
  };

  // NUEVA FUNCIÓN: Calcular estadísticas detalladas de caca
  const calculateStoolStats = () => {
    // Eventos de caca de hoy (dirty + mixed)
    const todayStoolEvents = todayData.diaperEvents.filter(e => 
      e.type === 'dirty' || e.type === 'mixed'
    );

    // Eventos de caca de la semana
    const weekStoolEvents = weekData.diaperEvents.filter(e => 
      e.type === 'dirty' || e.type === 'mixed'
    );

    // Contar colores más frecuentes (solo de hoy)
    const colorCounts = {};
    const textureCounts = {};
    
    todayStoolEvents.forEach(event => {
      if (event.stool_color) {
        colorCounts[event.stool_color] = (colorCounts[event.stool_color] || 0) + 1;
      }
      if (event.stool_texture) {
        textureCounts[event.stool_texture] = (textureCounts[event.stool_texture] || 0) + 1;
      }
    });

    // Color y textura más frecuentes
    const mostFrequentColor = Object.keys(colorCounts).length > 0 
      ? Object.keys(colorCounts).reduce((a, b) => colorCounts[a] > colorCounts[b] ? a : b)
      : null;
    
    const mostFrequentTexture = Object.keys(textureCounts).length > 0
      ? Object.keys(textureCounts).reduce((a, b) => textureCounts[a] > textureCounts[b] ? a : b)
      : null;

    // Eventos con mocos
    const withMucusToday = todayStoolEvents.filter(e => e.has_mucus).length;

    // Promedio semanal de cacas por día
    const weeklyAverage = weekStoolEvents.length > 0 ? (weekStoolEvents.length / 7).toFixed(1) : '0';

    // Último evento con detalles
    const lastDetailedEvent = todayStoolEvents
      .filter(e => e.stool_color || e.stool_texture)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

    return {
      todayCount: todayStoolEvents.length,
      weeklyAverage,
      mostFrequentColor,
      mostFrequentTexture,
      withMucusToday,
      lastDetailedEvent,
      hasDetailedData: todayStoolEvents.some(e => e.stool_color || e.stool_texture)
    };
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const feedingStats = calculateFeedingStats();
  const sleepStats = calculateSleepStats();
  const diaperStats = calculateDiaperStats();
  const stoolStats = calculateStoolStats(); // NUEVA estadística

  if (!currentBaby) {
    return (
      <div className="stats-page">
        <h2>Estadísticas</h2>
        <div className="stats-card">
          <p>Selecciona un bebé para ver las estadísticas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-page">
      <h2>Estadísticas de {currentBaby.name}</h2>
      
      <div className="stats-card">
        <h3>Uso de Pechos (Esta Semana)</h3>
        <div className="progress-bars">
          <div className="progress-item">
            <div className="progress-label">
              <span>Pecho Izquierdo</span>
              <span>{feedingStats.leftBreast}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill left-breast" 
                style={{width: `${feedingStats.leftBreast}%`}}
              ></div>
            </div>
          </div>
          
          <div className="progress-item">
            <div className="progress-label">
              <span>Pecho Derecho</span>
              <span>{feedingStats.rightBreast}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill right-breast" 
                style={{width: `${feedingStats.rightBreast}%`}}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="stats-card">
        <h3>Patrones de Sueño</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{sleepStats.totalToday}</div>
            <div className="stat-label">Sueño total hoy</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{sleepStats.naps}</div>
            <div className="stat-label">Siestas</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{sleepStats.averageNap}</div>
            <div className="stat-label">Siesta promedio</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{sleepStats.quality === 'Buena' ? '😴' : sleepStats.quality === 'Regular' ? '😊' : '😔'}</div>
            <div className="stat-label">Calidad: {sleepStats.quality}</div>
          </div>
        </div>
      </div>
      
      <div className="stats-card">
        <h3>Registro de Pañales (Hoy)</h3>
        <div className="diaper-stats">
          <div className="diaper-stat wet">
            <div className="diaper-value">{diaperStats.wet}</div>
            <div className="diaper-label">💧 Mojados</div>
          </div>
          <div className="diaper-stat dirty">
            <div className="diaper-value">{diaperStats.dirty}</div>
            <div className="diaper-label">💩 Con caca</div>
          </div>
          <div className="diaper-stat total">
            <div className="diaper-value">{diaperStats.total}</div>
            <div className="diaper-label">📊 Total</div>
          </div>
        </div>
        <div className="last-poop">
          <span>Última caca: hace {diaperStats.lastPoop}</span>
        </div>
      </div>

      {/* NUEVA SECCIÓN: Detalles de Caca */}
      <div className="stats-card">
        <h3>💩 Análisis de Cacas (Hoy)</h3>
        
        {stoolStats.hasDetailedData ? (
          <>
            <div className="stool-summary">
              <div className="stool-stat">
                <div className="stool-value">{stoolStats.todayCount}</div>
                <div className="stool-label">Cacas hoy</div>
              </div>
              <div className="stool-stat">
                <div className="stool-value">{stoolStats.weeklyAverage}</div>
                <div className="stool-label">Promedio/día</div>
              </div>
              <div className="stool-stat">
                <div className="stool-value">{stoolStats.withMucusToday}</div>
                <div className="stool-label">Con mocos</div>
              </div>
            </div>

            {/* Características más frecuentes */}
            <div className="stool-details">
              {stoolStats.mostFrequentColor && (
                <div className="stool-detail-item">
                  <span className="detail-label">Color más frecuente:</span>
                  <span className="detail-value">
                    {getStoolColorLabel ? getStoolColorLabel(stoolStats.mostFrequentColor) : stoolStats.mostFrequentColor}
                  </span>
                </div>
              )}
              
              {stoolStats.mostFrequentTexture && (
                <div className="stool-detail-item">
                  <span className="detail-label">Textura más frecuente:</span>
                  <span className="detail-value">
                    {getStoolTextureLabel ? getStoolTextureLabel(stoolStats.mostFrequentTexture) : stoolStats.mostFrequentTexture}
                  </span>
                </div>
              )}
            </div>

            {/* Último evento detallado */}
            {stoolStats.lastDetailedEvent && (
              <div className="last-stool-event">
                <h4>Última caca registrada:</h4>
                <div className="event-details">
                  <span className="event-time">
                    {new Date(stoolStats.lastDetailedEvent.timestamp).toLocaleTimeString('es', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  <div className="event-characteristics">
                    {stoolStats.lastDetailedEvent.stool_color && (
                      <span className="characteristic">
                        🎨 {getStoolColorLabel ? getStoolColorLabel(stoolStats.lastDetailedEvent.stool_color) : stoolStats.lastDetailedEvent.stool_color}
                      </span>
                    )}
                    {stoolStats.lastDetailedEvent.stool_texture && (
                      <span className="characteristic">
                        🥄 {getStoolTextureLabel ? getStoolTextureLabel(stoolStats.lastDetailedEvent.stool_texture) : stoolStats.lastDetailedEvent.stool_texture}
                      </span>
                    )}
                    {stoolStats.lastDetailedEvent.has_mucus && (
                      <span className="characteristic mucus">🫧 Con mocos</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="no-stool-data">
            <p>📝 Aún no hay detalles de caca registrados hoy</p>
            <p className="hint">Registra los detalles de color y textura para ver estadísticas aquí</p>
          </div>
        )}
      </div>
      
      <div className="stats-card">
        <h3>Tiempo Total de Lactancia</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{feedingStats.totalToday}</div>
            <div className="stat-label">Hoy</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{feedingStats.average}</div>
            <div className="stat-label">Promedio</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{feedingStats.count}</div>
            <div className="stat-label">Tomas</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{weekData.feedingSessions.length}</div>
            <div className="stat-label">Esta semana</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;