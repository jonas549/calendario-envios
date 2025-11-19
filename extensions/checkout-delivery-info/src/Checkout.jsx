import '@shopify/ui-extensions/preact';
import {render} from "preact";

export default async () => {
  render(<Extension />, document.body)
};

function Extension() {
  // Verificar que shopify esté disponible
  if (!shopify || !shopify.attributes) {
    console.error('❌ [CHECKOUT] Shopify object not available');
    return null;
  }

  // Obtener los cart attributes
  const attributes = shopify.attributes.value || [];
  
  console.log('🔍 [CHECKOUT] Total attributes:', attributes.length);
  console.log('🔍 [CHECKOUT] Attributes completos:', attributes);
  
  const deliveryCity = attributes.find(attr => attr.key === 'delivery_city')?.value;
  const deliveryDate = attributes.find(attr => attr.key === 'delivery_date')?.value;

  console.log('🏙️ [CHECKOUT] Ciudad:', deliveryCity);
  console.log('📅 [CHECKOUT] Fecha:', deliveryDate);

  // Si no hay datos, no mostrar nada
  if (!deliveryCity && !deliveryDate) {
    console.log('⚠️ [CHECKOUT] No hay datos de entrega');
    return null;
  }

  // Mostrar la información de entrega
  return (
    <s-banner heading="📅 Información de Entrega" tone="info">
      <s-stack gap="base">
        {deliveryCity && (
          <s-text>
            <s-text type="emphasis">Ciudad:</s-text> {deliveryCity}
          </s-text>
        )}
        {deliveryDate && (
          <s-text>
            <s-text type="emphasis">Fecha estimada:</s-text> {deliveryDate}
          </s-text>
        )}
      </s-stack>
    </s-banner>
  );
}