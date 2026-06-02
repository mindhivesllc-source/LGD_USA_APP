import { useEffect, useState } from "react"
import { useFetcher, useLoaderData, useRevalidator } from "@remix-run/react"
import { redirect } from "@remix-run/node"
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
  Toast,
  Frame,
  Button,
} from "@shopify/polaris"
import { TitleBar } from "@shopify/app-bridge-react"
import { authenticate } from "../shopify.server"
import db from "../db.server"

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request)
  const url = new URL(request.url)

  const onboardingDone = await db.setting.findUnique({ where: { key: "onboarding_complete" } })
  if (!onboardingDone || onboardingDone.value !== "true") {
    throw redirect(`/app/onboarding${url.search}`)
  }

  const latestSync = await db.syncRun.findFirst({
    orderBy: { startedAt: "desc" },
  })

  const isRunning = latestSync?.status === "running"

  let categoryCounts = {}
  try {
    const query = `#graphql
      query {
        products(first: 250, query: "vendor:LGD USA") {
          edges {
            node {
              productType
            }
          }
        }
      }
    `
    const response = await admin.graphql(query)
    const result = await response.json()
    const products = result.data?.products?.edges || []
    for (const edge of products) {
      const cat = edge.node.productType || "Others"
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
    }
  } catch (e) {
    console.error("Failed to fetch category counts:", e)
  }

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
    categoryCounts,
  }
}

export const action = async ({ request }) => {
  await authenticate.admin(request)

  const running = await db.syncRun.findFirst({
    where: { status: "running" },
  })
  if (running) {
    return { success: false, error: "Sync already in progress" }
  }

  const formData = await request.formData()
  const force = formData.get("force") === "true"

  if (!force) {
    const lastFailed = await db.syncRun.findFirst({
      where: { status: "failed" },
      orderBy: { startedAt: "desc" },
    })
    if (lastFailed?.error) {
      const isSupplierRateLimit = lastFailed.error.includes("Rate limited") || lastFailed.error.includes("SUPPLIER_RATE_LIMITED")
      if (isSupplierRateLimit) {
        const cooldownMinutes = 15
        const elapsed = (Date.now() - new Date(lastFailed.startedAt).getTime()) / 1000 / 60
        if (elapsed < cooldownMinutes) {
          const wait = Math.ceil(cooldownMinutes - elapsed)
          return { success: false, error: `Supplier API rate limit — try again in ${wait} minute${wait > 1 ? "s" : ""}` }
        }
      }
    }
  }

  const { runSync } = await import("../../src/scheduler.js")
  runSync().catch((err) => console.error("Background sync error:", err))

  return { success: true, message: "Sync started" }
}

export default function Dashboard() {
  const { lastSync, isRunning, syncInterval, categoryCounts } = useLoaderData()
  const fetcher = useFetcher()
  const stopFetcher = useFetcher()
  const isLoading = fetcher.state === "submitting"
  const isSyncing = isRunning || isLoading
  const [showToast, setShowToast] = useState(false)
  const [showForce, setShowForce] = useState(false)
  const revalidator = useRevalidator()

  const lastFailed = lastSync?.status === "failed"
  const isRateLimited = lastFailed && (lastSync?.error || "").includes("Rate limited")
  const showForceButton = isRateLimited && !isSyncing

  useEffect(() => {
    if (fetcher.data?.success) {
      setShowToast(true)
    }
  }, [fetcher.data?.success])

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => revalidator.revalidate(), 3000)
      return () => clearInterval(interval)
    }
  }, [isRunning, revalidator])

  return (
    <Frame>
      <Page title="LGD Jewelry Sync">
        <TitleBar title="Dashboard">
          <InlineStack gap="200">
            {isRunning ? (
              <stopFetcher.Form method="POST" action="/api/sync">
                <input type="hidden" name="intent" value="stop" />
                <Button variant="primary" tone="critical" submit loading={stopFetcher.state === "submitting"}>
                  Stop Sync
                </Button>
              </stopFetcher.Form>
            ) : (
              <fetcher.Form method="post">
                <input type="hidden" name="force" value={showForce ? "true" : "false"} />
                <Button variant="primary" submit disabled={isSyncing}>
                  {isSyncing ? "Syncing..." : "Sync Now"}
                </Button>
              </fetcher.Form>
            )}
            {showForceButton && (
              <Button
                variant="monochromePlain"
                disabled={isSyncing}
                onClick={() => {
                  setShowForce(true)
                  setTimeout(() => setShowForce(false), 5000)
                }}
              >
                Force Retry
              </Button>
            )}
          </InlineStack>
        </TitleBar>

        <BlockStack gap="500">
          <div aria-live="polite">
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
          </div>

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
                                    : lastSync.status === "cancelled"
                                      ? "warning"
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
                                : lastSync.status === "cancelled"
                                  ? "Stopped"
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
                      <Badge>{categoryCounts[cat] ?? "—"}</Badge>
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
      {showToast && (
        <Toast
          content={`Sync complete! ${fetcher.data?.pushed || ""} products processed.`}
          onDismiss={() => setShowToast(false)}
          duration={4000}
        />
      )}
    </Frame>
  )
}
