import { useEffect, useState } from "react"
import { useFetcher } from "@remix-run/react"
import {
  Page,
  Text,
  Card,
  BlockStack,
  InlineStack,
  Button,
  Badge,
  Box,
  Tabs,
  Spinner,
  EmptyState,
} from "@shopify/polaris"
import { TitleBar } from "@shopify/app-bridge-react"
import { authenticate } from "../shopify.server"

export const loader = async ({ request }) => {
  await authenticate.admin(request)
  return null
}

const CATEGORIES = ["All", "Rings", "Bracelets", "Necklaces", "Earrings", "Pendants", "Others"]

export default function Products() {
  const fetcher = useFetcher()
  const [selectedTab, setSelectedTab] = useState(0)
  const category = CATEGORIES[selectedTab]

  useEffect(() => {
    const params = new URLSearchParams()
    if (category !== "All") params.set("category", category)
    fetcher.load(`/api/products?${params.toString()}`)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  const products = fetcher.data?.products || []
  const categoryCounts = fetcher.data?.categoryCounts || {}
  const loading = fetcher.state === "loading"

  const tabs = CATEGORIES.map((cat, i) => ({
    id: `cat-${i}`,
    content: `${cat}${cat !== "All" && categoryCounts[cat] ? ` (${categoryCounts[cat]})` : ""}`,
  }))

  return (
    <Page title="Products" subtitle="Browse synced jewelry by category">
      <TitleBar title="Products">
        <Button variant="primary" url="/app">
          Back to Dashboard
        </Button>
      </TitleBar>

      <BlockStack gap="500">
        <Card>
          <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab} />
          <Box padding="400">
            {loading ? (
              <Box padding="800">
                <BlockStack align="center" gap="300">
                  <Spinner size="large" />
                  <Text as="p" variant="bodyMd" tone="subdued">Loading products...</Text>
                </BlockStack>
              </Box>
            ) : products.length === 0 ? (
              <EmptyState
                heading="No products found"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Run a sync to pull products from the LGD supplier.</p>
              </EmptyState>
            ) : (
              <BlockStack gap="200">
                {products.map((product) => (
                  <Card key={product.id}>
                    <InlineStack gap="400" align="space-between" wrap={false}>
                      <InlineStack gap="300" wrap={false}>
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.title}
                            aria-label={product.title}
                            style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4 }}
                          />
                        )}
                        <BlockStack gap="050">
                          <Text as="p" variant="bodyMd" fontWeight="bold">
                            {product.title}
                          </Text>
                          <InlineStack gap="200">
                            <Text as="span" variant="bodySm" tone="subdued">
                              SKU: {product.sku}
                            </Text>
                            <Badge tone={product.status === "active" ? "success" : "attention"}>
                              {product.status}
                            </Badge>
                            <Badge tone="info">{product.productType}</Badge>
                          </InlineStack>
                          {product.totalCtWt && (
                            <Text as="p" variant="bodySm" tone="subdued">
                              Diamond: {product.totalCtWt} cts
                            </Text>
                          )}
                        </BlockStack>
                      </InlineStack>

                      <InlineStack gap="200" align="center">
                        <Text as="span" variant="bodyMd" fontWeight="bold">
                          ${parseFloat(product.price).toLocaleString()}
                        </Text>
                        {product.videoUrl && (
                          <Button
                            url={product.videoUrl}
                            external
                            size="slim"
                            style={{ minHeight: "44px" }}
                            aria-label={`Watch video for ${product.title}`}
                          >
                            Watch Video
                          </Button>
                        )}
                        <Button
                          url={`shopify:admin/products/${product.id}`}
                          target="_blank"
                          variant="plain"
                          size="slim"
                          style={{ minHeight: "44px" }}
                          aria-label={`View ${product.title} in Shopify admin`}
                        >
                          View
                        </Button>
                      </InlineStack>
                    </InlineStack>
                  </Card>
                ))}
              </BlockStack>
            )}
          </Box>
        </Card>
      </BlockStack>
    </Page>
  )
}
