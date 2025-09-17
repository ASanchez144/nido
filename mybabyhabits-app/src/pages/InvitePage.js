// src/pages/InvitePage.js — procesa ?code=... o /join/:code (fallback visual)
import React, { useEffect, useState } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBaby } from '../contexts/BabyContext';

const InvitePage = () => {
  const [params] = useSearchParams();
  const { code: codeParam } = useParams();
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const { redeemInviteCode, loadBabies, selectBaby } = useBaby();
  const [status, setStatus] = useState('Procesando invitación...');

  const code = params.get('code') || codeParam || null;

  useEffect(() => {
    const run = async () => {
      if (!code) {
        setStatus('Código no válido.');
        return;
      }
      if (!session || !user) {
        // guarda y envía a login; AuthContext canjeará tras login
        localStorage.setItem('pendingInviteCode', code);
        setStatus('Necesitas iniciar sesión para aceptar la invitación...');
        navigate('/login');
        return;
      }
      try {
        setStatus('Aceptando invitación...');
        await redeemInviteCode(code);
        await loadBabies();
        setStatus('¡Invitación aceptada! Redirigiendo...');
        setTimeout(() => navigate('/'), 500);
      } catch (e) {
        console.error(e);
        setStatus(e.message || 'No se pudo aceptar la invitación.');
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, session, user]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Invitación</h2>
      <p>{status}</p>
    </div>
  );
};

export default InvitePage;
