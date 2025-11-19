import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  try {
    const { shop, session, topic } = await authenticate.webhook(request);

    console.log(`🟢 [WEBHOOK] ${topic} para ${shop}`);

    if (!session) {
      console.warn("⚠️ [WEBHOOK] Sin sesión activa");
      return new Response("No session", { status: 200 });
    }

    // Crear ScriptTag para inyectar el calendario en el storefront
    const scriptTagResponse = await session.admin.rest.resources.ScriptTag.create({
      session: session,
      src: `https://${process.env.SHOPIFY_APP_URL?.replace('https://', '')}/apps/proxy/script`,
      event: "onload",
      display_scope: "online_store",
    });

    console.log("✅ [SCRIPTTAG] Creado:", scriptTagResponse.id);

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("❌ [WEBHOOK] Error creando ScriptTag:", error);
    return new Response("Error", { status: 500 });
  }
};