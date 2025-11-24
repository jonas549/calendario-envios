import { Page, Layout, Card, Text, BlockStack } from "@shopify/polaris";

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