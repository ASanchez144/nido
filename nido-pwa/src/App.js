// src/App.js - Con ThemeProvider añadido
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BabyProvider } from './contexts/BabyContext'; 
import { TrackingProvider } from './contexts/TrackingContext';
import { ThemeProvider } from './contexts/ThemeContext'; // Importar ThemeProvider
import ProtectedRoute from './components/auth/ProtectedRoute';
import Header from './components/layout/Header';
import NavBar from './components/layout/NavBar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NightMode from './pages/NightMode';
import Stats from './pages/Stats';
import Settings from './pages/Settings';
import Caregivers from './pages/Caregivers';
import JoinBaby from './pages/JoinBaby';
import './App.css';

// Componente de mantenimiento
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
  // Estado para controlar si mostramos mantenimiento o la app normal
  const [maintenanceMode] = useState(false);
  
  return (
    <AuthProvider>
      <BabyProvider>
        <ThemeProvider> {/* Envolver toda la aplicación con ThemeProvider */}
          <Router>
            {maintenanceMode ? (
              // Modo mantenimiento con Router
              <div className="app">
                <Header />
                <main className="main-content">
                  <MaintenancePage />
                </main>
                <NavBar />
              </div>
            ) : (
              // Aplicación normal
              <TrackingProvider>
                <div className="app">
                  <Header />
                  
                  <main className="main-content">
                    <Routes>
                      {/* Rutas públicas */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/join/:code" element={<JoinBaby />} />
                      {/* Rutas protegidas */}
                      <Route path="/" element={
                        <ProtectedRoute>
                          <Home />
                        </ProtectedRoute>
                      } />
                      <Route path="/night-mode" element={
                        <ProtectedRoute>
                          <NightMode />
                        </ProtectedRoute>
                      } />
                      <Route path="/stats" element={
                        <ProtectedRoute>
                          <Stats />
                        </ProtectedRoute>
                      } />
                      <Route path="/settings" element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      } />
                      <Route path="/caregivers" element={
                        <ProtectedRoute>
                          <Caregivers />
                        </ProtectedRoute>
                      } />
                    </Routes>
                  </main>
                  
                  <NavBar />
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