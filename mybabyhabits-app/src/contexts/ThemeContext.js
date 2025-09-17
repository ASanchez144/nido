// src/contexts/ThemeContext.js - Versión corregida
import React, { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto
const ThemeContext = createContext();

// Hook personalizado para usar el tema
export const useTheme = () => {
  return useContext(ThemeContext);
};

// Proveedor del tema
export const ThemeProvider = ({ children }) => {
  // Función para obtener la preferencia inicial guardada o usar la preferencia del sistema
  const getInitialDarkMode = () => {
    // Primero verificar si hay una preferencia guardada en localStorage
    const savedTheme = localStorage.getItem('nido-dark-mode');
    if (savedTheme !== null) {
      return savedTheme === 'true';
    }
    
    // Si no hay preferencia guardada, usar la preferencia del sistema
    // pero NO activar automáticamente el modo oscuro por defecto
    return false;
  };

  // Estado para el modo oscuro
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);

  // Efecto para aplicar el tema al cambiar
  useEffect(() => {
    // Aplicar o quitar la clase 'dark-mode' del body según el estado
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    // Guardar preferencia en localStorage
    localStorage.setItem('nido-dark-mode', darkMode);
    
    console.log('ThemeContext: Modo oscuro:', darkMode ? 'ACTIVADO' : 'DESACTIVADO');
  }, [darkMode]);

  // Función para alternar el modo oscuro
  const toggleDarkMode = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      console.log('ThemeContext: Cambiando modo oscuro a:', newMode ? 'ACTIVADO' : 'DESACTIVADO');
      return newMode;
    });
  };

  // Valores proporcionados por el contexto
  const value = {
    darkMode,
    toggleDarkMode,
    setDarkMode
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};