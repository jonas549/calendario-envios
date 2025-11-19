(function() {
  'use strict';
  
  console.log('🟢 [CE] Script cargado');

  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // Detectar si estamos en la página del carrito
    if (!window.location.pathname.includes('/cart')) {
      console.log('⚠️ [CE] No estamos en /cart');
      return;
    }

    console.log('✅ [CE] Iniciando en carrito');
    injectCalendar();
  }

  function injectCalendar() {
    // Buscar el contenedor del carrito
    const cartForm = document.querySelector('form[action="/cart"]') || 
                     document.querySelector('.cart') ||
                     document.querySelector('#cart');
    
    if (!cartForm) {
      console.error('❌ [CE] No se encontró el formulario del carrito');
      return;
    }

    // Crear el HTML del calendario
    const calendarHTML = `
      <div id="ce-calendar-wrapper" style="margin: 20px 0; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background: #fff;">
        <h3 style="margin: 0 0 15px 0;">📅 Calcular envío</h3>
        
        <div style="margin-bottom: 15px;">
          <label for="ce-city" style="display: block; font-weight: 600; margin-bottom: 5px;">Ciudad</label>
          <select id="ce-city" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
            <option value="">--Selecciona Comuna--</option>
          </select>
        </div>

        <div style="margin-bottom: 15px;">
          <label for="ce-date" style="display: block; font-weight: 600; margin-bottom: 5px;">Fecha de entrega</label>
          <input type="text" id="ce-date" readonly placeholder="Selecciona una ciudad primero" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
        </div>

        <div id="ce-message" style="padding: 10px; border-radius: 4px; font-size: 14px; margin-top: 10px;"></div>
      </div>
    `;

    // Insertar el calendario después del form o al final
    cartForm.insertAdjacentHTML('afterend', calendarHTML);

    // Cargar Flatpickr
    loadFlatpickr(() => {
      loadCities();
      setupEventListeners();
    });
  }

  function loadFlatpickr(callback) {
    // Cargar CSS de Flatpickr
    if (!document.querySelector('link[href*="flatpickr"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css';
      document.head.appendChild(link);
    }

    // Cargar JS de Flatpickr
    if (typeof flatpickr === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/flatpickr';
      script.onload = () => {
        // Cargar idioma español
        const scriptES = document.createElement('script');
        scriptES.src = 'https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/es.js';
        scriptES.onload = callback;
        document.head.appendChild(scriptES);
      };
      document.head.appendChild(script);
    } else {
      callback();
    }
  }

  async function loadCities() {
    try {
      // Llamar a tu API para obtener las ciudades
      const res = await fetch('/apps/proxy/cities');
      const data = await res.json();

      if (data.success && Array.isArray(data.cities)) {
        const select = document.querySelector('#ce-city');
        data.cities.forEach(city => {
          const option = document.createElement('option');
          option.value = city.name;
          option.textContent = city.name;
          select.appendChild(option);
        });
      }
    } catch (err) {
      console.error('❌ [CE] Error cargando ciudades:', err);
    }
  }

  let flatpickrInstance = null;
  let availableDates = [];

  function setupEventListeners() {
    const citySelect = document.querySelector('#ce-city');
    const dateInput = document.querySelector('#ce-date');
    const message = document.querySelector('#ce-message');

    citySelect.addEventListener('change', async () => {
      const city = citySelect.value;

      if (!city) {
        if (flatpickrInstance) {
          flatpickrInstance.destroy();
          flatpickrInstance = null;
        }
        dateInput.value = '';
        message.textContent = '';
        return;
      }

      message.textContent = 'Cargando fechas disponibles...';
      message.style.background = '#f0f0f0';
      message.style.color = '#333';

      try {
        const res = await fetch(`/apps/proxy/availability?city=${encodeURIComponent(city)}`);
        const data = await res.json();

        if (data.success && Array.isArray(data.availableDates)) {
          availableDates = data.availableDates;

          if (flatpickrInstance) flatpickrInstance.destroy();

          flatpickrInstance = flatpickr(dateInput, {
            locale: 'es',
            dateFormat: 'Y-m-d',
            minDate: availableDates[0],
            enable: availableDates,
            inline: true,
            onChange(selectedDates, dateStr) {
              saveToCart(city, dateStr);
            }
          });

          message.textContent = `✅ ${availableDates.length} fecha(s) disponible(s) para ${city}`;
          message.style.background = '#e8f5e9';
          message.style.color = '#2e7d32';
        } else {
          message.textContent = '⚠️ No hay fechas disponibles';
          message.style.background = '#ffebee';
          message.style.color = '#c62828';
        }
      } catch (err) {
        console.error('❌ [CE] Error:', err);
        message.textContent = '❌ Error al cargar fechas';
        message.style.background = '#ffebee';
        message.style.color = '#c62828';
      }
    });
  }

  async function saveToCart(city, date) {
    try {
      const formData = new FormData();
      formData.append('attributes[delivery_city]', city);
      formData.append('attributes[delivery_date]', date);

      await fetch('/cart/update.js', {
        method: 'POST',
        body: formData
      });

      console.log('✅ [CE] Guardado:', { city, date });
    } catch (err) {
      console.error('❌ [CE] Error guardando:', err);
    }
  }
})();