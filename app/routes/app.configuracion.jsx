import { Page, Layout, Card, FormLayout, Select, TextField, Button, Text, BlockStack, Banner } from "@shopify/polaris";
import { useState } from "react";
import { useLoaderData, useActionData, useSubmit } from "react-router";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
import { logger } from "../utils/logger.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  logger.debug("configuracion", "Cargando config", null, shop);

  // Cargar config de esta tienda
  const config = await prisma.config.findUnique({
    where: { shop }
  });

  return { 
    config: config || { mode: "mismo_dia", daysAhead: 1, additionalMessage: "" }
  };
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();

  const configData = {
    mode: formData.get("mode"),
    daysAhead: parseInt(formData.get("daysAhead")),
    additionalMessage: formData.get("additionalMessage") || "",
  };

  logger.info("configuracion", "Guardando config", configData, shop);

  try {
    // Guardar en Prisma con shop
    await prisma.config.upsert({
      where: { shop },
      create: {
        shop,
        ...configData
      },
      update: configData
    });

    // Guardar en metafields (backup)
    const shopResponse = await admin.graphql(`
      #graphql
      query {
        shop {
          id
        }
      }
    `);

    const shopData = await shopResponse.json();
    const shopId = shopData.data.shop.id;

    await admin.graphql(`
      #graphql
      mutation UpdateConfig($input: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $input) {
          metafields {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `, {
      variables: {
        input: [{
          namespace: "calendario_envios",
          key: "config",
          type: "json",
          value: JSON.stringify(configData),
          ownerId: shopId
        }]
      }
    });

    logger.info("configuracion", "Config guardada exitosamente", null, shop);

    return { success: true };
  } catch (error) {
    logger.error("configuracion", "Error guardando config", {
      error: error.message,
      stack: error.stack
    }, shop);
    return { success: false, error: error.message };
  }
};

export default function Configuracion() {
  const { config } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  
  const [mode, setMode] = useState(config.mode);
  const [daysAhead, setDaysAhead] = useState(config.daysAhead.toString());
  const [additionalMessage, setAdditionalMessage] = useState(config.additionalMessage || "");

  const modeOptions = [
    { label: "Mismo día (si pides antes de la hora de corte de la ciudad, llega hoy)", value: "mismo_dia" },
    { label: "Día futuro (si pides antes de la hora de corte, llega en X días)", value: "dia_futuro" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("mode", mode);
    formData.append("daysAhead", daysAhead);
    formData.append("additionalMessage", additionalMessage);
    submit(formData, { method: "post" });
  };

  return (
    <Page
      title="Configuración General"
      backAction={{ url: "/app" }}
    >
      <Layout>
        <Layout.Section>
          {actionData?.success && (
            <Banner status="success" onDismiss={() => window.location.reload()}>
              ✅ Configuración guardada correctamente
            </Banner>
          )}

          {actionData?.success === false && (
            <Banner status="critical">
              ❌ Error al guardar configuración: {actionData.error}
            </Banner>
          )}

          <Card>
            <form onSubmit={handleSubmit}>
              <FormLayout>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">Modo de corte de envío</Text>

                  <Text as="p" tone="subdued">
                    ⚠️ Nota: La hora de corte ahora se configura por ciudad. Ve a "Ciudades" para editarla.
                  </Text>

                  <Select
                    label="Selecciona el modo"
                    options={modeOptions}
                    value={mode}
                    onChange={setMode}
                  />

                  {mode === "dia_futuro" && (
                    <TextField
                      label="Días de anticipación"
                      type="number"
                      value={daysAhead}
                      onChange={setDaysAhead}
                      min="1"
                      helpText="Número de días después del pedido para la entrega"
                    />
                  )}

                  <TextField
                    label="Mensaje adicional (opcional)"
                    value={additionalMessage}
                    onChange={setAdditionalMessage}
                    multiline={3}
                    helpText="Este mensaje aparecerá debajo del calendario en el carrito. Ej: 'Los pedidos se entregan de 8 AM a 8 PM'"
                    placeholder="Escribe un mensaje adicional para tus clientes..."
                  />

                  <Button submit variant="primary">Guardar configuración</Button>
                </BlockStack>
              </FormLayout>
            </form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}