import { Page, Layout, Card, Button, Text, BlockStack, Banner, Box, List } from "@shopify/polaris";
import { useActionData, useLoaderData, Form, useNavigate } from "react-router";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
import { logger } from "../utils/logger.server";
import { useState } from "react";

export const loader = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    logger.debug("installer", "Verificando configuración", null, shop);

    // Verificar si ya tiene config inicial
    const existingConfig = await prisma.config.findUnique({
      where: { shop }
    });

    // URL del theme editor con deep link
    const themeEditorUrl = `https://${shop}/admin/themes/current/editor?context=apps`;

    return { 
      hasConfig: !!existingConfig, 
      shop,
      themeEditorUrl 
    };
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
      message: "✅ Configuración inicial completada.",
      showOnboarding: true
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

  const hasConfig = loaderData?.hasConfig || false;
  const showOnboarding = actionData?.showOnboarding || hasConfig;
  const themeEditorUrl = loaderData?.themeEditorUrl || "";

  return (
    <Page 
      title={showOnboarding ? "¡Bienvenido a Calendify Delivery! 🎉" : "Configuración Inicial"}
      backAction={{ url: "/app" }}
      primaryAction={showOnboarding ? {
        content: "Abrir Editor de Temas",
        url: themeEditorUrl,
        external: true,
      } : undefined}
    >
      <Layout>
        <Layout.Section>
          {/* Banner de éxito después del setup */}
          {actionData?.success && (
            <Banner status="success">
              <Text as="p" variant="headingMd">{actionData.message}</Text>
            </Banner>
          )}
          
          {/* Banner de error */}
          {actionData?.success === false && (
            <Banner status="critical">
              <BlockStack gap="200">
                <Text as="p" variant="headingMd">❌ Error en la configuración</Text>
                <Text as="p">{actionData.message}</Text>
              </BlockStack>
            </Banner>
          )}

          {/* Banner de error en loader */}
          {loaderData?.error && (
            <Banner status="warning">
              <Text as="p">⚠️ No se pudo verificar el estado: {loaderData.error}</Text>
            </Banner>
          )}

          {/* VISTA 1: Setup inicial (sin config) */}
          {!showOnboarding && (
            <Card>
              <BlockStack gap="500">
                <Box paddingBlockEnd="400">
                  <Text as="h2" variant="headingLg">
                    📅 Calendify Delivery - Setup Inicial
                  </Text>
                </Box>

                <Text as="p" variant="bodyLg">
                  Configura la base de datos y prepara tu app para usar el calendario.
                </Text>

                <BlockStack gap="200">
                  <Text as="p" variant="headingMd">✨ Características:</Text>
                  <Text as="p">• Configuración de ciudades con horarios de corte</Text>
                  <Text as="p">• Gestión de feriados</Text>
                  <Text as="p">• Calendario interactivo en el carrito</Text>
                  <Text as="p">• Fechas guardadas automáticamente en pedidos</Text>
                </BlockStack>

                <Box paddingBlockStart="400">
                  <Form method="post" onSubmit={() => setIsInstalling(true)}>
                    <Button 
                      submit 
                      variant="primary" 
                      size="large"
                      loading={isInstalling}
                      disabled={isInstalling}
                    >
                      {isInstalling ? "Configurando..." : "🚀 Comenzar Setup"}
                    </Button>
                  </Form>
                </Box>

                <Text as="p" tone="subdued" variant="bodySm">
                  💡 Después del setup, seguirás las instrucciones para activar el bloque en tu tema.
                </Text>
              </BlockStack>
            </Card>
          )}

          {/* VISTA 2: Onboarding (con config) */}
          {showOnboarding && (
            <>
              <Banner status="info">
                <Text as="p">
                  Para que el calendario aparezca en tu carrito, necesitas activar el bloque en tu tema.
                </Text>
              </Banner>

              <Box paddingBlockStart="400">
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
              </Box>

<Box paddingBlockStart="400">
  <Card>
    <BlockStack gap="400">
      <Text as="h2" variant="headingMd">
        🎥 Video tutorial
      </Text>
      <Text as="p" tone="subdued">
        Sigue los pasos arriba para activar el calendario en menos de 2 minutos.
      </Text>
      
      <div style={{ 
        position: 'relative', 
        paddingBottom: '56.25%', 
        height: 0, 
        overflow: 'hidden',
        borderRadius: '8px'
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
          title="Tutorial de instalación"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </BlockStack>
  </Card>
</Box>
            </>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}