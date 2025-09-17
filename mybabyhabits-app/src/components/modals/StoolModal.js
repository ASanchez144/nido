// src/components/modals/StoolModal.js
import React, { useState, useCallback } from 'react';
import { useTracking } from '../../contexts/TrackingContext';

const StoolModal = ({ isOpen, onClose, diaperType }) => {
  const { addDiaperEvent } = useTracking();
  
  const [stoolDetails, setStoolDetails] = useState({
    color: '',
    texture: '',
    hasMucus: false
  });

  const handleColorSelect = useCallback((colorValue) => {
    setStoolDetails(prev => ({ ...prev, color: colorValue }));
  }, []);

  const handleTextureSelect = useCallback((textureValue) => {
    setStoolDetails(prev => ({ ...prev, texture: textureValue }));
  }, []);

  const handleMucusToggle = useCallback((e) => {
    setStoolDetails(prev => ({ ...prev, hasMucus: e.target.checked }));
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      await addDiaperEvent(diaperType, stoolDetails);
      setStoolDetails({ color: '', texture: '', hasMucus: false });
      onClose();
    } catch (error) {
      console.error('Error en pañal:', error);
      alert('Error: ' + error.message);
    }
  }, [stoolDetails, diaperType, addDiaperEvent, onClose]);

  const handleCancel = useCallback(() => {
    setStoolDetails({ color: '', texture: '', hasMucus: false });
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes stoolModalSlideIn {
            from { opacity: 0; transform: translateY(-20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .stool-modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.6); display: flex; align-items: center;
            justify-content: center; z-index: 1000; padding: 20px;
          }
          .stool-modal-content {
            background: white; border-radius: 20px; padding: 30px;
            width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3); animation: stoolModalSlideIn 0.3s ease-out;
          }
        `
      }} />
      
      <div className="stool-modal-overlay" onClick={handleCancel}>
        <div className="stool-modal-content" onClick={(e) => e.stopPropagation()}>
          <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '3px solid #f0f8ff', paddingBottom: '20px' }}>
            <h3 style={{ margin: '0', color: '#2563eb', fontSize: '1.4rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              💩 Detalles de la Deposición
            </h3>
            <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
              Ayúdanos a llevar un mejor registro
            </p>
          </div>
          
          {/* Colores */}
          <div style={{ marginBottom: '35px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>🎨</span>
              <h4 style={{ margin: '0', fontSize: '1.1rem', fontWeight: '600', color: '#1e293b' }}>
                ¿Qué color tenía?
              </h4>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {[
                { value: 'yellow', name: 'Amarillo', emoji: '🟡', bg: 'linear-gradient(135deg, #fef08a, #eab308)', textColor: '#92400e' },
                { value: 'brown', name: 'Marrón', emoji: '🤎', bg: 'linear-gradient(135deg, #d97706, #92400e)', textColor: 'white' },
                { value: 'green', name: 'Verde', emoji: '🟢', bg: 'linear-gradient(135deg, #84cc16, #16a34a)', textColor: 'white' },
                { value: 'orange', name: 'Naranja', emoji: '🟠', bg: 'linear-gradient(135deg, #fb923c, #ea580c)', textColor: 'white' },
                { value: 'red', name: 'Rojizo', emoji: '🔴', bg: 'linear-gradient(135deg, #f87171, #dc2626)', textColor: 'white' },
                { value: 'black', name: 'Negro', emoji: '⚫', bg: 'linear-gradient(135deg, #374151, #111827)', textColor: 'white' },
                { value: 'white', name: 'Blanco', emoji: '⚪', bg: 'linear-gradient(135deg, #f8fafc, #e2e8f0)', textColor: '#374151' },
                { value: 'dark_green', name: 'Verde oscuro', emoji: '🌿', bg: 'linear-gradient(135deg, #16a34a, #14532d)', textColor: 'white' }
              ].map(color => {
                const isSelected = stoolDetails.color === color.value;
                return (
                  <button
                    key={color.value}
                    onClick={() => handleColorSelect(color.value)}
                    style={{
                      padding: '18px 14px', border: isSelected ? '4px solid #2563eb' : '3px solid transparent',
                      borderRadius: '16px', background: isSelected ? `linear-gradient(white, white), ${color.bg}` : color.bg,
                      backgroundOrigin: 'border-box', backgroundClip: isSelected ? 'padding-box, border-box' : 'padding-box',
                      cursor: 'pointer', fontSize: '16px', fontWeight: '700', textAlign: 'center',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                      transition: 'all 0.2s ease', color: isSelected ? '#2563eb' : color.textColor,
                      boxShadow: isSelected ? '0 10px 25px rgba(37,99,235,0.3)' : '0 4px 10px rgba(0,0,0,0.1)',
                      transform: isSelected ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)'
                    }}
                  >
                    <span style={{ fontSize: '28px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
                      {color.emoji}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>
                      {color.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Texturas */}
          <div style={{ marginBottom: '35px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>👇</span>
              <h4 style={{ margin: '0', fontSize: '1.1rem', fontWeight: '600', color: '#1e293b' }}>
                ¿Cómo era la consistencia?
              </h4>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              {[
                { value: 'soft_seedy', emoji: '🌱', desc: 'Suave con granitos', subtext: 'Como mostaza con semillas', bg: '#f0fdf4' },
                { value: 'watery', emoji: '💧', desc: 'Líquida / Aguada', subtext: 'Muy fluida, como agua', bg: '#eff6ff' },
                { value: 'pasty', emoji: '🥜', desc: 'Pastosa cremosa', subtext: 'Como mantequilla de maní', bg: '#fffbeb' },
                { value: 'firm_formed', emoji: '🥖', desc: 'Firme y bien formada', subtext: 'Con forma definida', bg: '#fef3c7' },
                { value: 'soft_formed', emoji: '🍞', desc: 'Suave pero con forma', subtext: 'Como pan blando', bg: '#fdf4ff' },
                { value: 'hard_pellets', emoji: '🔵', desc: 'Bolitas duras', subtext: 'Como pelotitas pequeñas', bg: '#f1f5f9' },
                { value: 'very_watery', emoji: '🌊', desc: 'Muy líquida / Diarrea', subtext: 'Sin consistencia', bg: '#fef2f2' },
                { value: 'mucousy', emoji: '🫧', desc: 'Con mucosidad', subtext: 'Viscosa y pegajosa', bg: '#f0fdfa' }
              ].map(texture => {
                const isSelected = stoolDetails.texture === texture.value;
                return (
                  <button
                    key={texture.value}
                    onClick={() => handleTextureSelect(texture.value)}
                    style={{
                      padding: '16px 20px', border: isSelected ? '3px solid #2563eb' : '2px solid #e2e8f0',
                      borderRadius: '14px', backgroundColor: isSelected ? '#dbeafe' : texture.bg,
                      cursor: 'pointer', fontSize: '15px', fontWeight: '500', textAlign: 'left',
                      display: 'grid', gridTemplateColumns: '40px 1fr', alignItems: 'center', gap: '15px',
                      transition: 'all 0.2s ease', boxShadow: isSelected ? '0 4px 12px rgba(37,99,235,0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
                      transform: isSelected ? 'translateY(-1px)' : 'translateY(0)', color: isSelected ? '#1e40af' : '#374151'
                    }}
                  >
                    <span style={{ fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {texture.emoji}
                    </span>
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '2px', fontSize: '15px' }}>
                        {texture.desc}
                      </div>
                      <div style={{ fontSize: '12px', color: isSelected ? '#3b82f6' : '#64748b', fontStyle: 'italic' }}>
                        {texture.subtext}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mocos */}
          <div style={{ marginBottom: '35px' }}>
            <label style={{ 
              display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '18px 20px',
              backgroundColor: stoolDetails.hasMucus ? '#dcfce7' : '#f8fafc',
              border: stoolDetails.hasMucus ? '3px solid #16a34a' : '2px solid #e2e8f0',
              borderRadius: '14px', fontSize: '16px', fontWeight: '600', transition: 'all 0.2s ease',
              boxShadow: stoolDetails.hasMucus ? '0 4px 12px rgba(22,163,74,0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
              color: stoolDetails.hasMucus ? '#15803d' : '#475569'
            }}>
              <input
                type="checkbox"
                checked={stoolDetails.hasMucus}
                onChange={handleMucusToggle}
                style={{ width: '20px', height: '20px', cursor: 'pointer', marginRight: '15px', accentColor: '#16a34a' }}
              />
              <span style={{ fontSize: '24px', marginRight: '10px' }}>🟢</span>
              <div>
                <div>Contiene mocos</div>
                <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>
                  Mucosidad visible en las heces
                </div>
              </div>
            </label>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '15px' }}>
            <button 
              onClick={handleSubmit}
              style={{
                flex: 1, padding: '18px 24px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer',
                fontWeight: '700', fontSize: '16px', boxShadow: '0 6px 20px rgba(37,99,235,0.3)',
                transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              <span style={{ fontSize: '18px' }}>✅</span> Registrar
            </button>
            
            <button 
              onClick={handleCancel}
              style={{
                flex: 1, padding: '18px 24px', background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                color: '#475569', border: '2px solid #cbd5e1', borderRadius: '14px', cursor: 'pointer',
                fontWeight: '600', fontSize: '16px', transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              <span style={{ fontSize: '18px' }}>❌</span> Cancelar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default StoolModal;