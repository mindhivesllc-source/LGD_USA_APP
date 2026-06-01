import cron from "node-cron"
import { fetchAllJewelry } from "./sync/fetchSupplier.js"
import { mapToShopifyProduct } from "./sync/mapFields.js"
import { pushToShopify } from "./sync/pushToShopify.js"

let syncCount = 0
let lastRun = null

async function runSync() {
  const startTime = Date.now()
  syncCount++
  console.log(`[Sync #${syncCount}] Starting...`)

  try {
    const items = await fetchAllJewelry()
    console.log(`[Sync #${syncCount}] Fetched ${items.length} products from supplier`)

    let pushed = 0
    for (const item of items) {
      try {
        const mapped = mapToShopifyProduct(item)
        await pushToShopify(mapped)
        pushed++
      } catch (err) {
        console.error(`[Sync #${syncCount}] Error pushing ${item.Stock_No || item.sku}:`, err.message)
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    lastRun = new Date().toISOString()
    console.log(`[Sync #${syncCount}] Complete! ${pushed}/${items.length} products pushed in ${duration}s`)
  } catch (err) {
    console.error(`[Sync #${syncCount}] Failed:`, err.message)
  }
}

export function startScheduler() {
  const hours = parseInt(process.env.SYNC_INTERVAL_HOURS, 10) || 6
  const cronExpression = `0 */${hours} * * *`
  console.log(`Scheduler: sync every ${hours} hours (${cronExpression})`)

  cron.schedule(cronExpression, runSync)
  runSync()
}

export { runSync }
