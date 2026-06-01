import { useFetcher, useLoaderData } from "@remix-run/react"
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Box,
  Badge,
  Banner,
} from "@shopify/polaris"
import { TitleBar } from "@shopify/app-bridge-react"
import { authenticate } from "../shopify.server"
import db from "../db.server"

export const loader = async ({ request }) => {
  await authenticate.admin(request)

  const latestSync = await db.syncRun.findFirst({
    orderBy: { startedAt: "desc" },
  })

  const isRunning = latestSync?.status === "running"

  return {
    lastSync: latestSync
      ? {
          id: latestSync.id,
          startedAt: latestSync.startedAt.toISOString(),
          completedAt: latestSync.completedAt?.toISOString() || null,
          status: latestSync.status,
          totalFetched: latestSync.totalFetched,
          totalPushed: latestSync.totalPushed,
          newProducts: latestSync.newProducts,
          updatedProducts: latestSync.updatedProducts,
          error: latestSync.error,
        }
      : null,
    isRunning,
    syncInterval: parseInt(process.env.SYNC_INTERVAL_HOURS || "6", 10),
  }
}

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request)

  const syncRun = await db.syncRun.create({
    data: {
      status: "running",
      startedAt: new Date(),
    },
  })

  try {
    const { fetchAllJewelry } = await import(
      "../../src/sync/fetchSupplier.js"
    )
    const { mapToShopifyProduct } = await import(
      "../../src/sync/mapFields.js"
    )
    const { pushToShopify } = await import(
      "../../src/sync/pushToShopify.js"
    )

    const items = await fetchAllJewelry()
    let pushed = 0

    const batchSize = 20
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      for (const item of batch) {
        try {
          const mapped = mapToShopifyProduct(item)
          await pushToShopify(mapped)
          pushed++
        } catch (err) {
          console.error("Sync error:", err.message)
        }
      }
      if (i % 100 === 0) {
        console.log(`Sync progress: ${Math.min(i + batchSize, items.length)}/${items.length}`)
      }
    }

    await db.syncRun.update({
      where: { id: syncRun.id },
      data: {
        status: "completed",
        completedAt: new Date(),
        totalFetched: items.length,
        totalPushed: pushed,
      },
    })

    return { success: true, total: items.length, pushed }
  } catch (err) {
    await db.syncRun.update({
      where: { id: syncRun.id },
      data: {
        status: "failed",
        completedAt: new Date(),
        error: err.message,
      },
    })

    return { success: false, error: err.message }
  }
}

export default function Dashboard() {
  const { lastSync, isRunning, syncInterval } = useLoaderData()
  const fetcher = useFetcher()
  const isLoading = fetcher.state === "submitting"
  const isSyncing = isRunning || isLoading

  return (
    <Page title="LGD Jewelry Sync">
      <TitleBar title="Dashboard">
        <button
          variant="primary"
          disabled={isSyncing}
          onClick={() => fetcher.submit({}, { method: "POST" })}
        >
          {isSyncing ? "Syncing..." : "Sync Now"}
        </button>
      </TitleBar>

      <BlockStack gap="500">
        {lastSync?.error && (
          <Banner tone="critical">
            Last sync failed: {lastSync.error}
          </Banner>
        )}

        {isRunning && (
          <Banner tone="info">
            Sync in progress... This may take a few minutes for large catalogs.
          </Banner>
        )}

        {fetcher.data?.success && (
          <Banner
            tone="success"
            onDismiss={() => {}}
          >
            Sync complete! {fetcher.data.pushed} products processed.
          </Banner>
        )}

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Sync Overview
                </Text>

                <InlineStack gap="400" align="start" blockAlign="center">
                  <Box>
                    <BlockStack gap="100">
                      <Text as="p" variant="heading2xl" fontWeight="bold">
                        {lastSync?.totalPushed ?? 0}
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        Products Synced
                      </Text>
                    </BlockStack>
                  </Box>

                  <Box>
                    <BlockStack gap="100">
                      {lastSync ? (
                        <>
                          <Badge
                            tone={
                              lastSync.status === "completed"
                                ? "success"
                                : lastSync.status === "running"
                                  ? "attention"
                                  : "critical"
                            }
                          >
                            {lastSync.status}
                          </Badge>
                          <Text as="p" variant="bodySm" tone="subdued">
                            {lastSync.completedAt
                              ? `Last: ${new Date(
                                  lastSync.completedAt,
                                ).toLocaleDateString()}`
                              : "Running..."}
                          </Text>
                        </>
                      ) : (
                        <>
                          <Badge tone="new">Never synced</Badge>
                          <Text as="p" variant="bodySm" tone="subdued">
                            Click Sync Now to start
                          </Text>
                        </>
                      )}
                    </BlockStack>
                  </Box>
                </InlineStack>

                {lastSync && (
                  <InlineStack gap="200" wrap>
                    <Text as="span" variant="bodySm">
                      {lastSync.totalFetched} fetched
                    </Text>
                    <Text as="span" variant="bodySm">
                      &middot;
                    </Text>
                    <Text as="span" variant="bodySm">
                      {lastSync.totalPushed} pushed
                    </Text>
                    <Text as="span" variant="bodySm">
                      &middot;
                    </Text>
                    <Text as="span" variant="bodySm">
                      Auto: every {syncInterval}h
                    </Text>
                  </InlineStack>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Categories
                </Text>
                {[
                  "Rings",
                  "Bracelets",
                  "Necklaces",
                  "Earrings",
                  "Pendants",
                  "Others",
                ].map((cat) => (
                  <InlineStack key={cat} align="space-between">
                    <Text as="span" variant="bodyMd">
                      {cat}
                    </Text>
                    <Badge>—</Badge>
                  </InlineStack>
                ))}
                <Text as="p" variant="bodySm" tone="subdued">
                  Counts populate after first sync via Shopify API.
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
              How It Works
            </Text>
            <InlineStack gap="300" wrap>
              <Box maxWidth="280px">
                <BlockStack gap="100">
                  <Text as="h3" variant="headingSm">
                    1. Sync
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Click Sync Now to pull inventory from the LGD supplier API.
                  </Text>
                </BlockStack>
              </Box>
              <Box maxWidth="280px">
                <BlockStack gap="100">
                  <Text as="h3" variant="headingSm">
                    2. Classify
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Products are auto-classified: Rings, Bracelets, Necklaces,
                    Earrings, Pendants.
                  </Text>
                </BlockStack>
              </Box>
              <Box maxWidth="280px">
                <BlockStack gap="100">
                  <Text as="h3" variant="headingSm">
                    3. Publish
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Each product syncs to Shopify with full specs, metafields,
                    and video links.
                  </Text>
                </BlockStack>
              </Box>
              <Box maxWidth="280px">
                <BlockStack gap="100">
                  <Text as="h3" variant="headingSm">
                    4. Auto-sync
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Runs every {syncInterval} hours to keep inventory fresh
                    automatically.
                  </Text>
                </BlockStack>
              </Box>
            </InlineStack>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  )
}
