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

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
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
  const supplierMsg = firstPage.message || firstPage.Message || ""

  if (supplierMsg && !Array.isArray(firstPage.data) && !Array.isArray(firstPage.Stock)) {
    console.error("Supplier API error:", JSON.stringify(firstPage).slice(0, 500))
    throw new Error(`Supplier error: ${supplierMsg}`)
  }

  const firstItems = firstPage.data || firstPage.Stock || []
  if (!Array.isArray(firstItems) || firstItems.length === 0) {
    const msg = supplierMsg || "No items returned"
    console.error("Supplier API response:", JSON.stringify(firstPage).slice(0, 500))
    throw new Error(`Supplier returned empty: ${msg}`)
  }

  const totalPages = parsePositiveInt(
    firstPage.total_page ?? firstPage.total_pages ?? firstPage.totalPages,
    1
  )
  const reportedTotalResults = firstPage.total_results ?? firstPage.totalResults
  const totalResults = parsePositiveInt(reportedTotalResults, firstItems.length)
  const items = [...firstItems]

  for (let page = 2; page <= totalPages; page++) {
    const pageData = await fetchFromSupplier(page)
    const pageItems = pageData.data || pageData.Stock || []
    if (!Array.isArray(pageItems)) {
      throw new Error(`Supplier page ${page} returned invalid item payload`)
    }
    items.push(...pageItems)
  }

  if (reportedTotalResults && items.length !== totalResults) {
    throw new Error(
      `Supplier reported ${totalResults} jewelry items, but assembled ${items.length} from ${totalPages} page(s)`
    )
  } else {
    console.log(
      `[Supplier] Fetched ${items.length} jewelry items across ${totalPages} page(s)`
    )
  }

  return {
    items,
    totalPages,
    totalResults,
  }
}
