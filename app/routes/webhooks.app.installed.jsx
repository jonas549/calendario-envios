import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }) => {
  try {
    const { shop, session, topic } = await authenticate.webhook(request);

    console.log(`🟢 [WEBHOOK] ${topic} para ${shop}`);

    if (!session) {
      console.warn("⚠️ [WEBHOOK] Sin sesión activa");
      return new Response("No session", { status: 200 });
    }

    // Crear config inicial si no existe
    const existingConfig = await prisma.config.findUnique({
      where: { shop },
    });

    if (!existingConfig) {
      await prisma.config.create({
        data: {
          shop,
          mode: "mismo_dia",
          daysAhead: 1,
          additionalMessage: "",
        },
      });
      console.log("✅ [WEBHOOK] Config inicial creada para", shop);
    }

    // Crear ScriptTag para inyectar el calendario en el storefront
    const scriptTagUrl = `https://${process.env.SHOPIFY_APP_URL?.replace('https://', '')}/apps/proxy/script?shop=${encodeURIComponent(shop)}`;
    
    const scriptTagResponse = await session.admin.rest.resources.ScriptTag.create({
      session: session,
      src: scriptTagUrl,
      event: "onload",
      display_scope: "online_store",
    });

    console.log("✅ [SCRIPTTAG] Creado:", scriptTagResponse.id);

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("❌ [WEBHOOK] Error:", error);
    return new Response("Error", { status: 500 });
  }
};