import {
  Page,
  Layout,
  Card,
  FormLayout,
  Select,
  TextField,
  Button,
  Text,
  BlockStack,
  Banner,
  Checkbox,
  Box,
} from "@shopify/polaris";
import { useState } from "react";
import { useLoaderData, useActionData, useSubmit } from "react-router";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
import { logger } from "../utils/logger.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  logger.debug("configuracion", "Cargando config", null, shop);

  const config = await prisma.config.findUnique({
    where: { shop },
  });

  return {
    config: config || {
      mode: "mismo_dia",
      daysAhead: 1,
      additionalMessage: "",
      pickupEnabled: false,
      pickupLabel: "Recoger en tienda",
      checkoutButtonClasses: "",
      requireDelivery: true,
    },
  };
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();

  const configData = {
    mode: formData.get("mode"),
    daysAhead: parseInt(formData.get("daysAhead")) || 1,
    additionalMessage: formData.get("additionalMessage") || "",
    pickupEnabled: formData.get("pickupEnabled") === "true",
    pickupLabel: formData.get("pickupLabel") || "Recoger en tienda",
    checkoutButtonClasses: formData.get("checkoutButtonClasses") || "",
    requireDelivery: formData.get("requireDelivery") === "true",
  };

  logger.info("configuracion", "Guardando config", configData, shop);

  try {
    await prisma.config.upsert({
      where: { shop },
      create: { shop, ...configData },
      update: configData,
    });

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

    await admin.graphql(
      `
      #graphql
      mutation UpdateConfig($input: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $input) {
          metafields { id }
          userErrors { field message }
        }
      }
    `,
      {
        variables: {
          input: [
            {
              namespace: "calendario_envios",
              key: "config",
              type: "json",
              value: JSON.stringify(configData),
              ownerId: shopId,
            },
          ],
        },
      }
    );

    logger.info("configuracion", "Config guardada exitosamente", null, shop);
    return { success: true };
  } catch (error) {
    logger.error(
      "configuracion",
      "Error guardando config",
      { error: error.message, stack: error.stack },
      shop
    );
    return { success: false, error: error.message };
  }
};

export default function Configuracion() {
  const { config } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();

  const [mode, setMode] = useState(config.mode);
  const [daysAhead, setDaysAhead] = useState(config.daysAhead.toString());
  const [additionalMessage, setAdditionalMessage] = useState(
    config.additionalMessage || ""
  );
  const [pickupEnabled, setPickupEnabled] = useState(
    config.pickupEnabled ?? false
  );
  const [pickupLabel, setPickupLabel] = useState(
    config.pickupLabel || "Recoger en tienda"
  );
  const [requireDelivery, setRequireDelivery] = useState(
    config.requireDelivery ?? true
  );
  const [checkoutButtonClasses, setCheckoutButtonClasses] = useState(
    config.checkoutButtonClasses || ""
  );

  const modeOptions = [
    {
      label:
        "Mismo día (si pides antes de la hora de corte de la ciudad, llega hoy)",
      value: "mismo_dia",
    },
    {
      label:
        "Día futuro (si pides antes de la hora de corte, llega en X días)",
      value: "dia_futuro",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("mode", mode);
    formData.append("daysAhead", daysAhead);
    formData.append("additionalMessage", additionalMessage);
    formData.append("pickupEnabled", pickupEnabled.toString());
    formData.append("pickupLabel", pickupLabel);
    formData.append("requireDelivery", requireDelivery.toString());
    formData.append("checkoutButtonClasses", checkoutButtonClasses);
    submit(formData, { method: "post" });
  };

  return (
    <Page title="Configuración General" backAction={{ url: "/app" }}>
      <Layout>
        <Layout.Section>
          {actionData?.success && (
            <Banner
              status="success"
              onDismiss={() => window.location.reload()}
            >
              ✅ Configuración guardada correctamente
            </Banner>
          )}

          {actionData?.success === false && (
            <Banner status="critical">
              ❌ Error al guardar configuración: {actionData.error}
            </Banner>
          )}

          <BlockStack gap="500">
            {/* ── Sección 1: Modo de corte ── */}
            <Card>
              <form onSubmit={handleSubmit} id="config-form">
                <FormLayout>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">
                      Modo de corte de envío
                    </Text>

                    <Text as="p" tone="subdued">
                      ⚠️ La hora de corte se configura por ciudad en la sección
                      "Ciudades".
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
                      helpText="Aparece debajo del calendario en el carrito. Ej: 'Entregas de 8 AM a 8 PM'"
                      placeholder="Escribe un mensaje adicional para tus clientes..."
                    />
                  </BlockStack>
                </FormLayout>
              </form>
            </Card>

            {/* ── Sección 2: Recogida en tienda ── */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Recogida en tienda
                </Text>
                <Text as="p" tone="subdued">
                  Permite que el cliente marque que retirará el pedido en tu
                  local. Al activarlo, el cliente puede omitir la selección de
                  ciudad y fecha.
                </Text>

                <Checkbox
                  label="Activar opción de recogida en tienda"
                  checked={pickupEnabled}
                  onChange={setPickupEnabled}
                />

                {pickupEnabled && (
                  <TextField
                    label="Texto del checkbox"
                    value={pickupLabel}
                    onChange={setPickupLabel}
                    helpText="Texto que verá el cliente. Ej: 'Retirar en showroom', 'Recojo en tienda'"
                    placeholder="Recoger en tienda"
                  />
                )}
              </BlockStack>
            </Card>

            {/* ── Sección 3: Checkout ── */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Control de checkout
                </Text>

                <Banner status="warning">
                  <BlockStack gap="200">
                    <Text as="p" fontWeight="semibold">
                      ⚠️ Limitación con pagos acelerados
                    </Text>
                    <Text as="p">
                      Los botones de <strong>Shop Pay</strong>,{" "}
                      <strong>Apple Pay</strong> y{" "}
                      <strong>Google Pay</strong> son renderizados por Shopify
                      en un iframe aislado y{" "}
                      <strong>no pueden ser bloqueados</strong> por ninguna
                      app. Si necesitas forzar la selección de fecha, desactiva
                      esos botones en{" "}
                      <strong>
                        Configuración → Pagos → Métodos de pago acelerado
                      </strong>{" "}
                      de tu tienda. Los datos de ciudad y fecha{" "}
                      <strong>sí se guardan</strong> en el pedido
                      independientemente del método de pago usado.
                    </Text>
                  </BlockStack>
                </Banner>

                <Checkbox
                  label="Requerir selección de fecha antes de continuar al checkout"
                  checked={requireDelivery}
                  onChange={setRequireDelivery}
                  helpText="Si está activado, el cliente no podrá ir al checkout sin haber seleccionado ciudad y fecha (o activar la opción de recogida)."
                />

                <Box>
                  <BlockStack gap="200">
                    <Text as="p" variant="headingMd">
                      Clases CSS de botones de checkout (avanzado)
                    </Text>
                    <Text as="p" tone="subdued">
                      Opcional. Si tu tema usa botones con clases CSS
                      personalizadas que no son interceptados automáticamente,
                      pégalas aquí separadas por coma. Ejemplo:{" "}
                      <code>btn-checkout, cart__checkout-button</code>
                    </Text>
                    <TextField
                      label="Clases CSS adicionales"
                      value={checkoutButtonClasses}
                      onChange={setCheckoutButtonClasses}
                      multiline={2}
                      placeholder="btn-checkout, mi-boton-pago"
                      helpText="La interceptación universal ya funciona para la mayoría de los temas sin necesidad de configurar esto."
                    />
                  </BlockStack>
                </Box>
              </BlockStack>
            </Card>

            <Button submit variant="primary" form="config-form">
              Guardar configuración
            </Button>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
