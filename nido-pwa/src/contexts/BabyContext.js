// src/contexts/BabyContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../supabase/config';
import { useAuth } from './AuthContext';

const BabyContext = createContext();

export const useBaby = () => {
  const context = useContext(BabyContext);
  if (!context) {
    throw new Error('useBaby must be used within a BabyProvider');
  }
  return context;
};

export const BabyProvider = ({ children }) => {
  const [babies, setBabies] = useState([]);
  const [currentBaby, setCurrentBaby] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { user } = useAuth();

  // Cargar bebés cuando cambia el usuario
  useEffect(() => {
    if (user) {
      console.log('👶 BabyContext: Usuario detectado, cargando bebés...');
      loadBabies();
    } else {
      console.log('👶 BabyContext: No hay usuario, limpiando estado...');
      setBabies([]);
      setCurrentBaby(null);
      setError(null);
    }
  }, [user]);

  const loadBabies = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      console.log('👶 BabyContext: Haciendo consulta a Supabase...');

      const { data, error } = await supabase
        .from('babies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('👶 BabyContext: Error en consulta:', error);
        throw error;
      }

      console.log('👶 BabyContext: Bebés obtenidos:', data?.length || 0, data);

      setBabies(data || []);
      
      // Solo seleccionar bebé automáticamente si no hay uno actual Y hay bebés
      if (data && data.length > 0 && !currentBaby) {
        console.log('👶 BabyContext: Seleccionando primer bebé automáticamente:', data[0].name);
        setCurrentBaby(data[0]);
      }

    } catch (err) {
      console.error('👶 BabyContext: Error cargando bebés:', err);
      setError('Error cargando bebés: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addBaby = async (babyData) => {
    if (!user) throw new Error('Usuario no autenticado');
  
    try {
      setLoading(true);
      setError(null);
  
      const newBabyData = {
        name: babyData.name.trim(),
        birthdate: babyData.birthdate,
        user_id: user.id
      };
  
      const { data, error } = await supabase
        .from('babies')
        .insert([newBabyData])
        .select()
        .single();
  
      if (error) throw error;
  
      setBabies(prev => [...prev, data]);
      setCurrentBaby(data);
  
      return data;
  
    } catch (err) {
      setError('Error: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const selectBaby = (babyId) => {
    const baby = babies.find(b => b.id === babyId);
    if (baby) {
      console.log('👶 BabyContext: Bebé seleccionado manualmente:', baby.name);
      setCurrentBaby(baby);
    }
  };

  const value = {
    babies,
    currentBaby,
    loading,
    error,
    addBaby,
    selectBaby,
    loadBabies
  };

  return (
    <BabyContext.Provider value={value}>
      {children}
    </BabyContext.Provider>
  );
};