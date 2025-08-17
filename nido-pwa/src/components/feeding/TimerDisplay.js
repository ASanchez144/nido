// src/components/feeding/TimerDisplay.js
import React from 'react';
import './TimerDisplay.css';

const TimerDisplay = ({ time }) => {
  // Convertir milisegundos a formato HH:MM:SS
  const formatTime = () => {
    const totalSeconds = Math.floor(time / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };

  return (
    <div className="timer-display">
      <span className="timer-text">{formatTime()}</span>
    </div>
  );
};

export default TimerDisplay;