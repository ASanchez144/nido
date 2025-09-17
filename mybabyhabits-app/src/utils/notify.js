// Lightweight centralized notification helpers
// Replace later with a UI toast system (e.g., react-hot-toast)

const emit = (type, message) => {
  try {
    const detail = { type, message, timestamp: Date.now() };
    window.dispatchEvent(new CustomEvent('app:notify', { detail }));
  } catch (e) {
    // no-op
  }
  // Always log to console for now; swap when UI toasts are wired
  const text = typeof message === 'string' ? message : JSON.stringify(message);
  if (type === 'error') console.error('[notify]', text);
  else if (type === 'warning') console.warn('[notify]', text);
  else console.log('[notify]', text);
};

export const notifyInfo = (message) => emit('info', message);
export const notifySuccess = (message) => emit('success', message);
export const notifyWarning = (message) => emit('warning', message);
export const notifyError = (message) => emit('error', message);

export default {
  info: notifyInfo,
  success: notifySuccess,
  warning: notifyWarning,
  error: notifyError,
};

