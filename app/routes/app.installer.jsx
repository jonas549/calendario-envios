import { redirect } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const host = url.searchParams.get("host");
  const params = new URLSearchParams();
  if (shop) params.set("shop", shop);
  if (host) params.set("host", host);
  const qs = params.toString();
  return redirect(`/app${qs ? `?${qs}` : ""}`);
};
