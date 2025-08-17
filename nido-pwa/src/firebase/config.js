// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuración mock de Firebase para desarrollo
// NOTA: Para producción, configura Firebase real
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

let app, auth, db;

try {
  // Intentar inicializar Firebase
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn('Firebase no está configurado correctamente. Usando modo mock.');
  // Crear objetos mock para evitar errores
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback) => callback(null),
    signOut: () => Promise.resolve(),
    signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase no configurado')),
    createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase no configurado'))
  };
  db = {
    collection: () => ({
      add: () => Promise.reject(new Error('Firebase no configurado')),
      get: () => Promise.reject(new Error('Firebase no configurado'))
    })
  };
}

export { auth, db };