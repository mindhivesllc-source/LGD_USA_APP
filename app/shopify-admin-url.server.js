const ADMIN_BASE_URL = "https://admin.shopify.com";

function normalizeStoreHandle(shop) {
  if (!shop) return "";

  const withoutProtocol = shop.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const storeHandle = withoutProtocol.endsWith(".myshopify.com")
    ? withoutProtocol.replace(".myshopify.com", "")
    : withoutProtocol;

  return /^[a-z0-9][a-z0-9-]*$/i.test(storeHandle) ? storeHandle : "";
}

export function getShopifyAdminAppUrl(request) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || process.env.SHOPIFY_STORE || "";
  const storeHandle = normalizeStoreHandle(shop);
  const appIdentifier = process.env.SHOPIFY_APP_HANDLE || process.env.SHOPIFY_API_KEY || "";

  if (storeHandle && appIdentifier) {
    return `${ADMIN_BASE_URL}/store/${storeHandle}/apps/${appIdentifier}`;
  }

  if (appIdentifier) {
    return `${ADMIN_BASE_URL}/apps/${appIdentifier}`;
  }

  return `${ADMIN_BASE_URL}/apps`;
}

export function isIframeRequest(request) {
  return request.headers.get("Sec-Fetch-Dest") === "iframe";
}
