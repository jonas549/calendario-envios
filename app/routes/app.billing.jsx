import { Page, Layout, Card, Text, BlockStack } from "@shopify/polaris";
import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { logger } from "../utils/logger.server";

export const loader = async ({ request }) => {
  try {
    const { billing, session } = await authenticate.admin(request);
    const shop = session.shop;

    logger.info("billing", "Verificando billing", { shop }, shop);

    // Verificar si ya tiene una subscripción activa
    const billingCheck = await billing.require({
      plans: ["Plan Pro"],
      onFailure: async () => {
        logger.info("billing", "No tiene subscripción activa, creando cargo...", null, shop);
        
        const billingResponse = await billing.request({
          plan: "Plan Pro",
          isTest: true,
          amount: 25,
          currencyCode: "USD",
          interval: "EVERY_30_DAYS",
          trialDays: 3,
        });

        logger.info("billing", "Cargo creado, redirigiendo a confirmationUrl", { 
          confirmationUrl: billingResponse.confirmationUrl 
        }, shop);

        return billingResponse;
      },
    });

    // Si la subscripción fue aprobada, redirigir al installer
    if (billingCheck.appSubscriptions.length > 0) {
      logger.info("billing", "Subscripción activa encontrada", { 
        subscriptionId: billingCheck.appSubscriptions[0].id,
        subscriptionName: billingCheck.appSubscriptions[0].name
      }, shop);
      
      logger.info("billing", "Redirigiendo a /app/installer", null, shop);
      return redirect("/app/installer");
    }

    logger.warn("billing", "No se encontró subscripción pero no se creó cargo", null, shop);
    return null;

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
                Serás redirigido automáticamente para aprobar la subscripción de $25/mes.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}