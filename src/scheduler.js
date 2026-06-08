import cron from "node-cron"
import { fetchAllJewelry } from "./sync/fetchSupplier.js"
import { mapToShopifyProduct } from "./sync/mapFields.js"
import { pushToShopifyBatch } from "./sync/pushToShopify.js"
import { state, updateState, setCooldown, clearCooldown, resetStop, isCooldownActive } from "./syncState.js"
import { sendAlert } from "./notify.js"

let syncCount = 0

/**
 * Check the database for a recent rate-limited sync run that was started
 * by ANOTHER process (scheduler vs Remix app). In-memory syncState doesn't
 * cross process boundaries, so we need a DB-backed check to prevent
 * the Remix process from hammering the supplier API right after the
 * scheduler process just got rate-limited.
 */
async function checkDbCooldown(db) {
  try {
    const recent = await db.syncRun.findFirst({
      where: { status: "failed" },
      orderBy: { startedAt: "desc" },
    })
    if (!recent || !recent.error) return false

    const isRateLimit = recent.error.includes("Rate limited") || recent.error.includes("SUPPLIER_RATE_LIMITED")
    if (!isRateLimit) return false

    const elapsed = Date.now() - new Date(recent.startedAt).getTime()
    const COOLDOWN_MS = 15 * 60 * 1000 // 15 minutes
    if (elapsed < COOLDOWN_MS) {
      const waitMin = Math.ceil((COOLDOWN_MS - elapsed) / 60000)
      console.log(`[Sync] DB cooldown active: rate-limited ${Math.round(elapsed/1000)}s ago, wait ~${waitMin}min`)
      return true
    }
  } catch (_) { /* DB might not be ready — proceed without DB guard */ }
  return false
}

async function runSync() {
  if (state.isRunning) return

  if (isCooldownActive()) {
    const waitMinutes = Math.ceil((new Date(state.cooldownUntil).getTime() - Date.now()) / 60000)
    console.log(`[Sync] Skipped: supplier rate limit active for ~${waitMinutes}min`)
    return
  }

  // DB-backed cooldown check — guards against the Remix process not seeing
  // the scheduler process's in-memory cooldown (they run as separate Node processes).
  const { PrismaClient } = await import("@prisma/client")
  const db = new PrismaClient()

  if (await checkDbCooldown(db)) {
    console.log("[Sync] Skipped: DB shows recent rate-limit from another process")
    updateState({ lastError: "supplier_rate_limited" })
    setCooldown(15)
    await db.$disconnect()
    return
  }

  updateState({ isRunning: true })
  resetStop()
  const startTime = Date.now()
  syncCount++
  console.log(`[Sync #${syncCount}] Starting...`)

  const syncRun = await db.syncRun.create({
    data: {
      status: "running",
      startedAt: new Date(),
    },
  })

  try {
    const items = await fetchAllJewelry()
    console.log(`[Sync #${syncCount}] Fetched ${items.length} products from supplier`)
    sendAlert("started", { itemCount: items.length })

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

    // If all products failed to push, treat it as a failed sync so the dashboard
    // shows the error instead of claiming "completed" with 0 products.
    const allFailed = pushed === 0 && failed > 0
    const syncStatus = allFailed ? "failed" : "completed"
    const syncError = allFailed
      ? `All ${failed} products failed to push. Check Shopify access token and app installation.`
      : null

    await db.syncRun.update({
      where: { id: syncRun.id },
      data: {
        status: syncStatus,
        completedAt: new Date(),
        totalFetched: items.length,
        totalPushed: pushed,
        error: syncError,
      },
    })

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    if (allFailed) {
      console.error(`[Sync #${syncCount}] All ${failed} pushes failed in ${duration}s`)
      updateState({ lastError: syncError })
      sendAlert("failed", { error: syncError, pushed, failed, skipped, duration: `${duration}s` })
    } else {
      console.log(`[Sync #${syncCount}] Complete! ${pushed}/${items.length} products in ${duration}s`)
      sendAlert("completed", { pushed, failed, skipped, duration: `${duration}s` })
    }
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
      sendAlert("stopped", { reason: "User requested stop" })
      clearCooldown()
    } else {
      console.error(`[Sync #${syncCount}] Failed:`, err.message)
      if (err.code === "SUPPLIER_RATE_LIMITED" || err.message?.includes("Rate limited")) {
        setCooldown(15)
        updateState({ lastError: "supplier_rate_limited" })
        sendAlert("rate_limited", { cooldown: "15", retryIn: "16" })
      } else {
        clearCooldown()
        updateState({ lastError: err.message })
        sendAlert("failed", { error: err.message })
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

  async function runWithRetry(attempt = 0) {
    if (isCooldownActive()) {
      const waitMinutes = Math.ceil((new Date(state.cooldownUntil).getTime() - Date.now()) / 60000)
      if (attempt === 0) {
        console.log(`Scheduler: supplier rate limit active, will retry in ~${waitMinutes}min`)
      }
      setTimeout(() => runWithRetry(attempt + 1), (waitMinutes + 1) * 60_000)
      return
    }

    let lastErr = state.lastError
    const runPromise = attempt === 0
      ? (console.log("Scheduler: running initial sync on startup"), runSync())
      : (console.log(`Scheduler: retry attempt #${attempt}`), runSync())

    try {
      await runPromise
    } catch (err) {
      console.error("Scheduler: retry sync error:", err.message)
    }

    // If the sync failed with a rate limit, retry after cooldown
    const newErr = state.lastError
    const isRateLimited = newErr === "supplier_rate_limited" || newErr?.includes?.("Rate limited")
    if (isRateLimited) {
      const waitMinutes = 16 // cooldown is 15min + 1min buffer
      console.log(`Scheduler: rate limited, will retry in ${waitMinutes}min`)
      setTimeout(() => runWithRetry(attempt + 1), waitMinutes * 60_000)
    }
  }

  setTimeout(() => runWithRetry(), 5000)
  console.log("Scheduler: initial sync scheduled in 5s")
}

// Start the scheduler automatically on import — the Remix server imports this
// module at startup so the cron and initial sync run in-process (no & needed).
// Guard to prevent double-start when imported from multiple modules.
let started = false
if (!started) {
  started = true
  startScheduler()
}

export { runSync, startScheduler }
