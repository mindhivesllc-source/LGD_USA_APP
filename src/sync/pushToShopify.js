import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()
const SHOPIFY_STORE = process.env.SHOPIFY_STORE

let cachedToken = null
let cachedTokenExpiry = 0

async function getAccessToken() {
  const now = Date.now()
  if (cachedToken && now < cachedTokenExpiry) {
    return cachedToken
  }

  const session = await db.session.findFirst({
    where: { shop: SHOPIFY_STORE.replace(".myshopify.com", "") },
    orderBy: { expires: "desc" },
  })

  if (!session) {
    throw new Error(`No OAuth session found for ${SHOPIFY_STORE}`)
  }

  cachedToken = session.accessToken
  cachedTokenExpiry = session.expires ? new Date(session.expires).getTime() - 60000 : now + 3600000
  return cachedToken
}

function shopifyUrl(path) {
  return `https://${SHOPIFY_STORE}/admin/api/2024-07/${path}`
}

async function headers() {
  const token = await getAccessToken()
  return {
    "X-Shopify-Access-Token": token,
    "Content-Type": "application/json",
  }
}

async function shopifyFetch(path, options = {}) {
  const maxRetries = 5
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const res = await fetch(shopifyUrl(path), { ...options, headers: await headers() })

    if (res.status === 429) {
      const retryAfter = res.headers.get("Retry-After") || Math.pow(2, attempt)
      await new Promise((r) => setTimeout(r, parseInt(retryAfter, 10) * 1000))
      continue
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "")
      throw new Error(`Shopify API error: ${res.status} ${res.statusText} - ${body.slice(0, 200)}`)
    }

    return res.json()
  }
  throw new Error("Max retries exceeded for Shopify API")
}

async function findProductBySku(sku) {
  const data = await shopifyFetch(`products.json?sku=${encodeURIComponent(sku)}`)
  return data.products?.length ? data.products[0] : null
}

export async function pushToShopify(mappedData) {
  const { product, metafields } = mappedData
  const sku = product.variants[0].sku
  const existing = await findProductBySku(sku)

  let productId
  if (existing) {
    const data = await shopifyFetch(`products/${existing.id}.json`, {
      method: "PUT",
      body: JSON.stringify({ product }),
    })
    productId = data.product.id
  } else {
    const data = await shopifyFetch("products.json", {
      method: "POST",
      body: JSON.stringify({ product }),
    })
    productId = data.product.id
  }

  for (const metafield of metafields) {
    await shopifyFetch(`products/${productId}/metafields.json`, {
      method: "POST",
      body: JSON.stringify({ metafield }),
    }).catch(() => {})
  }

  return productId
}
