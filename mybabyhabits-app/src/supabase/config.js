// src/supabase/config.js
import { createClient } from '@supabase/supabase-js';

// Leer variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Faltan variables de entorno.');
  console.error('URL:', supabaseUrl);
  console.error('Key:', supabaseAnonKey ? '[CONFIGURADA]' : '[FALTA]');
  throw new Error('Configuración de Supabase incompleta');
}

if (import.meta.env.DEV) {
  console.log('[Supabase] Cliente configurado');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: { 'X-Client-Info': 'nido-pwa' },
  },
});

export default supabase;