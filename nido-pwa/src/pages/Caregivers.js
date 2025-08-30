// src/pages/Caregivers.js
import React, { useEffect, useState } from 'react';
import supabase from '../supabase/config';
import { useAuth } from '../contexts/AuthContext';
import { useBaby } from '../contexts/BabyContext';

export default function Caregivers() {
  const { user } = useAuth();
  const { currentBaby } = useBaby();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('collaborator'); // 'admin' | 'collaborator' | 'viewer'
  const [error, setError] = useState(null);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (!currentBaby) return;
    loadCaregivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBaby?.id]);

  const loadCaregivers = async () => {
    if (!currentBaby) return;
    try {
      setLoading(true);
      setError(null);

      // OJO: ahora embebemos profiles(email) (no users)
      const { data, error } = await supabase
        .from('caregivers')
        .select('id,user_id,role,created_by, profiles(email)')
        .eq('baby_id', currentBaby.id);

      if (error) throw error;

      setItems(
        (data || []).map((row) => ({
          id: row.id,
          user_id: row.user_id,
          role: row.role,
          email: row.profiles?.email || '(sin email)'
        }))
      );
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteByEmail = async (e) => {
    e.preventDefault();
    if (!currentBaby) return;
    const email = inviteEmail.trim().toLowerCase();
    if (!email) return;

    try {
      setLoading(true);
      setError(null);

      // upsert en pending_caregivers (necesita UNIQUE(baby_id, lower(email)))
      const { error } = await supabase
        .from('pending_caregivers')
        .upsert(
          [{
            baby_id: currentBaby.id,
            email,
            role: inviteRole,
            invited_by: user.id
          }],
          { onConflict: 'baby_id,email' }
        );

      if (error) throw error;

      // Si el invitado YA existe en auth.users (y por tanto en profiles),
      // podríamos adjuntarlo inmediatamente (best effort).
      // De lo contrario, el TRIGGER lo hará cuando se registre.
      const { data: maybeProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (maybeProfile?.id) {
        // crea caregiver si no existe
        await supabase
          .from('caregivers')
          .upsert(
            [{
              baby_id: currentBaby.id,
              user_id: maybeProfile.id,
              role: inviteRole,
              created_by: user.id
            }],
            { onConflict: 'baby_id,user_id' }
          );
      }

      setInviteEmail('');
      await loadCaregivers();
      alert('Invitación registrada. Si el usuario aún no existe, se adjuntará automáticamente cuando se registre.');
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const buildShareLink = async () => {
    if (!currentBaby) return;
    // Link “opcional” por si quieres compartir enlace además del email
    // (puedes cambiar la ruta si usas /invite o /join)
    const code = Math.random().toString(36).slice(2, 12);
    const url = `${window.location.origin}/invite?code=${code}&baby=${currentBaby.id}&role=${inviteRole}`;
    setShareUrl(url);

    // Si quieres guardar el code en tu tabla 'invitations', hazlo aquí
    // (no es obligatorio para el flujo por email)
    // await supabase.from('invitations').insert([{ baby_id: currentBaby.id, code, role: inviteRole, created_by: user.id, expires_at: new Date(Date.now()+7*864e5).toISOString() }]);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Caregivers</h2>

      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}

      {!currentBaby && <p>Selecciona un bebé.</p>}

      {currentBaby && (
        <>
          <form onSubmit={handleInviteByEmail} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                style={{ padding: 8, minWidth: 260 }}
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                style={{ padding: 8 }}
              >
                <option value="collaborator">Colaborador</option>
                <option value="viewer">Lector</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit" disabled={loading}>
                {loading ? 'Enviando...' : 'Invitar por email'}
              </button>
              <button type="button" onClick={buildShareLink}>Generar link</button>
            </div>
          </form>

          {shareUrl && (
            <div style={{ marginBottom: 16 }}>
              <label>Link para compartir:</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input readOnly value={shareUrl} style={{ flex: 1, padding: 8 }} />
                <button onClick={() => { navigator.clipboard.writeText(shareUrl); }}>Copiar</button>
              </div>
              <small>El link es opcional; el flujo por email funciona sin él.</small>
            </div>
          )}

          <h3>Asignados</h3>
          {loading ? <p>Cargando...</p> : (
            <ul>
              {items.map(it => (
                <li key={it.id} style={{ marginBottom: 6 }}>
                  <strong>{it.email}</strong> — {it.role}
                </li>
              ))}
              {items.length === 0 && <li>No hay caregivers aún.</li>}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
