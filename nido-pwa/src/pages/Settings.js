// src/pages/Settings.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBaby } from '../contexts/BabyContext';
import { useTheme } from '../contexts/ThemeContext';
import './Settings.css';

const Settings = () => {
  const { user, signOut } = useAuth();
  const { currentBaby, babies } = useBaby();
  const { darkMode, setDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  
  // Estado para opciones de notificaciones
  const [notifications, setNotifications] = useState({
    feedingReminders: true,
    sleepReminders: true,
    diaperReminders: false
  });

  const handleNotificationChange = (setting) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));

    // Aquí se podría guardar la configuración en la base de datos
    showMessage(`Configuración de notificaciones actualizada`, 'success');
  };
  
  const handleThemeToggle = (e) => {
    const isChecked = e.target.checked;
    console.log('Toggle modo oscuro:', isChecked ? 'ACTIVADO' : 'DESACTIVADO');
    setDarkMode(isChecked);
    showMessage(`Modo oscuro ${isChecked ? 'activado' : 'desactivado'}`, 'success');
  };

  const handleExportData = async () => {
    try {
      setLoading(true);
      // Aquí iría la lógica para exportar datos
      // Por ejemplo, descargar un JSON o CSV
      
      const supabase = (await import('../supabase/config')).default;
      
      if (!currentBaby) {
        throw new Error('No hay un bebé seleccionado');
      }
      
      // Obtener todos los datos del bebé actual
      const [
        { data: feedingSessions, error: feedError },
        { data: sleepSessions, error: sleepError },
        { data: diaperEvents, error: diaperError },
        { data: weightEntries, error: weightError }
      ] = await Promise.all([
        supabase.from('feeding_sessions').select('*').eq('baby_id', currentBaby.id),
        supabase.from('sleep_sessions').select('*').eq('baby_id', currentBaby.id),
        supabase.from('diaper_events').select('*').eq('baby_id', currentBaby.id),
        supabase.from('weight_entries').select('*').eq('baby_id', currentBaby.id)
      ]);
      
      if (feedError || sleepError || diaperError || weightError) {
        throw new Error('Error al obtener datos');
      }
      
      // Crear un objeto con todos los datos
      const exportData = {
        baby: currentBaby,
        feeding: feedingSessions,
        sleep: sleepSessions,
        diapers: diaperEvents,
        weight: weightEntries,
        exportDate: new Date().toISOString()
      };
      
      // Convertir a JSON y descargar
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `nido_${currentBaby.name.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      showMessage('Datos exportados correctamente', 'success');
    } catch (error) {
      console.error('Error exportando datos:', error);
      showMessage(`Error al exportar datos: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImportData = () => {
    // Esta función se implementaría para importar datos
    showMessage('Importación de datos no disponible en esta versión', 'info');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // La redirección a /login debería ocurrir automáticamente por el ProtectedRoute
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      showMessage('Error al cerrar sesión', 'error');
    }
  };
  
  const handleResetApp = async () => {
    if (window.confirm('¿Estás seguro de que quieres borrar todos los datos? Esta acción no se puede deshacer.')) {
      try {
        setLoading(true);
        
        // Borrar datos de IndexedDB/localStorage si estamos usando almacenamiento local
        localStorage.removeItem('nido-last-baby');
        
        // Borrar datos de Supabase si estamos conectados
        if (currentBaby) {
          const supabase = (await import('../supabase/config')).default;
          
          // Borrar datos del bebé actual
          await Promise.all([
            supabase.from('feeding_sessions').delete().eq('baby_id', currentBaby.id),
            supabase.from('sleep_sessions').delete().eq('baby_id', currentBaby.id),
            supabase.from('diaper_events').delete().eq('baby_id', currentBaby.id),
            supabase.from('weight_entries').delete().eq('baby_id', currentBaby.id)
          ]);
          
          showMessage('Todos los datos han sido borrados', 'success');
        }
      } catch (error) {
        console.error('Error al resetear la aplicación:', error);
        showMessage(`Error al borrar datos: ${error.message}`, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
    }, 5000);
  };

  return (
    <div className="settings-page">
      <h2>Ajustes</h2>
      
      {message && (
        <div className={`settings-message ${messageType}`}>
          {message}
        </div>
      )}
      
      {/* Sección de apariencia */}
      <div className="settings-section">
        <h3>Apariencia</h3>
        
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-name">Modo Oscuro</div>
            <div className="setting-description">
              Activa el modo oscuro para reducir la fatiga visual durante la noche.
            </div>
          </div>
          <label className="toggle">
            <input 
              type="checkbox" 
              checked={darkMode} 
              onChange={handleThemeToggle}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
      
      {/* Sección de notificaciones */}
      <div className="settings-section">
        <h3>Notificaciones</h3>
        
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-name">Recordatorios de alimentación</div>
            <div className="setting-description">
              Recibe alertas cuando sea hora de alimentar al bebé.
            </div>
          </div>
          <label className="toggle">
            <input 
              type="checkbox" 
              checked={notifications.feedingReminders} 
              onChange={() => handleNotificationChange('feedingReminders')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-name">Recordatorios de sueño</div>
            <div className="setting-description">
              Recibe alertas sobre ventanas de sueño óptimas.
            </div>
          </div>
          <label className="toggle">
            <input 
              type="checkbox" 
              checked={notifications.sleepReminders} 
              onChange={() => handleNotificationChange('sleepReminders')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-name">Alertas de pañales</div>
            <div className="setting-description">
              Recibe recordatorios para revisar el pañal.
            </div>
          </div>
          <label className="toggle">
            <input 
              type="checkbox" 
              checked={notifications.diaperReminders} 
              onChange={() => handleNotificationChange('diaperReminders')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
      
      {/* Sección de datos */}
      <div className="settings-section">
        <h3>Datos</h3>
        
        <div className="data-actions">
          <button 
            className="data-button export" 
            onClick={handleExportData}
            disabled={loading}
          >
            {loading ? 'Exportando...' : 'Exportar datos'}
          </button>
          
          <button 
            className="data-button import" 
            onClick={handleImportData}
            disabled={loading}
          >
            Importar datos
          </button>
        </div>
        
        <div className="data-actions" style={{ marginTop: '12px' }}>
          <button 
            className="data-button reset" 
            onClick={handleResetApp}
            disabled={loading}
            style={{ 
              backgroundColor: '#fee2e2', 
              color: '#b91c1c',
              borderColor: '#fecaca' 
            }}
          >
            {loading ? 'Borrando...' : 'Borrar todos los datos'}
          </button>
        </div>
      </div>
      
      {/* Sección de cuenta */}
      <div className="settings-section">
        <h3>Cuenta</h3>
        
        {user && (
          <div className="user-info-settings">
            <p><strong>Email:</strong> {user.email}</p>
          </div>
        )}
        
        <button 
          className="logout-button" 
          onClick={handleLogout}
          style={{ 
            width: '100%',
            padding: '14px',
            backgroundColor: '#f1f5f9',
            color: '#64748b',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '16px'
          }}
        >
          Cerrar sesión
        </button>
      </div>
      
      {/* Sección Acerca de */}
      <div className="settings-section">
        <h3>Acerca de</h3>
        
        <div className="about-info">
          <p><strong>Nido</strong> - Versión 1.0.0</p>
          <p>Una aplicación para el seguimiento del cuidado de bebés.</p>
          <p>Desarrollada con ❤️ para ayudar a padres y cuidadores.</p>
          
          <p className="tagline">Cuidando con amor y tecnología.</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;