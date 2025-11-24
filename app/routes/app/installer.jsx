import { Page, Layout, Card, Button, Text, BlockStack, Banner, Box } from "@shopify/polaris";
import { useActionData, Form, useNavigate } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { useState, useEffect } from "react";

export const action = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.admin(request);
    const shop = session.shop;

    // URL del script del carrito (dinámico según el shop)
    const cartScriptUrl = `https://${shop}/apps/proxy/script?shop=${encodeURIComponent(shop)}`;

    // Verificar scripts existentes
    const checkQuery = `
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

    const checkResponse = await admin.graphql(checkQuery);
    const checkData = await checkResponse.json();
    
    // Eliminar todos los ScriptTags existentes de esta app
    for (const edge of checkData.data.scriptTags.edges) {
      if (edge.node.src.includes('calendario-envios') || edge.node.src.includes('proxy/script')) {
        const deleteMutation = `
          mutation scriptTagDelete($id: ID!) {
            scriptTagDelete(id: $id) {
              deletedScriptTagId
              userErrors {
                field
                message
              }
            }
          }
        `;
        
        await admin.graphql(deleteMutation, {
          variables: { id: edge.node.id }
        });
      }
    }

    // Crear ScriptTag para el CARRITO
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

    const response = await admin.graphql(createMutation, {
      variables: {
        input: {
          src: cartScriptUrl,
          displayScope: "ONLINE_STORE"
        }
      }
    });

    const data = await response.json();

    if (data.data.scriptTagCreate.userErrors.length > 0) {
      return {
        success: false,
        message: "Error: " + data.data.scriptTagCreate.userErrors[0].message
      };
    }

    // Crear config inicial si no existe
    const existingConfig = await prisma.config.findUnique({
      where: { shop },
    });

    if (!existingConfig) {
      await prisma.config.create({
        data: {
          shop,
          mode: "mismo_dia",
          daysAhead: 1,
          additionalMessage: "",
        },
      });
    }

    return { 
      success: true, 
      message: "✅ Instalación completada correctamente", 
      scriptId: data.data.scriptTagCreate.scriptTag.id,
      scriptUrl: cartScriptUrl
    };

  } catch (error) {
    console.error("Error con ScriptTag:", error);
    return { success: false, message: error.message };
  }
};

export default function Installer() {
  const actionData = useActionData();
  const navigate = useNavigate();
  const [isInstalling, setIsInstalling] = useState(false);

  // Redirigir al dashboard después de instalación exitosa
  useEffect(() => {
    if (actionData?.success) {
      setTimeout(() => {
        navigate("/app");
      }, 3000);
    }
  }, [actionData, navigate]);

  return (
    <Page title="Bienvenido a Calendario de Envíos">
      <Layout>
        <Layout.Section>
          {actionData?.success && (
            <Banner status="success">
              <BlockStack gap="200">
                <Text as="p" variant="headingMd">🎉 {actionData.message}</Text>
                <Text as="p" tone="subdued">Redirigiendo al panel de control...</Text>
              </BlockStack>
            </Banner>
          )}
          
          {actionData?.success === false && (
            <Banner status="critical">
              <Text as="p">❌ {actionData.message}</Text>
            </Banner>
          )}

          {!actionData?.success && (
            <Card>
              <BlockStack gap="500">
                <Box paddingBlockEnd="400">
                  <Text as="h2" variant="headingLg">👋 ¡Gracias por instalar Calendario de Envíos!</Text>
                </Box>

                <Text as="p" variant="bodyLg">
                  Esta app te permite gestionar fechas de entrega por ciudad con horarios de corte personalizados.
                </Text>

                <BlockStack gap="200">
                  <Text as="p" variant="headingMd">✨ Características del Plan Pro:</Text>
                  <Text as="p">• Configuraciones generales de envío</Text>
                  <Text as="p">• Ciudades ilimitadas con horarios de corte</Text>
                  <Text as="p">• Feriados ilimitados</Text>
                  <Text as="p">• Calendario interactivo en el carrito</Text>
                  <Text as="p">• Fechas guardadas en pedidos y emails</Text>
                </BlockStack>

                <Box paddingBlockStart="400">
                  <Text as="p" variant="headingMd">🚀 Instalación</Text>
                  <Text as="p" tone="subdued">
                    Haz clic en el botón para instalar el calendario en tu tienda. 
                    Esto tomará solo unos segundos.
                  </Text>
                </Box>
                
                <Form method="post" onSubmit={() => setIsInstalling(true)}>
                  <Button 
                    submit 
                    variant="primary" 
                    size="large"
                    loading={isInstalling}
                  >
                    {isInstalling ? "Instalando..." : "Instalar Calendario"}
                  </Button>
                </Form>
              </BlockStack>
            </Card>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}