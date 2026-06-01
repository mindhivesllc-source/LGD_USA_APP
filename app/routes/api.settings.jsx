import { json } from "@remix-run/node"
import { authenticate } from "../shopify.server"
import db from "../db.server"

export const loader = async ({ request }) => {
  await authenticate.admin(request)
  const settings = await db.setting.findMany()
  const map = {}
  settings.forEach((s) => (map[s.key] = s.value))
  return json(map)
}

export const action = async ({ request }) => {
  await authenticate.admin(request)
  const formData = await request.formData()
  const key = formData.get("key")
  const value = formData.get("value")

  if (!key) return json({ error: "Key required" }, { status: 400 })

  await db.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })

  return json({ success: true })
}
