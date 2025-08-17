// src/supabase/config.js
import { createClient } from '@supabase/supabase-js';

// Reemplaza estas variables con tus datos reales de Supabase
const supabaseUrl = 'https://nzbakwpipctojwuyummg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56YmFrd3BpcGN0b2p3dXl1bW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQyMjUsImV4cCI6MjA3MDc0MDIyNX0.ZugiWjt9IvdMPWntz4Ijhhhz76Iuua8896y9xR8REvU';

const supabase = createClient(supabaseUrl, supabaseKey);

// Intenta iniciar sesión
supabase.auth.signInWithPassword({
    email: 'eldeteruel2@gmail.com',
    password: 'admin123'
  }).then(result => console.log('Resultado del inicio de sesión:', result))
    .catch(error => console.error('Error al iniciar sesión:', error));

export default supabase;