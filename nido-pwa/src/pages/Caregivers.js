// src/pages/Caregivers.js
import React, { useState, useEffect } from 'react';
import { useBaby } from '../contexts/BabyContext';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../supabase/config';
import './Caregivers.css';

const Caregivers = () => {
  const { currentBaby } = useBaby() || {};
  const { user } = useAuth() || {};
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [caregivers, setCaregivers] = useState([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('readonly');
  const [showShareLink, setShowShareLink] = useState(false);
  const [shareLink, setShareLink] = useState('');

  // Comprobación única de estado de administrador
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentBaby?.id || !user?.id) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('caregivers')
          .select('role')
          .eq('baby_id', currentBaby.id)
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error verificando estado de admin:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data?.role === 'admin');
        }
      } catch (error) {
        console.error('Error general verificando admin:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [currentBaby, user]);

  // Cargar cuidadores solo si es admin
  useEffect(() => {
    const loadCaregivers = async () => {
      if (!isAdmin || !currentBaby?.id) return;

      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('caregivers')
          .select('id, role, user_id')
          .eq('baby_id', currentBaby.id);

        if (error) throw error;

        // Enriquecer con información de usuarios
        const enrichedCaregivers = [];
        for (const caregiver of data || []) {
          try {
            const { data: userData } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', caregiver.user_id)
              .single();
              
            enrichedCaregivers.push({
              id: caregiver.id,
              email: userData?.email || 'Usuario desconocido',
              role: caregiver.role
            });
          } catch (error) {
            console.error('Error obteniendo datos de usuario:', error);
          }
        }

        setCaregivers(enrichedCaregivers);
      } catch (error) {
        console.error('Error cargando cuidadores:', error);
        setError('Error al cargar los cuidadores. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      loadCaregivers();
    }
  }, [isAdmin, currentBaby]);

  const handleShareBaby = async (e) => {
    e.preventDefault();
    
    if (!isAdmin || !currentBaby?.id) {
      alert('No tienes permisos para compartir este bebé');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Verificar si el usuario existe
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (userError) {
        // Usuario no encontrado, generar enlace de invitación
        const inviteCode = Math.random().toString(36).substring(2, 15);
        const link = `${window.location.origin}/invite?code=${inviteCode}&baby=${currentBaby.id}&role=${role}`;
        setShareLink(link);
        setShowShareLink(true);
        setLoading(false);
        return;
      }

      // Verificar si ya tiene acceso
      const { data: existingAccess } = await supabase
        .from('caregivers')
        .select('id')
        .eq('baby_id', currentBaby.id)
        .eq('user_id', userData.id);

      if (existingAccess && existingAccess.length > 0) {
        alert('Este usuario ya tiene acceso a este bebé');
        setLoading(false);
        return;
      }

      // Añadir acceso
      const { data, error } = await supabase
      .from('caregivers')
      .insert([
        {
          baby_id: currentBaby.id,
          user_id: userData.id,
          role: role,
          created_by: user.id
        }
      ])
      .select('id'); // <-- devuelve el id real

      if (error) throw error;

      // Añadir a la lista local
      setCaregivers([...caregivers, {
        id: data?.[0]?.id || 'temp_id',
        email,
        role
      }]);

      alert('Se ha compartido el bebé correctamente');
      setEmail('');
    } catch (error) {
      console.error('Error compartiendo bebé:', error);
      setError('Error al compartir el bebé. Intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAccess = async (caregiverId) => {
    if (!isAdmin || !currentBaby?.id) {
      alert('No tienes permisos para eliminar este acceso');
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('caregivers')
        .delete()
        .eq('id', caregiverId);

      if (error) throw error;

      // Actualizar la lista local
      setCaregivers(caregivers.filter(c => c.id !== caregiverId));
      alert('Se ha eliminado el acceso correctamente');
    } catch (error) {
      console.error('Error eliminando acceso:', error);
      setError('Error al eliminar el acceso. Intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (caregiverId, newRole) => {
    if (!isAdmin || !currentBaby?.id) {
      alert('No tienes permisos para actualizar este rol');
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('caregivers')
        .update({ role: newRole })
        .eq('id', caregiverId);

      if (error) throw error;

      // Actualizar la lista local
      setCaregivers(caregivers.map(c => 
        c.id === caregiverId ? { ...c, role: newRole } : c
      ));
      
      alert('Se ha actualizado el rol correctamente');
    } catch (error) {
      console.error('Error actualizando rol:', error);
      setError('Error al actualizar el rol. Intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('Enlace copiado al portapapeles');
  };

  if (loading && !currentBaby) {
    return (
      <div className="caregivers-page">
        <h1>Cuidadores</h1>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!currentBaby || !user) {
    return (
      <div className="caregivers-page">
        <h1>Cuidadores</h1>
        <p>No hay un bebé seleccionado o necesitas iniciar sesión.</p>
      </div>
    );
  }

  return (
    <div className="caregivers-page">
      <h1>Cuidadores</h1>
      <p className="baby-info">
        Administrando para <strong>{currentBaby.name}</strong>
      </p>
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>Cerrar</button>
        </div>
      )}
      
      {isAdmin ? (
        <>
          <form onSubmit={handleShareBaby} className="share-form">
            <div className="form-group">
              <label htmlFor="email">Correo electrónico:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="role">Rol:</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              >
                <option value="readonly">Solo lectura</option>
                <option value="collaborator">Colaborador</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            
            <button 
              type="submit" 
              disabled={loading || !email}
              className="share-button"
            >
              {loading ? 'Cargando...' : 'Compartir'}
            </button>
          </form>

          {showShareLink && shareLink && (
            <div className="share-link-container">
              <h3>Enlace de invitación</h3>
              <p className="share-link">{shareLink}</p>
              <div className="link-buttons">
                <button 
                  onClick={() => copyToClipboard(shareLink)}
                  className="copy-button"
                >
                  Copiar enlace
                </button>
                <button 
                  onClick={() => setShowShareLink(false)}
                  className="close-button"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
          
          {caregivers.length > 0 && (
            <div className="caregivers-list">
              <h3>Cuidadores actuales</h3>
              <ul>
                {caregivers.map(caregiver => (
                  <li key={caregiver.id} className="caregiver-item">
                    <div className="caregiver-info">
                      <span className="caregiver-email">{caregiver.email}</span>
                      <span className="caregiver-role">
                        {caregiver.role === 'admin' ? 'Administrador' : 
                         caregiver.role === 'collaborator' ? 'Colaborador' : 'Solo lectura'}
                      </span>
                    </div>
                    <div className="caregiver-actions">
                      <select
                        value={caregiver.role}
                        onChange={(e) => handleUpdateRole(caregiver.id, e.target.value)}
                        disabled={loading}
                        aria-label="Cambiar rol"
                      >
                        <option value="readonly">Solo lectura</option>
                        <option value="collaborator">Colaborador</option>
                        <option value="admin">Administrador</option>
                      </select>
                      <button 
                        onClick={() => handleRemoveAccess(caregiver.id)}
                        disabled={loading}
                        className="remove-btn"
                        aria-label="Eliminar acceso"
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <div className="not-authorized">
          <p>No tienes permisos para gestionar cuidadores para este bebé.</p>
        </div>
      )}
    </div>
  );
};

export default Caregivers;