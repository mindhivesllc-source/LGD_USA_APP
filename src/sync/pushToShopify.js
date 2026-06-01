const SHOPIFY_STORE = process.env.SHOPIFY_STORE
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN

function shopifyUrl(path) {
  return `https://${SHOPIFY_STORE}/admin/api/2024-07/${path}`
}

function headers() {
  return {
    "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
    "Content-Type": "application/json",
  }
}

async function shopifyFetch(path, options = {}) {
  const maxRetries = 5
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const res = await fetch(shopifyUrl(path), { ...options, headers: headers() })

    if (res.status === 429) {
      const retryAfter = res.headers.get("Retry-After") || Math.pow(2, attempt)
      await new Promise((r) => setTimeout(r, parseInt(retryAfter, 10) * 1000))
      continue
    }

    if (!res.ok) {
      throw new Error(`Shopify API error: ${res.status} ${res.statusText}`)
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
