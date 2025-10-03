
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
      const cleanUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  useEffect(() => {
    if (loading) return;

    if (user) {
      navigate('/', { replace: true });
    } else {
      setShowError(true);
    }
  }, [loading, user, navigate]);

  const handleRetry = () => {
    navigate('/login', { replace: true });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Conectando con Google…</h2>
        {showError ? (
          <>
            <div className="auth-error">
              No pudimos confirmar tu sesión con Google. Puedes intentarlo de nuevo o usar tu correo y contraseña.
            </div>
            <button type="button" className="auth-button" onClick={handleRetry}>
              Volver al inicio de sesión
            </button>
          </>
        ) : (
          <p className="auth-status-text">
            Estamos validando tus credenciales. Este proceso puede tardar unos segundos…
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;