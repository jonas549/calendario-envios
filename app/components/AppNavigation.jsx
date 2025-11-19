// app/components/AppNavigation.jsx
import { Navigation } from "@shopify/polaris";
import {
  HomeMajor,
  SettingsMajor,
  LocationMajor,
  CalendarMajor,
} from "@shopify/polaris-icons";
import { useLocation, useNavigate } from "react-router";

export function AppNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Navigation location={location.pathname}>
      <Navigation.Section
        items={[
          {
            label: "Inicio",
            icon: HomeMajor,
            onClick: () => navigate("/app"),
            selected: location.pathname === "/app",
          },
          {
            label: "Configuración",
            icon: SettingsMajor,
            onClick: () => navigate("/app/configuracion"),
            selected: location.pathname === "/app/configuracion",
          },
          {
            label: "Ciudades",
            icon: LocationMajor,
            onClick: () => navigate("/app/ciudades"),
            selected: location.pathname === "/app/ciudades",
          },
          {
            label: "Feriados",
            icon: CalendarMajor,
            onClick: () => navigate("/app/feriados"),
            selected: location.pathname === "/app/feriados",
          },
        ]}
      />
    </Navigation>
  );
}
