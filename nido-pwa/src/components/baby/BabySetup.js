// src/components/baby/BabySetup.js
import React, { useState } from 'react';
import { useBaby } from '../../contexts/BabyContext';

const BabySetup = ({ onComplete }) => {
  const { addBaby } = useBaby();
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🍼 BabySetup: Creando bebé...', { name, birthDate });
      
      const baby = await addBaby({
        name: name.trim(),
        birthdate: new Date().toISOString().split('T')[0]  // ← MANTENER ESTE (se mapea arriba)
      });
      
      console.log('✅ BabySetup: Bebé creado exitosamente:', baby);
      
      // Limpiar formulario
      setName('');
      setBirthDate('');
      
      // Llamar callback si existe
      if (onComplete) {
        onComplete(baby);
      }
      
    } catch (error) {
      console.error('❌ BabySetup: Error creando bebé:', error);
      setError(error.message || 'Error al crear el bebé');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '40px 20px', 
      textAlign: 'center',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#007bff', marginBottom: '10px' }}>
        🪺 ¡Bienvenido a Nido!
      </h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Crea tu primer bebé para empezar
      </p>

      {error && (
        <div style={{
          background: '#fee',
          color: '#c00',
          padding: '10px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #fcc'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            Nombre del bebé *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: María, Juan..."
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            Fecha de nacimiento
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !name.trim()}
          style={{
            width: '100%',
            padding: '14px',
            background: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {loading ? '⏳ Creando bebé...' : '🍼 Crear mi bebé'}
        </button>
      </form>

      <div style={{ 
        marginTop: '30px', 
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#666'
      }}>
        <p style={{ margin: 0 }}>
          💡 <strong>Tip:</strong> Después podrás agregar más bebés desde configuración
        </p>
      </div>
    </div>
  );
};

export default BabySetup;