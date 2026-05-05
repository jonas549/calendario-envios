import { redirect } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { logger } from "../utils/logger.server";

export const loader = async ({ request }) => {
  try {
    logger.info("auth", "Iniciando autenticación OAuth");

    const { session } = await authenticate.admin(request);
    
    logger.info("auth", "OAuth exitoso", { shop: session.shop }, session.shop);
    
    logger.info("auth", "Redirigiendo a /app", null, session.shop);
    return redirect("/app");
    
  } catch (error) {
    logger.error("auth", "Error en autenticación", { 
      error: error.message,
      stack: error.stack 
    });
    throw error;
  }
};

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};