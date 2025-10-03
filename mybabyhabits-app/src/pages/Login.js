// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useAuth();

  // src/pages/Login.js - Mejorar manejo de errores
  const handleSubmit = async (e) => {
    e.preventDefault();
    

    try {
      setError('');
      setLoading(true);
      console.log('Intentando iniciar sesión con:', email);
      await signIn(email, password);
      navigate('/');
    } catch (error) {
      console.error('Error detallado al iniciar sesión:', error);
      if (error.message) {
        setError(error.message);
      } else {
        setError('Error al iniciar sesión. Por favor, verifica tus credenciales.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);

      await signInWithGoogle();
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      setError(error?.message || 'No pudimos conectar con Google. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Iniciar Sesión</h2>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
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
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
        

        <div className="auth-divider">
          <span>O continúa con</span>
        </div>

        <div className="auth-oauth-buttons">
          <button
            type="button"
            className="auth-google-button"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <span className="google-icon" aria-hidden="true">G</span>
            {loading ? 'Conectando...' : 'Continuar con Google'}
          </button>
        </div>

        <div className="auth-links">
          <p>
            ¿No tienes una cuenta? <Link to="/register">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;