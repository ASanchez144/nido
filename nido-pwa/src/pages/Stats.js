// src/pages/Stats.js
import React from 'react';
import './Stats.css';

const Stats = () => {
  // Datos de ejemplo
  const feedingStats = {
    leftBreast: 45,
    rightBreast: 55,
    bothBreasts: 23,
    totalToday: '2h 45m',
    average: '3h 12m',
    count: 8
  };
  
  const sleepStats = {
    totalToday: '4h 20m',
    naps: 3,
    averageNap: '85min',
    quality: 'good'
  };
  
  const diaperStats = {
    wet: 6,
    dirty: 2,
    total: 8,
    lastPoop: '3h 20m'
  };
  
  return (
    <div className="stats-page">
      <h2>Estadísticas</h2>
      
      <div className="stats-card">
        <h3>Uso de Pechos (Esta Semana)</h3>
        <div className="progress-bars">
          <div className="progress-item">
            <div className="progress-label">
              <span>Pecho Izquierdo</span>
              <span>{feedingStats.leftBreast}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill left-breast" 
                style={{width: `${feedingStats.leftBreast}%`}}
              ></div>
            </div>
          </div>
          
          <div className="progress-item">
            <div className="progress-label">
              <span>Pecho Derecho</span>
              <span>{feedingStats.rightBreast}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill right-breast" 
                style={{width: `${feedingStats.rightBreast}%`}}
              ></div>
            </div>
          </div>
          
          <div className="progress-item">
            <div className="progress-label">
              <span>Ambos Pechos</span>
              <span>{feedingStats.bothBreasts}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill both-breasts" 
                style={{width: `${feedingStats.bothBreasts}%`}}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="stats-card">
        <h3>Patrones de Sueño</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{sleepStats.totalToday}</div>
            <div className="stat-label">Sueño total hoy</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{sleepStats.naps}</div>
            <div className="stat-label">Siestas</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{sleepStats.averageNap}</div>
            <div className="stat-label">Siesta promedio</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">😴</div>
            <div className="stat-label">Calidad: Buena</div>
          </div>
        </div>
      </div>
      
      <div className="stats-card">
        <h3>Registro de Pañales (Hoy)</h3>
        <div className="diaper-stats">
          <div className="diaper-stat wet">
            <div className="diaper-value">{diaperStats.wet}</div>
            <div className="diaper-label">💧 Mojados</div>
          </div>
          <div className="diaper-stat dirty">
            <div className="diaper-value">{diaperStats.dirty}</div>
            <div className="diaper-label">💩 Con caca</div>
          </div>
          <div className="diaper-stat total">
            <div className="diaper-value">{diaperStats.total}</div>
            <div className="diaper-label">📊 Total</div>
          </div>
        </div>
        <div className="last-poop">
          <span>Última caca: hace {diaperStats.lastPoop}</span>
        </div>
      </div>
      
      <div className="stats-card">
        <h3>Tiempo Total de Lactancia</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{feedingStats.totalToday}</div>
            <div className="stat-label">Hoy</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{feedingStats.average}</div>
            <div className="stat-label">Promedio</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{feedingStats.count}</div>
            <div className="stat-label">Tomas</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;