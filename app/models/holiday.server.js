import { getHolidays, saveHolidays } from '../lib/data.server.js';
import { info, error } from '../lib/logger.server.js';

/**
 * Obtiene todos los feriados
 */
export async function getAllHolidays(admin) {
  try {
    const holidays = await getHolidays(admin);
    info('Feriados obtenidos', { total: holidays.length });
    return holidays;
  } catch (err) {
    error('Error al obtener feriados', { error: err.message });
    return [];
  }
}

/**
 * Crea un nuevo feriado
 */
export async function createHoliday(admin, holidayData) {
  try {
    const holidays = await getHolidays(admin);
    
    // Verificar si ya existe
    const exists = holidays.some(h => h.date === holidayData.date);
    if (exists) {
      return { success: false, error: 'Feriado ya existe para esta fecha' };
    }

    holidays.push({
      date: holidayData.date,
      reason: holidayData.reason || ''
    });

    await saveHolidays(admin, holidays);
    info('Feriado creado', { fecha: holidayData.date });
    return { success: true };
  } catch (err) {
    error('Error al crear feriado', { error: err.message });
    return { success: false, error: err.message };
  }
}

/**
 * Elimina un feriado por fecha
 */
export async function deleteHoliday(admin, date) {
  try {
    const holidays = await getHolidays(admin);
    const filtered = holidays.filter(h => h.date !== date);

    if (filtered.length === holidays.length) {
      return { success: false, error: 'Feriado no encontrado' };
    }

    await saveHolidays(admin, filtered);
    info('Feriado eliminado', { fecha: date });
    return { success: true };
  } catch (err) {
    error('Error al eliminar feriado', { error: err.message });
    return { success: false, error: err.message };
  }
}

/**
 * Actualiza un feriado
 */
export async function updateHoliday(admin, date, newData) {
  try {
    const holidays = await getHolidays(admin);
    const index = holidays.findIndex(h => h.date === date);

    if (index === -1) {
      return { success: false, error: 'Feriado no encontrado' };
    }

    holidays[index] = {
      ...holidays[index],
      ...newData
    };

    await saveHolidays(admin, holidays);
    info('Feriado actualizado', { fecha: date });
    return { success: true };
  } catch (err) {
    error('Error al actualizar feriado', { error: err.message });
    return { success: false, error: err.message };
  }
}