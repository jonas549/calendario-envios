import { Outlet, useSearchParams } from "react-router";
import { requireBilling } from "../shopify.server";
import { AppProvider, Frame, Navigation } from "@shopify/polaris";

export const loader = async ({ request }) => {
  await requireBilling(request);
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