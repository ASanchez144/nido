// src/pages/Settings.js
import React, { useState } from 'react';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    autoSuggestBreast: true,
    voiceCommands: false,
    reminders: true,
    autoBackup: false
  });
  
  const handleToggle = (key) => {
    setSettings({
      ...settings,
      [key]: !settings[key]
    });
  };
  
  return (
    <div className="settings-page">
      <h2>Ajustes</h2>
      
      <div className="settings-section">
        <h3>General</h3>
        
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-name">Modo oscuro</div>
            <div className="setting-description">Cambia la apariencia de la aplicación</div>
          </div>
          <label className="toggle">
            <input 
              type="checkbox" 
              checked={settings.darkMode} 
              onChange={() => handleToggle('darkMode')} 
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-name">Notificaciones</div>
            <div className="setting-description">Recibe alertas de próximas tomas</div>
          </div>
          <label className="toggle">
            <input 
              type="checkbox" 
              checked={settings.notifications} 
              onChange={() => handleToggle('notifications')} 
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
      
      <div className="settings-section">
        <h3>Alimentación</h3>
        
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-name">Sugerencia automática</div>
            <div className="setting-description">Sugiere alternar automáticamente el pecho</div>
          </div>
          <label className="toggle">
            <input 
              type="checkbox" 
              checked={settings.autoSuggestBreast} 
              onChange={() => handleToggle('autoSuggestBreast')} 
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-name">Comandos de voz</div>
            <div className="setting-description">Controla la app con tu voz (Experimental)</div>
          </div>
          <label className="toggle">
            <input 
              type="checkbox" 
              checked={settings.voiceCommands} 
              onChange={() => handleToggle('voiceCommands')} 
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
      
      <div className="settings-section">
        <h3>Datos</h3>
        
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-name">Copia de seguridad automática</div>
            <div className="setting-description">Guarda tus datos en la nube</div>
          </div>
          <label className="toggle">
            <input 
              type="checkbox" 
              checked={settings.autoBackup} 
              onChange={() => handleToggle('autoBackup')} 
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        
        <div className="data-actions">
          <button className="data-button export">Exportar Datos</button>
          <button className="data-button import">Importar Datos</button>
        </div>
      </div>
      
      <div className="settings-section about">
        <h3>Acerca de Nido</h3>
        <div className="about-info">
          <p><strong>Versión:</strong> 0.1.0 (Beta)</p>
          <p><strong>Creado por:</strong> Tu Nombre</p>
          <p className="tagline">
            Nido: Asistente inteligente para la lactancia, sueño y cuidado del bebé
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;