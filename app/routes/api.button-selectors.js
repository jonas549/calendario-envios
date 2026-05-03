import prisma from "../db.server";

export const loader = async ({ request }) => {
  try {
    const url  = new URL(request.url);
    const shop = url.searchParams.get("shop");

    if (!shop) {
      return Response.json({ success: false, error: "Missing shop" }, { status: 400 });
    }

    const config = await prisma.config.findUnique({
      where:  { shop },
      select: { selectedButtonSelectors: true },
    });

    let selectors = [];
    try { selectors = JSON.parse(config?.selectedButtonSelectors || "[]"); } catch (_) {}

    return Response.json({ success: true, selectors });
  } catch (err) {
    console.error("❌ [API/BUTTON-SELECTORS] GET:", err);
    return Response.json({ success: false }, { status: 500 });
  }
};

export const action = async ({ request }) => {
  try {
    let shop, selectors;

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      shop      = body.shop;
      selectors = body.selectors;
    } else {
      const fd  = await request.formData();
      shop      = fd.get("shop");
      try { selectors = JSON.parse(fd.get("selectors") || "[]"); } catch (_) { selectors = []; }
    }

    if (!shop || !Array.isArray(selectors)) {
      return Response.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    const value = JSON.stringify(selectors.filter(Boolean));

    await prisma.config.upsert({
      where:  { shop },
      create: { shop, selectedButtonSelectors: value },
      update: { selectedButtonSelectors: value },
    });

    console.log(`✅ [API/BUTTON-SELECTORS] ${shop} → ${selectors.length} selectores guardados`);
    return Response.json({ success: true, count: selectors.length });
  } catch (err) {
    console.error("❌ [API/BUTTON-SELECTORS] POST:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
};
