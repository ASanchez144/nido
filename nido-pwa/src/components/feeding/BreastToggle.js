// src/components/feeding/BreastToggle.js
import React from 'react';
import './BreastToggle.css';

const BreastToggle = ({ selectedBreast, onToggle, disabled }) => {
  return (
    <div className="breast-toggle">
      <button 
        className={`breast-button left ${selectedBreast === 'left' ? 'active' : ''}`}
        onClick={() => onToggle('left')}
        disabled={disabled}
      >
        Izquierdo
      </button>
      <button 
        className={`breast-button right ${selectedBreast === 'right' ? 'active' : ''}`}
        onClick={() => onToggle('right')}
        disabled={disabled}
      >
        Derecho
      </button>
    </div>
  );
};

export default BreastToggle;