import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
  BillingInterval,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { prisma } from "./db.server";
import { logger } from "./utils/logger.server";

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
  useOnlineTokens: false,
  
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
    
    logger.debug("shopify-auth", `Autenticando request: ${url.pathname}`, {
      method: request.method,
      pathname: url.pathname
    });
    
    const result = await shopify.authenticate.admin(request);
    
    logger.info("shopify-auth", `Autenticación exitosa: ${url.pathname}`, {
      shop: result.session?.shop
    }, result.session?.shop);
    
    return result;
  },

  public: shopify.authenticate.public,
  webhook: shopify.authenticate.webhook,
};

// Cache por tienda: { shop -> { isTest, expiresAt } }
const _devStoreCache = new Map();
const _CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Detecta automáticamente si la tienda es dev store o real.
// Fallback a true (no cobra) si la query falla, para evitar cobros accidentales.
export async function getIsTest(admin, shop) {
  const cached = _devStoreCache.get(shop);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.isTest;
  }

  try {
    const response = await admin.graphql(`
      query {
        shop {
          plan {
            partnerDevelopment
            publicDisplayName
          }
        }
      }
    `);
    const data = await response.json();
    const plan = data?.data?.shop?.plan;
    const isTest =
      plan?.partnerDevelopment === true ||
      plan?.publicDisplayName === "Development";

    _devStoreCache.set(shop, { isTest, expiresAt: Date.now() + _CACHE_TTL });
    logger.info("billing", `Tipo de tienda detectado: ${isTest ? "dev store" : "tienda real"} (isTest=${isTest})`, { plan }, shop);
    return isTest;
  } catch (error) {
    logger.warn("billing", "Error detectando tipo de tienda — fallback a isTest: true (seguro)", { error: error.message }, shop);
    return true;
  }
}

// Helper para verificar subscripción activa
export async function requireBilling(request) {
  const { billing, session, admin } = await authenticate.admin(request);

  logger.info("billing-check", "Verificando billing", null, session.shop);

  const isTest = await getIsTest(admin, session.shop);

  await billing.require({
    plans: ["Plan Pro"],
    isTest,
  });

  logger.info("billing-check", "Billing verificado OK", null, session.shop);
}

export default shopify;
export const apiVersion = ApiVersion.October25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;