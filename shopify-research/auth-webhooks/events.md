# Shopify Events Research (Next-Gen Subscription Mechanism)

## Sources:
- https://shopify.dev/docs/apps/build/events
- https://shopify.dev/docs/apps/build/events/subscribe
- https://shopify.dev/docs/apps/build/events-webhooks (comparison)

---

## Status: Developer Preview

- Available on `unstable` API version only
- **NOT for production use yet** — use webhooks for production
- Subset of topics supported (check [Events reference](https://shopify.dev/docs/api/events))
- Events + webhooks can coexist in the same `shopify.app.toml`
- Will become the primary subscription mechanism as topic coverage expands
- Migration guides provided per topic

---

## Key Differentiators: Events vs Webhooks

| Capability | Events | Webhooks |
|---|---|---|
| Configuration | `shopify.app.toml` only | TOML or GraphQL Admin API |
| Topic format | `topic = "Product"` + `actions = ["update"]` | `topics = ["products/update"]` |
| Field filtering | `triggers` — field-level paths | `include_fields` — field subset |
| Delivery gating | `query_filter` — evaluated on query results | `filter` — search syntax |
| Payload shape | Custom GraphQL `query` (any shape) | Fixed REST-shaped payload |
| Per-shop variation | No | Yes (Admin API) |
| Scope | App-specific only | App-specific or shop-specific |

---

## TOML Configuration

### Required Fields
```toml
[events]
api_version = "unstable"

[[events.subscription]]
handle = "unique-handle-name"    # Unique ID, alphanumeric/_/-, max 50 chars
topic = "Product"                # Capitalized GraphQL Admin resource name
actions = ["create", "update", "delete"]  # Lifecycle transitions
uri = "https://your-app.example.com/events"  # Delivery destination
```

### Optional Fields
| Field | Purpose |
|---|---|
| `triggers` | Narrow `update` deliveries to specific field paths |
| `query` | GraphQL query — result appears in `data` of delivery |
| `query_filter` | Expression evaluated on query result after `query` runs |

### Full Example
```toml
[events]
api_version = "unstable"

[[events.subscription]]
handle = "my_product_events"
topic = "Product"
actions = ["update"]
triggers = ["product.variants.price"]
uri = "/events/app/products-update"

query = """
query price_change($productId: ID!, $variantsId: ID!) {
  productVariant(id: $variantsId) {
    id
    price
  }
  product(id: $productId) {
    status
  }
}
"""
query_filter = "product.status:'ACTIVE'"
```

### Delivery Response
```json
{
  "topic": "Product",
  "action": "update",
  "handle": "my_product_events",
  "data": {
    "productVariant": { "id": "gid://shopify/ProductVariant/456", "price": "24.99" },
    "product": { "status": "ACTIVE" }
  },
  "fields_changed": [
    "product[id: 'gid://shopify/Product/123'].variants[id: 'gid://shopify/ProductVariant/456'].price"
  ],
  "query_variables": {
    "productId": "gid://shopify/Product/123",
    "variantsId": "gid://shopify/ProductVariant/456"
  }
}
```

---

## Topics

- `topic` names the GraphQL Admin resource (e.g., `Product`)
- Some child objects don't have their own topic — surfaced through parent
  - Example: `ProductVariant` changes appear under `Product` topic, not a standalone `ProductVariant` topic
- Check [Events reference](https://shopify.dev/docs/api/events) for supported topics

---

## Actions

| Action | Description |
|---|---|
| `create` | Resource created |
| `update` | Resource or owned children changed (narrow with `triggers`) |
| `delete` | Resource deleted |

- `triggers` only apply to `update` actions
- `create` and `delete` are at resource boundary — no field-path narrowing

---

## Triggers (Field-Level Filtering)

- Narrow `update` deliveries to specific field path changes
- Format: dot-notation paths — e.g., `product.variants.price`, `product.tags`
- If omitted: every change to the topic fires a delivery

### Use Cases

**Sync prices with less noise** — only fire on price changes:
```toml
actions = ["update"]
triggers = ["product.variants.price"]
```

**Tag automation without catalog re-sync**:
```toml
actions = ["update"]
triggers = ["product.tags"]
```

---

## Query (Custom Payload Shape)

- Any valid GraphQL query with `$productId` (and other topic-specific) variables
- Result becomes `data` in delivery payload — no follow-up API call needed
- Can include metafields in the delivery:

```graphql
query product_with_metafields($productId: ID!) {
  product(id: $productId) {
    id
    title
    metafield(namespace: "$app", key: "my_key") {
      namespace
      key
      value
    }
  }
}
```

---

## Query Filter (Conditional Suppression)

- Expression evaluated on query result AFTER `query` runs
- Suppresses delivery if condition not met
- Example: only fire for ACTIVE products
  ```
  query_filter = "product.status:'ACTIVE'"
  ```

---

## Verification

Events use the same HMAC verification approach as webhooks:
- Verify HMAC signature on deliveries
- Use `Shopify-Webhook-Id` for deduplication
- HTTPS delivery: respond 200 within timeout

---

## Requirements

- Shopify CLI 3.92 or higher — check with `shopify version`
- Each topic requires a corresponding access scope (see Events reference)
- `api_version` must be `"unstable"` during developer preview

---

## Delivery Pipeline

```
Store Change → Topic Match → Triggers Filter → Query Execution → Query Filter → Delivery
```

If any gate fails (no trigger match, query filter fails), no delivery is sent.

---

## Events + Webhooks Coexistence

```toml
[webhooks]
api_version = "2026-04"

[[webhooks.subscriptions]]
topics = ["products/create"]
uri = "/webhooks/products"

[events]
api_version = "unstable"

[[events.subscription]]
handle = "product-updates"
topic = "Product"
actions = ["update"]
triggers = ["product.variants.price"]
uri = "/events/products"
```

Use webhooks for broad coverage, Events for precise/supported topics. Migrate topic by topic.

---

## When to Use Events Over Webhooks

| Scenario | Best Choice |
|---|---|
| Need full field payloads for all changes | Webhooks |
| Only care about specific field changes | Events (triggers) |
| Need metafields or related data in every delivery | Events (custom query) |
| Topic not yet supported in Events | Webhooks |
| Need per-shop subscription variation | Webhooks (Admin API) |
| Want to reduce handler complexity | Events (filtering in config) |
| Production app | Webhooks |
| Early testing / future-proofing | Events |

---

## Migration: Webhooks → Events

1. Check if topic is supported in [Events reference](https://shopify.dev/docs/api/events)
2. Add Events subscription alongside existing webhook in `shopify.app.toml`
3. Test both run side-by-side
4. Remove webhook subscription once Events subscription confirmed working
5. Detailed migration guide per topic at: `https://shopify.dev/docs/apps/build/events/migrate-from-webhooks`
