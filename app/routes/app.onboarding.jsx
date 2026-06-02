import { useFetcher, useLocation, useNavigate } from "@remix-run/react";
import {
  Page,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Box,
  ProgressBar,
  Banner,
  TextField,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useEffect, useState } from "react";

export const loader = async () => {
  return { shopifyAppUrl: process.env.SHOPIFY_APP_URL || "" };
};

export const action = async ({ request }) => {
  const { default: db } = await import("../db.server");
  const formData = await request.formData();
  const intent = formData.get("intent");
  const apiKey = formData.get("apiKey");

  if (intent === "save_api_key" && apiKey) {
    await db.setting.upsert({
      where: { key: "SUPPLIER_API_KEY" },
      update: { value: apiKey },
      create: { key: "SUPPLIER_API_KEY", value: apiKey },
    });
    return { success: true, step: "api_key_saved" };
  }

  if (intent === "start_sync") {
    const { runSync } = await import("../../src/scheduler.js");
    runSync().catch(console.error);
    return { success: true, step: "sync_started" };
  }

  if (intent === "complete") {
    await db.setting.upsert({
      where: { key: "onboarding_complete" },
      update: { value: "true" },
      create: { key: "onboarding_complete", value: "true" },
    });
    return { success: true, step: "complete" };
  }

  return { success: false, error: "Invalid intent" };
};

export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const fetcher = useFetcher();
  const [apiKey, setApiKey] = useState("");
  const [step, setStep] = useState(1);

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  useEffect(() => {
    if (fetcher.data?.step === "api_key_saved") {
      setStep(2);
    }
    if (fetcher.data?.step === "sync_started") {
      setStep(3);
    }
    if (fetcher.data?.step === "complete") {
      navigate(`/app${location.search}`);
    }
  }, [fetcher.data?.step, location.search, navigate])

  return (
    <Page title="Welcome to LGD Jewelry Sync" subtitle="Set up your automated inventory sync">
      <TitleBar title="Setup Wizard" />

      <BlockStack gap="500">
        <Card>
          <BlockStack gap="400">
            <ProgressBar progress={progress} size="small" />
            <Text as="h2" variant="headingLg">
              {step === 1 && "Step 1: Connect Your Supplier"}
              {step === 2 && "Step 2: First Sync"}
              {step === 3 && "Step 3: All Set!"}
            </Text>

            {step === 1 && (
              <BlockStack gap="400">
                <Text as="p" variant="bodyMd">
                  Enter your LGD supplier API key to start pulling jewelry inventory.
                  You can find this in your supplier dashboard.
                </Text>
                <fetcher.Form method="post">
                  <input type="hidden" name="intent" value="save_api_key" />
                  <TextField
                    label="Supplier API Key"
                    type="password"
                    name="apiKey"
                    value={apiKey}
                    onChange={setApiKey}
                    autoComplete="off"
                    helpText="This key is stored securely and never shared."
                  />
                  <Box paddingBlockStart="400">
                    <Button submit variant="primary" disabled={!apiKey}>
                      Save &amp; Continue
                    </Button>
                  </Box>
                </fetcher.Form>
              </BlockStack>
            )}

            {step === 2 && (
              <BlockStack gap="400">
                <Text as="p" variant="bodyMd">
                  Ready to pull your first batch of products. This will sync all available
                  jewelry from your supplier to your Shopify store.
                </Text>
                <Banner tone="info">
                  Your products will be created as Active and visible in your store.
                  You can unpublish any items you don't want displayed.
                </Banner>
                <fetcher.Form method="post">
                  <input type="hidden" name="intent" value="start_sync" />
                  <InlineStack gap="300">
                    <Button submit variant="primary" loading={fetcher.state === "submitting"}>
                      Start First Sync
                    </Button>
                    <Button onClick={() => setStep(3)} variant="plain">
                      Skip for now
                    </Button>
                  </InlineStack>
                </fetcher.Form>
              </BlockStack>
            )}

            {step === 3 && (
              <BlockStack gap="400">
                <Text as="p" variant="bodyMd">
                  Setup complete! Your sync will run automatically every 6 hours.
                </Text>
                <InlineStack gap="200">
                  <Text as="span">&#9989;</Text>
                  <Text as="span" variant="bodyMd">
                    Products auto-sync from supplier
                  </Text>
                </InlineStack>
                <InlineStack gap="200">
                  <Text as="span">&#9989;</Text>
                  <Text as="span" variant="bodyMd">
                    Smart category classification
                  </Text>
                </InlineStack>
                <InlineStack gap="200">
                  <Text as="span">&#9989;</Text>
                  <Text as="span" variant="bodyMd">
                    Video &amp; spec metafields
                  </Text>
                </InlineStack>
                <Box paddingBlockStart="400">
                  <fetcher.Form method="post">
                    <input type="hidden" name="intent" value="complete" />
                    <Button submit variant="primary">
                      Go to Dashboard
                    </Button>
                  </fetcher.Form>
                </Box>
              </BlockStack>
            )}
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
