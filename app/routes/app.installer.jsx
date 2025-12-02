import { Page, Layout, Card, Button, Text, BlockStack, Banner, Box } from "@shopify/polaris";
import { useActionData, useLoaderData, Form } from "react-router";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
import { logger } from "../utils/logger.server";
import { useState } from "react";

export const loader = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.admin(request);
    const shop = session.shop;

    logger.debug("installer", "Verificando scripts existentes", null, shop);

    const query = `
      query {
        scriptTags(first: 50) {
          edges {
            node {
              id
              src
            }
          }
        }
      }
    `;

    const response = await admin.graphql(query);
    const data = await response.json();
    
    const hasScript = data.data.scriptTags.edges.some(edge => 
      edge.node.src.includes('calendario-envios')
    );

    logger.debug("installer", `Scripts instalados: ${hasScript}`, null, shop);

    return { hasScript, shop };
  } catch (error) {
    logger.error("installer", "Error en loader", {
      error: error.message,
      stack: error.stack
    });
    return { hasScript: false, error: error.message };
  }
};

export const action = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.admin(request);
    const shop = session.shop;

    logger.info("installer", "Iniciando instalación", null, shop);

    const cartScriptUrl = `https://calendario-envios.vercel.app/api/script?shop=${encodeURIComponent(shop)}`;

    // Obtener scripts existentes
    const queryScripts = `
      query {
        scriptTags(first: 50) {
          edges {
            node {
              id
              src
            }
          }
        }
      }
    `;

    const getResponse = await admin.graphql(queryScripts);
    const getData = await getResponse.json();

    // Eliminar scripts antiguos
    for (const edge of getData.data.scriptTags.edges) {
      if (edge.node.src.includes('calendario-envios')) {
        logger.info("installer", `Eliminando script: ${edge.node.id}`, null, shop);
        
        const deleteMutation = `
          mutation scriptTagDelete($id: ID!) {
            scriptTagDelete(id: $id) {
              deletedScriptTagId
            }
          }
        `;
        
        await admin.graphql(deleteMutation, {
          variables: { id: edge.node.id }
        });
      }
    }

    // Crear nuevo script
    logger.info("installer", "Creando nuevo script", null, shop);

    const createMutation = `
      mutation scriptTagCreate($input: ScriptTagInput!) {
        scriptTagCreate(input: $input) {
          scriptTag {
            id
            src
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const createResponse = await admin.graphql(createMutation, {
      variables: {
        input: {
          src: cartScriptUrl,
          displayScope: "ONLINE_STORE"
        }
      }
    });

    const createData = await createResponse.json();

    if (createData.data.scriptTagCreate.userErrors.length > 0) {
      const errorMsg = createData.data.scriptTagCreate.userErrors[0].message;
      logger.error("installer", "Error de GraphQL", { error: errorMsg }, shop);
      
      return {
        success: false,
        message: `Error: ${errorMsg}`
      };
    }

    // Crear config inicial si no existe
    const existingConfig = await prisma.config.findUnique({
      where: { shop }
    });

    if (!existingConfig) {
      await prisma.config.create({
        data: {
          shop,
          setting: "mode",
          value: "mismo_dia"
        }
      });
      logger.info("installer", "Config inicial creada", null, shop);
    }

    logger.info("installer", "Instalación completada", {
      scriptId: createData.data.scriptTagCreate.scriptTag.id
    }, shop);

    return { 
      success: true, 
      message: "✅ Calendario instalado correctamente. Ahora configura tus ciudades y feriados.",
      scriptId: createData.data.scriptTagCreate.scriptTag.id,
      scriptUrl: cartScriptUrl
    };

  } catch (error) {
    logger.error("installer", "Error crítico en instalación", {
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
  const [isInstalling, setIsInstalling] = useState(false);

  const hasScript = loaderData?.hasScript || false;
  const buttonText = hasScript ? "🔄 Reinstalar Calendario" : "🚀 Instalar Calendario";

  return (
    <Page 
      title="Instalador de Calendario"
      backAction={{ url: "/app" }}
    >
      <Layout>
        <Layout.Section>
          {actionData?.success && (
            <Banner status="success">
              <BlockStack gap="200">
                <Text as="p" variant="headingMd">{actionData.message}</Text>
                <Button url="/app/ciudades" variant="primary">
                  Configurar Ciudades
                </Button>
              </BlockStack>
            </Banner>
          )}
          
          {actionData?.success === false && (
            <Banner status="critical">
              <BlockStack gap="200">
                <Text as="p" variant="headingMd">❌ Error en la instalación</Text>
                <Text as="p">{actionData.message}</Text>
                <Text as="p" tone="subdued">
                  Si el problema persiste, contacta soporte con este mensaje.
                </Text>
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
                  {hasScript ? "🔄 Reinstalar Calendario" : "📅 Instalar Calendario de Envíos"}
                </Text>
              </Box>

              {hasScript && (
                <Banner status="info">
                  <Text as="p">
                    ℹ️ El calendario ya está instalado en tu tienda. Puedes reinstalarlo si hay problemas.
                  </Text>
                </Banner>
              )}

              <Text as="p" variant="bodyLg">
                {hasScript 
                  ? "Reinstala el calendario para aplicar actualizaciones o resolver problemas."
                  : "Instala el calendario interactivo en el carrito de tu tienda."
                }
              </Text>

              {!hasScript && (
                <BlockStack gap="200">
                  <Text as="p" variant="headingMd">✨ Características:</Text>
                  <Text as="p">• Configuración de ciudades con horarios de corte</Text>
                  <Text as="p">• Gestión de feriados</Text>
                  <Text as="p">• Calendario interactivo en el carrito</Text>
                  <Text as="p">• Fechas guardadas automáticamente en pedidos</Text>
                </BlockStack>
              )}

              <Box paddingBlockStart="400">
                <Form method="post" onSubmit={() => setIsInstalling(true)}>
                  <Button 
                    submit 
                    variant="primary" 
                    size="large"
                    loading={isInstalling}
                    disabled={isInstalling}
                  >
                    {isInstalling ? "Instalando..." : buttonText}
                  </Button>
                </Form>
              </Box>

              <Text as="p" tone="subdued" variant="bodySm">
                💡 Después de instalar, configura tus ciudades y feriados desde el menú lateral.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}