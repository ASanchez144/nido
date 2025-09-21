// src/components/SmartHomePage.js - LÓGICA INTELIGENTE VERIFICADA
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LandingPage from '../pages/LandingPage';
import Home from '../pages/Home';
import Header from './layout/Header';
import NavBar from './layout/NavBar';
import ProtectedRoute from './auth/ProtectedRoute';

const SmartHomePage = () => {
  const { user, loading } = useAuth();

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #c7d2fe 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e0e7ff',
            borderTop: '4px solid #4f46e5',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          Cargando MyBabyHabits...
        </div>
      </div>
    );
  }

  // Si NO hay usuario → Landing Page (sin header/navbar)
  if (!user) {
    return <LandingPage />;
  }

  // Si SÍ hay usuario → Dashboard (con header/navbar)
  return (
    <>
      <Header />
      <main className="main-content">
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      </main>
      <NavBar />
    </>
  );
};

export default SmartHomePage;