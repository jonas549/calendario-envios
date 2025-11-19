import { getCities, saveCities } from '../lib/data.server.js';
import { info, error } from '../lib/logger.server.js';

/**
 * Obtiene todas las ciudades
 */
export async function getAllCities(admin) {
  try {
    const cities = await getCities(admin);
    info('Ciudades obtenidas', { total: cities.length });
    return cities;
  } catch (err) {
    error('Error al obtener ciudades', { error: err.message });
    return [];
  }
}

/**
 * Obtiene una ciudad por nombre
 */
export async function getCityByName(admin, name) {
  const cities = await getAllCities(admin);
  return cities.find(city => city.name.toLowerCase() === name.toLowerCase());
}

/**
 * Crea o actualiza una ciudad
 */
export async function upsertCity(admin, cityData) {
  try {
    const cities = await getCities(admin);
    const existingIndex = cities.findIndex(c => c.name === cityData.name);

    if (existingIndex >= 0) {
      // Actualizar existente
      cities[existingIndex] = {
        ...cities[existingIndex],
        ...cityData
      };
      info('Ciudad actualizada', { ciudad: cityData.name });
    } else {
      // Crear nueva
      cities.push({
        name: cityData.name,
        workdays: cityData.workdays || 'lun,mar,mie,jue,vie',
        cutoff: cityData.cutoff || '20:00'
      });
      info('Ciudad creada', { ciudad: cityData.name });
    }

    await saveCities(admin, cities);
    return { success: true };
  } catch (err) {
    error('Error al guardar ciudad', { error: err.message });
    return { success: false, error: err.message };
  }
}

/**
 * Elimina una ciudad
 */
export async function deleteCity(admin, cityName) {
  try {
    const cities = await getCities(admin);
    const filtered = cities.filter(c => c.name !== cityName);

    if (filtered.length === cities.length) {
      return { success: false, error: 'Ciudad no encontrada' };
    }

    await saveCities(admin, filtered);
    info('Ciudad eliminada', { ciudad: cityName });
    return { success: true };
  } catch (err) {
    error('Error al eliminar ciudad', { error: err.message });
    return { success: false, error: err.message };
  }
}