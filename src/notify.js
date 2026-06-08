/**
 * Telegram notification utility for sync alerts.
 * Sends messages to the configured Telegram chat via bot API.
 *
 * Required env vars:
 *   TELEGRAM_BOT_TOKEN - Bot token from @BotFather
 *   TELEGRAM_CHAT_ID   - Numeric chat ID to send messages to
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

const TELEGRAM_API = "https://api.telegram.org"

/** Send a Telegram message. No-op if credentials aren't configured. */
async function sendMessage(text) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return false
  }

  try {
    const url = `${TELEGRAM_API}/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => "")
      console.error(`[Notify] Telegram API error ${res.status}: ${body.slice(0, 200)}`)
      return false
    }

    return true
  } catch (err) {
    console.error("[Notify] Failed to send Telegram message:", err.message)
    return false
  }
}

/**
 * Send a sync alert. Formats the message with emoji and key stats.
 *
 * @param {"started"|"completed"|"failed"|"rate_limited"|"stopped"} type
 * @param {object} [details]
 */
export async function sendAlert(type, details = {}) {
  const store = process.env.SHOPIFY_STORE || "unknown"
  const now = new Date().toLocaleString("en-US", { timeZone: "America/New_York" })

  let emoji, title, body

  switch (type) {
    case "started":
      emoji = "🔄"
      title = "Sync Started"
      body = [
        `<b>Store:</b> ${store}`,
        details.itemCount ? `<b>Products fetched:</b> ${details.itemCount}` : null,
      ]
      break

    case "completed":
      emoji = "✅"
      title = "Sync Complete"
      body = [
        `<b>Store:</b> ${store}`,
        `<b>Pushed:</b> ${details.pushed ?? 0}`,
        `<b>Failed:</b> ${details.failed ?? 0}`,
        `<b>Skipped:</b> ${details.skipped ?? 0}`,
        details.duration ? `<b>Duration:</b> ${details.duration}` : null,
      ]
      break

    case "failed":
      emoji = "❌"
      title = "Sync Failed"
      body = [
        `<b>Store:</b> ${store}`,
        `<b>Error:</b> ${details.error || "Unknown error"}`,
      ]
      break

    case "rate_limited":
      emoji = "⏳"
      title = "Supplier Rate Limited"
      body = [
        `<b>Store:</b> ${store}`,
        `<b>Cooldown:</b> ${details.cooldown || "15"} minutes`,
        details.retryIn ? `<b>Retry in:</b> ~${details.retryIn}min` : null,
      ]
      break

    case "stopped":
      emoji = "🛑"
      title = "Sync Stopped"
      body = [
        `<b>Store:</b> ${store}`,
        `<b>Reason:</b> ${details.reason || "User requested stop"}`,
      ]
      break

    default:
      emoji = "ℹ️"
      title = "Sync Update"
      body = [`<b>Store:</b> ${store}`, details.message || ""]
  }

  const message = [
    `${emoji} <b>${title}</b>`,
    ...body.filter(Boolean),
    "",
    `<i>${now} ET</i>`,
  ].join("\n")

  return sendMessage(message)
}

export default sendAlert
