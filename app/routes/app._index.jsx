import { Page, Layout, Card, Text, BlockStack } from "@shopify/polaris";
import { json, redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  console.log("🏠 [INDEX] Verificando ScriptTags para:", session.shop);

  try {
    // Verificar si hay ScriptTags instalados
    const scriptsQuery = `
      query {
        scriptTags(first: 10) {
          edges {
            node {
              id
              src
              displayScope
            }
          }
        }
      }
    `;

    const scriptsResponse = await admin.graphql(scriptsQuery);
    const scriptsData = await scriptsResponse.json();

    console.log("📜 [INDEX] ScriptTags encontrados:", JSON.stringify(scriptsData, null, 2));

    // Verificar si existe un script de calendario-envios
    const hasCalendarScript = scriptsData.data?.scriptTags?.edges?.some(
      ({ node }) => 
        node.src.includes('calendario-envios') || 
        node.src.includes('/apps/proxy/script')
    );

    if (!hasCalendarScript) {
      console.log("⚠️ [INDEX] No hay ScriptTags instalados, redirigiendo a installer");
      return redirect("/app/installer");
    }

    console.log("✅ [INDEX] ScriptTags verificados, mostrando dashboard");
    return json({ shop: session.shop });

  } catch (error) {
    console.error("❌ [INDEX] Error verificando scripts:", error);
    return redirect("/app/installer");
  }
};

export default function Index() {
  return (
    <Page title="Calendario de Envíos">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                ✅ Bienvenido al panel de administración
              </Text>
              <Text as="p">
                Tu calendario está instalado y funcionando correctamente.
              </Text>
              <Text as="p" tone="subdued">
                Usa el menú lateral para configurar ciudades, horarios y feriados.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}