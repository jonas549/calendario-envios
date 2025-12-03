import { Page, Layout, Card, Text, BlockStack, Link } from "@shopify/polaris";

export default function Soporte() {
  return (
    <Page title="Soporte" backAction={{ url: "/app" }}>
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              <Text as="h2" variant="headingLg">
                📞 ¿Necesitas ayuda?
              </Text>

              <BlockStack gap="300">
                <Text as="p" variant="bodyLg">
                  Estamos aquí para ayudarte con cualquier duda o problema.
                </Text>

                <Text as="h3" variant="headingMd">
                  📧 Contacto
                </Text>
                <Text as="p">
                  Email: <Link url="mailto:soporte@ejemplo.com">contacto@appsdeveloperspro.com</Link>
                </Text>


                <Text as="h3" variant="headingMd">
                  🎥 Video tutorial
                </Text>
                <Text as="p" tone="subdued">
                  Próximamente: Tutorial completo de configuración
                </Text>

                <Text as="h3" variant="headingMd">
                  ⚡ Preguntas frecuentes
                </Text>
                <BlockStack gap="200">
                  <Text as="p" fontWeight="semibold">
                    ¿Cómo funciona el horario de corte?
                  </Text>
                  <Text as="p" tone="subdued">
                    Si el cliente pide antes de la hora de corte de su ciudad, puede recibir el mismo día (modo "mismo día") o en X días (modo "día futuro").
                  </Text>

                  <Text as="p" fontWeight="semibold">
                    ¿El calendario aparece automáticamente en el carrito?
                  </Text>
                  <Text as="p" tone="subdued">
                    Sí, una vez instalado desde la sección "Instalador", el calendario se muestra automáticamente en /cart de tu tienda.
                  </Text>

                  <Text as="p" fontWeight="semibold">
                    ¿Puedo tener diferentes horarios por ciudad?
                  </Text>
                  <Text as="p" tone="subdued">
                    Sí, cada ciudad tiene su propia configuración de hora de corte y días activos.
                  </Text>
                </BlockStack>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}