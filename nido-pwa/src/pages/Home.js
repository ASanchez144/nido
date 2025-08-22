// src/pages/Home.js
import React, { useState } from 'react';
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

  // Stats del día
  const todayStats = currentBaby ? getTodayStats() : {
    feedingCount: 0,
    sleepDuration: 0,
    diaperCount: { total: 0, wet: 0, dirty: 0, mixed: 0 }
  };

  const handleBabySetupComplete = (newBaby) => {
    console.log('✅ Home: Baby creado con éxito:', newBaby);
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
    // Si es caca o ambos, mostrar modal de detalles
    if (type === 'dirty' || type === 'mixed') {
      setPendingDiaperType(type);
      setShowStoolDetails(true);
      setShowQuickActions(false);
      return;
    }
    
    // Para solo mojado, enviar directamente
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

  // Mostrar loading
  if (babyLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        flexDirection: 'column'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '15px'
        }}></div>
        <p>Cargando...</p>
        <style>
          {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
        </style>
      </div>
    );
  }

  // Mostrar setup si no hay bebés
  if (babies.length === 0) {
    return <BabySetup onComplete={handleBabySetupComplete} />;
  }

  // Modal de acciones rápidas para pañales
  const QuickActions = () => (
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
        maxWidth: '350px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', textAlign: 'center', color: '#007bff' }}>
          Registrar Pañal
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <button 
            onClick={() => handleDiaperAction('wet')}
            style={{
              padding: '18px 12px',
              backgroundColor: '#e3f2fd',
              color: '#0d47a1',
              border: '2px solid #bbdefb',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            💧 Mojado
          </button>
          
          <button 
            onClick={() => handleDiaperAction('dirty')}
            style={{
              padding: '18px 12px',
              backgroundColor: '#fff3e0',
              color: '#e65100',
              border: '2px solid #ffcc80',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            💩 Sucio
          </button>
          
          <button 
            onClick={() => handleDiaperAction('mixed')}
            style={{
              padding: '18px 12px',
              backgroundColor: '#f3e5f5',
              color: '#4a148c',
              gridColumn: 'span 2',
              border: '2px solid #ce93d8',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            💧💩 Ambos
          </button>
        </div>
        
        <button 
          onClick={() => setShowQuickActions(false)}
          style={{
            width: '100%',
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
  );

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
              { value: 'yellow', label: '🟡 Amarillo', color: '#ffeb3b' },
              { value: 'brown', label: '🟤 Marrón', color: '#8d6e63' },
              { value: 'green', label: '🟢 Verde', color: '#4caf50' },
              { value: 'orange', label: '🟠 Naranja', color: '#ff9800' },
              { value: 'red', label: '🔴 Rojizo', color: '#f44336' },
              { value: 'black', label: '⚫ Negro', color: '#424242' }
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
              { value: 'liquid', label: '💧 Líquida' },
              { value: 'soft', label: '🧈 Blanda' },
              { value: 'normal', label: '🥜 Normal' },
              { value: 'hard', label: '🪨 Dura' }
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

        {/* Selector de Mocos */}
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

      {(localError || babyError) && (
        <div style={{
          background: '#fee',
          color: '#c00',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{localError || babyError}</span>
          <button 
            onClick={() => setLocalError('')}
            style={{
              background: 'none',
              border: 'none',
              color: '#c00',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {currentBaby ? (
        <>
          {/* Stats del día */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '25px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 15px 0', textAlign: 'center', color: '#007bff' }}>
              📊 Resumen de Hoy
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '15px'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '15px 10px',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '1.8rem' }}>🍼</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#007bff' }}>
                  {todayStats.feedingCount}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Tomas</div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '15px 10px',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '1.8rem' }}>😴</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#007bff' }}>
                  {formatDuration(todayStats.sleepDuration)}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Sueño</div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '15px 10px',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '1.8rem' }}>💩</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#007bff' }}>
                  {todayStats.diaperCount.total}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Pañales</div>
              </div>
            </div>
          </div>

          {/* Acciones principales */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '25px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', textAlign: 'center', color: '#007bff' }}>
              ⚡ Acciones Rápidas
            </h3>
            
            {/* Alimentación */}
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>🍼 Alimentación</h4>
              {currentFeedingSession ? (
                <div style={{
                  background: '#e8f5e8',
                  border: '2px solid #4caf50',
                  borderRadius: '8px',
                  padding: '15px',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: '0 0 8px 0', color: '#2e7d32', fontWeight: '500' }}>
                    Sesión activa: {currentFeedingSession.type} 
                    {currentFeedingSession.breast && ` (${currentFeedingSession.breast})`}
                  </p>
                  <button 
                    onClick={() => handleFeedingAction()}
                    style={{
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 20px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    ⏹️ Terminar Sesión
                  </button>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px'
                }}>
                  <button 
                    onClick={() => handleFeedingAction('breastfeeding', 'left')}
                    style={{
                      padding: '15px 12px',
                      border: '2px solid #ff9800',
                      borderRadius: '8px',
                      background: 'white',
                      color: '#ff9800',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    ← Pecho Izquierdo
                  </button>
                  <button 
                    onClick={() => handleFeedingAction('breastfeeding', 'right')}
                    style={{
                      padding: '15px 12px',
                      border: '2px solid #9c27b0',
                      borderRadius: '8px',
                      background: 'white',
                      color: '#9c27b0',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Pecho Derecho →
                  </button>
                </div>
              )}
            </div>

            {/* Sueño */}
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>😴 Sueño</h4>
              {currentSleepSession ? (
                <div style={{
                  background: '#e8f5e8',
                  border: '2px solid #4caf50',
                  borderRadius: '8px',
                  padding: '15px',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: '0 0 8px 0', color: '#2e7d32', fontWeight: '500' }}>
                    Durmiendo...
                  </p>
                  <button 
                    onClick={handleSleepAction}
                    style={{
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 20px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    ⏰ Despertar
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleSleepAction}
                  style={{
                    width: '100%',
                    padding: '15px',
                    background: '#673ab7',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  😴 Empezar Sueño
                </button>
              )}
            </div>

            {/* Pañales */}
            <div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>💩 Pañales</h4>
              <button 
                onClick={() => setShowQuickActions(true)}
                style={{
                  width: '100%',
                  padding: '15px',
                  background: '#795548',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  marginBottom: '10px'
                }}
              >
                📝 Registrar Cambio
              </button>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
                color: '#666'
              }}>
                <span>Hoy: {todayStats.diaperCount.total} cambios</span>
                <span>(💧{todayStats.diaperCount.wet} 💩{todayStats.diaperCount.dirty})</span>
              </div>
            </div>
          </div>

          {/* Enlaces de navegación */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <Link 
              to="/night-mode" 
              style={{
                padding: '15px',
                textAlign: 'center',
                textDecoration: 'none',
                borderRadius: '8px',
                background: '#37474f',
                color: 'white',
                fontWeight: '500'
              }}
            >
              🌙 Modo Noche
            </Link>
            <Link 
              to="/stats" 
              style={{
                padding: '15px',
                textAlign: 'center',
                textDecoration: 'none',
                borderRadius: '8px',
                background: '#4caf50',
                color: 'white',
                fontWeight: '500'
              }}
            >
              📊 Estadísticas
            </Link>
          </div>
        </>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <p style={{ marginBottom: '20px', color: '#666', fontSize: '1.1rem' }}>
            🤔 No hay ningún bebé seleccionado
          </p>
          <Link 
            to="/settings" 
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '500'
            }}
          >
            Configurar bebé
          </Link>
        </div>
      )}

      {showQuickActions && <QuickActions />}
      {showStoolDetails && <StoolDetailsModal />}
    </div>
  );
};

export default Home;