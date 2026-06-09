import { json } from "@remix-run/node"
import { authenticate } from "../shopify.server"
import { getState, isCooldownActive, getCooldownRemaining, getCooldownRemainingSeconds, requestStop, resetStop } from "../../src/syncState.js"
import { runSync } from "../../src/scheduler.js"

export const loader = async ({ request }) => {
  await authenticate.admin(request)
  const state = getState()
  return json({
    ...state,
    cooldownActive: isCooldownActive(),
    cooldownRemainingMin: getCooldownRemaining(),
    cooldownRemainingSec: getCooldownRemainingSeconds(),
  })
}

export const action = async ({ request }) => {
  await authenticate.admin(request)
  const s = getState()

  const body = request.method === "POST" ? await request.formData().catch(() => null) : null
  const intent = body?.get("intent") || "start"

  if (intent === "stop") {
    if (!s.isRunning) {
      return json({ error: "No sync running" }, { status: 409 })
    }
    requestStop()
    console.log("[Sync] Stop requested by user")
    return json({ success: true, message: "Stop requested" })
  }

  if (s.isRunning) {
    return json({ error: "Sync already in progress" }, { status: 409 })
  }

  const force = body?.get("force") === "true"

  if (!force && isCooldownActive()) {
    const waitMinutes = getCooldownRemaining()
    return json({
      error: `Supplier API rate limit — try again in ${waitMinutes} minute${waitMinutes > 1 ? "s" : ""}`,
      retryAfterMinutes: waitMinutes,
    })
  }

  if (force) {
    resetStop()
  }

  runSync().catch((err) => console.error("Manual sync error:", err))

  return json({ success: true, message: "Sync started" })
}
