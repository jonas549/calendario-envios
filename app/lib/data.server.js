/**
 * Funciones para gestionar metafields de Shopify
 * Almacena: ciudades, feriados y configuración del calendario
 */

/**
 * Obtiene la configuración completa del calendario desde metafields
 */
export async function getCalendarConfig(admin) {
  const response = await admin.graphql(
    `#graphql
      query {
        shop {
          metafield(namespace: "calendario_envios", key: "config") {
            value
          }
        }
      }
    `
  );

  const data = await response.json();
  const value = data?.data?.shop?.metafield?.value;

  if (!value) {
    return {
      cutoff_mode: 'same_day',
      cutoff_time: '20:00',
      lead_min: 0,
      lead_max: 30
    };
  }

  return JSON.parse(value);
}

/**
 * Guarda la configuración del calendario
 */
export async function saveCalendarConfig(admin, config) {
  const response = await admin.graphql(
    `#graphql
      mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            namespace
            key
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        metafields: [
          {
            namespace: 'calendario_envios',
            key: 'config',
            type: 'json',
            value: JSON.stringify(config),
            ownerId: `gid://shopify/Shop/${admin.session.shop.split('.')[0]}`
          }
        ]
      }
    }
  );

  return response.json();
}

/**
 * Obtiene todas las ciudades configuradas
 */
export async function getCities(admin) {
  const response = await admin.graphql(
    `#graphql
      query {
        shop {
          metafield(namespace: "calendario_envios", key: "cities") {
            value
          }
        }
      }
    `
  );

  const data = await response.json();
  const value = data?.data?.shop?.metafield?.value;

  return value ? JSON.parse(value) : [];
}

/**
 * Guarda las ciudades
 */
export async function saveCities(admin, cities) {
  const response = await admin.graphql(
    `#graphql
      mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        metafields: [
          {
            namespace: 'calendario_envios',
            key: 'cities',
            type: 'json',
            value: JSON.stringify(cities),
            ownerId: `gid://shopify/Shop/${admin.session.shop.split('.')[0]}`
          }
        ]
      }
    }
  );

  return response.json();
}

/**
 * Obtiene todos los feriados
 */
export async function getHolidays(admin) {
  const response = await admin.graphql(
    `#graphql
      query {
        shop {
          metafield(namespace: "calendario_envios", key: "holidays") {
            value
          }
        }
      }
    `
  );

  const data = await response.json();
  const value = data?.data?.shop?.metafield?.value;

  return value ? JSON.parse(value) : [];
}

/**
 * Guarda los feriados
 */
export async function saveHolidays(admin, holidays) {
  const response = await admin.graphql(
    `#graphql
      mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        metafields: [
          {
            namespace: 'calendario_envios',
            key: 'holidays',
            type: 'json',
            value: JSON.stringify(holidays),
            ownerId: `gid://shopify/Shop/${admin.session.shop.split('.')[0]}`
          }
        ]
      }
    }
  );

  return response.json();
}