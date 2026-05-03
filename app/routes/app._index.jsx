import { Page, Layout, Card, Text, BlockStack, Button, Banner, List, Box, InlineStack } from "@shopify/polaris";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  return {
    shop,
    themeEditorUrl: `https://${shop}/admin/themes/current/editor?context=apps`,
  };
};

export default function Index() {
  const { themeEditorUrl } = useLoaderData();

  return (
    <Page title="Calendify Delivery">
      <Layout>

        {/* Banner principal */}
        <Layout.Section>
          <Banner tone="info">
            <BlockStack gap="200">
              <Text as="p" variant="headingMd">👋 Bienvenido a Calendify Delivery</Text>
              <Text as="p">
                Para comenzar, activa el App Embed en tu tema. Esto hace que la interceptación
                de checkout funcione automáticamente en <strong>todas</strong> las páginas de tu tienda.
              </Text>
            </BlockStack>
          </Banner>
        </Layout.Section>

        {/* PASO 1: Activar App Embed */}
        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              <Text as="h2" variant="headingLg">🎨 Activar la app en tu tema</Text>

              <Text as="p" variant="bodyLg">
                El App Embed se activa una sola vez desde el editor de temas y luego funciona
                en todas las páginas automáticamente.
              </Text>

              <Box>
                <Button variant="primary" size="large" url={themeEditorUrl} external>
                  🎨 Abrir Editor de Temas → App embeds
                </Button>
              </Box>

              <Banner tone="warning">
                <BlockStack gap="200">
                  <Text as="p" fontWeight="bold">Una vez abierto el editor:</Text>
                  <List type="number">
                    <List.Item>
                      En el panel izquierdo, busca la sección <strong>App embeds</strong>
                    </List.Item>
                    <List.Item>
                      Activa el toggle de <strong>"Calendify Delivery"</strong>
                    </List.Item>
                    <List.Item>
                      Haz clic en <strong>Guardar</strong> (esquina superior derecha)
                    </List.Item>
                    <List.Item>
                      Vuelve aquí y continúa con los pasos siguientes
                    </List.Item>
                  </List>
                </BlockStack>
              </Banner>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Pasos siguientes */}
        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              <Text as="h2" variant="headingLg">📋 Pasos siguientes</Text>

              <BlockStack gap="400">

                <InlineStack gap="300" blockAlign="start" wrap={false}>
                  <Box minWidth="24px">
                    <Text as="p" variant="headingMd" tone="subdued">1</Text>
                  </Box>
                  <BlockStack gap="100">
                    <Text as="p" fontWeight="semibold">✅ Activar App Embed (paso de arriba)</Text>
                    <Text as="p" tone="subdued">
                      Necesario para la interceptación universal de checkout.
                    </Text>
                  </BlockStack>
                </InlineStack>

                <InlineStack gap="300" blockAlign="start" wrap={false}>
                  <Box minWidth="24px">
                    <Text as="p" variant="headingMd" tone="subdued">2</Text>
                  </Box>
                  <BlockStack gap="100">
                    <InlineStack gap="300" blockAlign="center">
                      <Text as="p" fontWeight="semibold">📍 Configurar ciudades de entrega</Text>
                      <Button variant="plain" url="/app/ciudades">Ir a Ciudades →</Button>
                    </InlineStack>
                    <Text as="p" tone="subdued">
                      Agrega las ciudades donde realizas entregas con sus horarios de corte.
                    </Text>
                  </BlockStack>
                </InlineStack>

                <InlineStack gap="300" blockAlign="start" wrap={false}>
                  <Box minWidth="24px">
                    <Text as="p" variant="headingMd" tone="subdued">3</Text>
                  </Box>
                  <BlockStack gap="100">
                    <InlineStack gap="300" blockAlign="center">
                      <Text as="p" fontWeight="semibold">📅 Configurar feriados</Text>
                      <Button variant="plain" url="/app/feriados">Ir a Feriados →</Button>
                    </InlineStack>
                    <Text as="p" tone="subdued">
                      Bloquea días festivos para que no aparezcan como fechas de entrega.
                    </Text>
                  </BlockStack>
                </InlineStack>

                <InlineStack gap="300" blockAlign="start" wrap={false}>
                  <Box minWidth="24px">
                    <Text as="p" variant="headingMd" tone="subdued">4</Text>
                  </Box>
                  <BlockStack gap="100">
                    <InlineStack gap="300" blockAlign="center">
                      <Text as="p" fontWeight="semibold">⚙️ Configurar opciones generales</Text>
                      <Button variant="plain" url="/app/configuracion">Ir a Configuración →</Button>
                    </InlineStack>
                    <Text as="p" tone="subdued">
                      Días de anticipación, mensaje personalizado, opciones de retiro en tienda.
                    </Text>
                  </BlockStack>
                </InlineStack>

                <InlineStack gap="300" blockAlign="start" wrap={false}>
                  <Box minWidth="24px">
                    <Text as="p" variant="headingMd" tone="subdued">5</Text>
                  </Box>
                  <BlockStack gap="100">
                    <Text as="p" fontWeight="semibold">🎨 (Opcional) Agregar el calendario visualmente al carrito</Text>
                    <Text as="p" tone="subdued">
                      Theme Editor → página del Carrito → panel izquierdo →{" "}
                      <strong>Agregar bloque → Apps → Calendario de Entregas</strong>
                    </Text>
                  </BlockStack>
                </InlineStack>

              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Video tutorial */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">🎥 Video tutorial completo</Text>
              <Text as="p" tone="subdued">
                Aprende a instalar y configurar Calendify Delivery en menos de 5 minutos.
              </Text>
              <div style={{
                position: "relative", paddingBottom: "56.25%", height: 0,
                overflow: "hidden", borderRadius: "8px", background: "#000",
              }}>
                <iframe
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                  src="https://www.youtube-nocookie.com/embed/GYWJlrS0iIc"
                  title="Tutorial completo de Calendify Delivery"
                  frameBorder="0"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Funcionalidades */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">✨ Funcionalidades principales</Text>
              <BlockStack gap="200">
                <Text as="p">🔒 <strong>Interceptación universal</strong> — Funciona en todas las páginas (carrito, producto, etc.)</Text>
                <Text as="p">🏙️ <strong>Ciudades personalizadas</strong> — Configura horarios de corte por ciudad</Text>
                <Text as="p">📅 <strong>Gestión de feriados</strong> — Bloquea días festivos automáticamente</Text>
                <Text as="p">🛒 <strong>Calendario en carrito</strong> — Los clientes seleccionan su fecha de entrega</Text>
                <Text as="p">🎨 <strong>Selector visual de botones</strong> — Elige qué botones interceptar desde tu tienda</Text>
                <Text as="p">💾 <strong>Guardado automático</strong> — Las fechas se guardan en los pedidos de Shopify</Text>
                <Text as="p">🏪 <strong>Retiro en tienda</strong> — Opción de pickup configurable</Text>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

      </Layout>
    </Page>
  );
}
