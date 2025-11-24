import { redirect } from "@remix-run/node";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { billing, session } = await authenticate.admin(request);

  console.log("🔍 [AUTH] Shop:", session.shop);

  // Verificar billing
  const billingCheck = await billing.check({
    plans: ["Plan Pro"],
    isTest: true,
  });

  if (!billingCheck.hasActivePayment) {
    console.log("⚠️ [AUTH] Sin subscripción, redirigiendo a billing");
    return redirect("/app/billing");
  }

  console.log("✅ [AUTH] Billing OK, redirigiendo a /app");
  return redirect("/app");
};

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};