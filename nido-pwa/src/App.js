// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BabyProvider } from './contexts/BabyContext';
import { TrackingProvider } from './contexts/TrackingContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/layout/Header';
import NavBar from './components/layout/NavBar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NightMode from './pages/NightMode';
import Stats from './pages/Stats';
import Settings from './pages/Settings';
import Caregivers from './pages/Caregivers';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BabyProvider>
        <TrackingProvider>
          <Router>
            <div className="app">
              <Header />
              
              <main className="main-content">
                <Routes>
                  {/* Rutas públicas */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
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
          </Router>
        </TrackingProvider>
      </BabyProvider>
    </AuthProvider>
  );
}

export default App;