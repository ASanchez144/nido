// src/pages/Caregivers.js
import React, { useEffect, useState } from 'react';
import supabase from '../supabase/config';
import { useAuth } from '../contexts/AuthContext';
import { useBaby } from '../contexts/BabyContext';

const Caregivers = () => {
  const { user } = useAuth();
  const { currentBaby } = useBaby();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [email, setEmail] = useState('');
  const [role, setRole] = useState('collaborator');
  const [inviteLink, setInviteLink] = useState('');

  useEffect(() => {
    if (!currentBaby || !user) return;
    loadCaregivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBaby?.id, user?.id]);

  const loadCaregivers = async () => {
    try {
      setLoading(true);
      setErr(null);

      // RPC que ya valida que seas cuidador de ese bebé
      const { data, error } = await supabase.rpc('get_caregivers_with_email', {
        p_baby_id: currentBaby.id
      });

      if (error) throw error;
      setList(data || []);
    } catch (e) {
      console.error(e);
      setErr(e.message || 'Error cargando cuidadores');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteByEmail = async (e) => {
    e.preventDefault();
    const target = (email || '').trim().toLowerCase();
    if (!target) {
      setErr('Introduce un email');
      return;
    }

    try {
      setLoading(true);
      setErr(null);
      setInviteLink('');

      const { data, error } = await supabase.rpc('invite_caregiver_by_email', {
        p_baby_id: currentBaby.id,
        p_email: target,
        p_role: role
      });

      if (error) throw error;

      // data: [{ id, code, email, role }]
      const inv = Array.isArray(data) ? data[0] : data;

      // link opcional para compartir (si quieres el flujo por link)
      const base = window.location.origin;
      const url = `${base}/invite?code=${inv.code}&baby=${currentBaby.id}&role=${inv.role}`;
      setInviteLink(url);

      // feedback
      alert(`Invitación creada para ${inv.email} (${inv.role}). Si ese usuario se registra, se unirá automáticamente.`);

      // refresca lista por si el invitado ya existía y se upserteó caregivers
      await loadCaregivers();
      setEmail('');
      setRole('collaborator');
    } catch (e) {
      console.error(e);
      setErr(e.message || 'Error invitando');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="caregivers-page" style={{ maxWidth: 520, margin: '0 auto', padding: 16 }}>
      <h2>Compartir bebé</h2>

      {!currentBaby ? (
        <p>Primero selecciona o crea un bebé.</p>
      ) : (
        <>
          <h3 style={{ marginTop: 12 }}>{currentBaby.name}</h3>

          <form onSubmit={handleInviteByEmail} style={{ display: 'grid', gap: 8, marginTop: 16 }}>
            <label>
              Email del colaborador
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ej. colaborador@correo.com"
                required
                style={{ width: '100%', padding: 8, marginTop: 4 }}
              />
            </label>

            <label>
              Rol
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ width: '100%', padding: 8, marginTop: 4 }}
              >
                <option value="collaborator">Colaborador</option>
                <option value="viewer">Observador</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <button disabled={loading} type="submit" style={{ padding: 10 }}>
              {loading ? 'Creando invitación…' : 'Invitar por email'}
            </button>
          </form>

          {inviteLink && (
            <div style={{ marginTop: 12 }}>
              <small>Link opcional para compartir:</small>
              <div style={{
                marginTop: 6, padding: 8, background: '#f4f4f4',
                borderRadius: 8, wordBreak: 'break-all'
              }}>
                {inviteLink}
              </div>
            </div>
          )}

          <hr style={{ margin: '20px 0' }} />

          <h4>Cuidadores</h4>
          {err && <div style={{ color: 'crimson', marginBottom: 8 }}>{err}</div>}
          {loading ? <p>Cargando…</p> : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
              {list.map(row => (
                <li key={row.id} style={{ padding: 10, border: '1px solid #ddd', borderRadius: 8 }}>
                  <div><b>{row.email || row.user_id}</b></div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>rol: {row.role}</div>
                </li>
              ))}
              {list.length === 0 && <li>No hay cuidadores aún.</li>}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default Caregivers;
