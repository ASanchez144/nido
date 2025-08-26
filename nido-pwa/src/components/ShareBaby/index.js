// src/components/ShareBaby/index.js
import React, { useState, useEffect } from 'react';
import supabase from '../../supabase/config';
import './ShareBaby.css';

const ShareBaby = ({ babyId, currentUserId }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('readonly');
  const [caregivers, setCaregivers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [showShareLink, setShowShareLink] = useState(false);
  const [shareLink, setShareLink] = useState('');

  // Traducción simplificada (reemplazar con i18n cuando esté configurado)
  const t = (key) => {
    const translations = {
      'share.title': 'Compartir acceso al bebé',
      'share.email': 'Correo electrónico',
      'share.role': 'Rol',
      'share.roles.readonly': 'Solo lectura',
      'share.roles.collaborator': 'Colaborador',
      'share.roles.admin': 'Administrador',
      'share.submit': 'Compartir',
      'common.loading': 'Cargando...',
      'share.caregivers': 'Cuidadores actuales',
      'share.remove': 'Eliminar',
      'share.linkTitle': 'Enlace de invitación',
      'share.copy': 'Copiar enlace',
      'share.close': 'Cerrar',
      'share.notAuthorizedMessage': 'No tienes permisos para compartir este bebé',
    };
    return translations[key] || key;
  };

  // Check if current user is admin for this baby
  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data, error } = await supabase
        .from('caregivers')
        .select('role')
        .eq('baby_id', babyId)
        .eq('user_id', currentUserId)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        return;
      }

      setIsUserAdmin(data?.role === 'admin');
    };

    checkAdminStatus();
  }, [babyId, currentUserId]);

  // Load existing caregivers
  useEffect(() => {
    const loadCaregivers = async () => {
      // Only admins can see other caregivers
      if (!isUserAdmin) return;

      setIsLoading(true);
      
      try {
        // Get caregivers for this baby
        const { data: caregiversData, error: caregiversError } = await supabase
          .from('caregivers')
          .select('id, user_id, role')
          .eq('baby_id', babyId);

        if (caregiversError) throw caregiversError;

        // For each caregiver, get the user email
        const enrichedCaregivers = [];
        for (const caregiver of caregiversData) {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', caregiver.user_id)
            .single();
            
          if (!userError) {
            enrichedCaregivers.push({
              id: caregiver.id,
              email: userData?.email || 'Unknown',
              role: caregiver.role
            });
          }
        }

        setCaregivers(enrichedCaregivers);
      } catch (error) {
        console.error('Error loading caregivers:', error);
        alert('Error al cargar los cuidadores');
      } finally {
        setIsLoading(false);
      }
    };

    if (isUserAdmin) {
      loadCaregivers();
    }
  }, [babyId, isUserAdmin]);

  const handleShareBaby = async (e) => {
    e.preventDefault();
    
    if (!isUserAdmin) {
      alert('No tienes permisos para compartir este bebé');
      return;
    }

    setIsLoading(true);
    
    try {
      // Check if user exists
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (userError) {
        // Generate a share link with an invitation code
        const inviteCode = Math.random().toString(36).substring(2, 15);
        
        // In a real app, you'd store this in the database
        // For now, just generate a link
        const link = `${window.location.origin}/invite?code=${inviteCode}&baby=${babyId}&role=${role}`;
        setShareLink(link);
        setShowShareLink(true);
        
        alert('Se ha generado un enlace de invitación');
        setIsLoading(false);
        return;
      }

      // Check if this user already has access to this baby
      const { data: existingAccess } = await supabase
        .from('caregivers')
        .select('id')
        .eq('baby_id', babyId)
        .eq('user_id', userData.id);

      if (existingAccess && existingAccess.length > 0) {
        alert('Este usuario ya tiene acceso a este bebé');
        setIsLoading(false);
        return;
      }

      // Add caregiver record
      const { data, error } = await supabase
        .from('caregivers')
        .insert([
          {
            baby_id: babyId,
            user_id: userData.id,
            role: role,
            created_by: currentUserId  // Añadimos la columna created_by
          }
        ]);

      if (error) throw error;

      // Add to the local state
      setCaregivers([...caregivers, {
        id: data[0].id,
        email,
        role
      }]);

      alert('Se ha compartido el bebé correctamente');
      setEmail('');
    } catch (error) {
      console.error('Error sharing baby:', error);
      alert('Error al compartir el bebé');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAccess = async (caregiverId) => {
    if (!isUserAdmin) {
      alert('No tienes permisos para eliminar este acceso');
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('caregivers')
        .delete()
        .eq('id', caregiverId);

      if (error) throw error;

      // Update local state
      setCaregivers(caregivers.filter(c => c.id !== caregiverId));
      alert('Se ha eliminado el acceso correctamente');
    } catch (error) {
      console.error('Error removing access:', error);
      alert('Error al eliminar el acceso');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (caregiverId, newRole) => {
    if (!isUserAdmin) {
      alert('No tienes permisos para actualizar este rol');
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('caregivers')
        .update({ role: newRole })
        .eq('id', caregiverId);

      if (error) throw error;

      // Update local state
      setCaregivers(caregivers.map(c => 
        c.id === caregiverId ? { ...c, role: newRole } : c
      ));
      
      alert('Se ha actualizado el rol correctamente');
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Error al actualizar el rol');
    } finally {
      setIsLoading(false);
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

  if (!isUserAdmin) {
    return (
      <div className="share-baby not-authorized">
        <p>{t('share.notAuthorizedMessage')}</p>
      </div>
    );
  }

  return (
    <div className="share-baby">
      <h2>{t('share.title')}</h2>
      
      <form onSubmit={handleShareBaby} className="share-form">
        <div className="form-group">
          <label htmlFor="email">{t('share.email')}:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="role">{t('share.role')}:</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={isLoading}
          >
            <option value="readonly">{t('share.roles.readonly')}</option>
            <option value="collaborator">{t('share.roles.collaborator')}</option>
            <option value="admin">{t('share.roles.admin')}</option>
          </select>
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading || !email}
          className="share-button"
        >
          {isLoading ? t('common.loading') : t('share.submit')}
        </button>
      </form>

      {showShareLink && shareLink && (
        <div className="share-link-container">
          <h3>{t('share.linkTitle')}</h3>
          <p className="share-link">{shareLink}</p>
          <div className="link-buttons">
            <button 
              onClick={() => copyToClipboard(shareLink)}
              className="copy-button"
            >
              {t('share.copy')}
            </button>
            <button 
              onClick={() => setShowShareLink(false)}
              className="close-button"
            >
              {t('share.close')}
            </button>
          </div>
        </div>
      )}
      
      {caregivers.length > 0 && (
        <div className="caregivers-list">
          <h3>{t('share.caregivers')}</h3>
          <ul>
            {caregivers.map(caregiver => (
              <li key={caregiver.id} className="caregiver-item">
                <div className="caregiver-info">
                  <span className="caregiver-email">{caregiver.email}</span>
                  <span className="caregiver-role">{t(`share.roles.${caregiver.role}`)}</span>
                </div>
                <div className="caregiver-actions">
                  <select
                    value={caregiver.role}
                    onChange={(e) => handleUpdateRole(caregiver.id, e.target.value)}
                    disabled={isLoading}
                    aria-label="Cambiar rol"
                  >
                    <option value="readonly">{t('share.roles.readonly')}</option>
                    <option value="collaborator">{t('share.roles.collaborator')}</option>
                    <option value="admin">{t('share.roles.admin')}</option>
                  </select>
                  <button 
                    onClick={() => handleRemoveAccess(caregiver.id)}
                    disabled={isLoading}
                    className="remove-button"
                    aria-label="Eliminar acceso"
                  >
                    {t('share.remove')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ShareBaby;