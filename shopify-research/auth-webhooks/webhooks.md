# Shopify Webhooks Research

## Sources:
- https://shopify.dev/docs/apps/build/webhooks
- https://shopify.dev/docs/apps/build/webhooks/subscribe
- https://shopify.dev/docs/apps/build/webhooks/verify-deliveries
- https://shopify.dev/docs/apps/build/webhooks/delivery-structure

---

## Core Concepts

### Topic Format
`{resource}/{action}` — e.g., `products/create`, `products/update`, `orders/delete`

### Subscription Types

| Type | Configuration | Scope | Best For |
|---|---|---|---|
| **App-specific** (Recommended) | `shopify.app.toml` | Uniform across all shops | Most apps |
| **Shop-specific** | GraphQL Admin API | Per-shop variation | Custom per-shop needs |

### App-Specific Subscription (TOML)
```toml
[webhooks]
api_version = "2026-04"

[[webhooks.subscriptions]]
topics = ["products/create"]
uri = "https://your-app.example.com/webhooks/products"
```

### Shop-Specific Subscription (React Router Template — `app/shopify.server.ts`)
```javascript
const shopify = shopifyApp({
  webhooks: {
    ORDERS_CREATED: {
      deliveryMethod: DeliveryMethod.PubSub,
      pubSubProject: "<GCP-PROJECT>",
      pubSubTopic: "<PUB_SUB_TOPIC>",
    },
  },
  hooks: {
    afterAuth: async ({ session }) => {
      shopify.registerWebhooks({ session });
    },
  },
});
```

### GraphQL Admin API Subscription
```graphql
mutation webhookSubscriptionCreate(
  $topic: WebhookSubscriptionTopic!,
  $webhookSubscription: WebhookSubscriptionInput!
) {
  webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
    userErrors { field message }
    webhookSubscription { id format includeFields metafieldNamespaces topic uri }
  }
}
```

---

## Subscription Fields

| Field | Required | Purpose |
|---|---|---|
| `topics` | Yes | Topic name(s) — e.g., `["products/create"]` |
| `uri` | Yes | Delivery destination — HTTPS URL, EventBridge ARN, or Pub/Sub URI |
| `include_fields` | No | Fields to include in payload |
| `filter` | No | Filter expression to gate deliveries |
| `name` | No | Label in `X-Shopify-Name` header (alphanumeric, `-`, `_`, max 50 chars) |

---

## Delivery Methods

| Method | URI Format | Notes |
|---|---|---|
| **HTTPS** | `https://yourserver.com/webhooks` | Requires HMAC verification, must respond 200 within 5s |
| **Google Pub/Sub** | `pubsub://{project-id}:{topic-id}` | No HMAC needed, handled by cloud |
| **Amazon EventBridge** | ARN from EventBridge console | No HMAC needed, handled by cloud |

**Recommendation**: Use Google Pub/Sub or EventBridge for production. HTTPS requires extra infrastructure.

---

## API Versioning

- Webhooks are versioned — set `api_version` in `[webhooks]` block of TOML
- Each delivery includes `X-Shopify-API-Version` header
- Test with: `shopify app webhook trigger --api-version=<new-version> --address=<destination> --topic=<topic-name>`
- Update quarterly to latest stable version

---

## Delivery Structure

### Headers
| Header | Description |
|---|---|
| `X-Shopify-Topic` | Topic name (e.g., `products/update`) |
| `X-Shopify-Hmac-Sha256` | Base64 HMAC signature for verification (HTTPS only) |
| `X-Shopify-Shop-Domain` | `myshopify.com` domain of the store |
| `X-Shopify-API-Version` | API version used to serialize payload |
| `X-Shopify-Webhook-Id` | Unique per delivery — use for deduplication |
| `X-Shopify-Triggered-At` | When Shopify triggered the delivery |
| `X-Shopify-Event-Id` | Shared across deliveries from same merchant action |
| `X-Shopify-Name` | Developer-supplied subscription name (optional) |

### Default Payload (Full Resource)
```json
{
  "id": 9554194432293,
  "title": "T-Shirt",
  "status": "active",
  "vendor": "My Store",
  "variants": [{ "id": 123456789, "price": "29.99" }]
}
```

### With `include_fields`
```toml
include_fields = ["id", "variants.id", "variants.price", "updated_at"]
```
```json
{
  "id": 9554194432293,
  "variants": [{ "id": 123456789, "price": "29.99" }],
  "updated_at": "2025-04-22T14:30:00-05:00"
}
```

### Debouncing Warning
When `include_fields` reduces payload, identical payloads within a short window are debounced (later one dropped). Always include `updated_at` in `include_fields` to prevent this.

### Combining `filter` with `include_fields`
All fields referenced in `filter` must appear in `include_fields`:
```toml
include_fields = ["id", "status", "product_type", "variants.taxable", "variants.price", "variants.title", "updated_at"]
filter = "id:* AND status:active AND (product_type:Music OR product_type:Movies) AND variants.taxable:true AND variants.price:>=100"
```

---

## Verification: HMAC and Deduplication

### HMAC Verification (HTTPS Only)
- Compute `HMAC-SHA256(raw_request_body, client_secret)` and compare to `X-Shopify-Hmac-Sha256` header
- Use `crypto.timingSafeEqual` to prevent timing attacks
- Must capture raw body BEFORE body parsing middleware; place webhook verification middleware first

#### React Router Template (Handles Automatically)
```javascript
export const action = async ({ request }) => {
  const { shop, session, topic } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  return new Response();
};
```

#### Manual Verification
```javascript
const crypto = require('crypto');
app.use(express.raw({ type: '*/*' }));
app.post('*', (req, res) => {
  const shopifyHmac = req.headers['x-shopify-hmac-sha256'];
  const calculated = crypto.createHmac('sha256', clientSecret).update(req.body).digest('base64');
  const valid = crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(shopifyHmac));
  if (!valid) return res.status(401).send('HMAC validation failed');
});
```

### Deduplication
1. Extract `X-Shopify-Webhook-Id` from headers
2. Check persistent store for that ID
3. If exists → skip processing, return 200
4. If new → process, save ID, return 200

**Note**: `X-Shopify-Webhook-Id` is unique per delivery. `X-Shopify-Event-Id` is shared across deliveries from the same merchant action. Use `Webhook-Id` for dedup, `Event-Id` for correlation.

---

## HTTPS Delivery Requirements

### Timing
- **Connection timeout**: 1 second
- **Request timeout**: 5 seconds total
- Must respond `200 OK` within 5 seconds
- Any non-200 response (including 3xx) = error

### Retry Behavior
- Retries 8 times over 4 hours on failure
- After 8 consecutive failures → subscription **auto-deleted** if Admin API-managed
- App-specific subscriptions (TOML) are NOT auto-deleted
- Warning emails sent to emergency developer email

### Best Practices
1. **Respond 200 quickly**, then process asynchronously (use a queue like Better Queue)
2. **Enable HTTP Keep-Alive** on your endpoint
3. **Use Cloud Pub/Sub or EventBridge** for production to avoid these concerns entirely
4. **Relative paths in dev**: `uri = "/webhooks"` — Cloudflare tunnel URL changes each restart
5. **Implement reconciliation jobs** — periodically fetch data via API as backup

---

## Reconciliation Jobs

Shopify **does not guarantee webhook delivery**. Required practices:
- Implement background reconciliation jobs using `updated_at` filter on GraphQL queries
- Offer manual reconciliation button in app UI
- Use `X-Shopify-Triggered-At` header or payload `updated_at` timestamps for ordering (delivery order not guaranteed)

---

## Event Ordering

- Shopify does NOT guarantee ordering within a topic or across topics for the same resource
- `products/update` could arrive before `products/create`
- Use timestamps (`X-Shopify-Triggered-At` or payload `updated_at`) for ordering

---

## Scopes Required for Webhook Topics

Each webhook topic requires a corresponding access scope. See [Webhooks reference](https://shopify.dev/docs/api/webhooks) for full mapping. Common examples:
- `products/create`, `products/update`, `products/delete` → `read_products` or `write_products`
- `orders/create`, `orders/updated`, `orders/delete` → `read_orders` or `write_orders`

Scopes are declared in `[access_scopes]` in TOML.

---

## Mandatory Compliance Topics

Apps distributed through the App Store must subscribe to mandatory compliance webhooks:
- `shop/redact` — 48 hours after uninstall, must delete stored shop data
- `customers/redact` — must delete customer data on request
- `customers/data_request` — must provide customer data on request

These are configured in Dev Dashboard or app config.

---

## Migration: Shop-Specific → App-Specific Subscriptions

1. Query existing shop-specific subscriptions: `webhookSubscriptions` GraphQL query
2. Delete relevant queries, subscription code, and handler code
3. Deploy with `shopify app deploy`
4. Configure app-specific subscriptions in `shopify.app.toml`
5. **Remove existing subscriptions first** to avoid conflicts and duplicate notifications

---

## Testing

```bash
shopify app webhook trigger --api-version=<version> --address=<destination> --topic=<topic-name>
```

| Delivery Method | `--address` Value |
|---|---|
| HTTPS | Your endpoint URL |
| Google Pub/Sub | `pubsub://{project-id}:{topic-id}` |
| Amazon EventBridge | ARN from EventBridge console |
