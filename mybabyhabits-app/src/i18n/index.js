// src/i18n/index.js - CONFIGURACIÓN COMPLETA
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      nav: {
        signin: "Sign In",
        signup: "Sign Up",
        features: "Features",
        newsletter: "Newsletter",
        contact: "Contact"
      },
      hero: {
        badge: "New features available",
        title: {
          care: "Care with",
          love: "love and technology"
        },
        description: "The most complete app for tracking your baby's care. Family sync, voice control, and intelligent analytics.",
        startFree: "Start Free",
        viewFeatures: "View Features"
      },
      stats: {
        families: "Active families",
        rating: "User rating",
        uptime: "Uptime",
        support: "Support"
      },
      features: {
        title: "Everything you need to",
        titleGradient: " care better",
        subtitle: "Designed by parents, for parents. Every feature thoughtfully crafted to make your life easier.",
        smartTracking: {
          title: "Smart Tracking",
          description: "Track feeding, sleep, and diapers with one tap. Voice control for hands-free use."
        },
        familyCollaboration: {
          title: "Family Collaboration",
          description: "Real-time sync between caregivers. Customizable roles and notifications."
        },
        intelligentAnalytics: {
          title: "Intelligent Analytics",
          description: "Detailed statistics and reminders based on your baby's age."
        }
      },
      newsletter: {
        title: "Stay Updated",
        description: "Get expert tips, app updates, and exclusive content for parents directly in your inbox.",
        placeholder: "your@email.com",
        subscribe: "Subscribe",
        subscribing: "Subscribing...",
        success: "Great! Your subscription is pending approval.",
        error: "Error processing your subscription. Please try again.",
        note: "No spam. Cancel anytime. 📧✨"
      },
      cta: {
        title: "Ready to get started?",
        description: "Join thousands of families who already trust MyBabyHabits for their baby's care.",
        startNow: "Start Now",
        haveAccount: "I have an account",
        note: "Progressive Web App - Works on any device"
      },
      footer: {
        description: "Caring with love and technology. The most complete app for tracking your baby's care.",
        product: "Product",
        support: "Support",
        legal: "Legal",
        features: "Features",
        updates: "Updates",
        help: "Help",
        contact: "Contact",
        community: "Community",
        privacy: "Privacy",
        terms: "Terms",
        cookies: "Cookies",
        copyright: "© 2025 MyBabyHabits. All rights reserved.",
        follow: "Follow us:"
      }
    }
  },
  es: {
    translation: {
      nav: {
        signin: "Iniciar Sesión",
        signup: "Registrarse",
        features: "Características",
        newsletter: "Newsletter",
        contact: "Contacto"
      },
      hero: {
        badge: "Nuevas funciones disponibles",
        title: {
          care: "Cuidado con",
          love: "amor y tecnología"
        },
        description: "La app más completa para el seguimiento del cuidado de tu bebé. Sincronización familiar, control por voz y análisis inteligente.",
        startFree: "Empezar Gratis",
        viewFeatures: "Ver Características"
      },
      stats: {
        families: "Familias activas",
        rating: "Valoración usuarios",
        uptime: "Tiempo activo",
        support: "Soporte"
      },
      features: {
        title: "Todo lo que necesitas para",
        titleGradient: " cuidar mejor",
        subtitle: "Diseñado por padres, para padres. Cada característica pensada para hacer tu vida más fácil.",
        smartTracking: {
          title: "Seguimiento Inteligente",
          description: "Registra lactancia, sueño y pañales con un toque. Control por voz para manos libres."
        },
        familyCollaboration: {
          title: "Colaboración Familiar",
          description: "Sincronización en tiempo real entre cuidadores. Roles personalizables y notificaciones."
        },
        intelligentAnalytics: {
          title: "Análisis Inteligente",
          description: "Estadísticas detalladas y recordatorios basados en la edad del bebé."
        }
      },
      newsletter: {
        title: "Mantente al día",
        description: "Recibe consejos de expertos, actualizaciones de la app y contenido exclusivo para padres directamente en tu bandeja de entrada.",
        placeholder: "tu@email.com",
        subscribe: "Suscribirse",
        subscribing: "Suscribiendo...",
        success: "¡Genial! Tu suscripción está pendiente de aprobación.",
        error: "Error al procesar tu suscripción. Inténtalo de nuevo.",
        note: "No spam. Cancela cuando quieras. 📧✨"
      },
      cta: {
        title: "¿Listo para empezar?",
        description: "Únete a miles de familias que ya confían en MyBabyHabits para el cuidado de sus pequeños.",
        startNow: "Empezar Ahora",
        haveAccount: "Ya tengo cuenta",
        note: "Progressive Web App - Funciona en cualquier dispositivo"
      },
      footer: {
        description: "Cuidando con amor y tecnología. La app más completa para el seguimiento del cuidado de tu bebé.",
        product: "Producto",
        support: "Soporte",
        legal: "Legal",
        features: "Características",
        updates: "Actualizaciones",
        help: "Ayuda",
        contact: "Contacto",
        community: "Comunidad",
        privacy: "Privacidad",
        terms: "Términos",
        cookies: "Cookies",
        copyright: "© 2025 MyBabyHabits. Todos los derechos reservados.",
        follow: "Síguenos:"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;