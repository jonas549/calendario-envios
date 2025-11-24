import { json, redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { Page, Layout, Card, Text, BlockStack } from "@shopify/polaris";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  console.log("🔍 [INDEX] Shop:", session.shop);

  const scriptsQuery = `
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

  const scriptsResponse = await admin.graphql(scriptsQuery);
  const scriptsData = await scriptsResponse.json();

  const hasScripts = scriptsData.data.scriptTags.edges.some(
    (edge) => edge.node.src.includes('/apps/proxy/script')
  );

  if (!hasScripts) {
    console.log("⚠️ [INDEX] Sin scripts, redirigiendo a installer");
    return redirect("/app/installer");
  }

  console.log("✅ [INDEX] Scripts instalados, mostrando dashboard");
  return json({ shop: session.shop });
};

export default function Index() {
  return (
    <Page title="Calendario de Envíos">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Bienvenido al panel de administración</Text>
              <Text as="p">Usa el menú lateral para navegar entre las secciones.</Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}