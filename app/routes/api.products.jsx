import { json } from "@remix-run/node"
import { authenticate } from "../shopify.server"

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request)
  const url = new URL(request.url)
  const category = url.searchParams.get("category") || ""

  let query
  if (category) {
    query = `#graphql
      query getProductsByType($type: String!) {
        products(first: 100, query: $type) {
          edges {
            node {
              id
              title
              handle
              productType
              status
              variants(first: 1) {
                edges {
                  node {
                    sku
                    price
                  }
                }
              }
              featuredImage {
                url
                altText
              }
              metafields(first: 10, namespace: "lgd") {
                edges {
                  node {
                    key
                    value
                  }
                }
              }
              updatedAt
            }
          }
        }
      }`
  } else {
    query = `#graphql
      query getProducts {
        products(first: 100, query: "vendor:LGD USA") {
          edges {
            node {
              id
              title
              handle
              productType
              status
              variants(first: 1) {
                edges {
                  node {
                    sku
                    price
                  }
                }
              }
              featuredImage {
                url
                altText
              }
              metafields(first: 10, namespace: "lgd") {
                edges {
                  node {
                    key
                    value
                  }
                }
              }
              updatedAt
            }
          }
        }
      }`
  }

  const response = await admin.graphql(query, {
    variables: category ? { type: `product_type:${category}` } : {},
  })

  const data = await response.json()
  const products = data.data.products.edges.map((e) => {
    const node = e.node
    const metafields = {}
    if (node.metafields) {
      node.metafields.edges.forEach((m) => {
        metafields[m.node.key] = m.node.value
      })
    }
    return {
      id: node.id.replace("gid://shopify/Product/", ""),
      title: node.title,
      handle: node.handle,
      productType: node.productType,
      status: node.status,
      sku: node.variants.edges[0]?.node?.sku || "",
      price: node.variants.edges[0]?.node?.price || "",
      image: node.featuredImage?.url || "",
      videoUrl: metafields.video_url || "",
      totalCtWt: metafields.total_ct_wt || "",
      updatedAt: node.updatedAt,
    }
  })

  const categories = {}
  products.forEach((p) => {
    const cat = p.productType || "Others"
    categories[cat] = (categories[cat] || 0) + 1
  })

  return json({ products, categoryCounts: categories })
}
