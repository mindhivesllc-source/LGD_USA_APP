import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()
const SUPPLIER_API_BASE = process.env.SUPPLIER_API_BASE || "https://lgdusallc.com/developer-api"

async function getApiKey() {
  // Check database first (set via app settings UI)
  const setting = await db.setting.findUnique({ where: { key: "SUPPLIER_API_KEY" } })
  if (setting?.value) return setting.value

  // Fall back to environment variable (set via Railway — survives all deploys)
  const envKey = process.env.SUPPLIER_API_KEY
  if (envKey) return envKey

  throw new Error("SUPPLIER_API_KEY not found in settings or environment. Configure in app settings or set SUPPLIER_API_KEY env var on Railway.")
}

async function fetchFromSupplier(page = 1) {
  const apiKey = await getApiKey()
  const url = `${SUPPLIER_API_BASE}/jewelry?type=all&page=${page}&key=${apiKey}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Supplier API error: ${response.status} ${response.statusText}`)
  }
  const json = await response.json()

  if (json.Message?.includes("rate") || json.Message?.includes("limit")) {
    const rateErr = new Error(`Rate limited: ${json.Message}`)
    rateErr.code = "SUPPLIER_RATE_LIMITED"
    throw rateErr
  }

  return json
}

export async function fetchAllJewelry() {
  const firstPage = await fetchFromSupplier(1)

  // Check for API-level error messages regardless of HTTP status
  const supplierMsg = firstPage.message || firstPage.Message || ""
  if (supplierMsg && !Array.isArray(firstPage.data) && !Array.isArray(firstPage.Stock)) {
    console.error("Supplier API error:", JSON.stringify(firstPage).slice(0, 500))
    throw new Error(`Supplier error: ${supplierMsg}`)
  }

  const items = firstPage.data || firstPage.Stock || []

  if (!Array.isArray(items) || items.length === 0) {
    const msg = supplierMsg || "No items returned"
    console.error("Supplier API response:", JSON.stringify(firstPage).slice(0, 500))
    throw new Error(`Supplier returned empty: ${msg}`)
  }

  return items
}
