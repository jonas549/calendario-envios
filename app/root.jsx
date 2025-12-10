import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "react-router";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import "@shopify/polaris/build/esm/styles.css";

const i18n = {
  Polaris: {
    ResourceList: {
      sortingLabel: "Ordenar por",
      defaultItemSingular: "elemento",
      defaultItemPlural: "elementos",
    },
    Common: {
      checkbox: "checkbox",
    },
  },
};

export const loader = ({ request }) => {
  const url = new URL(request.url);
  const host = url.searchParams.get("host");
  const shop = url.searchParams.get("shop");
  
  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    host: host || "",
    shop: shop || "",
  };
};

export default function App() {
  const { apiKey, host } = useLoaderData();

  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>

      <body>
        <AppProvider isEmbeddedApp apiKey={apiKey} host={host} i18n={i18n}>
          <Outlet />
        </AppProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}