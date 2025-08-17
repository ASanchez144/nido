// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import NavBar from './components/layout/NavBar';
import Home from './pages/Home';
import NightMode from './pages/NightMode';
import Caregivers from './pages/Caregivers';
import Settings from './pages/Settings';
import Stats from './pages/Stats';
import './App.css';


// Función App principal
function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/night-mode" element={<NightMode />} />
            <Route path="/caregivers" element={<Caregivers />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </main>
        
        <NavBar />
      </div>
    </Router>
  );
}

export default App;