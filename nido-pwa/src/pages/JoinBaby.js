// src/pages/JoinBaby.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import invitationService from '../services/invitationService';
import './JoinBaby.css';

const JoinBaby = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [status, setStatus] = useState('checking'); // checking, valid, accepted, error
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    checkInvitation();
  }, [code, user]);

  const checkInvitation = async () => {
    try {
      setStatus('checking');
      
      // Verificar que el código existe y es válido
      const inv = await invitationService.verifyInvitation(code);
      setInvitation(inv);
      
      // Si no hay usuario, guardar código y redirigir a login
      if (!user) {
        localStorage.setItem('pendingInvite', code);
        setStatus('valid');
        return;
      }
      
      setStatus('valid');
    } catch (err) {
      console.error('Error checking invitation:', err);
      setError(err.message || 'Invitación inválida o expirada');
      setStatus('error');
    }
  };

  const acceptInvitation = async () => {
    if (!user) {
      // Redirigir a login guardando el código
      localStorage.setItem('pendingInvite', code);
      navigate('/login', { state: { from: `/join/${code}` } });
      return;
    }

    try {
      setStatus('checking');
      const baby = await invitationService.acceptInvitation(code);
      setStatus('accepted');
      
      // Redirigir al home después de 2 segundos
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2000);
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError(err.message || 'Error al aceptar invitación');
      setStatus('error');
    }
  };

  const goToLogin = () => {
    localStorage.setItem('pendingInvite', code);
    navigate('/login', { state: { from: `/join/${code}` } });
  };

  const goToRegister = () => {
    localStorage.setItem('pendingInvite', code);
    navigate('/register', { state: { from: `/join/${code}` } });
  };

  if (status === 'checking') {
    return (
      <div className="join-page">
        <div className="join-container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Verificando invitación...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="join-page">
        <div className="join-container error-container">
          <div className="error-icon">❌</div>
          <h2>Invitación no válida</h2>
          <p>{error}</p>
          <button className="primary-button" onClick={() => navigate('/')}>
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  if (status === 'accepted') {
    return (
      <div className="join-page">
        <div className="join-container success-container">
          <div className="success-icon">✅</div>
          <h2>¡Bienvenido!</h2>
          <p>Te has unido exitosamente como cuidador</p>
          <p className="redirect-message">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  // status === 'valid'
  return (
    <div className="join-page">
      <div className="join-container">
        <div className="logo">🪺 Nido</div>
        
        {invitation && (
          <>
            <h2>Invitación para cuidar a</h2>
            <div className="baby-name">{invitation.babies?.name || 'Bebé'}</div>
            
            <div className="role-badge">
              {invitation.role === 'collaborator' ? '👥 Colaborador' : '👁️ Observador'}
            </div>
            
            <div className="role-description">
              {invitation.role === 'collaborator' 
                ? 'Podrás añadir y editar registros de alimentación y sueño'
                : 'Podrás ver los registros pero no editarlos'
              }
            </div>

            {user ? (
              <>
                <p className="user-info">
                  Conectado como: <strong>{user.email}</strong>
                </p>
                <button className="primary-button" onClick={acceptInvitation}>
                  Aceptar invitación
                </button>
                <button className="secondary-button" onClick={() => navigate('/')}>
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <p className="auth-message">
                  Necesitas una cuenta para aceptar esta invitación
                </p>
                <button className="primary-button" onClick={goToLogin}>
                  Iniciar sesión
                </button>
                <button className="secondary-button" onClick={goToRegister}>
                  Crear cuenta nueva
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JoinBaby;