import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  try {
    const productGid = payload.admin_graphql_api_id;

    const variants = payload.variants || [];
    for (const variant of variants) {
      if (variant.sku) {
        await db.manualEdit.upsert({
          where: { sku: variant.sku },
          update: {
            editedAt: new Date(),
            productGid,
          },
          create: {
            sku: variant.sku,
            productGid,
            editedAt: new Date(),
          },
        });
      }
    }

    console.log(`[Webhook] products/update: tracked ${variants.length} variants for ${shop}`);
  } catch (err) {
    console.error("[Webhook] products/update error:", err.message);
  }

  return new Response(null, { status: 200 });
};
