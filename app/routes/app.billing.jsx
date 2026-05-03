import { Page, Layout, Card, Text, BlockStack } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { logger } from "../utils/logger.server";

export const loader = async ({ request }) => {
  try {
    const { billing, session } = await authenticate.admin(request);
    const shop = session.shop;

    logger.info("billing", "Verificando billing", { shop }, shop);

    // Verificar si ya tiene subscripción
    const billingCheck = await billing.check({
      plans: ["Plan Pro"],
      isTest: process.env.BILLING_TEST_MODE === "true",
    });

    if (billingCheck.hasActivePayment) {
      logger.info("billing", "Ya tiene subscripción activa, redirigiendo a installer", null, shop);
      
      // Ya tiene pago, ir al installer
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/app/installer"
        }
      });
    }

    // NO tiene pago, crear cargo
    logger.info("billing", "No tiene subscripción, creando cargo", null, shop);

    const billingResponse = await billing.request({
      plan: "Plan Pro",
      isTest: process.env.BILLING_TEST_MODE === "true",
      returnUrl: `${process.env.SHOPIFY_APP_URL}/app/installer`
    });

    logger.info("billing", "Cargo creado, redirigiendo a confirmationUrl", {
      confirmationUrl: billingResponse.confirmationUrl
    }, shop);

    // CRÍTICO: Redirigir FUERA del iframe a la página de pago de Shopify
    return new Response(null, {
      status: 302,
      headers: {
        Location: billingResponse.confirmationUrl,
        "X-Shopify-API-Request-Failure-Reauthorize": "1",
        "X-Shopify-API-Request-Failure-Reauthorize-Url": billingResponse.confirmationUrl
      }
    });

  } catch (error) {
    logger.error("billing", "Error en billing loader", {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

export default function Billing() {
  return (
    <Page title="Configurando subscripción">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                💳 Procesando pago...
              </Text>
              <Text as="p">
                Serás redirigido automáticamente para aprobar la subscripción de $25/mes con 3 días de prueba gratis.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}