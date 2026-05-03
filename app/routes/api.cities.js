import prisma from "../db.server";

export const loader = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");

    if (!shop) {
      return Response.json(
        { success: false, cities: [], error: "Missing shop parameter" },
        { status: 400 }
      );
    }

    const [cities, config] = await Promise.all([
      prisma.city.findMany({
        where: { shop, active: true },
        select: { name: true },
        orderBy: { name: "asc" },
      }),
      prisma.config.findUnique({
        where: { shop },
        select: {
          pickupEnabled: true,
          pickupLabel: true,
          checkoutButtonClasses: true,
          requireDelivery: true,
          selectedButtonSelectors: true,
        },
      }),
    ]);

    return Response.json({
      success: true,
      cities,
      config: {
        pickupEnabled: config?.pickupEnabled ?? false,
        pickupLabel: config?.pickupLabel ?? "Recoger en tienda",
        checkoutButtonClasses: config?.checkoutButtonClasses ?? "",
        requireDelivery: config?.requireDelivery ?? true,
        selectedButtonSelectors: config?.selectedButtonSelectors ?? "[]",
      },
    });
  } catch (error) {
    console.error("❌ [API/CITIES] Error:", error);
    return Response.json(
      { success: false, cities: [] },
      { status: 500 }
    );
  }
};
