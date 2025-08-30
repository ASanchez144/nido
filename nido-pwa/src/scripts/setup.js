#!/usr/bin/env node
// scripts/setup.js - Script de configuración automática

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setup() {
  console.log('🪺 Configuración de Nido PWA\n');

  try {
    // Verificar si ya existe .env.local
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const overwrite = await question('Ya existe .env.local. ¿Sobreescribir? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('❌ Configuración cancelada');
        rl.close();
        return;
      }
    }

    // Pedir configuración de Supabase
    console.log('\n📊 Configuración de Supabase:');
    const supabaseUrl = await question('URL de Supabase: ');
    const supabaseKey = await question('Clave anónima de Supabase: ');

    // Pedir configuración opcional
    console.log('\n⚙️ Configuración de la aplicación:');
    const appName = await question('Nombre de la app (Nido): ') || 'Nido';
    const environment = await question('Entorno (development): ') || 'development';

    // Crear contenido del archivo .env.local
    const envContent = `# Generado por setup.js - ${new Date().toISOString()}

# Supabase Configuration
REACT_APP_SUPABASE_URL=${supabaseUrl}
REACT_APP_SUPABASE_ANON_KEY=${supabaseKey}

# App Configuration
REACT_APP_APP_NAME=${appName}
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=${environment}
`;

    // Escribir archivo
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Archivo .env.local creado exitosamente');
    console.log('🔐 Recuerda: NUNCA subir este archivo a Git');
    console.log('\n📋 Próximos pasos:');
    console.log('1. npm install (si no lo has hecho)');
    console.log('2. npm start');
    console.log('3. Verificar que Supabase se conecta correctamente');

  } catch (error) {
    console.error('❌ Error durante la configuración:', error);
  } finally {
    rl.close();
  }
}

setup();