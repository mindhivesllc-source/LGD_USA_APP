import cron from "node-cron"
import { fetchAllJewelry } from "./sync/fetchSupplier.js"
import { mapToShopifyProduct } from "./sync/mapFields.js"
import { pushToShopifyBatch } from "./sync/pushToShopify.js"
import { state, updateState, setCooldown, clearCooldown, resetStop } from "./syncState.js"

let syncCount = 0

async function runSync() {
  if (state.isRunning) return

  updateState({ isRunning: true })
  resetStop()
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
    let skipped = 0
    let failed = 0

    const mappedItems = items.map((item) => mapToShopifyProduct(item))

    const result = await pushToShopifyBatch(mappedItems, {
      onProgress: async ({ pushed: p, failed: f, skipped: s }) => {
        pushed = p
        failed = f
        skipped = s
        try {
          await db.syncRun.update({
            where: { id: syncRun.id },
            data: { totalPushed: p + f + s, totalFetched: items.length },
          })
        } catch (_) {}
      },
    })

    pushed = result.pushed
    skipped = result.skipped
    failed = result.failed

    console.log(`[Sync #${syncCount}] Final: ${pushed} pushed, ${failed} failed, ${skipped} skipped`)

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
    clearCooldown()
  } catch (err) {
    const isStopped = err.name === "SyncStopError"
    await db.syncRun.update({
      where: { id: syncRun.id },
      data: {
        status: isStopped ? "cancelled" : "failed",
        completedAt: new Date(),
        error: isStopped ? "Stopped by user" : err.message,
      },
    })
    if (isStopped) {
      console.log(`[Sync #${syncCount}] Stopped by user`)
      clearCooldown()
    } else {
      console.error(`[Sync #${syncCount}] Failed:`, err.message)
      if (err.code === "SUPPLIER_RATE_LIMITED" || err.message?.includes("Rate limited")) {
        setCooldown(15)
        updateState({ lastError: "supplier_rate_limited" })
      } else {
        clearCooldown()
        updateState({ lastError: err.message })
      }
    }
  } finally {
    updateState({ isRunning: false, lastDuration: ((Date.now() - startTime) / 1000).toFixed(1) })
    resetStop()
    await db.$disconnect()
  }
}

export function startScheduler() {
  const hours = parseInt(process.env.SYNC_INTERVAL_HOURS, 10) || 6
  const cronExpression = `0 */${hours} * * *`
  console.log(`Scheduler: sync every ${hours} hours (${cronExpression})`)

  cron.schedule(cronExpression, runSync)
  console.log("Scheduler: cron job registered")

  setTimeout(() => {
    console.log("Scheduler: running initial sync on startup")
    runSync().catch(err => console.error("Initial sync error:", err))
  }, 5000)

  console.log("Scheduler: initial sync scheduled in 5s")
}

// Only start the cron scheduler when this module is the main entry point
// (node src/scheduler.js), not when imported by the Remix server
if (process.argv[1]?.includes("scheduler.js")) {
  startScheduler()
}

export { runSync }
