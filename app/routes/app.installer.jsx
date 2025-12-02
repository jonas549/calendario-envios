import { Page, Layout, Card, Button, Text, BlockStack, Banner } from "@shopify/polaris";
import { useActionData, Form } from "react-router";
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);

    // URL del script del carrito
    const cartScriptUrl = `https://calendario-envios-test.myshopify.com/apps/proxy/script`;

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

    return { 
      success: true, 
      message: "ScriptTag del carrito creado correctamente", 
      scriptId: data.data.scriptTagCreate.scriptTag.id,
      scriptUrl: cartScriptUrl
    };

  } catch (error) {
    console.error("Error con ScriptTag:", error);
    return { success: false, message: error.message };
  }
};

export default function InstallScript() {
  const actionData = useActionData();

  return (
    <Page title="Instalar Script en Storefront" backAction={{ url: "/app" }}>
      <Layout>
        <Layout.Section>
          {actionData?.success && (
            <Banner status="success">
              <BlockStack gap="200">
                <Text as="p">{actionData.message}</Text>
                <Text as="p" tone="subdued">Script ID: {actionData.scriptId}</Text>
                <Text as="p" tone="subdued">URL: {actionData.scriptUrl}</Text>
              </BlockStack>
            </Banner>
          )}
          
          {actionData?.success === false && (
            <Banner status="critical">
              {actionData.message}
            </Banner>
          )}

          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Inyectar script del calendario en la tienda</Text>
              <Text as="p">
                Este botón elimina cualquier ScriptTag previo y crea uno nuevo que:
              </Text>
              <BlockStack gap="200">
                <Text as="p">• Muestra el calendario en la página del carrito (/cart)</Text>
                <Text as="p">• Guarda ciudad y fecha como Cart Attributes</Text>
                <Text as="p">• Los datos aparecen en pedidos y emails</Text>
              </BlockStack>
              
              <Form method="post">
                <Button submit variant="primary">
                  Reinstalar ScriptTag
                </Button>
              </Form>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}