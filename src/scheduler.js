import cron from "node-cron"
import { fetchAllJewelry } from "./sync/fetchSupplier.js"
import { mapToShopifyProduct } from "./sync/mapFields.js"
import { pushToShopifyBatch, countShopifyProducts } from "./sync/pushToShopify.js"
import { state, updateState, setCooldown, clearCooldown, resetStop, isCooldownActive } from "./syncState.js"
import { sendAlert } from "./notify.js"

let syncCount = 0
let cooldownRetryTimer = null

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
    if (!recent || !recent.error) return 0

    const isRateLimit =
      recent.error.includes("Rate limited") || recent.error.includes("SUPPLIER_RATE_LIMITED")
    if (!isRateLimit) return 0

    const elapsed = Date.now() - new Date(recent.startedAt).getTime()
    const COOLDOWN_MS = 15 * 60 * 1000
    if (elapsed < COOLDOWN_MS) {
      const waitMin = Math.ceil((COOLDOWN_MS - elapsed) / 60000)
      console.log(
        `[Sync] DB cooldown active: rate-limited ${Math.round(elapsed / 1000)}s ago, wait ~${waitMin}min`
      )
      return waitMin
    }
  } catch (_) {
    // DB might not be ready — proceed without DB guard.
  }

  return 0
}

function scheduleCooldownRetry(waitMinutes) {
  if (cooldownRetryTimer) {
    clearTimeout(cooldownRetryTimer)
  }

  const delayMs = Math.max(1, waitMinutes) * 60_000 + 60_000
  console.log(`Scheduler: retry scheduled in ~${waitMinutes + 1}min`)
  cooldownRetryTimer = setTimeout(() => {
    cooldownRetryTimer = null
    runSync().catch((err) => console.error("Scheduler retry error:", err.message))
  }, delayMs)
}

function clearCooldownRetryTimer() {
  if (cooldownRetryTimer) {
    clearTimeout(cooldownRetryTimer)
    cooldownRetryTimer = null
  }
}

async function runSync() {
  if (state.isRunning) return

  if (isCooldownActive()) {
    const waitMinutes = Math.ceil((new Date(state.cooldownUntil).getTime() - Date.now()) / 60000)
    console.log(`[Sync] Skipped: supplier rate limit active for ~${waitMinutes}min`)
    scheduleCooldownRetry(waitMinutes)
    return
  }

  const { PrismaClient } = await import("@prisma/client")
  const db = new PrismaClient()

  const dbCooldownMinutes = await checkDbCooldown(db)
  if (dbCooldownMinutes > 0) {
    console.log("[Sync] Skipped: DB shows recent rate-limit from another process")
    updateState({ lastError: "supplier_rate_limited" })
    setCooldown(dbCooldownMinutes)
    scheduleCooldownRetry(dbCooldownMinutes)
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
    const { items, totalResults, totalPages } = await fetchAllJewelry()
    console.log(
      `[Sync #${syncCount}] Fetched ${items.length} products from supplier (${totalResults} reported across ${totalPages} page(s))`
    )
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

    if (pushed !== items.length || failed > 0 || skipped > 0) {
      throw new Error(
        `Supplier returned ${items.length} jewelry items, but Shopify only accepted ${pushed} (${failed} failed, ${skipped} skipped).`
      )
    }

    const shopifyQuery = 'vendor:"LGD USA" status:active'
    const shopifyCount = await countShopifyProducts(shopifyQuery)
    if (shopifyCount !== totalResults) {
      throw new Error(
        `Supplier reported ${totalResults} jewelry items, but Shopify now has ${shopifyCount} active products for vendor LGD USA.`
      )
    }

    await db.syncRun.update({
      where: { id: syncRun.id },
      data: {
        status: "completed",
        completedAt: new Date(),
        totalFetched: items.length,
        totalPushed: pushed,
        error: null,
      },
    })

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`[Sync #${syncCount}] Complete! ${pushed}/${items.length} products in ${duration}s`)
    sendAlert("completed", { pushed, failed, skipped, duration: `${duration}s` })
    clearCooldown()
    clearCooldownRetryTimer()
  } catch (err) {
    const isStopped = err.name === "SyncStopError"

    try {
      await db.syncRun.update({
        where: { id: syncRun.id },
        data: {
          status: isStopped ? "cancelled" : "failed",
          completedAt: new Date(),
          error: isStopped ? "Stopped by user" : err.message,
        },
      })
    } catch (_) {}

    if (isStopped) {
      console.log(`[Sync #${syncCount}] Stopped by user`)
      sendAlert("stopped", { reason: "User requested stop" })
    } else {
      console.error(`[Sync #${syncCount}] Failed:`, err.message)
      if (err.code === "SUPPLIER_RATE_LIMITED" || err.message?.includes("Rate limited")) {
        setCooldown(15)
        updateState({ lastError: "supplier_rate_limited" })
        sendAlert("rate_limited", { cooldown: "15", retryIn: "16" })
        scheduleCooldownRetry(15)
      } else {
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
  const intervalMin = parseInt(process.env.SYNC_INTERVAL_MINUTES, 10) || 0
  let cronExpression
  if (intervalMin > 0) {
    cronExpression = `*/${intervalMin} * * * *`
  } else {
    const hours = parseInt(process.env.SYNC_INTERVAL_HOURS, 10) || 6
    cronExpression = `0 */${hours} * * *`
  }

  console.log(
    `Scheduler: sync every ${
      intervalMin > 0 ? intervalMin + "min" : (parseInt(process.env.SYNC_INTERVAL_HOURS, 10) || 6) + "h"
    } (${cronExpression})`
  )

  cron.schedule(cronExpression, runSync)
  console.log("Scheduler: cron job registered")

  setTimeout(() => {
    console.log("Scheduler: running initial sync on startup")
    runSync().catch((err) => console.error("Scheduler startup sync error:", err.message))
  }, 5000)
  console.log("Scheduler: initial sync scheduled in 5s")
}

let started = false
if (!started) {
  started = true
  startScheduler()
}

export { runSync }
