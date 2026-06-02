# Shopify Product Merchandising - Research Notes

## Product Model (Three-Tier Hierarchy)
```
Product (container: title, description, vendor)
  └── Options (characteristics: Color, Size)
        └── OptionValues (Red, Green, Small, Large)
              └── Variants (specific purchasable SKUs: Red/Small, Green/Large)
```
- Each variant has its own: price, inventory, barcode, SKU
- GID format: `gid://shopify/Product/{id}`, `gid://shopify/ProductVariant/{id}`

## Required OAuth Scopes
- **`write_products`** — for creating/updating products, variants, options
- **`write_files`** — for product media/images

## Two Workflows for Managing Products

### 1. Incremental Mutations (Shopify is source of truth)
Use when you need targeted changes:

| Operation | Mutations |
|-----------|-----------|
| Products | `productCreate`, `productUpdate` |
| Options | `productOptionsCreate`, `productOptionUpdate`, `productOptionsReorder`, `productOptionsDelete` |
| Variants | `productVariantsBulkCreate` (up to 2,048), `productVariantsBulkUpdate`, `productVariantsBulkDelete` (up to 250), `productVariantsBulkReorder` |
| Collections | `collectionCreate`, `collectionUpdate`, `collectionDelete` |
| Media | `fileCreate`, `productReorderMedia`, `productDeleteMedia`, `productVariantAppendMedia`, `productVariantDetachMedia` |

### 2. Declarative Sync (External system is source of truth) — **RECOMMENDED FOR SYNC APPS**
Use `productSet` mutation:
- Replaces **complete product state** in one operation
- Creates OR updates (upsert pattern)
- **Not a merge** — options/variants not in input are REMOVED
- Non-option fields (description, tags) are left unchanged if omitted, updated if included
- Supports synchronous mode (returns immediately) and asynchronous mode (returns operation ID, poll for completion)
- **Exempt from variant creation limits**
- Must include product ID in input to update existing product; omit to create new

#### Synchronous `productSet` Example:
```graphql
mutation setProductSync {
  productSet(
    synchronous: true,
    input: {
      title: "My Cool Product",
      productOptions: [{
        name: "Color",
        values: [{ name: "Red" }, { name: "Green" }, { name: "Blue" }]
      }],
      variants: [
        { optionValues: [{ optionName: "Color", name: "Red" }] },
        { optionValues: [{ optionName: "Color", name: "Green" }] },
        { optionValues: [{ optionName: "Color", name: "Blue" }] }
      ]
    }
  ) {
    product { id title options { id } variants(first: 100) { edges { node { id } } } }
    userErrors { field message }
  }
}
```

#### Asynchronous `productSet` + Polling:
```graphql
# Step 1: Initiate
mutation setProduct {
  productSet(synchronous: false, input: { id: "gid://shopify/Product/1", title: "Updated", ... }) {
    productSetOperation { id status }
    userErrors { field message }
  }
}

# Step 2: Poll (status: CREATED → COMPLETE or FAILED)
query productSetOperation {
  productOperation(id: "gid://shopify/ProductSetOperation/1") {
    ... on ProductSetOperation {
      id status
      product { id title }
      userErrors { code field message }
    }
  }
}
```

## Finding Products by Variant SKU (CRITICAL FOR SYNC)

Use the `productVariants` query with the `query` filter parameter:

### Exact SKU match:
```graphql
query {
  productVariants(first: 10, query: "sku:XYZ-12345") {
    edges {
      node {
        id
        title
        sku
        product { id title }
      }
    }
  }
}
```

### Wildcard SKU (prefix match):
```graphql
query {
  productVariants(first: 10, query: "sku:element*") {
    edges {
      node {
        id
        title
        sku
        product { id title }
      }
    }
  }
}
```

### Other useful query filters:
- `product_id:8474977763649` — variants for a specific product
- `product_ids:8474977763649,8474977796417` — variants for multiple products
- `barcode:ABC-abc-123` — by barcode
- `title:ice` — by variant title
- `updated_at:>2020-10-21T23:39:20Z` — by last update time
- `inventory_quantity:10` — by inventory level
- `managed_by:shopify` — by fulfillment service
- Combined filters: `"sku:XYZ* AND published_status:published"`

**Search syntax**: supports `AND`, `OR`, wildcards (`*`), comparison operators (`:>`, `:>=`, `:<`, `:<=`)

## Updating Variants (Without Creating Duplicates)

### CORRECT approach for sync apps:
1. **Look up existing variant by SKU** using `productVariants(query: "sku:...")`
2. If found: use variant's GID with `productVariantsBulkUpdate` or use `productSet` with product ID
3. If not found: create new product with `productSet` (upsert) or `productCreate`

### productSet behavior (critical for avoiding duplicates):
- When `id` is provided in input → updates existing product, replaces all variants
- When `id` is omitted → creates new product
- If you include a variant with a specific option combination that already exists on the product, `productSet` handles it (replaces state)

### Batch variant operations:
- `productVariantsBulkCreate`: up to 2,048 variants in one call
  - Using `REMOVE_STANDALONE_VARIANT` strategy: all 2,048 slots available
  - Without: 2,047 (one slot reserved for auto-created standalone variant)
- `productVariantsBulkUpdate`: update multiple variants at once
- `productVariantsBulkDelete`: up to 250 at a time

## Product Image/Media Handling
- Upload files via `fileCreate` mutation (to Shopify CDN)
- Associate with products via `productCreate`/`productUpdate`/`productSet`
- Reorder: `productReorderMedia`
- Remove association: `productDeleteMedia`
- Variant-specific media: `productVariantAppendMedia`, `productVariantDetachMedia`
- Media types: images, videos, 3D models (all under `File` interface)

## Deprecation Notices
- REST Admin API: deprecated October 1, 2024
- `publishable_status` filter: deprecated as of 2025-12, use `published_status` instead
- Current latest API version: `2026-04`
