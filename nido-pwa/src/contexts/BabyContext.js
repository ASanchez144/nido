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
  
  const { user, loading: authLoading } = useAuth();

  // Cargar bebés cuando el usuario esté disponible
  useEffect(() => {
    if (user && !authLoading) {
      console.log('👶 BabyContext: Loading babies for user:', user.email);
      loadBabies();
    } else if (!user && !authLoading) {
      console.log('👶 BabyContext: No user, clearing state');
      setBabies([]);
      setCurrentBaby(null);
      setError(null);
    }
  }, [user, authLoading]);

  // Auto-seleccionar primer bebé
  useEffect(() => {
    if (babies.length > 0 && !currentBaby) {
      console.log('👶 BabyContext: Auto-selecting first baby:', babies[0].name);
      setCurrentBaby(babies[0]);
      localStorage.setItem('selectedBabyId', babies[0].id);
    }
  }, [babies, currentBaby]);

  // Restaurar bebé seleccionado
  useEffect(() => {
    const savedBabyId = localStorage.getItem('selectedBabyId');
    if (savedBabyId && babies.length > 0) {
      const baby = babies.find(b => b.id === savedBabyId);
      if (baby && (!currentBaby || baby.id !== currentBaby.id)) {
        console.log('👶 BabyContext: Restoring selected baby:', baby.name);
        setCurrentBaby(baby);
      }
    }
  }, [babies]);

  const loadBabies = async () => {
    if (!user) {
      console.log('👶 BabyContext: No user available');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('👶 BabyContext: Fetching babies from Supabase...');

      const { data, error } = await supabase
        .from('babies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('👶 BabyContext: Supabase error:', error);
        throw error;
      }

      console.log('👶 BabyContext: Babies loaded successfully:', data?.length || 0);
      setBabies(data || []);

    } catch (err) {
      console.error('👶 BabyContext: Error loading babies:', err);
      setError('Error cargando bebés: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addBaby = async (babyData) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    console.log('👶 BabyContext: Adding baby:', babyData);
    
    try {
      setLoading(true);
      setError(null);

      // Validaciones
      if (!babyData.name?.trim()) {
        throw new Error('El nombre del bebé es requerido');
      }
      if (!babyData.birth_date) {
        throw new Error('La fecha de nacimiento es requerida');
      }

      // Validar fecha no sea futura
      const birthDate = new Date(babyData.birth_date);
      const today = new Date();
      if (birthDate > today) {
        throw new Error('La fecha de nacimiento no puede ser en el futuro');
      }

      const newBabyData = {
        name: babyData.name.trim(),
        birth_date: babyData.birth_date,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('👶 BabyContext: Inserting baby data:', newBabyData);

      const { data, error } = await supabase
        .from('babies')
        .insert([newBabyData])
        .select()
        .single();

      if (error) {
        console.error('👶 BabyContext: Supabase insert error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No se recibieron datos del bebé creado');
      }

      console.log('👶 BabyContext: Baby created successfully:', data);

      // Actualizar estado local
      setBabies(prevBabies => [...prevBabies, data]);
      setCurrentBaby(data);
      localStorage.setItem('selectedBabyId', data.id);

      return data;

    } catch (err) {
      console.error('👶 BabyContext: Add baby error:', err);
      setError('Error añadiendo bebé: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBaby = async (babyId, updates) => {
    try {
      setLoading(true);
      setError(null);

      console.log('👶 BabyContext: Updating baby:', babyId, updates);

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('babies')
        .update(updateData)
        .eq('id', babyId)
        .eq('user_id', user.id) // Seguridad adicional
        .select()
        .single();

      if (error) {
        console.error('👶 BabyContext: Update error:', error);
        throw error;
      }

      console.log('👶 BabyContext: Baby updated successfully');

      // Actualizar estado local
      setBabies(prevBabies => 
        prevBabies.map(baby => baby.id === babyId ? data : baby)
      );

      if (currentBaby?.id === babyId) {
        setCurrentBaby(data);
      }

      return data;

    } catch (err) {
      console.error('👶 BabyContext: Update baby error:', err);
      setError('Error actualizando bebé: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBaby = async (babyId) => {
    try {
      setLoading(true);
      setError(null);

      console.log('👶 BabyContext: Deleting baby:', babyId);

      const { error } = await supabase
        .from('babies')
        .delete()
        .eq('id', babyId)
        .eq('user_id', user.id); // Seguridad adicional

      if (error) {
        console.error('👶 BabyContext: Delete error:', error);
        throw error;
      }

      console.log('👶 BabyContext: Baby deleted successfully');

      // Actualizar estado local
      setBabies(prevBabies => prevBabies.filter(baby => baby.id !== babyId));

      if (currentBaby?.id === babyId) {
        const remainingBabies = babies.filter(baby => baby.id !== babyId);
        if (remainingBabies.length > 0) {
          setCurrentBaby(remainingBabies[0]);
          localStorage.setItem('selectedBabyId', remainingBabies[0].id);
        } else {
          setCurrentBaby(null);
          localStorage.removeItem('selectedBabyId');
        }
      }

    } catch (err) {
      console.error('👶 BabyContext: Delete baby error:', err);
      setError('Error eliminando bebé: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const selectBaby = (babyId) => {
    const baby = babies.find(b => b.id === babyId);
    if (baby) {
      console.log('👶 BabyContext: Selecting baby:', baby.name);
      setCurrentBaby(baby);
      localStorage.setItem('selectedBabyId', baby.id);
    } else {
      console.error('👶 BabyContext: Baby not found:', babyId);
    }
  };

  const refreshBabies = async () => {
    await loadBabies();
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    babies,
    currentBaby,
    loading,
    error,
    addBaby,
    updateBaby,
    deleteBaby,
    selectBaby,
    refreshBabies,
    clearError
  };

  return (
    <BabyContext.Provider value={value}>
      {children}
    </BabyContext.Provider>
  );
};