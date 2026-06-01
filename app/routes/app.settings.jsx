import { useFetcher, useLoaderData } from "@remix-run/react"
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  InlineStack,
  Banner,
  List,
  Button,
  TextField,
  FormLayout,
  Box,
} from "@shopify/polaris"
import { TitleBar } from "@shopify/app-bridge-react"
import { useState } from "react"

export const loader = async () => {
  const { default: db } = await import("../db.server")
  const settings = await db.setting.findMany()
  const map = {}
  settings.forEach((s) => (map[s.key] = s.value))

  return {
    supplierApiKey: map.SUPPLIER_API_KEY || process.env.SUPPLIER_API_KEY || "",
    syncInterval: process.env.SYNC_INTERVAL_HOURS || "6",
    shopifyAppUrl: process.env.SHOPIFY_APP_URL || "",
    supplierBase: process.env.SUPPLIER_API_BASE || "",
  }
}

export const action = async ({ request }) => {
  const { default: db } = await import("../db.server")
  const formData = await request.formData()
  const supplierApiKey = formData.get("supplierApiKey")

  if (supplierApiKey) {
    await db.setting.upsert({
      where: { key: "SUPPLIER_API_KEY" },
      update: { value: supplierApiKey },
      create: { key: "SUPPLIER_API_KEY", value: supplierApiKey },
    })
  }

  return { success: true }
}

export default function Settings() {
  const data = useLoaderData()
  const fetcher = useFetcher()
  const [apiKey, setApiKey] = useState(data.supplierApiKey)

  const isSaved = fetcher.data?.success

  return (
    <Page title="Settings" subtitle="Configuration for LGD Jewelry Sync">
      <TitleBar title="Settings" />

      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Sync Configuration</Text>

                <fetcher.Form method="post">
                  <FormLayout>
                    <TextField
                      label="Supplier API Key"
                      type="password"
                      name="supplierApiKey"
                      value={apiKey}
                      onChange={setApiKey}
                      autoComplete="off"
                      helpText="Your LGD supplier API key. Changes take effect immediately."
                    />
                    <InlineStack gap="200">
                      <Button submit variant="primary">
                        Save API Key
                      </Button>
                      {isSaved && (
                        <Text as="span" variant="bodyMd" tone="success">
                          Saved
                        </Text>
                      )}
                    </InlineStack>
                  </FormLayout>
                </fetcher.Form>

                <Box paddingBlockStart="400">
                  <BlockStack gap="300">
                    <BlockStack gap="100">
                      <Text as="p" variant="bodySm" tone="subdued">Sync Interval</Text>
                      <Text as="p" variant="bodyMd">Every {data.syncInterval} hours</Text>
                    </BlockStack>
                    <BlockStack gap="100">
                      <Text as="p" variant="bodySm" tone="subdued">Supplier API Base</Text>
                      <Text as="p" variant="bodyMd">{data.supplierBase}</Text>
                    </BlockStack>
                    <BlockStack gap="100">
                      <Text as="p" variant="bodySm" tone="subdued">App URL</Text>
                      <Text as="p" variant="bodyMd">{data.shopifyAppUrl}</Text>
                    </BlockStack>
                  </BlockStack>
                </Box>

                <Banner tone="info">
                  <p>
                    Other environment variables are managed through Railway.
                    Visit the{" "}
                    <a
                      href="https://railway.com/project/9128c432-f045-491f-bfb0-8346e86e671e"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Railway Dashboard
                    </a>{" "}
                    to update Shopify credentials.
                  </p>
                </Banner>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">Field Mapping</Text>
                  <List>
                    <List.Item>Stock_No → Variant SKU</List.Item>
                    <List.Item>Price → Variant Price</List.Item>
                    <List.Item>Jewelry_Type → Product Type</List.Item>
                    <List.Item>Metal_Type, Color, Clarity → Tags</List.Item>
                    <List.Item>Dia_Wt, Gross_Wt → Metafields</List.Item>
                    <List.Item>Video_1 → Metafield (link button)</List.Item>
                    <List.Item>Size → Variant Option</List.Item>
                  </List>
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">Support</Text>
                  <Text as="p" variant="bodyMd">LGD USA LLC · Theia Jewels</Text>
                  <BlockStack gap="100">
                    <Text as="p" variant="bodySm">info@lgdusallc.com</Text>
                    <Text as="p" variant="bodySm">+1-212-921-0118</Text>
                    <Text as="p" variant="bodySm">lgdusallc.com</Text>
                  </BlockStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  )
}
