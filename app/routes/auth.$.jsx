import { redirect } from "@remix-run/node";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  
  // SIEMPRE redirigir a billing después de OAuth
  return redirect("/app/billing");
};

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};