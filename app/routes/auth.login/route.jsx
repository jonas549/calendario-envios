import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { Form, useActionData, useLoaderData } from "react-router";
import { useState } from "react";

import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";

export const loader = async ({ request }) => {
  const errors = loginErrorMessage(await login(request));
  return { errors };
};

export const action = async ({ request }) => {
  const errors = loginErrorMessage(await login(request));
  return { errors };
};

export default function Auth() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const [shop, setShop] = useState("");

  const { errors } = actionData || loaderData;

  return (
    <AppProvider embedded={false}>
      <main style={{ maxWidth: 400, margin: "60px auto", fontFamily: "Inter" }}>
        <h1 style={{ marginBottom: 20 }}>Log in</h1>

        <Form method="post">
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="shop"
              style={{ fontWeight: 600, display: "block", marginBottom: 6 }}
            >
              Shop domain
            </label>

            <input
              id="shop"
              name="shop"
              type="text"
              placeholder="example.myshopify.com"
              value={shop}
              onChange={(e) => setShop(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: 6,
              }}
            />

            {errors?.shop && (
              <p style={{ color: "red", marginTop: 6 }}>{errors.shop}</p>
            )}
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              background: "#2c6ecb",
              color: "#fff",
              padding: "12px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
            }}
          >
            Log in
          </button>
        </Form>
      </main>
    </AppProvider>
  );
}


