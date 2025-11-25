import { redirect } from "react-router";
import { authenticate } from "../shopify.server";
import { logger } from "../utils/logger.server";

export const loader = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    
    logger.info("callback", "OAuth callback exitoso", { shop: session.shop }, session.shop);
    logger.info("callback", "Redirigiendo a /app/billing", null, session.shop);
    
    return redirect("/app/billing");
  } catch (error) {
    logger.error("callback", "Error en callback", {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

export const action = loader;

