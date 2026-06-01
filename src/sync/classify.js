const CATEGORY_MAP = {
  RING: "Rings",
  BRACELET: "Bracelets",
  "TENNIS NECKLACE": "Necklaces",
  NECKLACE: "Necklaces",
  EARRING: "Earrings",
  PENDANT: "Pendants",
}

export function classifyProduct(item) {
  const jewelryType = (item.Jewelry_Type || item.jewelry_type || "").toUpperCase().trim()

  for (const [key, category] of Object.entries(CATEGORY_MAP)) {
    if (jewelryType.includes(key)) {
      return category
    }
  }

  const title = (item.Remarks || item.title || "").toUpperCase()
  if (title.includes("RING")) return "Rings"
  if (title.includes("BRACELET")) return "Bracelets"
  if (title.includes("NECKLACE") || title.includes("TENNIS")) return "Necklaces"
  if (title.includes("EARRING")) return "Earrings"
  if (title.includes("PENDANT")) return "Pendants"

  return "Others"
}
