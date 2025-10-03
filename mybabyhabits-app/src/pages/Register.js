// src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulario
    if (password !== confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }
    
    try {
      setError('');
      setLoading(true);
      
      console.log('Intentando registrar usuario:', { email, firstName, lastName });
      
      const result = await signUp(email, password, firstName, lastName);
      console.log('Resultado del registro:', result);
      
      navigate('/');
    } catch (error) {
      console.error('Error detallado al registrar usuario:', error);
      
      // Mostrar mensaje de error específico si está disponible
      if (error.message) {
        setError(`Error: ${error.message}`);
      } else {
        setError('Error al crear la cuenta. Por favor, inténtalo de nuevo.');
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
      console.error('Error al registrarse con Google:', error);
      setError(error?.message || 'No pudimos conectar con Google. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Crear Cuenta</h2>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="firstName">Nombre</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Apellido</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          
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
              minLength="6"
            />
            <small className="form-text">La contraseña debe tener al menos 6 caracteres</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <div className="auth-divider">
          <span>O crea tu cuenta con</span>
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
            ¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;