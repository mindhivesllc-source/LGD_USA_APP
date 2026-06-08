import { shouldStop } from "../syncState.js"

const POLL_CONCURRENCY = 20

const MAX_AVAILABLE = 1000
const MIN_AVAILABLE_THRESHOLD = MAX_AVAILABLE * 0.5
const LOW_THRESHOLD = 200

// Admin context cache — refreshed periodically so we don't re-auth on every request
let cachedAdmin = null
let cachedAdminExpiry = 0
const ADMIN_CACHE_MS = 10 * 60 * 1000 // 10 minutes

let cachedLocationId = null

class SyncStopError extends Error {
  constructor() { super("Sync stopped by user"); this.name = "SyncStopError" }
}

/**
 * Get a Shopify Admin API context via the library's unauthenticated.admin().
 * This uses PrismaSessionStorage to find valid sessions and handles token
 * rotation — unlike the previous hand-rolled DB query which returned stale tokens.
 */
async function getAdmin() {
  const now = Date.now()
  if (cachedAdmin && now < cachedAdminExpiry) {
    return cachedAdmin
  }

  const shop = process.env.SHOPIFY_STORE
  if (!shop) {
    throw new Error("SHOPIFY_STORE env var not set")
  }

  // Dynamic import avoids circular dependency issues at module load time
  const { unauthenticated } = await import("../../app/shopify.server.js")
  const ctx = await unauthenticated.admin(shop)

  if (!ctx || !ctx.admin) {
    throw new Error(
      `No admin context for ${shop} — app may not be installed. Reinstall the app from the Shopify Admin.`
    )
  }

  cachedAdmin = ctx.admin
  cachedAdminExpiry = now + ADMIN_CACHE_MS
  console.log("[Auth] Refreshed admin context for Shopify API")
  return ctx.admin
}

/** Clear the cached admin context to force re-auth on the next request. */
function clearAdminCache() {
  cachedAdmin = null
  cachedAdminExpiry = 0
}

/**
 * Make a GraphQL request to the Shopify Admin API.
 * Uses the library's admin.graphql() for proper auth and token management.
 * Handles 401 (stale token), 429 (rate limit), and throttle awareness with retries.
 */
async function graphqlRequest(query, variables = {}) {
  const maxRetries = 5

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const admin = await getAdmin()

    let res
    try {
      res = await admin.graphql(query, { variables })
    } catch (err) {
      console.warn(
        `[GraphQL] Request error (attempt ${attempt}/${maxRetries}):`,
        err.message
      )
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 2000))
        continue
      }
      throw err
    }

    // 401 means the access token is invalid/stale — clear cache so getAdmin()
    // reloads the session and picks up any rotated token
    if (res.status === 401) {
      console.warn(
        `[GraphQL] 401 Unauthorized — clearing admin cache (attempt ${attempt}/${maxRetries})`
      )
      clearAdminCache()
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 5000))
        continue
      }
    }

    // 429 — Shopify rate limit, honor Retry-After header
    if (res.status === 429) {
      const retryAfter = parseInt(
        res.headers.get("Retry-After") || String(Math.pow(2, attempt)),
        10
      )
      console.warn(
        `[GraphQL] Rate limited (429), retrying after ${retryAfter}s (attempt ${attempt}/${maxRetries})`
      )
      await new Promise((r) => setTimeout(r, retryAfter * 1000))
      continue
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "")
      throw new Error(
        `GraphQL HTTP error: ${res.status} ${res.statusText} - ${body.slice(0, 200)}`
      )
    }

    const result = await res.json()

    // Distinguish fatal GraphQL errors from throttling (which is handled below)
    if (result.errors) {
      const fatal = result.errors.filter(
        (e) => !(e.extensions?.code === "THROTTLED")
      )
      if (fatal.length > 0) {
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`)
      }
    }

    // Respect Shopify's cost throttle to avoid 429s
    const throttle = result.extensions?.cost?.throttleStatus
    if (throttle) {
      console.log(
        `[Throttle] currentlyAvailable=${throttle.currentlyAvailable} restoreRate=${throttle.restoreRate}`
      )
      if (throttle.currentlyAvailable < MIN_AVAILABLE_THRESHOLD) {
        const delay = throttle.currentlyAvailable < LOW_THRESHOLD ? 500 : 200
        await new Promise((r) => setTimeout(r, delay))
      }
    }

    return result
  }

  throw new Error("Max retries exceeded for Shopify GraphQL")
}

async function getLocationId() {
  if (cachedLocationId) return cachedLocationId

  const query = `
    query {
      locations(first: 1) {
        edges {
          node {
            id
          }
        }
      }
    }
  `

  try {
    const result = await graphqlRequest(query)
    const locationId = result.data?.locations?.edges?.[0]?.node?.id
    if (locationId) {
      cachedLocationId = locationId
      return cachedLocationId
    }
    console.warn("[Sync] No inventory location found, skipping inventory quantities")
  } catch (err) {
    console.warn("[Sync] Could not fetch location ID:", err.message)
    console.warn("[Sync] Add 'read_locations' scope to access inventory locations")
  }
  return null
}

function buildProductSetInput(mappedData) {
  const {
    title,
    descriptionHtml,
    vendor,
    productType,
    tags,
    status,
    options,
    variants,
    metafields,
  } = mappedData

  const input = {
    title: title || "",
    descriptionHtml: descriptionHtml || "",
    vendor: vendor || "LGD USA",
    productType: productType || "",
    tags: Array.isArray(tags) ? tags : [],
    status: status || "ACTIVE",
    productOptions: options || [],
  }

  if (variants && variants.length > 0) {
    input.variants = variants.map((v) => ({
      sku: v.sku,
      price: String(v.price),
      optionValues: v.optionValues || [],
      inventoryQuantities: v.inventoryQuantities || [],
      taxable: v.taxable !== undefined ? v.taxable : true,
    }))
  }

  if (metafields && metafields.length > 0) {
    input.metafields = metafields.slice(0, 25)
  }

  return input
}

const PRODUCT_SET_MUTATION = `
  mutation productSet($input: ProductSetInput!, $synchronous: Boolean!) {
    productSet(synchronous: $synchronous, input: $input) {
      product {
        id
        title
      }
      productSetOperation {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`

const POLL_QUERY = `
  query pollOperation($id: ID!) {
    productOperation(id: $id) {
      status
      product {
        id
      }
    }
  }
`

function injectLocation(mappedData, locationId) {
  if (!locationId) return

  if (mappedData.variants) {
    for (const variant of mappedData.variants) {
      variant.inventoryQuantities = [
        { name: "available", locationId, quantity: 1 },
      ]
    }
  }
  if (!mappedData.metafields) {
    mappedData.metafields = []
  }
}

async function execProductSet(mappedData, synchronous) {
  const input = buildProductSetInput(mappedData)

  const result = await graphqlRequest(PRODUCT_SET_MUTATION, { input, synchronous })

  const userErrors = result.data?.productSet?.userErrors
  if (userErrors && userErrors.length > 0) {
    console.error("productSet userErrors:", JSON.stringify(userErrors))
    throw new Error(
      `productSet failed: ${userErrors.map((e) => `${e.field}: ${e.message}`).join(", ")}`
    )
  }

  if (synchronous) {
    const product = result.data?.productSet?.product
    if (!product) {
      throw new Error("productSet returned no product")
    }
    return product.id
  }

  return result.data?.productSet?.productSetOperation
}

async function pollProductSetOperation(operationId, maxWaitSec = 300) {
  const interval = 2000
  const maxAttempts = Math.ceil((maxWaitSec * 1000) / interval)

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await graphqlRequest(POLL_QUERY, { id: operationId })
    const op = result.data?.productOperation

    if (!op) {
      throw new Error(`Product operation ${operationId} not found`)
    }

    if (op.status === "COMPLETE") {
      return op.product?.id || null
    }

    if (op.status === "FAILED") {
      throw new Error(`Product operation ${operationId} failed`)
    }

    await new Promise((r) => setTimeout(r, interval))
  }

  throw new Error(`Product operation ${operationId} timed out after ${maxWaitSec}s`)
}

function getItemSku(item) {
  return item?.variants?.[0]?.sku || ""
}

function getItemTitle(item) {
  return item?.title || ""
}

function isValidItem(item) {
  return Boolean(getItemSku(item) && getItemTitle(item))
}

async function submitOne(item, synchronous = true) {
  try {
    if (synchronous) {
      return await execProductSet(item, true)
    }
    const op = await execProductSet(item, false)
    return op?.id || null
  } catch (err) {
    // Don't log individual errors — the caller batches them into a summary
    // to avoid hitting Railway's 500 logs/sec rate limit with 1866 identical messages.
    const sku = getItemSku(item)
    return { __error: true, sku, message: err.message }
  }
}

export async function pushToShopify(mappedData) {
  const locationId = await getLocationId()
  injectLocation(mappedData, locationId)
  return execProductSet(mappedData, true)
}

export async function pushToShopifyBatch(
  mappedItems,
  { asyncThreshold = 50, maxWaitSec = 300, onProgress } = {}
) {
  const locationId = await getLocationId()

  const valid = []
  const skipped = []
  for (const item of mappedItems) {
    injectLocation(item, locationId)
    if (!isValidItem(item)) {
      skipped.push(getItemSku(item) || "<no-sku>")
      continue
    }
    valid.push(item)
  }

  if (skipped.length > 0) {
    console.warn(`[Sync] Skipped ${skipped.length} items with missing SKU/title`)
  }

  if (valid.length === 0) {
    console.warn("[Sync] No valid products to push")
    return { pushed: 0, skipped: skipped.length, failed: 0 }
  }

  if (valid.length <= asyncThreshold) {
    let pushed = 0
    let failed = 0
    let i = 0
    const syncErrors = new Map()
    console.log(`[Sync] Submitting ${valid.length} products synchronously...`)
    for (const item of valid) {
      i++
      if (shouldStop()) throw new SyncStopError()
      const result = await submitOne(item, true)
      if (result?.__error) {
        failed++
        const msg = result.message
        syncErrors.set(msg, (syncErrors.get(msg) || 0) + 1)
        // Abort early if first 10 all fail (auth issue)
        if (i >= 10 && pushed === 0) {
          const [[topMsg, count]] = [...syncErrors].sort((a, b) => b[1] - a[1])
          throw new Error(
            `All ${i} product submissions failed. Top error (${count}x): ${topMsg}`
          )
        }
      } else if (result) {
        pushed++
      } else {
        failed++
      }
      if (i % 10 === 0) {
        console.log(`[Sync] Progress: ${i}/${valid.length} submitted (${pushed} ok, ${failed} fail)`)
        if (onProgress)
          onProgress({ pushed, failed, skipped: skipped.length, phase: "sync" })
      }
    }
    if (syncErrors.size > 0) {
      console.error(`[Sync] Sync errors (${failed}/${valid.length} failed):`)
      for (const [msg, count] of [...syncErrors].sort((a, b) => b[1] - a[1]).slice(0, 5)) {
        console.error(`  ${count}x: ${msg}`)
      }
    }
    return { pushed, skipped: skipped.length, failed }
  }

  console.log(`[Sync] Submitting ${valid.length} products in async mode...`)

  const operations = []
  const submitErrors = new Map() // dedupe error messages to avoid log spam
  let submitFailed = 0
  let i = 0
  for (const item of valid) {
    i++
    if (shouldStop()) throw new SyncStopError()
    const opId = await submitOne(item, false)
    if (opId?.__error) {
      submitFailed++
      const msg = opId.message
      if (submitErrors.has(msg)) {
        submitErrors.set(msg, submitErrors.get(msg) + 1)
      } else {
        submitErrors.set(msg, 1)
      }
    } else if (opId) {
      operations.push(opId)
    } else {
      submitFailed++
    }

    // Abort early if EVERY submission is failing — typically means no auth session
    if (i >= 10 && operations.length === 0) {
      const [[topMsg, count]] = [...submitErrors].sort((a, b) => b[1] - a[1])
      throw new Error(
        `All ${i} product submissions failed. Top error (${count}x): ${topMsg}`
      )
    }

    if (i % 10 === 0) {
      console.log(
        `[Sync] Submitted ${i}/${valid.length}, got ${operations.length} operation IDs so far`
      )
      if (onProgress)
        onProgress({
          pushed: operations.length,
          failed: submitFailed,
          skipped: skipped.length,
          phase: "submitting",
        })
    }
  }

  // Log deduplicated error summary
  if (submitErrors.size > 0) {
    console.error(`[Sync] Submission errors (${submitFailed}/${valid.length} failed):`)
    for (const [msg, count] of [...submitErrors].sort((a, b) => b[1] - a[1]).slice(0, 5)) {
      console.error(`  ${count}x: ${msg}`)
    }
  }

  console.log(
    `[Sync] Submitted ${operations.length} async operations (${submitFailed} failed submission), polling...`
  )

  const stats = { completed: 0, failed: submitFailed, pollCount: 0 }

  const chunks = []
  for (let c = 0; c < operations.length; c += POLL_CONCURRENCY) {
    chunks.push(operations.slice(c, c + POLL_CONCURRENCY))
  }

  let chunkIndex = 0
  const pollErrors = new Map()
  for (const chunk of chunks) {
    chunkIndex++
    if (shouldStop()) throw new SyncStopError()
    await Promise.allSettled(
      chunk.map(async (opId) => {
        try {
          await pollProductSetOperation(opId, maxWaitSec)
          stats.completed++
        } catch (err) {
          const msg = err.message
          pollErrors.set(msg, (pollErrors.get(msg) || 0) + 1)
          stats.failed++
        } finally {
          stats.pollCount++
          if (stats.pollCount % 50 === 0) {
            console.log(
              `[Sync] Polled ${stats.pollCount}/${operations.length} (${stats.completed} done)`
            )
            if (onProgress)
              onProgress({
                pushed: stats.completed,
                failed: stats.failed,
                skipped: skipped.length,
                phase: "polling",
              })
          }
        }
      })
    )
    console.log(
      `[Sync] Chunk ${chunkIndex}/${chunks.length} done: ${stats.completed} succeeded, ${stats.failed} failed`
    )
  }

  if (pollErrors.size > 0) {
    console.error(`[Sync] Poll errors (${stats.failed} operations):`)
    for (const [msg, count] of [...pollErrors].sort((a, b) => b[1] - a[1]).slice(0, 5)) {
      console.error(`  ${count}x: ${msg}`)
    }
  }

  console.log(
    `[Sync] Async batch complete: ${stats.completed} succeeded, ${stats.failed} failed, ${skipped.length} skipped`
  )
  return { pushed: stats.completed, skipped: skipped.length, failed: stats.failed }
}
