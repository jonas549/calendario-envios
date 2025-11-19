import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { billing, session } = await authenticate.admin(request);

  // Verificar si ya tiene una subscripción activa
  const billingCheck = await billing.require({
    plans: ["Plan Pro"],
    onFailure: async () => billing.request({
      plan: "Plan Pro",
      isTest: true, // Cambia a false en producción
      amount: 25,
      currencyCode: "USD",
      interval: "EVERY_30_DAYS",
      trialDays: 3,
    }),
  });

  // Si la subscripción fue aprobada, redirigir al installer
  if (billingCheck.appSubscriptions.length > 0) {
    return redirect("/app/installer");
  }

  return redirect("/app");
};