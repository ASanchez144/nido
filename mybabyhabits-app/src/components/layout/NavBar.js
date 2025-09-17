import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  const location = useLocation();
  
  // Comprobar si la ruta actual coincide con la ruta del enlace
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <Link to="/" className={`nav-item ${isActive('/')}`}>
        <span className="nav-icon">🏠</span>
        <span className="nav-text">Inicio</span>
      </Link>
      
      <Link to="/night-mode" className={`nav-item ${isActive('/night-mode')}`}>
        <span className="nav-icon">🌙</span>
        <span className="nav-text">Noche</span>
      </Link>
      
      <Link to="/stats" className={`nav-item ${isActive('/stats')}`}>
        <span className="nav-icon">📊</span>
        <span className="nav-text">Estadísticas</span>
      </Link>
      
      <Link to="/caregivers" className={`nav-item ${isActive('/caregivers')}`}>
        <span className="nav-icon">👥</span>
        <span className="nav-text">Cuidadores</span>
      </Link>
      
      <Link to="/settings" className={`nav-item ${isActive('/settings')}`}>
        <span className="nav-icon">⚙️</span>
        <span className="nav-text">Ajustes</span>
      </Link>
    </nav>
  );
};

export default NavBar;