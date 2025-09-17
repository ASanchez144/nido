// src/components/auth/PublicRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('🌐 PublicRoute: Verificando acceso', { 
    hasUser: !!user, 
    userEmail: user?.email,
    isLoading: loading 
  });

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh',
        fontSize: '18px'
      }}>
        Verificando autenticación...
      </div>
    );
  }

  // Si hay usuario, redirigir al dashboard
  if (user) {
    console.log('🌐 PublicRoute: Usuario ya autenticado, redirigiendo a home');
    return <Navigate to="/" replace />;
  }

  // Si no hay usuario, mostrar la página pública (login/register)
  console.log('🌐 PublicRoute: No hay usuario, mostrando página pública');
  return children;
};

export default PublicRoute;