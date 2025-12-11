import { Page, Layout, Card, Text, BlockStack, Button, Banner, List, Box } from "@shopify/polaris";
import { useNavigate } from "react-router";

export default function Index() {
  const navigate = useNavigate();

  return (
    <Page title="Calendario de Envíos">
      <Layout>
        <Layout.Section>
          <Banner status="info">
            <BlockStack gap="200">
              <Text as="p" variant="headingMd">
                👋 ¡Bienvenido a Calendify Delivery!
              </Text>
              <Text as="p">
                Antes de empezar a usar la app, necesitas activar el calendario en tu tema.
              </Text>
            </BlockStack>
          </Banner>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              <Text as="h2" variant="headingLg">
                🚀 Primeros pasos
              </Text>

              <List type="number">
                <List.Item>
                  <Text as="p" fontWeight="semibold">Ve al Instalador</Text>
                  <Text as="p" tone="subdued">
                    Haz clic en el botón de abajo o usa el menú "Herramientas → Instalador"
                  </Text>
                </List.Item>
                <List.Item>
                  <Text as="p" fontWeight="semibold">Completa el setup inicial</Text>
                  <Text as="p" tone="subdued">
                    Esto configura la base de datos de tu app
                  </Text>
                </List.Item>
                <List.Item>
                  <Text as="p" fontWeight="semibold">Activa el bloque en tu tema</Text>
                  <Text as="p" tone="subdued">
                    Sigue las instrucciones para añadir el calendario al carrito
                  </Text>
                </List.Item>
                <List.Item>
                  <Text as="p" fontWeight="semibold">Configura ciudades y feriados</Text>
                  <Text as="p" tone="subdued">
                    Usa el menú lateral para gestionar las fechas de entrega
                  </Text>
                </List.Item>
              </List>

           
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                🎥 Video tutorial completo
              </Text>
              <Text as="p" tone="subdued">
                Mira este video para aprender a instalar y configurar Calendify Delivery en menos de 5 minutos.
              </Text>
              
          <div style={{ 
  position: 'relative', 
  paddingBottom: '56.25%', 
  height: 0, 
  overflow: 'hidden',
  borderRadius: '8px',
  background: '#000'
}}>
  <iframe
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      border: 0
    }}
    src="https://www.youtube.com/watch?v=GYWJlrS0iIc"
    title="Tutorial de Calendify Delivery"
    frameBorder="0"
    loading="lazy"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
  />
</div>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                ✨ Funcionalidades principales
              </Text>

              <BlockStack gap="200">
                <Text as="p">
                  📍 <strong>Ciudades personalizadas</strong> - Configura horarios de corte por ciudad
                </Text>
                <Text as="p">
                  📅 <strong>Gestión de feriados</strong> - Bloquea días festivos automáticamente
                </Text>
                <Text as="p">
                  🛒 <strong>Calendario en carrito</strong> - Los clientes seleccionan su fecha de entrega
                </Text>
                <Text as="p">
                  💾 <strong>Guardado automático</strong> - Las fechas se guardan en los pedidos de Shopify
                </Text>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}