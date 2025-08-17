// src/components/layout/Header.js
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  // Añadir este efecto para depuración
  useEffect(() => {
    console.log('Estado de autenticación en Header:', { user, profile });
  }, [user, profile]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">
          <h1>Nido 🪺</h1>
        </Link>
      </div>
      
      <div className="user-section">
        {user ? (
          <div className="user-info">
            <span className="user-name">
              {profile?.first_name 
                ? `Hola, ${profile.first_name}` 
                : `Hola, ${user.email.split('@')[0]}`}
            </span>
            <button onClick={handleLogout} className="logout-button">
              Cerrar sesión
            </button>
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="login-link">Iniciar sesión</Link>
            <Link to="/register" className="register-link">Registrarse</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;