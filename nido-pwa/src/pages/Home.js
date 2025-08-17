// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FeedingTimer from '../components/feeding/FeedingTimer';
import DiaperTracker from '../components/feeding/DiaperTracker';
import SleepTracker from '../components/sleep/SleepTracker';
import './Home.css';

const Home = () => {
  const [lastDiaper, setLastDiaper] = useState({
    time: '17:20',
    type: 'wet',
    hasPooped: false
  });
  
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  const handleDiaperChange = (type) => {
    setLastDiaper({
      time: new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      type: type,
      hasPooped: type === 'dirty' || type === 'both'
    });
  };
  
  // Modal de acciones rápidas para pañales
  const QuickActions = () => (
    <div className="quick-actions-modal">
      <div className="quick-actions-content">
        <h3>Acciones Rápidas</h3>
        
        <div className="quick-actions-buttons">
          <button 
            className="wet-button"
            onClick={() => {
              handleDiaperChange('wet');
              setShowQuickActions(false);
            }}
          >
            💧 Pañal Mojado
          </button>
          
          <button 
            className="dirty-button"
            onClick={() => {
              handleDiaperChange('dirty');
              setShowQuickActions(false);
            }}
          >
            💩 Pañal con Caca
          </button>
          
          <button 
            className="both-button"
            onClick={() => {
              handleDiaperChange('both');
              setShowQuickActions(false);
            }}
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
      <h1>Nido 🪺</h1>
      <p className="app-description">
        Tu asistente inteligente para la lactancia, sueño y cuidado del bebé
      </p>
      
      <FeedingTimer />
      
      <SleepTracker />
      
      <DiaperTracker 
        lastDiaper={lastDiaper}
        onDiaperChange={() => setShowQuickActions(true)}
      />
      
      <div className="action-buttons">
        <Link to="/night-mode" className="night-mode-button">
          🌙 Modo Noche de Supervivencia
        </Link>
      </div>
      
      {showQuickActions && <QuickActions />}
    </div>
  );
};

export default Home;