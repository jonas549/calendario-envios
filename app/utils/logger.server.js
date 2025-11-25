import { prisma } from "../db.server";

/**
 * Sistema de logging centralizado
 * Registra en console.log (para Vercel) y en base de datos (para historial)
 */
export async function log({ shop, level, module, message, data }) {
  const timestamp = new Date().toISOString();
  const emoji = {
    info: "ℹ️",
    warn: "⚠️",
    error: "❌",
    debug: "🔍",
  }[level] || "📝";

  // Log a consola (aparece en Vercel)
  const consoleMsg = `${emoji} [${module.toUpperCase()}] ${shop || "SYSTEM"} - ${message}`;
  console.log(consoleMsg, data ? JSON.stringify(data, null, 2) : "");

  // Log a base de datos (historial permanente)
  try {
    await prisma.log.create({
      data: {
        shop: shop || null,
        level,
        module,
        message,
        data: data ? JSON.stringify(data) : null,
      },
    });
  } catch (error) {
    console.error("❌ [LOGGER] Error guardando log en BD:", error);
  }
}

// Helpers para cada nivel
export const logger = {
  info: (module, message, data, shop) => log({ shop, level: "info", module, message, data }),
  warn: (module, message, data, shop) => log({ shop, level: "warn", module, message, data }),
  error: (module, message, data, shop) => log({ shop, level: "error", module, message, data }),
  debug: (module, message, data, shop) => log({ shop, level: "debug", module, message, data }),
};