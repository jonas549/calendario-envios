import { redirect } from "@remix-run/node";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { billing, session } = await authenticate.admin(request);

  console.log("🔍 [AUTH] Shop:", session.shop);

  // Verificar si es primera instalación (no hay config en DB)
  const existingConfig = await prisma.config.findFirst();

  if (!existingConfig) {
    console.log("🆕 [AUTH] Primera instalación detectada, redirigiendo a installer");
    return redirect("/app/installer");
  }

  // Verificar billing (solo en producción, en dev siempre está ok)
  const billingCheck = await billing.check({
    plans: ["Plan Pro"],
    isTest: true, // Cambiar a false en producción
  });

  if (!billingCheck.hasActivePayment) {
    console.log("⚠️ [AUTH] No tiene subscripción activa, redirigiendo a billing");
    return redirect("/app/billing");
  }

  console.log("✅ [AUTH] Subscripción activa, redirigiendo a dashboard");
  return redirect("/app");
};

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};