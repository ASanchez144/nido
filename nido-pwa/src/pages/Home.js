// src/pages/Home.js
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useBaby } from '../contexts/BabyContext';
import { useTracking } from '../contexts/TrackingContext';
import BabySetup from '../components/baby/BabySetup';
import StoolModal from '../components/modals/StoolModal';
import './Home.css';

const Home = () => {
  const { babies, currentBaby, loading: babyLoading, error: babyError } = useBaby();
  const { 
    currentFeedingSession, 
    currentSleepSession, 
    startFeedingSession, 
    endFeedingSession,
    startSleepSession,
    endSleepSession,
    addDiaperEvent,
    getTodayStats
  } = useTracking();

  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showStoolDetails, setShowStoolDetails] = useState(false);
  const [pendingDiaperType, setPendingDiaperType] = useState('');
  const [localError, setLocalError] = useState('');
  
  // Estados para timer
  const [feedingElapsedTime, setFeedingElapsedTime] = useState(0);
  const [sleepElapsedTime, setSleepElapsedTime] = useState(0);
  const [lastBreast, setLastBreast] = useState('');

  // Refs para los timers
  const timerRef = useRef(null);
  const sleepTimerRef = useRef(null);

  // Stats del día (alineado con TrackingContext.getTodayStats)
  const todayStats = currentBaby ? getTodayStats() : {
    feeding: { total: 0, completed: 0, active: false },
    sleep: { total: 0, completed: 0, totalTimeMs: 0, totalTimeFormatted: '0m', active: false },
    diaper: { total: 0, wet: 0, dirty: 0, mixed: 0 },
    weight: { entries: 0, latest: null }
  };

  // Cargar último pecho
  useEffect(() => {
    if (currentBaby) {
      const stored = localStorage.getItem(`lastBreast_${currentBaby.id}`);
      if (stored) {
        setLastBreast(stored);
      }
    }
  }, [currentBaby]);

  // Timer alimentación OPTIMIZADO - SOLO cuando NO hay modal abierto
  useEffect(() => {
    if (showStoolDetails) return; // STOP TOTAL cuando modal está abierto
    
    if (currentFeedingSession) {
      const updateTimer = () => {
        const start = new Date(currentFeedingSession.start_time);
        const now = new Date();
        const elapsed = now - start;
        setFeedingElapsedTime(elapsed);
      };
      
      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setFeedingElapsedTime(0);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentFeedingSession, showStoolDetails]); // Para cuando se cierre el modal

  // Timer sueño OPTIMIZADO - SOLO cuando NO hay modal abierto
  useEffect(() => {
    if (showStoolDetails) return; // STOP TOTAL cuando modal está abierto
    
    if (currentSleepSession) {
      const updateTimer = () => {
        const start = new Date(currentSleepSession.start_time);
        const now = new Date();
        setSleepElapsedTime(now - start);
      };
      
      updateTimer();
      sleepTimerRef.current = setInterval(updateTimer, 1000);
    } else {
      if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
        sleepTimerRef.current = null;
      }
      setSleepElapsedTime(0);
    }
    
    return () => {
      if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
        sleepTimerRef.current = null;
      }
    };
  }, [currentSleepSession, showStoolDetails]); // Para cuando se cierre el modal

  const handleBabySetupComplete = (newBaby) => {
    console.log('✅ Home: Baby creado con éxito:', newBaby);
  };

  const handleFeedingAction = async (type, side) => {
    try {
      setLocalError('');
      
      if (currentFeedingSession) {
        await endFeedingSession(currentFeedingSession.id);
        localStorage.setItem(`lastBreast_${currentBaby.id}`, currentFeedingSession.breast);
        setLastBreast(currentFeedingSession.breast);
      } else {
        const result = await startFeedingSession(type, side);
        console.log('✅ Sesión creada:', result);
      }
    } catch (error) {
      console.error('❌ Error en alimentación:', error);
      setLocalError('Error: ' + error.message);
    }
  };

  const handleSleepAction = async () => {
    try {
      setLocalError('');
      
      if (currentSleepSession) {
        await endSleepSession(currentSleepSession.id);
      } else {
        await startSleepSession();
      }
    } catch (error) {
      console.error('Error en sueño:', error);
      setLocalError('Error: ' + error.message);
    }
  };

  const handleDiaperAction = async (type) => {
    if (type === 'dirty' || type === 'mixed') {
      setPendingDiaperType(type);
      setShowStoolDetails(true);
      setShowQuickActions(false);
      return;
    }
    
    try {
      setLocalError('');
      await addDiaperEvent(type);
      setShowQuickActions(false);
    } catch (error) {
      console.error('Error en pañal:', error);
      setLocalError('Error: ' + error.message);
    }
  };

  const handleStoolModalClose = () => {
    setShowStoolDetails(false);
    setPendingDiaperType('');
  };

  const formatDuration = (milliseconds) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const formatTimer = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getSuggestedBreast = () => {
    if (!lastBreast) return 'left';
    return lastBreast === 'left' ? 'right' : 'left';
  };

  // Loading
  if (babyLoading) {
    return (
      <div className="home-loading">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando información del bebé...</p>
        </div>
      </div>
    );
  }

  // Setup si no hay bebés
  if (babies.length === 0) {
    return <BabySetup onComplete={handleBabySetupComplete} />;
  }

  // HOME PRINCIPAL
  return (
    <div className="home-page">
      <div className="home-header">
        <h1>🪺 Baby Habits</h1>
        {currentBaby && (
          <p className="current-baby">
            Cuidando a <strong>{currentBaby.name}</strong>
          </p>
        )}
      </div>

      {/* Errores */}
      {(localError || babyError) && (
        <div className="home-error">
          <p>{localError || babyError}</p>
          <button onClick={() => setLocalError('')}>✕</button>
        </div>
      )}

      {currentBaby ? (
        <>
          {/* Estadísticas del día */}
          <div className="today-stats">
            <h3>📊 Resumen de Hoy</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-emoji">🍼</div>
                <div className="stat-number">{todayStats.feeding?.total || 0}</div>
                <div className="stat-label">Tomas</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-emoji">😴</div>
                <div className="stat-number">{formatDuration(todayStats.sleep?.totalTimeMs || 0)}</div>
                <div className="stat-label">Sueño</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-emoji">🔄</div>
                <div className="stat-number">{todayStats.diaper?.total || 0}</div>
                <div className="stat-label">Pañales</div>
              </div>
            </div>

            <div className="diaper-stats-summary">
              <span>💧 {(todayStats.diaper?.wet || 0) + (todayStats.diaper?.mixed || 0)} mojados</span>
              <span>💩 {(todayStats.diaper?.dirty || 0) + (todayStats.diaper?.mixed || 0)} con caca</span>
            </div>
          </div>

          {/* Sesiones activas CON TIMER */}
          {(currentFeedingSession || currentSleepSession) && (
            <div className="active-session">
              <h3>🔄 Sesiones Activas</h3>
              
              {currentFeedingSession && (
                <div className="feeding-session-active">
                  <p>🍼 Alimentando con pecho <strong>{currentFeedingSession.breast === 'left' ? 'izquierdo' : 'derecho'}</strong></p>
                  <p className="session-timer">{formatTimer(feedingElapsedTime)}</p>
                  <button 
                    className="end-session-btn"
                    onClick={() => handleFeedingAction('breastfeeding', currentFeedingSession.breast)}
                  >
                    ⏹️ Terminar Alimentación
                  </button>
                </div>
              )}
              
              {currentSleepSession && (
                <div className="sleep-session-active">
                  <p>😴 Durmiendo</p>
                  <p className="session-timer">{formatTimer(sleepElapsedTime)}</p>
                  <button 
                    className="end-session-btn"
                    onClick={handleSleepAction}
                  >
                    ⏰ Despertar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Acciones principales */}
          <div className="main-actions">
            
            {/* Alimentación */}
            <div className="action-section">
              <h3>🍼 Alimentación</h3>
              
              {!currentFeedingSession ? (
                <>
                  {lastBreast && (
                    <div className="feeding-suggestion">
                      <p>💡 Última toma: pecho <strong>{lastBreast === 'left' ? 'izquierdo' : 'derecho'}</strong></p>
                      <p>Se sugiere: <strong>{getSuggestedBreast() === 'left' ? 'izquierdo' : 'derecho'}</strong></p>
                    </div>
                  )}
                  
                  <div className="feeding-buttons">
                    <button 
                      className={`feeding-btn left ${getSuggestedBreast() === 'left' ? 'suggested' : ''}`}
                      onClick={() => handleFeedingAction('breastfeeding', 'left')}
                    >
                      🤱 Izquierdo
                      {getSuggestedBreast() === 'left' && <span className="suggested-text">Sugerido</span>}
                    </button>
                    
                    <button 
                      className={`feeding-btn right ${getSuggestedBreast() === 'right' ? 'suggested' : ''}`}
                      onClick={() => handleFeedingAction('breastfeeding', 'right')}
                    >
                      🤱 Derecho
                      {getSuggestedBreast() === 'right' && <span className="suggested-text">Sugerido</span>}
                    </button>
                  </div>
                </>
              ) : (
                <div className="feeding-active-info">
                  <p>✅ Sesión en curso - Ve arriba para terminarla</p>
                </div>
              )}
            </div>

            {/* Sueño */}
            <div className="action-section">
              <h3>😴 Sueño</h3>
              {!currentSleepSession ? (
                <button 
                  className="sleep-btn"
                  onClick={handleSleepAction}
                >
                  😴 Empezar a Dormir
                </button>
              ) : (
                <div className="feeding-active-info">
                  <p>✅ Durmiendo - Ve arriba para despertar</p>
                </div>
              )}
            </div>

            {/* Pañales */}
            <div className="action-section">
              <h3>🔄 Pañales</h3>
              <button 
                className="diaper-btn"
                onClick={() => setShowQuickActions(true)}
              >
                📝 Registrar Pañal
              </button>
            </div>
          </div>

          {/* Enlaces navegación MÁS PEQUEÑOS 
          <div className="home-buttons">
            <Link to="/night-mode" className="home-button night-mode-button">
              🌙 Modo Noche
            </Link>
            
            <Link to="/stats" className="home-button stats-button">
              📊 Estadísticas
            </Link>
          </div>*/}
        </>
      ) : (
        <div className="no-baby-selected">
          <p>🤔 No hay ningún bebé seleccionado</p>
          <Link to="/settings" className="setup-link">
            Configurar bebé
          </Link>
        </div>
      )}

      {/* Modal pañales */}
      {showQuickActions && (
        <div className="quick-actions-modal">
          <div className="quick-actions-content">
            <h3>🔄 Tipo de Pañal</h3>
            
            <div className="quick-actions-buttons">
              <button 
                className="wet-button"
                onClick={() => handleDiaperAction('wet')}
              >
                💧 Solo Mojado
              </button>
              
              <button 
                className="dirty-button"
                onClick={() => handleDiaperAction('dirty')}
              >
                💩 Solo Caca
              </button>
              
              <button 
                className="mixed-button"
                onClick={() => handleDiaperAction('mixed')}
              >
                💧💩 Ambos
              </button>
            </div>
            
            <button 
              className="cancel-button"
              onClick={() => setShowQuickActions(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal de detalles de caca - COMPONENTE SEPARADO */}
      <StoolModal 
        isOpen={showStoolDetails}
        onClose={handleStoolModalClose}
        diaperType={pendingDiaperType}
      />
    </div>
  );
};

export default Home;