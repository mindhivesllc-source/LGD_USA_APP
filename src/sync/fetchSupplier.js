import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()
const SUPPLIER_API_BASE = process.env.SUPPLIER_API_BASE || "https://lgdusallc.com/developer-api"

async function getApiKey() {
  const setting = await db.setting.findUnique({ where: { key: "SUPPLIER_API_KEY" } })
  if (!setting?.value) {
    throw new Error("SUPPLIER_API_KEY not found in settings. Please configure in app settings.")
  }
  return setting.value
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

  const items = firstPage.data || firstPage.Stock || []

  if (!Array.isArray(items) || items.length === 0) {
    const msg = firstPage.Message || "No items returned"
    console.log("Supplier API response:", JSON.stringify(firstPage).slice(0, 200))
    throw new Error(`Supplier returned empty: ${msg}`)
  }

  return items
}
