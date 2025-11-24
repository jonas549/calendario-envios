import { Page, Layout, Card, Text, BlockStack } from "@shopify/polaris";
import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { billing, session } = await authenticate.admin(request);

  console.log("💳 [BILLING] Verificando para:", session.shop);

  // Verificar si ya tiene una subscripción activa
  const billingCheck = await billing.require({
    plans: ["Plan Pro"],
    onFailure: async () => {
      console.log("💳 [BILLING] Creando subscripción...");
      return billing.request({
        plan: "Plan Pro",
        isTest: true,
        amount: 25,
        currencyCode: "USD",
        interval: "EVERY_30_DAYS",
        trialDays: 3,
      });
    },
  });

  // Si la subscripción fue aprobada, redirigir al installer
  if (billingCheck.appSubscriptions.length > 0) {
    console.log("✅ [BILLING] Subscripción activa, redirigiendo a installer");
    return redirect("/app/installer");
  }

  return null;
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