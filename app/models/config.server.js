import { getCalendarConfig, saveCalendarConfig } from '../lib/data.server.js';
import { info, error } from '../lib/logger.server.js';

/**
 * Obtiene la configuración del calendario
 */
export async function getConfig(admin) {
  try {
    const config = await getCalendarConfig(admin);
    info('Configuración obtenida', config);
    return config;
  } catch (err) {
    error('Error al obtener configuración', { error: err.message });
    return {
      cutoff_mode: 'same_day',
      cutoff_time: '20:00',
      lead_min: 0,
      lead_max: 30
    };
  }
}

/**
 * Actualiza la configuración del calendario
 */
export async function updateConfig(admin, configData) {
  try {
    const currentConfig = await getCalendarConfig(admin);
    
    const newConfig = {
      ...currentConfig,
      ...configData
    };

    // Validaciones
    if (!['same_day', 'next_day'].includes(newConfig.cutoff_mode)) {
      return { success: false, error: 'Modo de corte inválido' };
    }

    if (newConfig.lead_min < 0 || newConfig.lead_max < newConfig.lead_min) {
      return { success: false, error: 'Rango de días inválido' };
    }

    await saveCalendarConfig(admin, newConfig);
    info('Configuración actualizada', newConfig);
    return { success: true, config: newConfig };
  } catch (err) {
    error('Error al actualizar configuración', { error: err.message });
    return { success: false, error: err.message };
  }
}

/**
 * Resetea la configuración a valores por defecto
 */
export async function resetConfig(admin) {
  const defaultConfig = {
    cutoff_mode: 'same_day',
    cutoff_time: '20:00',
    lead_min: 0,
    lead_max: 30
  };

  try {
    await saveCalendarConfig(admin, defaultConfig);
    info('Configuración reseteada a valores por defecto');
    return { success: true, config: defaultConfig };
  } catch (err) {
    error('Error al resetear configuración', { error: err.message });
    return { success: false, error: err.message };
  }
}