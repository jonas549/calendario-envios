import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }) => {
  try {
    const { shop, topic } = await authenticate.webhook(request);

    console.log(`🟢 [WEBHOOK] ${topic} para ${shop}`);

    // Borrar TODOS los datos de esta tienda
    await prisma.city.deleteMany({
      where: { shop },
    });
    console.log("✅ [WEBHOOK] Ciudades eliminadas para", shop);

    await prisma.holiday.deleteMany({
      where: { shop },
    });
    console.log("✅ [WEBHOOK] Feriados eliminados para", shop);

    await prisma.config.deleteMany({
      where: { shop },
    });
    console.log("✅ [WEBHOOK] Config eliminada para", shop);

    await prisma.session.deleteMany({
      where: { shop },
    });
    console.log("✅ [WEBHOOK] Sesiones eliminadas para", shop);

    console.log("🗑️ [WEBHOOK] Todos los datos de", shop, "han sido eliminados");

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("❌ [WEBHOOK] Error eliminando datos:", error);
    return new Response("Error", { status: 500 });
  }
};
