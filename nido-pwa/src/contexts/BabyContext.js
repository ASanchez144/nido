// src/contexts/BabyContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

// Crear el contexto
const BabyContext = createContext();

// Hook personalizado para usar el contexto
export const useBaby = () => {
  return useContext(BabyContext);
};

// Proveedor del contexto
export const BabyProvider = ({ children }) => {
  const [babies, setBabies] = useState([]);
  const [currentBaby, setCurrentBaby] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Cargar bebés del usuario
  useEffect(() => {
    const loadBabies = async () => {
      if (!currentUser) {
        setBabies([]);
        setCurrentBaby(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const babiesRef = collection(db, 'babies');
        const q = query(babiesRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const babyList = [];
        querySnapshot.forEach((doc) => {
          babyList.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setBabies(babyList);
        
        // Seleccionar el primer bebé como actual si hay bebés y no hay ninguno seleccionado
        if (babyList.length > 0 && !currentBaby) {
          setCurrentBaby(babyList[0]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar bebés:', error);
        setLoading(false);
      }
    };

    loadBabies();
  }, [currentUser]);

  // Función para añadir un bebé
  const addBaby = async (babyData) => {
    if (!currentUser) return;

    try {
      const newBaby = {
        ...babyData,
        userId: currentUser.uid,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'babies'), newBaby);
      
      const babyWithId = {
        id: docRef.id,
        ...newBaby
      };
      
      setBabies([...babies, babyWithId]);
      setCurrentBaby(babyWithId);
      
      return babyWithId;
    } catch (error) {
      console.error('Error al añadir bebé:', error);
      throw error;
    }
  };

  // Función para cambiar el bebé actual
  const selectBaby = (babyId) => {
    const selected = babies.find(baby => baby.id === babyId);
    if (selected) {
      setCurrentBaby(selected);
    }
  };

  // Valor que se proporcionará a los componentes
  const value = {
    babies,
    currentBaby,
    loading,
    addBaby,
    selectBaby
  };

  return (
    <BabyContext.Provider value={value}>
      {children}
    </BabyContext.Provider>
  );
};