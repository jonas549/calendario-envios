import { authenticate } from "../shopify.server";
import { logger } from "../utils/logger.server";
import prisma from "../db.server";

export const action = async ({ request }) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  logger.info("webhooks", `Webhook recibido: ${topic}`, { shop, payload });

  switch (topic) {
    case "CUSTOMERS_DATA_REQUEST":
      // Log la solicitud - tu app no almacena datos de clientes
      logger.info("webhooks", "Solicitud de datos de cliente", { shop });
      break;

    case "CUSTOMERS_REDACT":
      // Log la solicitud - tu app no almacena datos de clientes
      logger.info("webhooks", "Eliminar datos de cliente", { shop });
      break;

    case "SHOP_REDACT":
      // Eliminar todos los datos de la tienda
      await prisma.city.deleteMany({ where: { shop } });
      await prisma.holiday.deleteMany({ where: { shop } });
      await prisma.config.deleteMany({ where: { shop } });
      await prisma.session.deleteMany({ where: { shop } });
      await prisma.log.deleteMany({ where: { shop } });
      logger.info("webhooks", "Datos de tienda eliminados", { shop });
      break;

    case "APP_UNINSTALLED":
      // Ya lo tienes en otro archivo, pero lo incluyo aquí para completar
      await prisma.city.deleteMany({ where: { shop } });
      await prisma.holiday.deleteMany({ where: { shop } });
      await prisma.config.deleteMany({ where: { shop } });
      logger.info("webhooks", "App desinstalada", { shop });
      break;
  }

  return new Response();
};