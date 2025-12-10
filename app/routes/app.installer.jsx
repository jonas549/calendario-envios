import { Page, Layout, Card, Button, Text, BlockStack, Banner, Box } from "@shopify/polaris";
import { useActionData, useLoaderData, Form, useNavigate } from "react-router";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
import { logger } from "../utils/logger.server";
import { useState, useEffect } from "react";

export const loader = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    logger.debug("installer", "Verificando configuración", null, shop);

    // Verificar si ya tiene config inicial
    const existingConfig = await prisma.config.findUnique({
      where: { shop }
    });

    return { hasConfig: !!existingConfig, shop };
  } catch (error) {
    logger.error("installer", "Error en loader", {
      error: error.message,
      stack: error.stack
    });
    return { hasConfig: false, error: error.message };
  }
};

export const action = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    logger.info("installer", "Iniciando setup inicial", null, shop);

    // Crear config inicial si no existe
    const existingConfig = await prisma.config.findUnique({
      where: { shop }
    });

    if (!existingConfig) {
      await prisma.config.create({
        data: {
          shop,
          mode: "mismo_dia",
          daysAhead: 1,
          additionalMessage: ""
        }
      });
      logger.info("installer", "Config inicial creada", null, shop);
    }

    logger.info("installer", "Setup completado", null, shop);

    return { 
      success: true, 
      message: "✅ Configuración inicial completada. Ahora activa el bloque en tu tema.",
      redirect: true
    };

  } catch (error) {
    logger.error("installer", "Error crítico en setup", {
      error: error.message,
      stack: error.stack
    });
    
    return { 
      success: false, 
      message: `Error: ${error.message}. Por favor intenta de nuevo o contacta soporte.`
    };
  }
};

export default function Installer() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const navigate = useNavigate();
  const [isInstalling, setIsInstalling] = useState(false);

  // Redirect a onboarding después de setup exitoso
  useEffect(() => {
    if (actionData?.success && actionData?.redirect) {
      const timer = setTimeout(() => {
        navigate("/app/onboarding");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [actionData, navigate]);

  const hasConfig = loaderData?.hasConfig || false;
  const buttonText = hasConfig ? "🔄 Reconfigurar" : "🚀 Comenzar Setup";

  return (
    <Page 
      title="Configuración Inicial"
      backAction={{ url: "/app" }}
    >
      <Layout>
        <Layout.Section>
          {actionData?.success && (
            <Banner status="success">
              <BlockStack gap="200">
                <Text as="p" variant="headingMd">{actionData.message}</Text>
                <Text as="p" tone="subdued">Redirigiendo a instrucciones de instalación...</Text>
              </BlockStack>
            </Banner>
          )}
          
          {actionData?.success === false && (
            <Banner status="critical">
              <BlockStack gap="200">
                <Text as="p" variant="headingMd">❌ Error en la configuración</Text>
                <Text as="p">{actionData.message}</Text>
              </BlockStack>
            </Banner>
          )}

          {loaderData?.error && (
            <Banner status="warning">
              <Text as="p">⚠️ No se pudo verificar el estado: {loaderData.error}</Text>
            </Banner>
          )}

          <Card>
            <BlockStack gap="500">
              <Box paddingBlockEnd="400">
                <Text as="h2" variant="headingLg">
                  📅 Calendify Delivery - Setup Inicial
                </Text>
              </Box>

              {hasConfig && (
                <Banner status="info">
                  <Text as="p">
                    ℹ️ La configuración ya está lista. Ve a onboarding para activar el bloque.
                  </Text>
                </Banner>
              )}

              <Text as="p" variant="bodyLg">
                {hasConfig 
                  ? "Tu app ya está configurada. Procede a activar el bloque en tu tema."
                  : "Configura la base de datos y prepara tu app para usar el calendario."}
              </Text>

              {!hasConfig && (
                <BlockStack gap="200">
                  <Text as="p" variant="headingMd">✨ Características:</Text>
                  <Text as="p">• Configuración de ciudades con horarios de corte</Text>
                  <Text as="p">• Gestión de feriados</Text>
                  <Text as="p">• Calendario interactivo en el carrito</Text>
                  <Text as="p">• Fechas guardadas automáticamente en pedidos</Text>
                </BlockStack>
              )}

              <Box paddingBlockStart="400">
                <BlockStack gap="300">
                  <Form method="post" onSubmit={() => setIsInstalling(true)}>
                    <Button 
                      submit 
                      variant="primary" 
                      size="large"
                      loading={isInstalling}
                      disabled={isInstalling}
                    >
                      {isInstalling ? "Configurando..." : buttonText}
                    </Button>
                  </Form>

                  {hasConfig && (
                    <Button 
                      onClick={() => navigate("/app/onboarding")}
                      size="large"
                    >
                      Ver Instrucciones de Instalación
                    </Button>
                  )}
                </BlockStack>
              </Box>

              <Text as="p" tone="subdued" variant="bodySm">
                💡 Después del setup, seguirás las instrucciones para activar el bloque en tu tema.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}