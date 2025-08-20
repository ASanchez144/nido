// src/pages/Caregivers.js
import React, { useState } from 'react';
import { useBaby } from '../contexts/BabyContext';
import './Caregivers.css';

const Caregivers = () => {
  const { currentBaby, caregivers, inviteCaregiver, updateCaregiverRole, removeCaregiver } = useBaby();
  
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('collaborator');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Comprobar si el usuario actual es administrador
  const isAdmin = caregivers.some(cg => cg.isCurrentUser && cg.role === 'admin');

  const handleInvite = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      
      if (!email.trim()) {
        throw new Error('El email es obligatorio');
      }
      
      await inviteCaregiver(email.trim(), role);
      setSuccess(`Invitación enviada a ${email}`);
      setEmail('');
      setRole('collaborator');
      setShowForm(false);
    } catch (error) {
      console.error('Error al invitar cuidador:', error);
      setError(error.message || 'Error al invitar cuidador');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (caregiverId, newRole) => {
    try {
      await updateCaregiverRole(caregiverId, newRole);
      setSuccess('Rol actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar rol:', error);
      setError(error.message || 'Error al actualizar rol');
    }
  };

  const handleRemove = async (caregiverId, caregiverName) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${caregiverName} como cuidador?`)) {
      try {
        await removeCaregiver(caregiverId);
        setSuccess('Cuidador eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar cuidador:', error);
        setError(error.message || 'Error al eliminar cuidador');
      }
    }
  };

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
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="caregivers-list">
        {caregivers.length === 0 ? (
          <p className="no-caregivers">No hay cuidadores registrados</p>
        ) : (
          caregivers.map(caregiver => (
            <div key={caregiver.id} className="caregiver-card">
              <div className="caregiver-avatar">
                {caregiver.firstName ? caregiver.firstName.charAt(0) : caregiver.email.charAt(0).toUpperCase()}
              </div>
              
              <div className="caregiver-info">
                <h3>{caregiver.firstName} {caregiver.lastName}</h3>
                <p className="caregiver-email">{caregiver.email}</p>
                
                <div className="caregiver-role">
                  {isAdmin && !caregiver.isCurrentUser ? (
                    <select
                      value={caregiver.role}
                      onChange={(e) => handleRoleChange(caregiver.id, e.target.value)}
                      className="role-select"
                    >
                      <option value="admin">Administrador</option>
                      <option value="collaborator">Colaborador</option>
                      <option value="observer">Observador</option>
                    </select>
                  ) : (
                    <span className={`role-badge ${caregiver.role}`}>
                      {caregiver.role === 'admin' ? 'Administrador' : 
                       caregiver.role === 'collaborator' ? 'Colaborador' : 'Observador'}
                    </span>
                  )}
                </div>
              </div>
              
              {isAdmin && !caregiver.isCurrentUser && (
                <button 
                  className="remove-button"
                  onClick={() => handleRemove(caregiver.id, `${caregiver.firstName} ${caregiver.lastName}`)}
                >
                  Eliminar
                </button>
              )}
              
              {caregiver.isCurrentUser && (
                <span className="current-user-badge">Tú</span>
              )}
            </div>
          ))
        )}
      </div>
      
      {isAdmin && (
        <>
          {showForm ? (
            <div className="invite-form">
              <h3>Invitar Cuidador</h3>
              <form onSubmit={handleInvite}>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="role">Rol</label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="collaborator">Colaborador</option>
                    <option value="observer">Observador</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                
                <div className="form-buttons">
                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={loading}
                  >
                    {loading ? 'Invitando...' : 'Invitar'}
                  </button>
                  <button 
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button 
              className="invite-button"
              onClick={() => setShowForm(true)}
            >
              + Invitar Cuidador
            </button>
          )}
        </>
      )}
      
      <div className="roles-info">
        <h3>Información de roles</h3>
        <ul>
          <li><strong>Administrador:</strong> Puede gestionar cuidadores, editar información del bebé y registrar actividades.</li>
          <li><strong>Colaborador:</strong> Puede registrar actividades como alimentación, siestas y pañales.</li>
          <li><strong>Observador:</strong> Solo puede ver la información, no puede realizar cambios.</li>
        </ul>
      </div>
    </div>
  );
};

export default Caregivers;