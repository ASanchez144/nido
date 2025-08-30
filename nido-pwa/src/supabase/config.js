// src/supabase/config.js
import { createClient } from '@supabase/supabase-js';

// Leer variables de entorno
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[Supabase] Faltan variables de entorno.');
  throw new Error('Configuración de Supabase incompleta');
}

if (process.env.NODE_ENV === 'development') {
  console.log('[Supabase] Cliente configurado');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: { 'X-Client-Info': 'nido-pwa' },
  },
});

export default supabase;

