// src/components/feeding/FeedingTimer.js
import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { useBaby } from '../../contexts/BabyContext';
import TimerDisplay from './TimerDisplay';
import BreastToggle from './BreastToggle';
import './FeedingTimer.css';

const FeedingTimer = () => {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [selectedBreast, setSelectedBreast] = useState('left');
  const [lastBreast, setLastBreast] = useState('');
  const [bothBreasts, setBothBreasts] = useState(false);
  const [breathingPattern, setBreathingPattern] = useState('nose'); // 'nose' o 'mouth'
  const timerRef = useRef(null);
  
  useEffect(() => {
    // Recuperar el último pecho usado del almacenamiento local
    const storedLastBreast = localStorage.getItem('lastBreast');
    if (storedLastBreast) {
      setLastBreast(storedLastBreast);
      // Sugerir el pecho alternativo para esta sesión
      setSelectedBreast(storedLastBreast === 'left' ? 'right' : 'left');
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  const handleStart = () => {
    if (!isActive) {
      setIsActive(true);
      const startTime = Date.now() - time;
      timerRef.current = setInterval(() => {
        setTime(Date.now() - startTime);
      }, 1000);
    }
  };
  
  const handlePause = () => {
    if (isActive) {
      clearInterval(timerRef.current);
      setIsActive(false);
    }
  };
  
  const handleReset = () => {
    clearInterval(timerRef.current);
    setIsActive(false);
    setTime(0);
  };
  
  const handleStop = () => {
    if (isActive || time > 0) {
      clearInterval(timerRef.current);
      setIsActive(false);
      
      // Guardar el último pecho usado
      setLastBreast(selectedBreast);
      localStorage.setItem('lastBreast', selectedBreast);
      
      // Aquí añadiremos la lógica para guardar en Firebase
      console.log('Sesión de lactancia guardada:', {
        breast: selectedBreast,
        bothBreasts: bothBreasts,
        duration: time,
        breathing: breathingPattern,
        timestamp: new Date()
      });
      
      // Resetear el timer
      setTime(0);
      setBothBreasts(false);
    }
  };
  
  const handleBreastToggle = (breast) => {
    setSelectedBreast(breast);
  };
  
  const toggleBothBreasts = () => {
    setBothBreasts(!bothBreasts);
  };
  
  const toggleBreathingPattern = () => {
    setBreathingPattern(breathingPattern === 'nose' ? 'mouth' : 'nose');
  };
  
  const formatTime = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };
  
  return (
    <div className="feeding-timer">
      <h2>Alimentación</h2>
      
      <div className="breast-toggle">
        <button 
          className={`breast-button ${selectedBreast === 'left' ? 'active' : ''}`}
          onClick={() => handleBreastToggle('left')}
          disabled={isActive}
        >
          Izquierdo
        </button>
        <button 
          className={`breast-button ${selectedBreast === 'right' ? 'active' : ''}`}
          onClick={() => handleBreastToggle('right')}
          disabled={isActive}
        >
          Derecho
        </button>
      </div>
      
      {isActive && (
        <div className="feeding-options">
          <label className="both-breasts-toggle">
            <input 
              type="checkbox" 
              checked={bothBreasts} 
              onChange={toggleBothBreasts} 
            />
            <span>Ambos pechos</span>
          </label>
          
          <div className="breathing-toggle">
            <span>Respiración:</span>
            <button 
              className={`breathing-button ${breathingPattern === 'nose' ? 'active' : ''}`}
              onClick={toggleBreathingPattern}
            >
              {breathingPattern === 'nose' ? '👃 Nariz' : '👄 Boca'}
            </button>
          </div>
        </div>
      )}
      
      <div className="timer-display">
        <span className="timer-text">{formatTime(time)}</span>
      </div>
      
      <div className="timer-controls">
        {!isActive ? (
          <button className="start-button" onClick={handleStart}>Iniciar</button>
        ) : (
          <button className="pause-button" onClick={handlePause}>Pausar</button>
        )}
        <button className="stop-button" onClick={handleStop}>Finalizar</button>
        <button className="reset-button" onClick={handleReset}>Reiniciar</button>
      </div>
      
      {lastBreast && (
        <div className="last-breast-info">
          <p>Última toma: {lastBreast === 'left' ? 'Izquierdo' : 'Derecho'}</p>
        </div>
      )}
    </div>
  );
};

export default FeedingTimer;