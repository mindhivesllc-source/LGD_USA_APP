import { classifyProduct } from "./classify.js"

export function mapToShopifyProduct(item) {
  const sku = item.Stock_No || item.sku || ""
  const title = item.Remarks || item.title || ""
  const price = item.Price || item.price || "0"
  const metalType = item.Metal_Type || item.metal_type || ""
  const color = item.Color || item.color || ""
  const clarity = item.Clarity || item.clarity || ""
  const shape = item.Shape || item.shape || ""
  const growthType = item.Growth_Type || item.growth_type || ""
  const size = item.Size || item.size || "One Size"
  const setting = item.Setting || item.setting || ""
  const totalCtWt = item.Dia_Wt || item.total_ct_wt || "0"
  const grossWt = item.gross_wt || "0"
  const diaPcs = item.Dia_Pcs || item.diamond_pieces || "0"
  const certificate = item.Certificate || item.certificate || ""
  const videoUrl = item.Video_1 || item.video_url || ""
  const image1 = item.Image_1 || item.image_1 || ""
  const image2 = item.Image_2 || item.image_2 || ""

  const category = classifyProduct(item)

  const tags = [category, metalType, color, clarity, shape, growthType].filter(Boolean)

  return {
    title,
    descriptionHtml: formatDescription(item),
    vendor: "LGD USA",
    productType: category,
    tags,
    status: "ACTIVE",
    options: [{ name: "Size", values: [{ name: size }] }],
    variants: [
      {
        sku,
        price,
        optionValues: [{ optionName: "Size", name: size }],
        taxable: true,
      },
    ],
    metafields: [
      {
        namespace: "lgd",
        key: "total_ct_wt",
        value: String(totalCtWt),
        type: "single_line_text_field",
      },
      {
        namespace: "lgd",
        key: "gross_wt",
        value: String(grossWt),
        type: "single_line_text_field",
      },
      {
        namespace: "lgd",
        key: "setting",
        value: setting,
        type: "single_line_text_field",
      },
      {
        namespace: "lgd",
        key: "diamond_pcs",
        value: String(diaPcs),
        type: "single_line_text_field",
      },
      {
        namespace: "lgd",
        key: "certificate",
        value: certificate,
        type: "single_line_text_field",
      },
      ...(videoUrl
        ? [
            {
              namespace: "lgd",
              key: "video_url",
              value: videoUrl,
              type: "url",
            },
          ]
        : []),
    ],
  }
}

function formatDescription(item) {
  const parts = []
  if (item.Metal_Type) parts.push(`Metal: ${item.Metal_Type}`)
  if (item.Color) parts.push(`Color: ${item.Color}`)
  if (item.Clarity) parts.push(`Clarity: ${item.Clarity}`)
  if (item.Shape) parts.push(`Shape: ${item.Shape}`)
  if (item.Dia_Wt) parts.push(`Diamond Weight: ${item.Dia_Wt} cts`)
  if (item.Dia_Pcs) parts.push(`Diamond Pieces: ${item.Dia_Pcs}`)
  if (item.Size) parts.push(`Size: ${item.Size}`)
  if (item.Setting) parts.push(`Setting: ${item.Setting}`)
  if (item.Growth_Type) parts.push(`Type: ${item.Growth_Type}`)
  return parts.length ? `<ul><li>${parts.join("</li><li>")}</li></ul>` : ""
}
