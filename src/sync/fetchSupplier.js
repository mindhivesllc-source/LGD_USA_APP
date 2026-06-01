const SUPPLIER_API_BASE = process.env.SUPPLIER_API_BASE || "https://lgdusallc.com/developer-api"
const SUPPLIER_API_KEY = process.env.SUPPLIER_API_KEY

async function fetchFromSupplier(page = 1) {
  const url = `${SUPPLIER_API_BASE}/jewelry?type=all&page=${page}&key=${SUPPLIER_API_KEY}`
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
