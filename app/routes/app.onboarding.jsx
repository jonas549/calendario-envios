import { Page, Layout, Card, Button, Text, BlockStack, Banner, List } from "@shopify/polaris";
import { useLoaderData, useNavigate } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  
  // URL del theme editor con deep link
  const themeEditorUrl = `https://${shop}/admin/themes/current/editor?context=apps`;
  
  return { shop, themeEditorUrl };
};

export default function Onboarding() {
  const { themeEditorUrl } = useLoaderData();
  const navigate = useNavigate();

  return (
    <Page
      title="¡Bienvenido a Calendify Delivery! 🎉"
      primaryAction={{
        content: "Abrir Editor de Temas",
        url: themeEditorUrl,
        external: true,
      }}
      secondaryActions={[
        {
          content: "Ya lo activé, ir al Dashboard",
          onAction: () => navigate("/app"),
        }
      ]}
    >
      <Layout>
        <Layout.Section>
          <Banner status="info">
            <Text as="p">
              Para que el calendario aparezca en tu carrito, necesitas activar el bloque en tu tema.
            </Text>
          </Banner>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                📋 Instrucciones de instalación
              </Text>

              <List type="number">
                <List.Item>
                  Haz clic en el botón <strong>"Abrir Editor de Temas"</strong> arriba
                </List.Item>
                <List.Item>
                  En el editor, navega a la página del <strong>Carrito</strong> (Cart)
                </List.Item>
                <List.Item>
                  En el panel izquierdo, busca la sección <strong>"Apps"</strong>
                </List.Item>
                <List.Item>
                  Busca <strong>"Calendario de Entregas"</strong> y arrástralo a tu carrito
                </List.Item>
                <List.Item>
                  Colócalo donde quieras que aparezca (recomendado: arriba del botón de pago)
                </List.Item>
                <List.Item>
                  Haz clic en <strong>"Guardar"</strong> en la esquina superior derecha
                </List.Item>
              </List>

              <Banner status="success">
                <Text as="p">
                  ¡Listo! El calendario ahora estará visible en tu tienda. 
                  Regresa aquí para configurar ciudades y fechas de entrega.
                </Text>
              </Banner>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                🎥 Video tutorial
              </Text>
              <Text as="p" tone="subdued">
                Sigue los pasos arriba para activar el calendario en menos de 2 minutos.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}