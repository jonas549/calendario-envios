export const loader = async () => {
  const scriptContent = `
(function() {
  'use strict';
  
  console.log('🟢 [CE-CHECKOUT] Script cargado');

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    console.log('🟢 [CE-CHECKOUT] Init ejecutado');
    
    // Obtener ciudad de localStorage
    const city = localStorage.getItem('ce_delivery_city');
    const date = localStorage.getItem('ce_delivery_date');
    
    console.log('📦 [CE-CHECKOUT] Datos en localStorage:', { city, date });
    
    if (city) {
      fillCityField(city);
    } else {
      console.log('⚠️ [CE-CHECKOUT] No hay ciudad en localStorage');
    }
  }

  function fillCityField(city) {
    console.log('🏙️ [CE-CHECKOUT] Intentando rellenar City con:', city);
    
    // Intentar múltiples veces porque el checkout puede cargar dinámicamente
    let attempts = 0;
    const maxAttempts = 10;
    
    const interval = setInterval(() => {
      attempts++;
      console.log(\`🔄 [CE-CHECKOUT] Intento \${attempts}/\${maxAttempts}\`);
      
      const cityInput = document.querySelector('input[name="checkout[shipping_address][city]"]') ||
                       document.querySelector('input[placeholder*="City" i]') ||
                       document.querySelector('input[placeholder*="Ciudad" i]') ||
                       document.querySelector('#checkout_shipping_address_city');
      
      if (cityInput) {
        console.log('✅ [CE-CHECKOUT] Campo encontrado:', cityInput);
        
        if (!cityInput.value) {
          cityInput.value = city;
          cityInput.dispatchEvent(new Event('input', { bubbles: true }));
          cityInput.dispatchEvent(new Event('change', { bubbles: true }));
          cityInput.dispatchEvent(new Event('blur', { bubbles: true }));
          console.log('✅ [CE-CHECKOUT] Campo City rellenado con:', city);
        } else {
          console.log('ℹ️ [CE-CHECKOUT] Campo ya tiene valor:', cityInput.value);
        }
        clearInterval(interval);
      } else if (attempts >= maxAttempts) {
        console.log('⚠️ [CE-CHECKOUT] No se pudo rellenar después de', maxAttempts, 'intentos');
        console.log('🔍 [CE-CHECKOUT] Inputs disponibles:', document.querySelectorAll('input'));
        clearInterval(interval);
      }
    }, 500);
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