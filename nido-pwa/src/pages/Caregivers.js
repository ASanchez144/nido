// src/pages/Caregivers.js (REEMPLAZO COMPLETO)
import React, { useState, useEffect } from 'react';
import { useBaby } from '../contexts/BabyContext';
import { useAuth } from '../contexts/AuthContext';
import ShareBaby from '../components/ShareBaby'; // NUEVO componente
import CaregiverManager from '../components/CaregiverManager'; // NUEVO componente
import './Caregivers.css';

const Caregivers = () => {
  const { currentBaby, caregivers } = useBaby();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('list'); // 'list' o 'share'
  
  // Verificar si es admin
  const isAdmin = caregivers.some(
    cg => cg.user_id === user?.id && cg.role === 'admin'
  );

  if (!currentBaby) {
    return (
      <div className="caregivers-page">
        <div className="no-baby-message">
          <h2>No hay bebé seleccionado</h2>
          <p>Por favor, selecciona o añade un bebé para gestionar cuidadores.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="caregivers-page">
      <h2>Cuidadores de {currentBaby.name}</h2>
      
      {isAdmin && (
        <div className="tabs">
          <button 
            className={activeTab === 'list' ? 'active' : ''}
            onClick={() => setActiveTab('list')}
          >
            Lista de Cuidadores
          </button>
          <button 
            className={activeTab === 'share' ? 'active' : ''}
            onClick={() => setActiveTab('share')}
          >
            Invitar Cuidador
          </button>
        </div>
      )}

      {activeTab === 'list' ? (
        <CaregiverManager 
          babyId={currentBaby.id} 
          caregivers={caregivers}
          isAdmin={isAdmin}
        />
      ) : (
        <ShareBaby babyId={currentBaby.id} />
      )}
    </div>
  );
};

export default Caregivers;