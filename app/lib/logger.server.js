/**
 * Sistema de logs para la app
 * Registra eventos importantes para debugging
 */

const LOG_LEVELS = {
  INFO: '✅ INFO',
  WARNING: '⚠️ WARNING',
  ERROR: '❌ ERROR',
  DEBUG: '🔍 DEBUG'
};

/**
 * Log genérico
 */
function log(level, message, context = {}) {
  const timestamp = new Date().toISOString();
  const contextStr = Object.keys(context).length > 0 ? JSON.stringify(context) : '';
  
  console.log(`[${timestamp}] [${level}] ${message} ${contextStr}`);
}

/**
 * Log de información
 */
export function info(message, context = {}) {
  log(LOG_LEVELS.INFO, message, context);
}

/**
 * Log de advertencia
 */
export function warning(message, context = {}) {
  log(LOG_LEVELS.WARNING, message, context);
}

/**
 * Log de error
 */
export function error(message, context = {}) {
  log(LOG_LEVELS.ERROR, message, context);
}

/**
 * Log de debug
 */
export function debug(message, context = {}) {
  if (process.env.NODE_ENV === 'development') {
    log(LOG_LEVELS.DEBUG, message, context);
  }
}