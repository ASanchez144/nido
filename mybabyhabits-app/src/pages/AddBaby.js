// src/pages/AddBaby.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBaby } from '../contexts/BabyContext';
import './AddBaby.css';

const AddBaby = () => {
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { addBaby } = useBaby();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      // Validaciones básicas
      if (!name.trim()) {
        throw new Error('El nombre es obligatorio');
      }
      
      const babyData = {
        name: name.trim(),
        birthdate: birthdate || null,
        gender: gender || null,
        weight_at_birth: weight ? parseFloat(weight) : null,
        height_at_birth: height ? parseFloat(height) : null
      };
      
      await addBaby(babyData);
      navigate('/');
    } catch (error) {
      console.error('Error al añadir bebé:', error);
      setError(error.message || 'Error al añadir bebé. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-baby-page">
      <h2>Añadir Bebé</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="add-baby-form">
        <div className="form-group">
          <label htmlFor="name">Nombre*</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="birthdate">Fecha de nacimiento</label>
          <input
            type="date"
            id="birthdate"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="gender">Género</label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">Seleccionar...</option>
            <option value="male">Niño</option>
            <option value="female">Niña</option>
            <option value="other">Otro</option>
          </select>
        </div>
        
        <div className="form-row">
          <div className="form-group half">
            <label htmlFor="weight">Peso al nacer (kg)</label>
            <input
              type="number"
              id="weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              step="0.01"
              min="0"
            />
          </div>
          
          <div className="form-group half">
            <label htmlFor="height">Altura al nacer (cm)</label>
            <input
              type="number"
              id="height"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              step="0.1"
              min="0"
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Añadiendo...' : 'Añadir Bebé'}
        </button>
      </form>
    </div>
  );
};

export default AddBaby;