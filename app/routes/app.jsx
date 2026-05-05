import { Outlet, useSearchParams } from "react-router";
import { authenticate } from "../shopify.server";
import { AppProvider, Frame, Navigation } from "@shopify/polaris";
import { logger } from "../utils/logger.server";

const APP_HANDLE = "calendify-delivery";

export const loader = async ({ request }) => {
  const { admin, session, redirect } = await authenticate.admin(request);

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
    logger.info("billing-check", "Sin suscripción activa, redirigiendo a Managed Pricing", { pricingUrl }, session.shop);
    // El SDK hace throw de la Response HTML en contexto embebido.
    // React Router v7 trata los throw como errores (ErrorBoundary), no los renderiza.
    // Capturamos el throw y lo retornamos para que React Router lo envíe directamente al browser.
    try {
      return redirect(pricingUrl, { target: "_top" });
    } catch (thrown) {
      if (thrown instanceof Response) return thrown;
      throw thrown;
    }
  }

  return {};
};

export default function AppLayout() {
  const [searchParams] = useSearchParams();
  const queryString = searchParams.toString();

  return (
    <AppProvider i18n={{}}>
      <Frame
        navigation={
          <Navigation location="/">
            <Navigation.Section
              title="Calendario de envíos"
              items={[
                { label: "Inicio", url: `/app${queryString ? `?${queryString}` : ''}` },
                { label: "Configuración", url: `/app/configuracion${queryString ? `?${queryString}` : ''}` },
                { label: "Ciudades", url: `/app/ciudades${queryString ? `?${queryString}` : ''}` },
                { label: "Feriados", url: `/app/feriados${queryString ? `?${queryString}` : ''}` },
              ]}
            />
            <Navigation.Section
              title="Herramientas"
              items={[
                { label: "Soporte", url: `/app/soporte${queryString ? `?${queryString}` : ''}` },
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
