import { json } from "@remix-run/node"
import { authenticate } from "../shopify.server"
import { getState } from "../../src/syncState.js"
import { runSync } from "../../src/scheduler.js"

export const loader = async ({ request }) => {
  await authenticate.admin(request)
  return json(getState())
}

export const action = async ({ request }) => {
  await authenticate.admin(request)

  const state = getState()

  if (state.isRunning) {
    return json({ error: "Sync already in progress" }, { status: 409 })
  }

  runSync().catch((err) => console.error("Manual sync error:", err))

  return json({ success: true, message: "Sync started" })
}
