# Shopify Metafields - Research Notes

## What Are Metafields?
Key-value pairs with components:
- **Identifier**: namespace + key (e.g., `custom.warranty_info`)
- **Value**: the stored data
- **Type**: defines how the value is interpreted (single_line_text_field, json, number_integer, etc.)

## Two-Tier Architecture (Critical)
Metafields have two layers:
1. **Metafield Definition** (schema) — defines namespace, key, type, validations, access control
2. **Metafield** (value) — the actual data, stored on a Shopify resource

You MUST have a definition before you can store typed metafield values.

## Metafield Ownership Types

| Type | Namespace | Created By | Editable By |
|------|-----------|------------|-------------|
| App-owned | `$app` (GraphQL) or `app` (TOML) | App (TOML or GraphQL) | App controls definition; value access configurable via `access.admin` |
| Merchant-owned | Any non-reserved (e.g., `custom`) | GraphQL only | Merchants + all apps |
| App-data | Any (stored on `AppInstallation`) | GraphQL only | Only owning app; hidden from Shopify admin |
| Standard | Shopify-reserved (e.g., `facts.isbn`) | Shopify pre-defined | Merchant-owned values |

## Creating Definitions

### TOML (app-owned, version-controlled):
```toml
# shopify.app.toml
[product.metafields.app.last_synced]
name = "Last Synced"
description = "When this product was last synchronized with external system"
type = "date_time"
access.admin = "merchant_read_write"
```

### GraphQL (merchant-owned or dynamic):
```graphql
mutation CreateMerchantOwnedDefinition {
  metafieldDefinitionCreate(definition: {
    namespace: "product_details"
    key: "warranty_info"
    name: "Warranty Information"
    type: "multi_line_text_field"
    ownerType: PRODUCT
    access: { storefront: PUBLIC_READ }
  }) {
    createdDefinition { id namespace key }
    userErrors { field message }
  }
}
```

### TOML Limits:
- 128 metafield definitions per owner type (app-scoped)
- 25 changes per deploy
- Read-only through Admin API (mutations will error)
- Smart collections capability NOT supported in TOML

## UPSERT Pattern for Metafields (CRITICAL)

### `metafieldsSet` — THE upsert mutation:
> "Sets metafield values. Metafield values will be set regardless if they were previously created or not."

- **Maximum 25 metafields per call**
- **Maximum 10MB total request payload**
- **Atomic** — no changes persist if any error occurs

```graphql
mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields {
      key namespace value createdAt updatedAt compareDigest
    }
    userErrors { field message code }
  }
}
```

Variables:
```json
{
  "metafields": [
    {
      "key": "last_sync_date",
      "namespace": "$app",
      "ownerId": "gid://shopify/Product/20995642",
      "type": "date_time",
      "value": "2026-06-01T10:00:00Z"
    }
  ]
}
```

### Compare-and-Set (CAS) via `compareDigest` (since 2024-07):
```json
{
  "metafields": [
    {
      "key": "materials",
      "namespace": "my_fields",
      "ownerId": "gid://shopify/Product/20995642",
      "type": "multi_line_text_field",
      "value": "95% Cotton\n5% Spandex",
      "compareDigest": "fd6b73725c9e83da2d2bcfaf90b27305b9058a48a1565639aa00d718d4caf8e8"
    },
    {
      "key": "manufactured",
      "namespace": "my_fields",
      "ownerId": "gid://shopify/Product/20995642",
      "type": "single_line_text_field",
      "value": "Made in Canada",
      "compareDigest": null
    }
  ]
}
```
- For existing metafields: set `compareDigest` to the current digest (acquired by querying `compareDigest` field)
- For new metafields: set `compareDigest` to `null` to ensure no race condition
- If digest doesn't match: mutation returns error (no overwrite)

### Setting metafields inline with product mutations:
```graphql
mutation {
  productUpdate(input: {
    id: "gid://shopify/Product/123456789"
    metafields: [{
      namespace: "$app"
      key: "internal_sku"
      value: "INV-2024-COTTON-001"
      type: "single_line_text_field"
    }]
  }) {
    product { id }
    userErrors { field message }
  }
}
```
- Metafields auto-update if namespace/key combination already exists
- Can pass array of metafields inline

## Reading Metafields

### Fetch all metafields on a product (with pagination):
```graphql
query {
  product(id: "gid://shopify/Product/1234567890") {
    metafields(first: 10) {
      edges { node { namespace key value type } }
    }
  }
}
```

### Get specific metafield by namespace/key:
```graphql
query {
  product(id: "gid://shopify/Product/1234567890") {
    warranty: metafield(namespace: "product_details", key: "warranty_info") {
      value
    }
  }
}
```

### Filter by namespace:
```graphql
query {
  product(id: "gid://shopify/Product/1234567890") {
    productDetails: metafields(namespace: "product_details", first: 20) {
      edges { node { key value } }
    }
  }
}
```

## Deleting Metafields
```graphql
mutation DeleteMetafield {
  metafieldsDelete(metafields: [{
    ownerId: "gid://shopify/Product/1234567890"
    namespace: "product_details"
    key: "warranty_info"
  }]) {
    deletedMetafields { key namespace ownerId }
    userErrors { field message }
  }
}
```

## Metafield Limits

### Definition limits:
| Limit | Value |
|-------|-------|
| App definitions per resource type | 256 |
| Merchant definitions per resource type | 256 |
| Pinned definitions per resource type | 20 |
| TOML app-scoped definitions per owner type | 128 |
| TOML changes per deploy | 25 |

### Size limits:
| Type | Size Limit |
|------|-----------|
| Most types | 64KB (65,536 bytes) |
| `json` | 128KB (2MB grandfathered for pre-April 2026 apps) |
| `id` | 2KB |
| `url` | 2KB |
| List types | 128 items (256 for metaobject references) |
| Single line text choices | 128 values |

### Capability limits:
| Capability | Max |
|------------|-----|
| Smart collections filter | 128 |
| Admin filter on Products/Companies/Locations/Metaobjects | 50 |
| Admin filter on Orders | 5 |

## Namespace Conventions (Best Practices)
- **App-owned**: Use `$app` (GraphQL) or `app` (TOML) — Shopify reserves this
- **Merchant-owned**: Use descriptive names like `product_details`, `shipping_settings`, `specs`
- **Standard**: Shopify-reserved like `facts.isbn`, `descriptors.subtitle`
- Use **sub-namespaces** for grouping related fields
  - TOML: `[product.metafields.analytics.lifetime_value]` creates namespace `app--{id}--analytics`
  - GraphQL: `namespace: "$app:analytics"`

## Validation Best Practices
- Add validations gradually — start loose, tighten as needed
- Tightening validations may fail if existing metafields violate new constraint
- Common validations: `max_length`, `min`, `max`, `regex`, `choices`
- Query `metafieldDefinitionTypes` to see which validations each type supports

## Required OAuth Scopes
- Depends on owner type: `write_products` for product metafields, `write_customers` for customer metafields, etc.
- `metafieldsSet` requires the same access as mutating the owner resource directly

## Error Handling
| Error | Cause | Solution |
|-------|-------|----------|
| "Value is invalid for type" | Wrong format for type | Check type formats |
| "Validation failed" | Value doesn't meet validation rules | Check definition's validation constraints |
| "Type mismatch" | Type doesn't match definition | Use exact type from definition |
| "JSON parse error" | Invalid JSON format | Validate and escape JSON properly |
| `TAKEN` | Namespace/key already in use | Query existing definitions first |

## Definitions: Immutable Properties
- **Type**: CANNOT be changed after creation
- **Namespace/key**: CANNOT be changed (immutable) — create new definition and migrate
- **Owner type**: CANNOT be migrated

## Definitions: Mutable Properties
- Name and description: yes
- Validations: yes (with limits)
- Access permissions: yes
