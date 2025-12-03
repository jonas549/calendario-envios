import prisma from "../db.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return new Response("// Error: Missing shop parameter", {
      headers: { "Content-Type": "application/javascript" },
      status: 400,
    });
  }

  // Obtener configuración para incluir el mensaje adicional
  const config = await prisma.config.findUnique({
    where: { shop },
  });
  const additionalMessage = config?.additionalMessage || "";

  const scriptContent = `
(function() {
  'use strict';
  
  const SHOP = "${shop}";
  let deliverySelected = false;
  
  console.log('🟢 [CE] Script cargado - v1.0');
  console.log('🟢 [CE] Shop:', SHOP);
  console.log('🟢 [CE] Pathname actual:', window.location.pathname);
  console.log('🟢 [CE] ReadyState:', document.readyState);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    console.log('🟢 [CE] Init ejecutado');
    console.log('🟢 [CE] Es página de carrito?', window.location.pathname.includes('/cart'));
    
    if (!window.location.pathname.includes('/cart')) {
      console.log('⚠️ [CE] No es página de carrito, saliendo');
      return;
    }
    console.log('✅ [CE] Iniciando en carrito');
    injectCalendar();
  }

  function injectCalendar() {
    console.log('🔍 [CE] Buscando contenedor del carrito...');
    
    const mainContent = document.querySelector('main') || 
                       document.querySelector('.main-content') ||
                       document.querySelector('[role="main"]') ||
                       document.body;
    
    console.log('🔍 [CE] Contenedor encontrado?', !!mainContent);
    
    if (!mainContent) {
      console.error('❌ [CE] No se encontró contenedor principal');
      return;
    }

    console.log('✅ [CE] Contenedor encontrado:', mainContent);

    const cartContent = mainContent.innerHTML;
    
const layoutHTML = \`
  <div style="
    display: flex; 
    flex-direction: column;
    gap: 20px; 
    max-width: 1400px; 
    margin: 0 auto; 
    padding: 20px;
  ">
    <div style="
      width: 100%;
      order: 1;
    ">
      <div id="ce-calendar-wrapper" style="
        padding: 20px;
        border: 2px solid #e9e9e9ff;
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      ">
        <h3 style="margin: 0 0 15px 0; font-size: 18px;">📅 Calcular envío</h3>
        
        <div style="margin-bottom: 15px;">
          <label for="ce-city" style="display: block; font-weight: 600; margin-bottom: 5px; font-size: 14px;">Ciudad</label>
          <select id="ce-city" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;">
            <option value="">--Selecciona Comuna--</option>
          </select>
        </div>

        <div style="margin-bottom: 15px;">
          <label for="ce-date" style="display: block; font-weight: 600; margin-bottom: 5px; font-size: 14px;">Fecha de entrega</label>
          <input type="text" id="ce-date" readonly placeholder="Selecciona una ciudad primero" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;">
        </div>

        <div id="ce-message" style="padding: 10px; border-radius: 4px; font-size: 13px; margin-top: 10px;"></div>
        
        ${additionalMessage ? `
        <div id="ce-additional-message" style="
          padding: 12px;
          margin-top: 15px;
          background: #f8f8f8;
          border-left: 3px solid #2e7d32;
          border-radius: 4px;
          font-size: 13px;
          line-height: 1.5;
          color: #333;
        ">
          ${additionalMessage.replace(/\n/g, '<br>')}
        </div>
        ` : ''}

        <button id="ce-checkout-btn" style="
          width: 100%;
          padding: 15px;
          margin-top: 15px;
          background: #000;
          color: #fff;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        ">
          Proceder al pago
        </button>
      </div>
    </div>
    
    <div style="
      width: 100%;
      order: 2;
    ">
      \${cartContent}
    </div>
  </div>

  <style>
    @media (min-width: 768px) {
      div[style*="flex-direction: column"] {
        flex-direction: row !important;
        align-items: flex-start !important;
      }
      div[style*="order: 1"] {
        order: 2 !important;
        flex: 0 0 350px !important;
      }
      div[style*="order: 2"] {
        order: 1 !important;
        flex: 1 !important;
        min-width: 0 !important;
      }
      #ce-calendar-wrapper {
        position: sticky !important;
        top: 20px !important;
      }
    }
  </style>
\`;
    console.log('📝 [CE] Reorganizando layout...');
    mainContent.innerHTML = layoutHTML;
    console.log('✅ [CE] Layout aplicado');
    
    const inserted = document.querySelector('#ce-calendar-wrapper');
    console.log('🔍 [CE] Calendario visible?', !!inserted);

    // Ocultar botones originales de checkout
    hideOriginalCheckoutButtons();

    // Configurar botón de checkout personalizado
    setupCheckoutButton();

    loadFlatpickr(() => {
      console.log('✅ [CE] Flatpickr cargado');
      loadCities();
      setupEventListeners();
    });
  }

  function hideOriginalCheckoutButtons() {
    const checkoutButtons = document.querySelectorAll(
      'button[name="checkout"], ' +
      'input[name="checkout"], ' +
      '[href*="/checkout"], ' +
      '.cart__checkout, ' +
      '.cart__checkout-button, ' +
      'button[type="submit"][form*="cart"]'
    );
    
    checkoutButtons.forEach(btn => {
      btn.style.display = 'none';
    });
    
    console.log('🚫 [CE] Botones de checkout originales ocultados:', checkoutButtons.length);
  }

  function setupCheckoutButton() {
    const checkoutBtn = document.querySelector('#ce-checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.onclick = () => {
        if (!deliverySelected) {
          alert('⚠️ Por favor selecciona una ciudad y fecha de despacho antes de continuar.');
          console.log('⚠️ [CE] Intento de checkout sin selección');
        } else {
          console.log('✅ [CE] Redirigiendo a checkout');
          const city = localStorage.getItem('ce_delivery_city');
          window.location.href = \`/checkout?checkout[shipping_address][city]=\${encodeURIComponent(city)}\`;
        }
      };
    }
  }

  function loadFlatpickr(callback) {
    console.log('📦 [CE] Cargando Flatpickr...');
    
    if (!document.querySelector('link[href*="flatpickr"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css';
      document.head.appendChild(link);
    }

    if (typeof flatpickr === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/flatpickr';
      script.onload = () => {
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
    console.log('🏙️ [CE] Cargando ciudades...');
    
    try {
      const res = await fetch('/apps/proxy/api/cities?shop=' + encodeURIComponent(SHOP));
      console.log('📡 [CE] Respuesta fetch cities:', res.status);
      
      const data = await res.json();
      console.log('📋 [CE] Datos recibidos:', data);

      if (data.success && Array.isArray(data.cities)) {
        const select = document.querySelector('#ce-city');
        data.cities.forEach(city => {
          const option = document.createElement('option');
          option.value = city.name;
          option.textContent = city.name;
          select.appendChild(option);
        });
        console.log('✅ [CE] Ciudades cargadas:', data.cities.length);
      }
    } catch (err) {
      console.error('❌ [CE] Error cargando ciudades:', err);
    }
  }

  let flatpickrInstance = null;
  let allAvailableDates = [];

  function setupEventListeners() {
    console.log('🎧 [CE] Configurando event listeners...');
    
    const citySelect = document.querySelector('#ce-city');
    const dateInput = document.querySelector('#ce-date');
    const message = document.querySelector('#ce-message');

    citySelect.addEventListener('change', async () => {
      const city = citySelect.value;
      console.log('🏙️ [CE] Ciudad seleccionada:', city);

      if (!city) {
        if (flatpickrInstance) {
          flatpickrInstance.destroy();
          flatpickrInstance = null;
        }
        dateInput.value = '';
        dateInput.placeholder = 'Selecciona una ciudad primero';
        message.textContent = '';
        allAvailableDates = [];
        deliverySelected = false;
        return;
      }

      message.textContent = '⏳ Cargando fechas disponibles...';
      message.style.background = '#f0f0f0';
      message.style.color = '#333';

      try {
        const res = await fetch(\`/apps/proxy/api/availability?city=\${encodeURIComponent(city)}&shop=\${encodeURIComponent(SHOP)}\`);
        console.log('📡 [CE] Respuesta availability:', res.status);
        
        const data = await res.json();
        console.log('📅 [CE] Fechas recibidas:', data);

        if (data.success && Array.isArray(data.availableDates) && data.availableDates.length > 0) {
          
          allAvailableDates = data.availableDates;
          
          if (flatpickrInstance) flatpickrInstance.destroy();

          flatpickrInstance = flatpickr(dateInput, {
            locale: 'es',
            dateFormat: 'Y-m-d',
            minDate: data.availableDates[0],
            enable: data.availableDates,
            inline: true,
            onChange(selectedDates, dateStr) {
              console.log('📅 [CE] Fecha seleccionada:', dateStr);
              saveToCart(city, dateStr);
              message.textContent = \`✅ Fecha seleccionada: \${dateStr}\`;
              message.style.background = '#e8f5e9';
              message.style.color = '#2e7d32';
            },
            onMonthChange() {
              updateMonthMessage();
            },
            onYearChange() {
              updateMonthMessage();
            }
          });

          dateInput.placeholder = 'Selecciona una fecha';
          updateMonthMessage();
        } else {
          message.textContent = '⚠️ No hay fechas disponibles para esta ciudad';
          message.style.background = '#fff3cd';
          message.style.color = '#856404';
        }
      } catch (err) {
        console.error('❌ [CE] Error:', err);
        message.textContent = '❌ Error al cargar fechas disponibles';
        message.style.background = '#ffebee';
        message.style.color = '#c62828';
      }
    });
    
    console.log('✅ [CE] Event listeners configurados');
  }

  function updateMonthMessage() {
    const message = document.querySelector('#ce-message');
    
    if (!flatpickrInstance || !allAvailableDates.length) return;
    
    const currentDate = flatpickrInstance.currentYear + '-' + 
                       String(flatpickrInstance.currentMonth + 1).padStart(2, '0');
    
    const datesInMonth = allAvailableDates.filter(date => date.startsWith(currentDate));
    
    message.textContent = \`✅ \${datesInMonth.length} fecha(s) disponible(s) en este mes\`;
    message.style.background = '#e8f5e9';
    message.style.color = '#2e7d32';
  }

  async function saveToCart(city, date) {
    console.log('💾 [CE] Guardando en carrito:', { city, date });
    
    try {
      localStorage.setItem('ce_delivery_city', city);
      localStorage.setItem('ce_delivery_date', date);
      console.log('✅ [CE] Guardado en localStorage');
      
      const formData = new FormData();
      formData.append('attributes[delivery_city]', city);
      formData.append('attributes[delivery_date]', date);

      await fetch('/cart/update.js', {
        method: 'POST',
        body: formData
      });

      console.log('✅ [CE] Guardado en carrito');
      
      // Marcar como seleccionado
      deliverySelected = true;
      
    } catch (err) {
      console.error('❌ [CE] Error guardando:', err);
    }
  }
})();
  `;

  return new Response(scriptContent, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=3600",
    },
  });
};