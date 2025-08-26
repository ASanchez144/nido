// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    getTodayStats
  } = useTracking();

  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showStoolDetails, setShowStoolDetails] = useState(false);
  const [pendingDiaperType, setPendingDiaperType] = useState('');
  const [stoolDetails, setStoolDetails] = useState({
    color: '',
    texture: '',
    hasMucus: false
  });
  const [localError, setLocalError] = useState('');
  
  // Estados para timer
  const [feedingElapsedTime, setFeedingElapsedTime] = useState(0);
  const [sleepElapsedTime, setSleepElapsedTime] = useState(0);
  const [lastBreast, setLastBreast] = useState('');

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

  // Timer alimentación CON DEBUG
  useEffect(() => {
    console.log('🔄 Timer alimentación - currentFeedingSession:', currentFeedingSession);
    
    let interval;
    if (currentFeedingSession) {
      console.log('⏱️ Iniciando timer para sesión:', currentFeedingSession);
      
      const updateTimer = () => {
        const start = new Date(currentFeedingSession.start_time);
        const now = new Date();
        const elapsed = now - start;
        setFeedingElapsedTime(elapsed);
        console.log('⏰ Timer actualizado:', { start: start.toLocaleTimeString(), elapsed });
      };
      
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      console.log('❌ No hay sesión activa, reseteando timer');
      setFeedingElapsedTime(0);
    }
    
    return () => {
      if (interval) {
        console.log('🧹 Limpiando interval de alimentación');
        clearInterval(interval);
      }
    };
  }, [currentFeedingSession]);

  // Timer sueño
  useEffect(() => {
    let interval;
    if (currentSleepSession) {
      const updateTimer = () => {
        const start = new Date(currentSleepSession.start_time);
        const now = new Date();
        setSleepElapsedTime(now - start);
      };
      
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setSleepElapsedTime(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentSleepSession]);

  const handleBabySetupComplete = (newBaby) => {
    console.log('✅ Home: Baby creado con éxito:', newBaby);
  };

  const handleFeedingAction = async (type, side) => {
    try {
      setLocalError('');
      
      console.log('🍼 handleFeedingAction llamado:', { type, side, currentFeedingSession });
      
      if (currentFeedingSession) {
        console.log('⏹️ Terminando sesión existente:', currentFeedingSession.id);
        await endFeedingSession(currentFeedingSession.id);
        // Guardar último pecho
        localStorage.setItem(`lastBreast_${currentBaby.id}`, currentFeedingSession.breast);
        setLastBreast(currentFeedingSession.breast);
      } else {
        console.log('▶️ Iniciando nueva sesión:', { type, side });
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

  const handleStoolSubmit = async () => {
    try {
      setLocalError('');
      await addDiaperEvent(pendingDiaperType, stoolDetails);
      setShowStoolDetails(false);
      setStoolDetails({ color: '', texture: '', hasMucus: false });
      setPendingDiaperType('');
    } catch (error) {
      console.error('Error en pañal:', error);
      setLocalError('Error: ' + error.message);
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

  // Modal de detalles de caca
  const StoolDetailsModal = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '25px',
        width: '90%',
        maxWidth: '400px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <h3 style={{ margin: '0 0 20px 0', textAlign: 'center', color: '#007bff' }}>
          Detalles de la Caca
        </h3>
        
        {/* Selector de Color */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Color:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { value: 'yellow', label: '🟡 Amarillo' },
              { value: 'brown', label: '🟤 Marrón' },
              { value: 'green', label: '🟢 Verde' },
              { value: 'orange', label: '🟠 Naranja' },
              { value: 'red', label: '🔴 Rojizo' },
              { value: 'black', label: '⚫ Negro' },
              { value: 'white', label: '⚪ Blanco' },
              { value: 'dark_green', label: '🟢 Verde oscuro' }
            ].map(color => (
              <button
                key={color.value}
                onClick={() => setStoolDetails(prev => ({ ...prev, color: color.value }))}
                style={{
                  padding: '10px 8px',
                  border: stoolDetails.color === color.value ? '3px solid #007bff' : '2px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: stoolDetails.color === color.value ? '#f0f8ff' : 'white',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textAlign: 'center'
                }}
              >
                {color.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selector de Textura */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Textura:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { value: 'soft_seedy', label: '🌱 Suave con semillitas' },
              { value: 'watery', label: '💧 Líquida/aguada' },
              { value: 'pasty', label: '🥜 Pastosa' },
              { value: 'firm_formed', label: '🥖 Firme y formada' },
              { value: 'soft_formed', label: '🍞 Suave pero formada' },
              { value: 'hard_pellets', label: '🔵 Bolitas duras' },
              { value: 'very_watery', label: '🌊 Muy líquida' },
              { value: 'mucousy', label: '🫧 Con mucosidad' }
            ].map(texture => (
              <button
                key={texture.value}
                onClick={() => setStoolDetails(prev => ({ ...prev, texture: texture.value }))}
                style={{
                  padding: '12px 8px',
                  border: stoolDetails.texture === texture.value ? '3px solid #007bff' : '2px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: stoolDetails.texture === texture.value ? '#f0f8ff' : 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textAlign: 'center'
                }}
              >
                {texture.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mocos */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={stoolDetails.hasMucus}
              onChange={(e) => setStoolDetails(prev => ({ ...prev, hasMucus: e.target.checked }))}
              style={{ marginRight: '8px' }}
            />
            <span>🟢 Contiene mocos</span>
          </label>
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleStoolSubmit}
            style={{
              flex: 1,
              padding: '14px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Registrar
          </button>
          
          <button 
            onClick={() => {
              setShowStoolDetails(false);
              setStoolDetails({ color: '', texture: '', hasMucus: false });
              setPendingDiaperType('');
            }}
            style={{
              flex: 1,
              padding: '14px',
              backgroundColor: '#f5f5f5',
              color: '#666',
              border: '1px solid #ddd',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );

  // HOME PRINCIPAL
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

          {/* Enlaces navegación MÁS PEQUEÑOS */}
          <div className="navigation-links">
            <Link to="/night-mode" className="nav-link night-mode">
              🌙 Modo Noche
            </Link>
            <Link to="/stats" className="nav-link stats">
              📊 Estadísticas
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

      {showStoolDetails && <StoolDetailsModal />}
    </div>
  );
};

export default Home;