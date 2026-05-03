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
import { useLoaderData, useFetcher } from "react-router";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
import { logger } from "../utils/logger.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const config = await prisma.config.findUnique({ where: { shop } });

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
  logger.info("configuracion", "Action recibido — inicio");

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

    // Backup en metafields de Shopify
    const shopResponse = await admin.graphql(`#graphql
      query { shop { id } }
    `);
    const shopData = await shopResponse.json();
    const shopId = shopData.data.shop.id;

    await admin.graphql(
      `#graphql
      mutation UpdateConfig($input: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $input) {
          metafields { id }
          userErrors { field message }
        }
      }`,
      {
        variables: {
          input: [{
            namespace: "calendario_envios",
            key: "config",
            type: "json",
            value: JSON.stringify(configData),
            ownerId: shopId,
          }],
        },
      }
    );

    logger.info("configuracion", "Config guardada exitosamente", null, shop);
    return { success: true };
  } catch (error) {
    logger.error(
      "configuracion",
      "Error guardando config",
      { error: error.message },
      shop
    );
    return { success: false, error: error.message };
  }
};

export default function Configuracion() {
  const { config } = useLoaderData();
  // useFetcher: submisión background sin navegación — necesario en iframe Shopify
  const fetcher = useFetcher();

  const [mode, setMode] = useState(config.mode);
  const [daysAhead, setDaysAhead] = useState(String(config.daysAhead));
  const [additionalMessage, setAdditionalMessage] = useState(config.additionalMessage || "");
  const [pickupEnabled, setPickupEnabled] = useState(config.pickupEnabled ?? false);
  const [pickupLabel, setPickupLabel] = useState(config.pickupLabel || "Recoger en tienda");
  const [requireDelivery, setRequireDelivery] = useState(config.requireDelivery ?? true);
  const [checkoutButtonClasses, setCheckoutButtonClasses] = useState(config.checkoutButtonClasses || "");

  const isSaving  = fetcher.state !== "idle";
  const saveResult = fetcher.data;

  const handleSave = () => {
    const fd = new FormData();
    fd.append("mode", mode);
    fd.append("daysAhead", daysAhead);
    fd.append("additionalMessage", additionalMessage);
    fd.append("pickupEnabled", String(pickupEnabled));
    fd.append("pickupLabel", pickupLabel);
    fd.append("requireDelivery", String(requireDelivery));
    fd.append("checkoutButtonClasses", checkoutButtonClasses);
    fetcher.submit(fd, { method: "post" });
  };

  const modeOptions = [
    { label: "Mismo día (si pides antes de la hora de corte, llega hoy)", value: "mismo_dia" },
    { label: "Día futuro (si pides antes de la hora de corte, llega en X días)", value: "dia_futuro" },
  ];

  return (
    <Page title="Configuración General" backAction={{ url: "/app" }}>
      <Layout>
        <Layout.Section>
          <Box paddingBlockEnd="800">
            <BlockStack gap="500">

              {/* ── Feedback de guardado ── */}
              {saveResult?.success === true && (
                <Banner tone="success" onDismiss={() => fetcher.data = null}>
                  ✅ Configuración guardada correctamente
                </Banner>
              )}
              {saveResult?.success === false && (
                <Banner tone="critical">
                  ❌ Error al guardar: {saveResult.error}
                </Banner>
              )}

              {/* ── Sección 1: Modo de corte ── */}
              <Card>
                <FormLayout>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">Modo de corte de envío</Text>

                    <Text as="p" tone="subdued">
                      ⚠️ La hora de corte se configura por ciudad en la sección "Ciudades".
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
                        helpText="Número de días mínimos desde el pedido hasta la entrega"
                      />
                    )}

                    <TextField
                      label="Mensaje adicional (opcional)"
                      value={additionalMessage}
                      onChange={setAdditionalMessage}
                      multiline={3}
                      helpText="Aparece debajo del calendario en el carrito"
                      placeholder="Ej: Entregas de 8 AM a 8 PM"
                    />
                  </BlockStack>
                </FormLayout>
              </Card>

              {/* ── Sección 2: Recogida en tienda ── */}
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">Recogida en tienda</Text>
                  <Text as="p" tone="subdued">
                    Permite que el cliente marque que retirará el pedido en tu local,
                    omitiendo la selección de ciudad y fecha.
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
                      helpText='Ej: "Retirar en showroom", "Recojo en tienda"'
                      placeholder="Recoger en tienda"
                    />
                  )}
                </BlockStack>
              </Card>

              {/* ── Sección 3: Control de checkout ── */}
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">Control de checkout</Text>

                  <Banner tone="warning">
                    <BlockStack gap="200">
                      <Text as="p" fontWeight="semibold">⚠️ Limitación con pagos acelerados</Text>
                      <Text as="p">
                        Los botones de <strong>Shop Pay</strong>, <strong>Apple Pay</strong> y{" "}
                        <strong>Google Pay</strong> son iframes de Shopify y{" "}
                        <strong>no pueden ser bloqueados</strong> por ninguna app.
                        Para forzar selección de fecha, desactívalos en{" "}
                        <strong>Configuración → Pagos → Métodos acelerados</strong>.
                        Los datos de entrega <strong>sí se guardan</strong> en el pedido
                        independientemente del método usado.
                      </Text>
                    </BlockStack>
                  </Banner>

                  <Checkbox
                    label="Requerir selección de fecha antes del checkout"
                    checked={requireDelivery}
                    onChange={setRequireDelivery}
                    helpText="El cliente no podrá ir al checkout sin seleccionar ciudad y fecha (o activar recogida)."
                  />

                  <BlockStack gap="200">
                    <Text as="p" variant="headingMd">Clases CSS adicionales (avanzado)</Text>
                    <Text as="p" tone="subdued">
                      Opcional. Si tu tema tiene botones de checkout con clases CSS no estándar,
                      agrégalas separadas por coma. La interceptación universal ya cubre la mayoría
                      de los temas sin necesidad de configurar esto.
                    </Text>
                    <TextField
                      label="Clases CSS de botones de checkout"
                      value={checkoutButtonClasses}
                      onChange={setCheckoutButtonClasses}
                      multiline={2}
                      placeholder="btn-checkout, cart__checkout-button"
                    />
                  </BlockStack>
                </BlockStack>
              </Card>

              {/* ── Botón guardar ── */}
              <Box paddingBlockStart="200">
                <Button
                  variant="primary"
                  size="large"
                  onClick={handleSave}
                  loading={isSaving}
                  disabled={isSaving}
                >
                  {isSaving ? "Guardando..." : "Guardar configuración"}
                </Button>
              </Box>

            </BlockStack>
          </Box>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
