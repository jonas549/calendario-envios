import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  try {
    const session = await authenticate.admin(request);
    return json({
      status: "ok",
      shop: session.session.shop,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return json({
      status: "error",
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};
