import { Page, Layout, Card, Text, BlockStack, List } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

export const loader = async () => {
  return { shopifyAppUrl: process.env.SHOPIFY_APP_URL || "" };
};

export default function Privacy() {
  return (
    <Page title="Privacy Policy">
      <TitleBar title="Privacy Policy" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingLg">LGD Jewelry Sync Privacy Policy</Text>
              <Text as="p" variant="bodyMd">
                Last updated: June 1, 2026
              </Text>

              <BlockStack gap="300">
                <Text as="h3" variant="headingMd">Information We Collect</Text>
                <Text as="p" variant="bodyMd">
                  LGD Jewelry Sync accesses your Shopify store data to sync jewelry products
                  from your supplier. We collect and process:
                </Text>
                <List>
                  <List.Item>Store information (shop domain, products, variants)</List.Item>
                  <List.Item>API credentials (stored encrypted in your database)</List.Item>
                  <List.Item>Sync history and product metadata</List.Item>
                </List>

                <Text as="h3" variant="headingMd">How We Use Information</Text>
                <List>
                  <List.Item>To sync jewelry products from your supplier to your Shopify store</List.Item>
                  <List.Item>To classify products by jewelry type</List.Item>
                  <List.Item>To maintain sync history and logs</List.Item>
                </List>

                <Text as="h3" variant="headingMd">Data Storage</Text>
                <Text as="p" variant="bodyMd">
                  All data is stored in your own Railway-deployed database. We do not
                  process or store your data on external servers beyond what is required
                  for Shopify API integration.
                </Text>

                <Text as="h3" variant="headingMd">Third-Party Services</Text>
                <Text as="p" variant="bodyMd">
                  This app communicates with the Shopify Admin API and the LGD supplier API
                  (lgdusallc.com) solely for the purpose of syncing jewelry inventory.
                </Text>

                <Text as="h3" variant="headingMd">Contact</Text>
                <Text as="p" variant="bodyMd">
                  LGD USA LLC · info@lgdusallc.com · +1-212-921-0118
                </Text>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
