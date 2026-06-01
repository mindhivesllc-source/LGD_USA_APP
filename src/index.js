import { runSync } from "./scheduler.js"

runSync()
  .then(() => {
    console.log("Manual sync complete.")
    process.exit(0)
  })
  .catch((err) => {
    console.error("Sync failed:", err.message)
    process.exit(1)
  })
