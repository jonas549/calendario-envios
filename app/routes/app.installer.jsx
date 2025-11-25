import { Page, Layout, Card, Text, Button, BlockStack, Banner } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { redirect } from "@remix-run/node";
import { prisma } from "../db.server";
import { logger } from "../utils/logger.server";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;

  logger.info("installer", "Cargando página de instalación", null, shop);

  return { shop };
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;

  try {
    logger.info("installer", "Iniciando instalación de ScriptTag", null, shop);

    const scriptTagUrl = `https://${shop}/apps/proxy/script?shop=${encodeURIComponent(shop)}`;

    logger.debug("installer", "URL del ScriptTag", { scriptTagUrl }, shop);

    const response = await admin.graphql(
      `#graphql
      mutation {
        scriptTagCreate(input: {
          src: "${scriptTagUrl}"
          displayScope: ONLINE_STORE
        }) {
          scriptTag {
            id
            src
          }
          userErrors {
            field
            message
          }
        }
      }`
    );

    const result = await response.json();

    logger.debug("installer", "Respuesta de ScriptTag mutation", { result }, shop);

    if (result.data?.scriptTagCreate?.userErrors?.length > 0) {
      const errors = result.data.scriptTagCreate.userErrors;
      logger.error("installer", "Error creando ScriptTag", { errors }, shop);
      throw new Error(JSON.stringify(errors));
    }

    logger.info("installer", "ScriptTag instalado exitosamente", {
      scriptTagId: result.data?.scriptTagCreate?.scriptTag?.id
    }, shop);

    // Crear config inicial si no existe
    const existingConfig = await prisma.config.findUnique({
      where: { shop },
    });

    if (!existingConfig) {
      logger.info("installer", "Creando configuración inicial", null, shop);
      await prisma.config.create({
        data: {
          shop,
          mode: "mismo_dia",
          daysAhead: 1,
        },
      });
      logger.info("installer", "Configuración inicial creada", null, shop);
    } else {
      logger.debug("installer", "Configuración ya existe", null, shop);
    }

    logger.info("installer", "Instalación completada, redirigiendo a /app", null, shop);
    return redirect("/app");

  } catch (error) {
    logger.error("installer", "Error en instalación", {
      error: error.message,
      stack: error.stack
    }, shop);
    throw error;
  }
};

export default function Installer() {
  return (
    <Page title="Instalador de Calendario">
      <Layout>
        <Layout.Section>
          <Banner tone="info">
            <Text as="p">
              Este paso instala el calendario en tu tienda. Haz click en el botón para continuar.
            </Text>
          </Banner>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                📅 Instalar Calendario de Envíos
              </Text>
              <Text as="p">
                El calendario se mostrará automáticamente en el carrito de tu tienda.
              </Text>
              <Button variant="primary" submit>
                Instalar Calendario
              </Button>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}