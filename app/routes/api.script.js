// Script Tags legacy — ruta mantenida para compatibilidad.
// La app migró a Theme App Extensions. Este endpoint sirve un JS vacío
// para evitar 404 en Script Tags que aún pueden estar registradas en Shopify.
export const loader = async () => {
  return new Response(
    "/* Calendify Delivery v2 — Calendar powered by Theme App Extension */",
    {
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
};
