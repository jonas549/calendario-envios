import { addDays, format, isWithinInterval } from 'date-fns';

/**
 * Calcula las fechas disponibles según configuración
 * @param {string} city - Nombre de la ciudad
 * @param {object} config - Configuración (cutoff_mode, cutoff_time, workdays, holidays, lead_max)
 * @returns {string[]} - Array de fechas en formato YYYY-MM-DD
 */
export function getAvailableDates(city, config) {
  const {
    cutoff_mode = 'same_day',
    cutoff_time = '20:00',
    workdays = 'lun,mar,mie,jue,vie',
    holidays = [],
    lead_max = 30
  } = config;

  const today = new Date();
  const currentTime = format(today, 'HH:mm');
  const dates = [];

  for (let i = 0; i <= lead_max; i++) {
    const date = addDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');

    // Lógica de corte
    if (i === 0) {
      if (cutoff_mode === 'same_day') {
        if (currentTime >= cutoff_time) continue;
      } else if (cutoff_mode === 'next_day') {
        continue; // Día actual siempre excluido
      }
    }

    // Validar día hábil
    if (!isWorkday(date, workdays)) continue;

    // Validar feriados
    if (holidays.includes(dateStr)) continue;

    dates.push(dateStr);
  }

  return dates;
}

/**
 * Verifica si una fecha es día hábil
 */
function isWorkday(date, workdays) {
  const dayMap = {
    0: 'dom', 1: 'lun', 2: 'mar', 3: 'mie',
    4: 'jue', 5: 'vie', 6: 'sab'
  };
  
  const dayShort = dayMap[date.getDay()];
  const validDays = workdays.split(',').map(d => d.trim());
  
  return validDays.includes(dayShort);
}

/**
 * Valida si una fecha específica es válida
 */
export function isValidDate(dateStr, city, config) {
  const availableDates = getAvailableDates(city, config);
  return availableDates.includes(dateStr);
}