import { redirect } from "react-router";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  if (shop) {
    return redirect(`/auth?shop=${encodeURIComponent(shop)}`);
  }
  return redirect("/auth");
};
