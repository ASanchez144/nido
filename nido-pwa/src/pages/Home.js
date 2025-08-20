// src/pages/Home.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBaby } from '../contexts/BabyContext';
import { useTracking } from '../contexts/TrackingContext';
import BabySetup from '../components/baby/BabySetup';
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
    getTodayStats,
    loading: trackingLoading
  } = useTracking();

  const [showQuickActions, setShowQuickActions] = useState(false);
  const [localError, setLocalError] = useState('');

  // Stats del día
  const todayStats = currentBaby ? getTodayStats() : {
    feedingCount: 0,
    sleepDuration: 0,
    diaperCount: { total: 0, wet: 0, dirty: 0, mixed: 0 }
  };

  const handleBabySetupComplete = (newBaby) => {
    console.log('✅ Home: Baby setup completed:', newBaby);
    // El BabyContext ya maneja la selección automática
  };

  const handleFeedingAction = async (type, side) => {
    try {
      setLocalError('');
      
      if (currentFeedingSession) {
        await endFeedingSession(currentFeedingSession.id);
      } else {
        await startFeedingSession(type, side);
      }
    } catch (error) {
      console.error('Error en alimentación:', error);
      setLocalError('Error al manejar la alimentación: ' + error.message);
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
      setLocalError('Error al manejar el sueño: ' + error.message);
    }
  };

  const handleDiaperAction = async (type) => {
    try {
      setLocalError('');
      await addDiaperEvent(type);
      setShowQuickActions(false);
    } catch (error) {
      console.error('Error en pañal:', error);
      setLocalError('Error al registrar el pañal: ' + error.message);
    }
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

  // Mostrar setup si no hay bebés
  if (!babyLoading && babies.length === 0) {
    return <BabySetup onComplete={handleBabySetupComplete} />;
  }

  // Mostrar loading
  if (babyLoading || trackingLoading) {
    return (
      <div className="home-loading">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando información...</p>
        </div>
      </div>
    );
  }

  // Modal de acciones rápidas para pañales
  const QuickActions = () => (
    <div className="quick-actions-modal">
      <div className="quick-actions-content">
        <h3>Registrar Pañal</h3>
        
        <div className="quick-actions-buttons">
          <button 
            className="wet-button"
            onClick={() => handleDiaperAction('wet')}
          >
            💧 Mojado
          </button>
          
          <button 
            className="dirty-button"
            onClick={() => handleDiaperAction('dirty')}
          >
            💩 Sucio
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
  );

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>🪺 Nido</h1>
        {currentBaby && (
          <p className="current-baby">
            Cuidando a <strong>{currentBaby.name}</strong>
          </p>
        )}
      </div>

      {(localError || babyError) && (
        <div className="home-error">
          <p>❌ {localError || babyError}</p>
          <button onClick={() => setLocalError('')}>✕</button>
        </div>
      )}

      {currentBaby ? (
        <>
          {/* Stats del día */}
          <div className="today-stats">
            <h3>📊 Resumen de Hoy</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-emoji">🍼</span>
                <span className="stat-number">{todayStats.feedingCount}</span>
                <span className="stat-label">Tomas</span>
              </div>
              <div className="stat-card">
                <span className="stat-emoji">😴</span>
                <span className="stat-number">{formatDuration(todayStats.sleepDuration)}</span>
                <span className="stat-label">Sueño</span>
              </div>
              <div className="stat-card">
                <span className="stat-emoji">💩</span>
                <span className="stat-number">{todayStats.diaperCount.total}</span>
                <span className="stat-label">Pañales</span>
              </div>
            </div>
          </div>

          {/* Acciones principales */}
          <div className="main-actions">
            <h3>⚡ Acciones Rápidas</h3>
            
            {/* Alimentación */}
            <div className="action-section">
              <h4>🍼 Alimentación</h4>
              {currentFeedingSession ? (
                <div className="active-session">
                  <p>
                    Sesión activa: {currentFeedingSession.type} 
                    {currentFeedingSession.side && ` (${currentFeedingSession.side})`}
                  </p>
                  <p className="session-timer">
                    ⏱️ {formatDuration(Date.now() - new Date(currentFeedingSession.start_time).getTime())}
                  </p>
                  <button 
                    className="end-session-btn"
                    onClick={() => handleFeedingAction()}
                  >
                    ⏹️ Terminar Sesión
                  </button>
                </div>
              ) : (
                <div className="feeding-buttons">
                  <button 
                    className="feeding-btn left"
                    onClick={() => handleFeedingAction('breastfeeding', 'left')}
                  >
                    ← Pecho Izquierdo
                  </button>
                  <button 
                    className="feeding-btn right"
                    onClick={() => handleFeedingAction('breastfeeding', 'right')}
                  >
                    Pecho Derecho →
                  </button>
                  <button 
                    className="feeding-btn bottle"
                    onClick={() => handleFeedingAction('bottle', null)}
                  >
                    🍼 Biberón
                  </button>
                </div>
              )}
            </div>

            {/* Sueño */}
            <div className="action-section">
              <h4>😴 Sueño</h4>
              {currentSleepSession ? (
                <div className="active-session">
                  <p>Durmiendo...</p>
                  <p className="session-timer">
                    ⏱️ {formatDuration(Date.now() - new Date(currentSleepSession.start_time).getTime())}
                  </p>
                  <button 
                    className="end-session-btn"
                    onClick={handleSleepAction}
                  >
                    ⏰ Despertar
                  </button>
                </div>
              ) : (
                <button 
                  className="sleep-btn"
                  onClick={handleSleepAction}
                >
                  😴 Empezar Sueño
                </button>
              )}
            </div>

            {/* Pañales */}
            <div className="action-section">
              <h4>💩 Pañales</h4>
              <button 
                className="diaper-btn"
                onClick={() => setShowQuickActions(true)}
              >
                📝 Registrar Cambio
              </button>
              <div className="diaper-stats-summary">
                <span>Hoy: {todayStats.diaperCount.total} cambios</span>
                <span>(💧{todayStats.diaperCount.wet} 💩{todayStats.diaperCount.dirty})</span>
              </div>
            </div>
          </div>

          {/* Enlaces de navegación */}
          <div className="navigation-links">
            <Link to="/night-mode" className="nav-link night-mode">
              🌙 Modo Noche
            </Link>
            <Link to="/stats" className="nav-link stats">
              📊 Estadísticas
            </Link>
            <Link to="/settings" className="nav-link settings">
              ⚙️ Configuración
            </Link>
          </div>
        </>
      ) : (
        <div className="no-baby-selected">
          <p>🤔 No hay ningún bebé seleccionado</p>
          <Link to="/settings" className="setup-link">
            Configurar bebé
          </Link>
        </div>
      )}

      {showQuickActions && <QuickActions />}
    </div>
  );
};

export default Home;