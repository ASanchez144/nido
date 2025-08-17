// src/pages/Caregivers.js
import React, { useState } from 'react';
import './Caregivers.css';

const Caregivers = () => {
  const [caregivers, setCaregivers] = useState([
    { id: 1, name: 'María (Tú)', role: 'Administrador', initial: 'M', color: 'blue', active: true },
    { id: 2, name: 'Carlos', role: 'Colaborador', initial: 'C', color: 'green', active: false },
    { id: 3, name: 'Abuela Ana', role: 'Colaborador', initial: 'A', color: 'purple', active: false }
  ]);
  
  const [activities, setActivities] = useState([
    { id: 1, text: 'Carlos registró toma de 15 min (hace 2h)' },
    { id: 2, text: 'Abuela Ana registró cambio de pañal (hace 4h)' },
    { id: 3, text: 'Tú registraste siesta de 1h 30m (hace 6h)' }
  ]);
  
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [newCaregiver, setNewCaregiver] = useState({ name: '', email: '', role: 'Colaborador' });
  
  const handleInvite = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar la invitación
    console.log('Invitación enviada a:', newCaregiver);
    setShowInviteForm(false);
    setNewCaregiver({ name: '', email: '', role: 'Colaborador' });
  };
  
  return (
    <div className="caregivers-page">
      <h2>Cuidadores</h2>
      
      <div className="caregivers-list">
        {caregivers.map(caregiver => (
          <div key={caregiver.id} className="caregiver-card">
            <div className={`caregiver-avatar ${caregiver.color}`}>
              {caregiver.initial}
            </div>
            <div className="caregiver-info">
              <h3>{caregiver.name}</h3>
              <p>{caregiver.role}</p>
            </div>
            <div className={`caregiver-status ${caregiver.active ? 'active' : 'inactive'}`}>
              {caregiver.active ? '🟢 Activo' : '⚪ Inactivo'}
            </div>
          </div>
        ))}
      </div>
      
      <button 
        className="invite-button"
        onClick={() => setShowInviteForm(!showInviteForm)}
      >
        + Invitar Cuidador
      </button>
      
      {showInviteForm && (
        <div className="invite-form">
          <h3>Invitar Cuidador</h3>
          <form onSubmit={handleInvite}>
            <div className="form-group">
              <label htmlFor="name">Nombre</label>
              <input 
                type="text" 
                id="name" 
                value={newCaregiver.name}
                onChange={(e) => setNewCaregiver({...newCaregiver, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                value={newCaregiver.email}
                onChange={(e) => setNewCaregiver({...newCaregiver, email: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="role">Rol</label>
              <select 
                id="role" 
                value={newCaregiver.role}
                onChange={(e) => setNewCaregiver({...newCaregiver, role: e.target.value})}
              >
                <option value="Colaborador">Colaborador</option>
                <option value="Observador">Observador</option>
              </select>
            </div>
            <div className="form-buttons">
              <button type="submit" className="submit-button">Invitar</button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => setShowInviteForm(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="activities-section">
        <h3>Actividad Reciente</h3>
        <ul className="activities-list">
          {activities.map(activity => (
            <li key={activity.id}>{activity.text}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Caregivers;