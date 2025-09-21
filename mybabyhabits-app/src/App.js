// src/App.js - ROUTER INTELIGENTE FINAL VERIFICADO
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BabyProvider } from './contexts/BabyContext'; 
import { TrackingProvider } from './contexts/TrackingContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import Header from './components/layout/Header';
import NavBar from './components/layout/NavBar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage'; // ← NUEVA LANDING PAGE
import NightMode from './pages/NightMode';
import Stats from './pages/Stats';
import Settings from './pages/Settings';
import Caregivers from './pages/Caregivers';
import AddBaby from './pages/AddBaby';
import JoinBaby from './pages/JoinBaby';
import InvitePage from './pages/InvitePage';

// Components
import SmartHomePage from './components/SmartHomePage';
import './App.css';

// Componente de mantenimiento (MANTENER COMO ESTABA)
const MaintenancePage = () => (
  <div style={{ 
    textAlign: 'center', 
    padding: '20px',
    maxWidth: '600px',
    margin: '20px auto',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }}>
    <h2>Base de datos en configuración</h2>
    <p>Es necesario ejecutar el script SQL en Supabase para crear las tablas necesarias.</p>
    <p>Error: La tabla "caregivers" no existe en la base de datos.</p>
    <button 
      onClick={() => {
        localStorage.clear();
        window.location.reload();
      }}
      style={{
        backgroundColor: '#4caf50',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '15px'
      }}
    >
      Reintentar después de configurar la base de datos
    </button>
  </div>
);

function App() {
  // MANTENER COMO ESTABA - No tocar si no hay problemas
  const [maintenanceMode] = useState(false);
  
  return (
    <AuthProvider>
      <BabyProvider>
        <ThemeProvider>
          <Router>
            {maintenanceMode ? (
              // Modo mantenimiento MANTENER IGUAL
              <div className="app">
                <Header />
                <main className="main-content">
                  <MaintenancePage />
                </main>
                <NavBar />
              </div>
            ) : (
              // Aplicación normal CON ROUTER INTELIGENTE
              <TrackingProvider>
                <div className="app">
                  <Routes>
                    {/* 🧠 RUTA INTELIGENTE: "/" decide automáticamente */}
                    <Route path="/" element={<SmartHomePage />} />
                    
                    {/* 🎨 RUTA DIRECTA A LANDING (para testing) */}
                    <Route path="/landing" element={<LandingPage />} />
                    
                    {/* 🔐 Rutas públicas CON layout normal */}
                    <Route path="/login" element={
                      <>
                        <Header />
                        <main className="main-content">
                          <PublicRoute>
                            <Login />
                          </PublicRoute>
                        </main>
                        <NavBar />
                      </>
                    } />
                    
                    <Route path="/register" element={
                      <>
                        <Header />
                        <main className="main-content">
                          <PublicRoute>
                            <Register />
                          </PublicRoute>
                        </main>
                        <NavBar />
                      </>
                    } />
                    
                    {/* 📧 Invitaciones - MANTENER IGUAL */}
                    <Route path="/invite" element={
                      <>
                        <Header />
                        <main className="main-content">
                          <InvitePage />
                        </main>
                        <NavBar />
                      </>
                    } />
                    
                    <Route path="/join/:code" element={
                      <>
                        <Header />
                        <main className="main-content">
                          <InvitePage />
                        </main>
                        <NavBar />
                      </>
                    } />
                    
                    {/* 🏠 Rutas protegidas - MANTENER IGUAL */}
                    <Route path="/dashboard" element={
                      <>
                        <Header />
                        <main className="main-content">
                          <ProtectedRoute>
                            <Home />
                          </ProtectedRoute>
                        </main>
                        <NavBar />
                      </>
                    } />
                    
                    <Route path="/night-mode" element={
                      <>
                        <Header />
                        <main className="main-content">
                          <ProtectedRoute>
                            <NightMode />
                          </ProtectedRoute>
                        </main>
                        <NavBar />
                      </>
                    } />
                    
                    <Route path="/stats" element={
                      <>
                        <Header />
                        <main className="main-content">
                          <ProtectedRoute>
                            <Stats />
                          </ProtectedRoute>
                        </main>
                        <NavBar />
                      </>
                    } />
                    
                    <Route path="/settings" element={
                      <>
                        <Header />
                        <main className="main-content">
                          <ProtectedRoute>
                            <Settings />
                          </ProtectedRoute>
                        </main>
                        <NavBar />
                      </>
                    } />
                    
                    <Route path="/caregivers" element={
                      <>
                        <Header />
                        <main className="main-content">
                          <ProtectedRoute>
                            <Caregivers />
                          </ProtectedRoute>
                        </main>
                        <NavBar />
                      </>
                    } />
                    
                    <Route path="/add-baby" element={
                      <>
                        <Header />
                        <main className="main-content">
                          <ProtectedRoute>
                            <AddBaby />
                          </ProtectedRoute>
                        </main>
                        <NavBar />
                      </>
                    } />
                  </Routes>
                </div>
              </TrackingProvider>
            )}
          </Router>
        </ThemeProvider>
      </BabyProvider>
    </AuthProvider>
  );
}

export default App;