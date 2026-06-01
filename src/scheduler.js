import cron from "node-cron"
import { fetchAllJewelry } from "./sync/fetchSupplier.js"
import { mapToShopifyProduct } from "./sync/mapFields.js"
import { pushToShopify } from "./sync/pushToShopify.js"

let syncCount = 0

async function runSync() {
  const startTime = Date.now()
  syncCount++
  console.log(`[Sync #${syncCount}] Starting...`)

  const { PrismaClient } = await import("@prisma/client")
  const db = new PrismaClient()

  const syncRun = await db.syncRun.create({
    data: {
      status: "running",
      startedAt: new Date(),
    },
  })

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

    await db.syncRun.update({
      where: { id: syncRun.id },
      data: {
        status: "completed",
        completedAt: new Date(),
        totalFetched: items.length,
        totalPushed: pushed,
      },
    })

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`[Sync #${syncCount}] Complete! ${pushed}/${items.length} products in ${duration}s`)
  } catch (err) {
    await db.syncRun.update({
      where: { id: syncRun.id },
      data: {
        status: "failed",
        completedAt: new Date(),
        error: err.message,
      },
    })
    console.error(`[Sync #${syncCount}] Failed:`, err.message)
  } finally {
    await db.$disconnect()
  }
}

export function startScheduler() {
  const hours = parseInt(process.env.SYNC_INTERVAL_HOURS, 10) || 6
  const cronExpression = `0 */${hours} * * *`
  console.log(`Scheduler: sync every ${hours} hours (${cronExpression})`)

  cron.schedule(cronExpression, runSync)
  console.log("Scheduler: cron job registered, first run on schedule")
}

export { runSync }
