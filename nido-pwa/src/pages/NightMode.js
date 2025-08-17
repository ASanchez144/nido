// src/pages/NightMode.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './NightMode.css';

const NightMode = () => {
  const [isFeeding, setIsFeeding] = useState(false);
  const [feedingTimer, setFeedingTimer] = useState(0);
  const [currentSide, setCurrentSide] = useState('');
  const [isSleeping, setIsSleeping] = useState(false);
  const [sleepTimer, setSleepTimer] = useState(0);
  
  const navigate = useNavigate();
  const timerRef = useRef(null);
  
  // Efecto para gestionar los timers
  useEffect(() => {
    let interval;
    if (isFeeding) {
      interval = setInterval(() => {
        setFeedingTimer(timer => timer + 1);
      }, 1000);
    } else if (isSleeping) {
      interval = setInterval(() => {
        setSleepTimer(timer => timer + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFeeding, isSleeping]);
  
  // Efecto para pantalla completa
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
          await elem.msRequestFullscreen();
        }
      } catch (error) {
        console.log('No se pudo entrar en modo pantalla completa', error);
      }
    };

    enterFullscreen();

    return () => {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  }, []);
  
  const startFeeding = (side) => {
    if (isSleeping) stopSleep();
    setIsFeeding(true);
    setCurrentSide(side);
    setFeedingTimer(0);
  };
  
  const stopFeeding = () => {
    setIsFeeding(false);
    // Aquí guardaríamos los datos en un contexto o localStorage
    setFeedingTimer(0);
    setCurrentSide('');
  };
  
  const startSleep = () => {
    if (isFeeding) stopFeeding();
    setIsSleeping(true);
    setSleepTimer(0);
  };
  
  const stopSleep = () => {
    setIsSleeping(false);
    // Aquí guardaríamos los datos en un contexto o localStorage
    setSleepTimer(0);
  };
  
  const logDiaper = (type) => {
    // Aquí guardaríamos los datos de pañal
    console.log(`Pañal registrado: ${type}`);
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const exitNightMode = () => {
    navigate('/');
  };
  
  return (
    <div className="night-mode">
      <div className="night-mode-header">
        <div className="moon-icon">🌙</div>
        <p className="night-mode-title">Modo Supervivencia</p>
      </div>
      
      <div className="breast-selection">
        <button 
          className="left-breast"
          onClick={() => startFeeding('left')}
        >
          ←
        </button>
        
        <div className="baby-container">
          <div className="baby-icon">👶</div>
          {isFeeding && (
            <div className="timer">{formatTime(feedingTimer)}</div>
          )}
          {isSleeping && (
            <div className="sleep-timer">💤 {formatTime(sleepTimer)}</div>
          )}
        </div>
        
        <button 
          className="right-breast"
          onClick={() => startFeeding('right')}
        >
          →
        </button>
      </div>
      
      <div className="action-buttons">
        <button 
          className="sleep-button"
          onClick={startSleep}
          disabled={isSleeping}
        >
          💤
        </button>
        <button 
          className="wet-diaper-button"
          onClick={() => logDiaper('wet')}
        >
          💧
        </button>
        <button 
          className="dirty-diaper-button"
          onClick={() => logDiaper('dirty')}
        >
          💩
        </button>
      </div>
      
      {(isFeeding || isSleeping) && (
        <button 
          className="stop-button"
          onClick={isFeeding ? stopFeeding : stopSleep}
        >
          PARAR
        </button>
      )}
      
      <button 
        className="exit-button"
        onClick={exitNightMode}
      >
        Salir
      </button>
    </div>
  );
};

export default NightMode;