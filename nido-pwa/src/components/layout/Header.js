// src/components/layout/Header.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useBaby } from '../../contexts/BabyContext';
import './Header.css';

const Header = () => {
  const { user, signOut } = useAuth();
  const { currentBaby, babies, selectBaby } = useBaby();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showBabyMenu, setShowBabyMenu] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    if (isSigningOut) return; // Prevenir múltiples clicks
    
    try {
      setIsSigningOut(true);
      setShowUserMenu(false);
      
      console.log('🚪 Iniciando cierre de sesión...');
      await signOut();
      
      console.log('✅ Sesión cerrada, redirigiendo...');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      alert('Error al cerrar sesión: ' + error.message);
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleBabySelect = (baby) => {
    selectBaby(baby.id);
    setShowBabyMenu(false);
  };

  // Si no hay usuario, no mostrar header
  if (!user) {
    return null;
  }

  return (
    <header className="app-header">
      <div className="header-content">
        <Link to="/" className="logo">
          👶
        </Link>

        <div className="header-actions">
          {/* Selector de bebé */}
          {babies && babies.length > 0 && (
            <div className="baby-selector">
              <button 
                className="baby-button"
                onClick={() => setShowBabyMenu(!showBabyMenu)}
                disabled={isSigningOut}
              >
                {currentBaby ? `👶 ${currentBaby.name}` : '👶 Seleccionar bebé'}
                <span className={`arrow ${showBabyMenu ? 'up' : 'down'}`}>▼</span>
              </button>

              {showBabyMenu && (
                <div className="baby-menu">
                  {babies.map(baby => (
                    <button
                      key={baby.id}
                      className={`baby-option ${currentBaby?.id === baby.id ? 'active' : ''}`}
                      onClick={() => handleBabySelect(baby)}
                    >
                      👶 {baby.name}
                      {currentBaby?.id === baby.id && <span className="check">✓</span>}
                    </button>
                  ))}
                  <hr />
                  <Link 
                    to="/add-baby" 
                    className="baby-option add-baby"
                    onClick={() => setShowBabyMenu(false)}
                  >
                    ➕ Agregar bebé
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Menú de usuario */}
          <div className="user-menu">
            <button 
              className="user-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              disabled={isSigningOut}
            >
              👤
              <span className={`arrow ${showUserMenu ? 'up' : 'down'}`}>▼</span>
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-info">
                  <span className="user-email">{user.email}</span>
                </div>
                <hr />
                <Link 
                  to="/settings" 
                  className="menu-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  ⚙️ Configuración
                </Link>
                <Link 
                  to="/caregivers" 
                  className="menu-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  👥 Cuidadores
                </Link>
                <hr />
                <button 
                  onClick={handleSignOut}
                  className="menu-item signout"
                  disabled={isSigningOut}
                >
                  {isSigningOut ? '🔄 Cerrando...' : '🚪 Cerrar sesión'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay para cerrar menús */}
      {(showUserMenu || showBabyMenu) && (
        <div 
          className="menu-overlay"
          onClick={() => {
            setShowUserMenu(false);
            setShowBabyMenu(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;