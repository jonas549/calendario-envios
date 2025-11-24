import { Page, Layout, Card, Text, BlockStack, Banner } from "@shopify/polaris";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { useEffect, useState } from "react";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  // Solo consultar scripts, NO redirigir
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

    return json({ 
      shop: session.shop,
      hasScripts: hasCalendarScript 
    });

  } catch (error) {
    console.error("❌ [INDEX] Error:", error);
    return json({ 
      shop: session.shop,
      hasScripts: false 
    });
  }
};

export default function Index() {
  const { hasScripts } = useLoaderData();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!hasScripts) {
      console.log("⚠️ [INDEX] No hay scripts, redirigiendo a installer");
      navigate("/app/installer");
    } else {
      setChecking(false);
    }
  }, [hasScripts, navigate]);

  if (checking && !hasScripts) {
    return (
      <Page title="Calendario de Envíos">
        <Layout>
          <Layout.Section>
            <Banner>
              <Text as="p">Verificando instalación...</Text>
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