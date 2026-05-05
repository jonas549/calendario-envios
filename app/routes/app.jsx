import { Outlet, useLoaderData, useSearchParams } from "react-router";
import { authenticate } from "../shopify.server";
import {
  AppProvider, Frame, Navigation,
  Page, Layout, Card, Text, BlockStack,
  Button, Banner, List, Box, InlineStack, Divider,
} from "@shopify/polaris";
import { logger } from "../utils/logger.server";

const APP_HANDLE = "calendify-delivery";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  const response = await admin.graphql(`
    query {
      currentAppInstallation {
        activeSubscriptions {
          id
          status
        }
      }
    }
  `);
  const { data } = await response.json();
  const activeSubscriptions = data?.currentAppInstallation?.activeSubscriptions ?? [];

  logger.info("billing-check", `Suscripciones activas: ${activeSubscriptions.length}`, null, session.shop);

  if (activeSubscriptions.length === 0) {
    const storeHandle = session.shop.replace(".myshopify.com", "");
    const pricingUrl = `https://admin.shopify.com/store/${storeHandle}/charges/${APP_HANDLE}/pricing_plans`;
    logger.info("billing-check", "Sin suscripción activa, mostrando página de gating", { pricingUrl }, session.shop);
    return { pricingUrl };
  }

  return {};
};

function BillingGate({ pricingUrl }) {
  return (
    <AppProvider i18n={{}}>
      <Page>
        <Layout>
          <Layout.Section>
            <Box paddingBlockStart="1600" paddingBlockEnd="800">
              <BlockStack gap="600" inlineAlign="center">

                <BlockStack gap="300" inlineAlign="center">
                  <Text as="h1" variant="headingXl" alignment="center">
                    Activa tu suscripción para continuar
                  </Text>
                  <Text as="p" variant="bodyLg" tone="subdued" alignment="center">
                    Calendify Delivery requiere una suscripción activa para funcionar en tu tienda.
                  </Text>
                </BlockStack>

                <Box maxWidth="480px" width="100%">
                  <Card>
                    <BlockStack gap="500">

                      <InlineStack align="space-between" blockAlign="center" wrap={false}>
                        <BlockStack gap="100">
                          <Text as="h2" variant="headingLg" fontWeight="bold">
                            Calendify Pro
                          </Text>
                          <Text as="p" tone="subdued">Plan único · Todo incluido</Text>
                        </BlockStack>
                        <BlockStack gap="0" inlineAlign="end">
                          <Text as="p" variant="heading2xl" fontWeight="bold">$25</Text>
                          <Text as="p" variant="bodySm" tone="subdued">USD / 30 días</Text>
                        </BlockStack>
                      </InlineStack>

                      <Banner tone="success">
                        <Text as="p" fontWeight="semibold">
                          3 días de prueba gratuita — sin cargos hasta que termine el período
                        </Text>
                      </Banner>

                      <Divider />

                      <BlockStack gap="300">
                        <Text as="p" variant="bodyMd" fontWeight="semibold">Incluye todo:</Text>
                        <List type="bullet">
                          <List.Item>Calendario de fechas de entrega en el carrito</List.Item>
                          <List.Item>Ciudades con horarios de corte personalizados</List.Item>
                          <List.Item>Gestión de feriados y días bloqueados</List.Item>
                          <List.Item>Interceptación universal de checkout</List.Item>
                          <List.Item>Opción de retiro en tienda configurable</List.Item>
                          <List.Item>Soporte incluido</List.Item>
                        </List>
                      </BlockStack>

                      <Box paddingBlockStart="200">
                        <Button
                          variant="primary"
                          size="large"
                          fullWidth
                          onClick={() => window.open(pricingUrl, "_top")}
                        >
                          Activar suscripción — 3 días gratis
                        </Button>
                      </Box>

                    </BlockStack>
                  </Card>
                </Box>

                <Text as="p" tone="subdued" alignment="center" variant="bodySm">
                  Puedes cancelar en cualquier momento desde Configuración → Apps de tu tienda.
                </Text>

              </BlockStack>
            </Box>
          </Layout.Section>
        </Layout>
      </Page>
    </AppProvider>
  );
}

export default function AppLayout() {
  const { pricingUrl } = useLoaderData();
  const [searchParams] = useSearchParams();
  const queryString = searchParams.toString();

  if (pricingUrl) {
    return <BillingGate pricingUrl={pricingUrl} />;
  }

  return (
    <AppProvider i18n={{}}>
      <Frame
        navigation={
          <Navigation location="/">
            <Navigation.Section
              title="Calendario de envíos"
              items={[
                { label: "Inicio", url: `/app${queryString ? `?${queryString}` : ""}` },
                { label: "Configuración", url: `/app/configuracion${queryString ? `?${queryString}` : ""}` },
                { label: "Ciudades", url: `/app/ciudades${queryString ? `?${queryString}` : ""}` },
                { label: "Feriados", url: `/app/feriados${queryString ? `?${queryString}` : ""}` },
              ]}
            />
            <Navigation.Section
              title="Herramientas"
              items={[
                { label: "Soporte", url: `/app/soporte${queryString ? `?${queryString}` : ""}` },
              ]}
            />
          </Navigation>
        }
      >
        <Outlet />
      </Frame>
    </AppProvider>
  );
}
