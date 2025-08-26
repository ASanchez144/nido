// src/contexts/BabyContext.js - Versión completa y funcional
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
  const { user } = useAuth();
  const [babies, setBabies] = useState([]);
  const [currentBaby, setCurrentBaby] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar bebés cuando el usuario cambia
  useEffect(() => {
    if (user) {
      console.log('👶 BabyContext: Usuario autenticado, cargando bebés...');
      loadBabies();
    } else {
      console.log('👶 BabyContext: Usuario no autenticado, limpiando estado...');
      setBabies([]);
      setCurrentBaby(null);
      setError(null);
    }
  }, [user]);

  // Auto-seleccionar primer bebé cuando cambia la lista
  useEffect(() => {
    if (babies.length > 0 && !currentBaby) {
      console.log('👶 BabyContext: Auto-seleccionando primer bebé:', babies[0].name);
      setCurrentBaby(babies[0]);
    }
  }, [babies, currentBaby]);

  const loadBabies = async () => {
    if (!user) {
      console.log('👶 BabyContext: No hay usuario para cargar bebés');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('👶 BabyContext: Cargando bebés para usuario:', user.id);

      // Seleccionar bebés accesibles (RLS se encarga del filtrado)
      const { data, error } = await supabase
        .from('babies')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('👶 BabyContext: Error cargando bebés:', error);
        throw error;
      }

      console.log('👶 BabyContext: Bebés cargados:', data);
      setBabies(data || []);

      if (data && data.length === 0) {
        console.log('👶 BabyContext: No se encontraron bebés');
      }

    } catch (err) {
      console.error('👶 BabyContext: Error en loadBabies:', err);
      setError('Error cargando bebés: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addBaby = async (babyData) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      console.log('👶 BabyContext: Añadiendo bebé:', babyData);

      // Validar datos
      if (!babyData.name || !babyData.name.trim()) {
        throw new Error('El nombre del bebé es requerido');
      }

      if (!babyData.birthdate) {
        throw new Error('La fecha de nacimiento es requerida');
      }

      const newBabyData = {
        name: babyData.name.trim(),
        birthdate: babyData.birthdate,
        user_id: user.id
      };

      // Insertar bebé (el trigger creará automáticamente el caregiver)
      const { data, error } = await supabase
        .from('babies')
        .insert([newBabyData])
        .select(`
          *,
          caregivers (
            role,
            user_id
          )
        `)
        .single();

      if (error) {
        console.error('👶 BabyContext: Error insertando bebé:', error);
        throw error;
      }

      console.log('👶 BabyContext: Bebé creado exitosamente:', data);

      // Actualizar estado local
      setBabies(prev => [...prev, data]);
      
      // Auto-seleccionar el nuevo bebé si es el primero
      if (babies.length === 0) {
        setCurrentBaby(data);
      }

      return data;

    } catch (err) {
      console.error('👶 BabyContext: Error en addBaby:', err);
      setError('Error añadiendo bebé: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const selectBaby = (babyId) => {
    console.log('👶 BabyContext: Seleccionando bebé con ID:', babyId);
    const baby = babies.find(b => b.id === babyId);
    if (baby) {
      console.log('👶 BabyContext: Bebé seleccionado:', baby.name);
      setCurrentBaby(baby);
    } else {
      console.warn('👶 BabyContext: Bebé no encontrado:', babyId);
    }
  };

  const updateBaby = async (babyId, updates) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      console.log('👶 BabyContext: Actualizando bebé:', babyId, updates);

      const { data, error } = await supabase
        .from('babies')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', babyId)
        .select(`
          *,
          caregivers (
            role,
            user_id
          )
        `)
        .single();

      if (error) {
        console.error('👶 BabyContext: Error actualizando bebé:', error);
        throw error;
      }

      console.log('👶 BabyContext: Bebé actualizado:', data);

      // Actualizar estado local
      setBabies(prev => prev.map(b => b.id === babyId ? data : b));
      
      if (currentBaby?.id === babyId) {
        setCurrentBaby(data);
      }

      return data;

    } catch (err) {
      console.error('👶 BabyContext: Error en updateBaby:', err);
      setError('Error actualizando bebé: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBaby = async (babyId) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      console.log('👶 BabyContext: Eliminando bebé:', babyId);

      const { error } = await supabase
        .from('babies')
        .delete()
        .eq('id', babyId);

      if (error) {
        console.error('👶 BabyContext: Error eliminando bebé:', error);
        throw error;
      }

      console.log('👶 BabyContext: Bebé eliminado exitosamente');

      // Actualizar estado local
      setBabies(prev => prev.filter(b => b.id !== babyId));
      
      // Si el bebé eliminado era el actual, limpiar selección
      if (currentBaby?.id === babyId) {
        setCurrentBaby(null);
      }

    } catch (err) {
      console.error('👶 BabyContext: Error en deleteBaby:', err);
      setError('Error eliminando bebé: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener información de caregivers
  const getCaregivers = async (babyId) => {
    if (!user || !babyId) return [];

    try {
      const { data, error } = await supabase
        .from('caregivers')
        .select(`
          *,
          users (
            email,
            full_name
          )
        `)
        .eq('baby_id', babyId);

      if (error) {
        console.error('👶 BabyContext: Error cargando caregivers:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('👶 BabyContext: Error en getCaregivers:', err);
      return [];
    }
  };

  const value = {
    babies,
    currentBaby,
    loading,
    error,
    addBaby,
    selectBaby,
    updateBaby,
    deleteBaby,
    loadBabies,
    getCaregivers
  };

  return (
    <BabyContext.Provider value={value}>
      {children}
    </BabyContext.Provider>
  );
};