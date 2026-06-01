import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()
const SUPPLIER_API_BASE = process.env.SUPPLIER_API_BASE || "https://lgdusallc.com/developer-api"

async function getApiKey() {
  try {
    const setting = await db.setting.findUnique({ where: { key: "SUPPLIER_API_KEY" } })
    return setting?.value || process.env.SUPPLIER_API_KEY
  } catch {
    return process.env.SUPPLIER_API_KEY
  }
}

async function fetchFromSupplier(page = 1) {
  const apiKey = await getApiKey()
  const url = `${SUPPLIER_API_BASE}/jewelry?type=all&page=${page}&key=${apiKey}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Supplier API error: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

export async function fetchAllJewelry() {
  const firstPage = await fetchFromSupplier(1)
  const totalPages = parseInt(firstPage.total_page, 10) || 1
  const allItems = [...firstPage.data]

  for (let page = 2; page <= totalPages; page++) {
    const pageData = await fetchFromSupplier(page)
    allItems.push(...pageData.data)
  }

  return allItems
}
