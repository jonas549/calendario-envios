import { redirect } from "react-router";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const host = url.searchParams.get("host");
  const embedded = url.searchParams.get("embedded");

  if (!shop) return redirect("/auth");

  // Preserve host if present (Shopify admin iframe routing includes it).
  // Construct it when absent (absolute return URL redirect from billing portal).
  const resolvedHost = host ?? Buffer.from(
    `admin.shopify.com/store/${shop.replace(".myshopify.com", "")}`
  ).toString("base64url");

  const params = new URLSearchParams({ shop, host: resolvedHost });
  if (embedded) params.set("embedded", embedded);

  return redirect(`/app?${params.toString()}`);
};
