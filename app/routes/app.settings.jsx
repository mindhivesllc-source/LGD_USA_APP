import { useFetcher } from "@remix-run/react"
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  InlineStack,
  Banner,
  List,
} from "@shopify/polaris"
import { TitleBar } from "@shopify/app-bridge-react"
import { authenticate } from "../shopify.server"

export const loader = async ({ request }) => {
  await authenticate.admin(request)
  return {
    supplierBase: process.env.SUPPLIER_API_BASE || "",
    syncInterval: process.env.SYNC_INTERVAL_HOURS || "6",
    shopifyAppUrl: process.env.SHOPIFY_APP_URL || "",
  }
}

export default function Settings() {
  const { supplierBase, syncInterval, shopifyAppUrl } = useLoaderData()

  return (
    <Page title="Settings" subtitle="Configuration for LGD Jewelry Sync">
      <TitleBar title="Settings" />

      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Sync Configuration</Text>

                <BlockStack gap="300">
                  <BlockStack gap="100">
                    <Text as="p" variant="bodySm" tone="subdued">Sync Interval</Text>
                    <Text as="p" variant="bodyMd">
                      Every {syncInterval} hours (set via <code>SYNC_INTERVAL_HOURS</code> env var)
                    </Text>
                  </BlockStack>

                  <BlockStack gap="100">
                    <Text as="p" variant="bodySm" tone="subdued">Supplier API</Text>
                    <Text as="p" variant="bodyMd">{supplierBase}</Text>
                  </BlockStack>

                  <BlockStack gap="100">
                    <Text as="p" variant="bodySm" tone="subdued">App URL</Text>
                    <Text as="p" variant="bodyMd">{shopifyAppUrl}</Text>
                  </BlockStack>
                </BlockStack>

                <Banner tone="info">
                  <p>
                    Environment variables are managed through Railway.
                    Visit the{" "}
                    <a
                      href="https://railway.com/project/9128c432-f045-491f-bfb0-8346e86e671e"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Railway Dashboard
                    </a>{" "}
                    to update credentials.
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
                  <Text as="p" variant="bodyMd">
                    These supplier fields are mapped to Shopify:
                  </Text>
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
                  <Text as="p" variant="bodyMd">
                    LGD USA LLC · Theia Jewels
                  </Text>
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
