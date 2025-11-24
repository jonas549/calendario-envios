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

    const cities = await prisma.city.findMany({
      where: { 
        shop,
        active: true 
      },
      select: { name: true },
      orderBy: { name: "asc" },
    });

    return Response.json({
      success: true,
      cities,
    });
  } catch (error) {
    console.error("❌ [API/CITIES] Error:", error);
    return Response.json(
      { success: false, cities: [] },
      { status: 500 }
    );
  }
};