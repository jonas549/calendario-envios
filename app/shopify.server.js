import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
  BillingInterval,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  isEmbeddedApp: true,
  useOnlineTokens: true,
  
  auth: {
    path: '/auth',
    callbackPath: '/auth/callback',
  },

  billing: {
    "Plan Pro": {
      amount: 25,
      currencyCode: "USD",
      interval: BillingInterval.Every30Days,
      trialDays: 3,
    },
  },
});

export const authenticate = {
  admin: async (request) => {
    const url = new URL(request.url);
    console.log("\n🔍 REQUEST:", url.pathname);
    console.log("📋 HEADERS:");
    for (const [key, value] of request.headers.entries()) {
      console.log(`   ${key}: ${value.substring(0, 100)}`);
    }
    
    const result = await shopify.authenticate.admin(request);
    console.log("✅ AUTH OK\n");
    return result;
  },

  public: shopify.authenticate.public,
  webhook: shopify.authenticate.webhook,
};

// Helper para verificar subscripción activa
export async function requireBilling(request) {
  const { billing } = await authenticate.admin(request);
  
  await billing.require({
    plans: ["Plan Pro"],
    isTest: true, // Cambiar a false en producción
  });
}

export default shopify;
export const apiVersion = ApiVersion.October25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;