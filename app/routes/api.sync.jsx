import { json } from "@remix-run/node"
import { authenticate } from "../shopify.server"
import { getState, updateState } from "../../src/syncState.js"
import { runSync } from "../../src/scheduler.js"

export const loader = async ({ request }) => {
  await authenticate.admin(request)
  return json(getState())
}

export const action = async ({ request }) => {
  await authenticate.admin(request)
  const s = getState()

  if (s.isRunning) {
    return json({ error: "Sync already in progress" }, { status: 409 })
  }

  if (s.lastAttempt) {
    const elapsed = (Date.now() - new Date(s.lastAttempt).getTime()) / 1000 / 60
    if (elapsed < s.cooldownMinutes) {
      const waitMinutes = Math.ceil(s.cooldownMinutes - elapsed)
      return json({
        error: `Supplier API rate limit — try again in ${waitMinutes} minute${waitMinutes > 1 ? "s" : ""}`,
        retryAfterMinutes: waitMinutes,
      })
    }
  }

  updateState({ lastAttempt: new Date().toISOString() })

  runSync().catch((err) => console.error("Manual sync error:", err))

  return json({ success: true, message: "Sync started" })
}
