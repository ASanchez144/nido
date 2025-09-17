// src/components/sleep/SleepTracker.js
import React, { useState, useRef } from 'react';
import './SleepTracker.css';

const SleepTracker = () => {
  const [isSleeping, setIsSleeping] = useState(false);
  const [sleepTimer, setSleepTimer] = useState(0);
  const [lastSleep, setLastSleep] = useState({
    startTime: '19:30',
    duration: 90,
    quality: 'good'
  });
  
  const timerRef = useRef(null);
  
  const startSleep = () => {
    setIsSleeping(true);
    setSleepTimer(0);
    
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      setSleepTimer(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
  };
  
  const stopSleep = () => {
    clearInterval(timerRef.current);
    
    if (sleepTimer > 0) {
      setLastSleep({
        startTime: new Date(Date.now() - sleepTimer * 1000).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        duration: Math.floor(sleepTimer / 60),
        quality: sleepTimer > 1800 ? 'good' : sleepTimer > 900 ? 'medium' : 'short'
      });
    }
    
    setIsSleeping(false);
    setSleepTimer(0);
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="sleep-tracker">
      <h2>Seguimiento de Sueño</h2>
      
      {isSleeping ? (
        <div className="active-sleep">
          <div className="sleep-timer">{formatTime(sleepTimer)}</div>
          <p className="sleeping-indicator">😴 Durmiendo...</p>
          <button className="stop-button" onClick={stopSleep}>
            Finalizar Siesta
          </button>
        </div>
      ) : (
        <div className="sleep-info">
          <div className="last-sleep">
            <h3>Última Siesta</h3>
            <p>Inicio: {lastSleep.startTime}</p>
            <p>Duración: {lastSleep.duration} min</p>
            <p>Calidad: {
              lastSleep.quality === 'good' ? '😴 Buena' : 
              lastSleep.quality === 'medium' ? '😐 Regular' : 
              '😵 Corta'
            }</p>
          </div>
          <button className="start-button" onClick={startSleep}>
            Iniciar Siesta
          </button>
        </div>
      )}
    </div>
  );
};

export default SleepTracker;