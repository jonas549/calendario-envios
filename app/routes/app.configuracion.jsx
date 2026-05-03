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
  InlineStack,
  Badge,
  Divider,
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
    shop,
    config: config || {
      mode: "mismo_dia",
      daysAhead: 1,
      additionalMessage: "",
      pickupEnabled: false,
      pickupLabel: "Recoger en tienda",
      checkoutButtonClasses: "",
      requireDelivery: true,
      selectedButtonSelectors: "[]",
    },
  };
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();

  // Acción separada: limpiar selectores visuales
  if (formData.get("_action") === "clearSelectors") {
    try {
      await prisma.config.upsert({
        where:  { shop },
        create: { shop, selectedButtonSelectors: "[]" },
        update: { selectedButtonSelectors: "[]" },
      });
      return { success: true, cleared: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Acción normal: guardar configuración general
  logger.info("configuracion", "Action recibido — inicio");

  const configData = {
    mode: formData.get("mode"),
    daysAhead: parseInt(formData.get("daysAhead")) || 1,
    additionalMessage: formData.get("additionalMessage") || "",
    pickupEnabled: formData.get("pickupEnabled") === "true",
    pickupLabel: formData.get("pickupLabel") || "Recoger en tienda",
    checkoutButtonClasses: "",   // deprecated — gestionado via selector visual
    requireDelivery: formData.get("requireDelivery") === "true",
  };

  logger.info("configuracion", "Guardando config", configData, shop);

  try {
    await prisma.config.upsert({
      where:  { shop },
      create: { shop, ...configData },
      update: configData,
    });

    const shopResponse = await admin.graphql(`#graphql
      query { shop { id } }
    `);
    const shopData = await shopResponse.json();
    const shopId   = shopData.data.shop.id;

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
            key:       "config",
            type:      "json",
            value:     JSON.stringify(configData),
            ownerId:   shopId,
          }],
        },
      }
    );

    logger.info("configuracion", "Config guardada exitosamente", null, shop);
    return { success: true };
  } catch (error) {
    logger.error("configuracion", "Error guardando config", { error: error.message }, shop);
    return { success: false, error: error.message };
  }
};

export default function Configuracion() {
  const { config, shop } = useLoaderData();
  const fetcher = useFetcher();

  const [mode,              setMode]              = useState(config.mode);
  const [daysAhead,         setDaysAhead]         = useState(String(config.daysAhead));
  const [additionalMessage, setAdditionalMessage] = useState(config.additionalMessage || "");
  const [pickupEnabled,     setPickupEnabled]     = useState(config.pickupEnabled ?? false);
  const [pickupLabel,       setPickupLabel]       = useState(config.pickupLabel || "Recoger en tienda");
  const [requireDelivery,   setRequireDelivery]   = useState(config.requireDelivery ?? true);

  const [selectedSelectors, setSelectedSelectors] = useState(() => {
    try { return JSON.parse(config.selectedButtonSelectors || "[]"); }
    catch (_) { return []; }
  });

  const storeUrl     = "https://" + shop;
  const selModeUrl   = storeUrl + "/cart?ce_select_mode=1";
  const isSaving     = fetcher.state !== "idle";
  const saveResult   = fetcher.data;

  const handleSave = () => {
    const fd = new FormData();
    fd.append("mode",              mode);
    fd.append("daysAhead",         daysAhead);
    fd.append("additionalMessage", additionalMessage);
    fd.append("pickupEnabled",     String(pickupEnabled));
    fd.append("pickupLabel",       pickupLabel);
    fd.append("requireDelivery",   String(requireDelivery));
    fetcher.submit(fd, { method: "post" });
  };

  const handleClearSelectors = () => {
    const fd = new FormData();
    fd.append("_action", "clearSelectors");
    fetcher.submit(fd, { method: "post" });
    setSelectedSelectors([]);
  };

  // Actualizar lista local si el servidor limpió
  if (saveResult?.cleared && selectedSelectors.length > 0) {
    setSelectedSelectors([]);
  }

  const modeOptions = [
    { label: "Mismo día (si pides antes de la hora de corte, llega hoy)",       value: "mismo_dia"  },
    { label: "Día futuro (si pides antes de la hora de corte, llega en X días)", value: "dia_futuro" },
  ];

  return (
    <Page title="Configuración General" backAction={{ url: "/app" }}>
      <Layout>
        <Layout.Section>
          <Box paddingBlockEnd="800">
            <BlockStack gap="500">

              {/* ── Feedback ── */}
              {saveResult?.success === true && !saveResult?.cleared && (
                <Banner tone="success">✅ Configuración guardada correctamente</Banner>
              )}
              {saveResult?.cleared && (
                <Banner tone="success">✅ Selectores personalizados eliminados</Banner>
              )}
              {saveResult?.success === false && (
                <Banner tone="critical">❌ Error al guardar: {saveResult.error}</Banner>
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

              {/* ── Sección 2: Recogida ── */}
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
                <BlockStack gap="500">
                  <Text as="h2" variant="headingMd">Control de checkout</Text>

                  <Checkbox
                    label="Requerir selección de fecha antes del checkout"
                    checked={requireDelivery}
                    onChange={setRequireDelivery}
                    helpText="El cliente no podrá ir al checkout sin seleccionar ciudad y fecha (o activar recogida)."
                  />

                  <Divider />

                  {/* ── Detección automática ── */}
                  <BlockStack gap="300">
                    <Text as="h3" variant="headingMd">Botones de checkout</Text>

                    <Banner tone="info">
                      <BlockStack gap="200">
                        <Text as="p" fontWeight="semibold">
                          Detección automática activa — cubre el 85% de los temas
                        </Text>
                        <Text as="p">
                          La app intercepta automáticamente los botones más comunes:{" "}
                          <em>Check out</em>, <em>Buy it now</em> y variantes estándar de Shopify.
                          Si tu tema usa botones con diseño personalizado, agrégalos con el
                          selector visual de abajo.
                        </Text>
                      </BlockStack>
                    </Banner>

                    {/* ── Selectores configurados ── */}
                    <BlockStack gap="200">
                      <InlineStack align="space-between" blockAlign="center">
                        <Text as="p" fontWeight="semibold">Botones personalizados configurados</Text>
                        {selectedSelectors.length > 0 && (
                          <Badge tone="success">{selectedSelectors.length} activos</Badge>
                        )}
                      </InlineStack>

                      {selectedSelectors.length > 0 ? (
                        <BlockStack gap="150">
                          {selectedSelectors.map((sel, i) => (
                            <Box
                              key={i}
                              background="bg-surface-secondary"
                              padding="200"
                              borderRadius="200"
                            >
                              <Text as="p" variant="bodySm" fontFamily="mono" breakWord>
                                {sel}
                              </Text>
                            </Box>
                          ))}
                          <Box paddingBlockStart="100">
                            <Button
                              tone="critical"
                              variant="plain"
                              onClick={handleClearSelectors}
                              disabled={isSaving}
                            >
                              Eliminar todos los botones personalizados
                            </Button>
                          </Box>
                        </BlockStack>
                      ) : (
                        <Text as="p" tone="subdued">
                          Ninguno configurado. La detección automática está activa.
                        </Text>
                      )}
                    </BlockStack>

                    {/* ── Botón de selector visual ── */}
                    <BlockStack gap="200">
                      <Text as="p" fontWeight="semibold">Agregar botones personalizados</Text>
                      <Text as="p" tone="subdued">
                        Abre tu tienda en modo selección. Los botones detectados se resaltarán —
                        haz clic en los que quieras activar y guarda. No necesitas saber CSS.
                      </Text>
                      <InlineStack gap="300" blockAlign="center">
                        <Button url={selModeUrl} external>
                          Configurar botones visualmente
                        </Button>
                        <Text as="p" tone="subdued" variant="bodySm">
                          Se abre en nueva pestaña. Navega a la página del carrito o producto.
                        </Text>
                      </InlineStack>
                    </BlockStack>
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
