import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
import { logger } from "../utils/logger.server";

export const action = async ({ request }) => {
  try {
    const { shop, session, topic } = await authenticate.webhook(request);

    logger.info("webhook", `${topic} recibido`, { shop }, shop);

    if (!session) {
      logger.warn("webhook", "Sin sesión activa", null, shop);
      return new Response("No session", { status: 200 });
    }

    // SOLO crear config inicial - NO instalar ScriptTag aquí
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
      logger.info("webhook", "Config inicial creada", null, shop);
    } else {
      logger.debug("webhook", "Config ya existe", null, shop);
    }

    logger.info("webhook", "Webhook procesado exitosamente - El merchant debe completar billing", null, shop);

    return new Response("OK", { status: 200 });
  } catch (error) {
    logger.error("webhook", "Error procesando webhook", {
      error: error.message,
      stack: error.stack
    });
    return new Response("Error", { status: 500 });
  }
};