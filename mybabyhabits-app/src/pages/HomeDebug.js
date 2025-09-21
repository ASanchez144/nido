// src/pages/HomeDebug.js - Versión simplificada para debug
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBaby } from '../contexts/BabyContext';
import { useTracking } from '../contexts/TrackingContext';

const HomeDebug = () => {
  const auth = useAuth();
  const baby = useBaby();
  const tracking = useTracking();

  return (
    <div style={{ padding: '20px' }}>
      <h1>🪺 MyBabyHabits - Home Debug</h1>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h3>🔑 Estado Auth:</h3>
        <p>Usuario: {auth.user?.email || 'No autenticado'}</p>
        <p>Loading: {String(auth.loading)}</p>
        <p>Error: {auth.error || 'Ninguno'}</p>
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '5px' }}>
        <h3>👶 Estado Baby:</h3>
        <p>Bebés: {baby.babies?.length || 0}</p>
        <p>Bebé actual: {baby.currentBaby?.name || 'Ninguno'}</p>
        <p>Loading: {String(baby.loading)}</p>
        <p>Error: {baby.error || 'Ninguno'}</p>
        
        {baby.babies?.length === 0 && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
            <p>⚠️ No tienes bebés registrados</p>
            <button 
              onClick={async () => {
                try {
                  console.log('👶 Añadiendo bebé de prueba...');
                  await baby.addBaby({
                    name: 'Bebé de Prueba',
                    birthdate: new Date().toISOString().split('T')[0]
                  });
                  console.log('✅ Bebé añadido exitosamente');
                } catch (error) {
                  console.error('❌ Error añadiendo bebé:', error);
                  alert('Error añadiendo bebé: ' + error.message);
                }
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ➕ Añadir Bebé de Prueba
            </button>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '5px' }}>
        <h3>📊 Estado Tracking:</h3>
        <p>Sesiones alimentación: {tracking.feedingSessions?.length || 0}</p>
        <p>Sesiones sueño: {tracking.sleepSessions?.length || 0}</p>
        <p>Eventos pañal: {tracking.diaperEvents?.length || 0}</p>
        <p>Loading: {String(tracking.isLoading)}</p>
        <p>Error: {tracking.error || 'Ninguno'}</p>
        <p>Online: {String(tracking.isOnline)}</p>
      </div>

      {baby.currentBaby && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '5px' }}>
          <h3>🎯 Bebé Seleccionado: {baby.currentBaby.name}</h3>
          <p>Fecha nacimiento: {baby.currentBaby.birthdate}</p>
          <p>ID: {baby.currentBaby.id}</p>
          
          <div style={{ marginTop: '10px' }}>
            <button 
              onClick={async () => {
                try {
                  console.log('🍼 Iniciando sesión de alimentación...');
                  await tracking.startFeedingSession('breastfeeding', 'left');
                  console.log('✅ Sesión iniciada');
                } catch (error) {
                  console.error('❌ Error:', error);
                  alert('Error: ' + error.message);
                }
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              🍼 Iniciar Alimentación
            </button>
            
            <button 
              onClick={async () => {
                try {
                  console.log('💩 Añadiendo evento pañal...');
                  await tracking.addDiaperEvent('wet');
                  console.log('✅ Evento añadido');
                } catch (error) {
                  console.error('❌ Error:', error);
                  alert('Error: ' + error.message);
                }
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              💩 Pañal Mojado
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>📝 Abre la consola del navegador (F12) para ver logs detallados</p>
        <p>🔄 Actualiza la página si algo no funciona</p>
      </div>
    </div>
  );
};

export default HomeDebug;