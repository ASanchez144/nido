// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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
      <Router>
        <div className="app">
          <Header />
          
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/night-mode" element={<NightMode />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/caregivers" element={<Caregivers />} />
            </Routes>
          </main>
          
          <NavBar />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;