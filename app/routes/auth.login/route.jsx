import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { AppProvider as PolarisAppProvider, Button, Page, Text } from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { getShopifyAdminAppUrl, isIframeRequest } from "../../shopify-admin-url.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  const adminAppUrl = getShopifyAdminAppUrl(request);

  if (!isIframeRequest(request)) {
    throw redirect(adminAppUrl);
  }

  return json({ adminAppUrl });
};

export const action = async ({ request }) => {
  throw redirect(getShopifyAdminAppUrl(request));
};

export default function Auth() {
  const { adminAppUrl } = useLoaderData();

  return (
    <PolarisAppProvider i18n={{}}>
      <Page>
        <Text variant="headingMd" as="h1">
          Open this app from Shopify Admin.
        </Text>
        <Button url={adminAppUrl} target="_top">
          Open app
        </Button>
      </Page>
    </PolarisAppProvider>
  );
}
