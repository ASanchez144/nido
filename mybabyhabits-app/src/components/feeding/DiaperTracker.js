// src/components/feeding/DiaperTracker.js
import React from 'react';
import './DiaperTracker.css';

const DiaperTracker = ({ lastDiaper, onDiaperChange }) => {
  return (
    <div className="diaper-tracker">
      <h2>Registro de Pañales</h2>
      
      <div className="diaper-info">
        <p>Último cambio: {lastDiaper.time}</p>
        <p>Tipo: 
          {lastDiaper.type === 'wet' && ' Mojado 💧'}
          {lastDiaper.type === 'dirty' && ' Caca 💩'}
          {lastDiaper.type === 'both' && ' Mojado y Caca 💧💩'}
        </p>
        {lastDiaper.hasPooped && <p className="pooped-today">✅ Ha hecho caca hoy</p>}
      </div>
      
      <div className="diaper-actions">
        <button 
          className="diaper-button wet"
          onClick={() => onDiaperChange('wet')}
        >
          Mojado 💧
        </button>
        <button 
          className="diaper-button dirty"
          onClick={() => onDiaperChange('dirty')}
        >
          Caca 💩
        </button>
        <button 
          className="diaper-button both"
          onClick={() => onDiaperChange('both')}
        >
          Ambos 💧💩
        </button>
      </div>
    </div>
  );
};

export default DiaperTracker;