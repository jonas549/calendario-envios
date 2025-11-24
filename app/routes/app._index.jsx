import { Page, Layout, Card, Text, BlockStack, Banner } from "@shopify/polaris";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { useEffect, useState } from "react";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  try {
    const scriptsQuery = `
      query {
        scriptTags(first: 10) {
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

    const hasCalendarScript = scriptsData.data?.scriptTags?.edges?.some(
      ({ node }) => 
        node.src.includes('calendario-envios') || 
        node.src.includes('/apps/proxy/script')
    );

    return { 
      shop: session.shop,
      hasScripts: hasCalendarScript 
    };

  } catch (error) {
    console.error("❌ [INDEX] Error:", error);
    return { 
      shop: session.shop,
      hasScripts: false 
    };
  }
};

export default function Index() {
  const { hasScripts } = useLoaderData();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!hasScripts) {
      console.log("⚠️ [INDEX] No hay scripts, redirigiendo...");
      setShouldRedirect(true);
      window.location.href = "/app/installer";
    }
  }, [hasScripts]);

  if (shouldRedirect) {
    return (
      <Page title="Calendario de Envíos">
        <Layout>
          <Layout.Section>
            <Banner>
              <Text as="p">Redirigiendo a instalador...</Text>
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

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