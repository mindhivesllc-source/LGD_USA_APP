# Shopify Metaobjects - Research Notes

## What Are Metaobjects?
Standalone entities with multiple related fields — unlike metafields (single key-value pairs on existing resources).

**Use metaobjects when you need:**
- Complex data structures with multiple related fields
- Reusable content that can be referenced from multiple resources
- Size charts, author profiles, ingredient lists, warranty information

**Use metafields when you need:**
- A single custom field on an existing Shopify resource (product, customer, order)

## Metaobject Structure
Each metaobject has:
- **ID**: Unique identifier (GID)
- **Handle**: URL-friendly identifier (auto-generated from display name)
- **Display name**: Human-readable name
- **Field values**: Data defined by its metaobject definition
- **Capability states**: Optional (e.g., published/unpublished)

## Two-Tier Architecture (Parallel to Metafields)
1. **Metaobject Definition** (schema) — defines type, fields, access, capabilities
2. **Metaobject** (entry/instance) — the actual data

## Ownership

| Type | Prefix | Created By | Purpose |
|------|--------|------------|---------|
| App-owned | `$app` (GraphQL) or `app` (TOML) | TOML or GraphQL | App-managed entries |
| Merchant-owned | Any non-reserved (e.g., `size_chart`) | GraphQL only | Shared content, editable in Shopify admin |

## Creating an App-Owned Metaobject (TOML)

### Step 1: Define in shopify.app.toml
```toml
[metaobjects.app.author]
name = "Author"
access.admin = "merchant_read_write"
access.storefront = "public_read"

[metaobjects.app.author.fields.full_name]
name = "Full Name"
type = "single_line_text_field"

[metaobjects.app.author.fields.bio]
name = "Biography"
type = "multi_line_text_field"

[metaobjects.app.author.fields.email]
name = "Email"
type = "single_line_text_field"

[metaobjects.app.author.fields.photo]
name = "Profile Photo"
type = "file_reference"
```
Deploy: `shopify app deploy`

### Step 2: Create metaobject entries via GraphQL
```graphql
mutation CreateAuthor {
  metaobjectCreate(metaobject: {
    type: "$app:author"
    fields: [
      { key: "full_name", value: "Jane Smith" }
      { key: "bio", value: "Award-winning author..." }
      { key: "email", value: "jane@example.com" }
      { key: "photo", value: "gid://shopify/MediaImage/123" }
    ]
  }) {
    metaobject { id handle displayName fields { key value } }
    userErrors { field message }
  }
}
```

## Creating a Merchant-Owned Metaobject (GraphQL)

### Step 1: Create definition via GraphQL
```graphql
mutation CreateSizeChartDefinition {
  metaobjectDefinitionCreate(definition: {
    type: "size_chart"
    name: "Size Chart"
    description: "Product sizing information"
    access: { storefront: PUBLIC_READ }
    fieldDefinitions: [
      { key: "size", name: "Size", type: "single_line_text_field" }
      { key: "chest_inches", name: "Chest (inches)", type: "number_decimal" }
      { key: "waist_inches", name: "Waist (inches)", type: "number_decimal" }
      { key: "length_inches", name: "Length (inches)", type: "number_decimal" }
    ]
  }) {
    metaobjectDefinition { id type name }
    userErrors { field message }
  }
}
```

### Step 2: Create entries
```graphql
mutation CreateSizeChartEntry {
  metaobjectCreate(metaobject: {
    type: "size_chart"
    fields: [
      { key: "size", value: "Medium" }
      { key: "chest_inches", value: "38" }
      { key: "waist_inches", value: "32" }
      { key: "length_inches", value: "29" }
    ]
  }) {
    metaobject { id handle displayName fields { key value } }
    userErrors { field message }
  }
}
```

## Permission Model (Same as Metafields)

### App-owned metaobjects:
- `access.admin = "merchant_read"` — merchants can view but not edit (default)
- `access.admin = "merchant_read_write"` — merchants can view and edit

### Merchant-owned metaobjects:
- Always full access — readable and writable by merchants and all apps with appropriate scopes

### Storefront access:
- `access.storefront = "none"` — not accessible via Storefront API (default)
- `access.storefront = "public_read"` — accessible via Storefront API

## Use in Shopify Functions
- App-owned metaobjects with `$app` prefix can be queried in function input queries
- Each `metaobject` root: 1 complexity point
- Each `field(key:)` call: 3 complexity points
- Input query budget: 30 points total
- Merchant-owned types do NOT work in function input queries

## Metaobject Definition: Important Limitations
- Type identifier (e.g., `$app:author`) is immutable after creation
- Only app-owned definitions can be created via TOML
- Merchant-owned definitions MUST be created via GraphQL
- Same ownership rules as metafields apply

## For a Product Sync App
- Metaobjects are **less likely** to be needed unless you're syncing complex structured data (e.g., product specifications, multi-field attribute sets)
- For typical sync use cases (external ID, last sync date, source system info), **metafields are the right tool**
- If syncing product size charts or complex attribute matrices: consider metaobjects
