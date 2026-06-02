# Shopify GraphQL Admin API - Research Notes

## Overview
- Single endpoint: `POST https://{shop}.myshopify.com/admin/api/2026-04/graphql.json`
- REST Admin API is **deprecated** as of October 1, 2024. All new development must use GraphQL.
- Request types: **Queries** (read, like GET) and **Mutations** (write, like PUT/POST/DELETE)
- GraphQL responses always return HTTP 200 (even for errors — errors appear in `errors` array)
- Authentication: `X-Shopify-Access-Token` header (or handled automatically by client libs)

## Global IDs (GIDs)
- Format: `gid://shopify/{ResourceType}/{NumericId}`
- Example: `gid://shopify/Product/10079785100`
- All object references use GIDs, not plain numeric IDs

## Rate Limits (CRITICAL)
| Plan Tier | Points/Second | Single Query Max |
|-----------|---------------|------------------|
| Standard | 100 | 1,000 |
| Advanced | 200 | 1,000 |
| Shopify Plus | 1,000 | 1,000 |
| Commerce Components | 2,000 | 1,000 |

- Uses **calculated query cost** method (not request count)
- Leaky bucket algorithm
- Cost calculation:
  - Scalar/Enum fields: 0 cost
  - Object fields: 1 cost
  - Connection fields: sized by `first`/`last` arguments
  - Mutation: 10 cost base
- **Requested cost** (pre-execution) vs **Actual cost** (post-execution) — bucket refunded the difference
- Response includes cost info under `extensions.cost`:
  ```json
  {
    "extensions": {
      "cost": {
        "requestedQueryCost": 101,
        "actualQueryCost": 46,
        "throttleStatus": {
          "maximumAvailable": 1000,
          "currentlyAvailable": 954,
          "restoreRate": 50
        }
      }
    }
  }
  ```
- Debug header: `Shopify-GraphQL-Cost-Debug=1` for per-field cost breakdown
- **Max input array size: 250** across all APIs

## Resource-Based Rate Limits (for product variants)
- Stores with **50,000+ product variants** are limited to **1,000 new variants per day**
- Applies to: `productCreate`, `productUpdate`, `productVariantCreate`
- Does NOT apply to Shopify Plus stores

## Pagination
- Cursor-based pagination
- Max 250 items per page (standard connections)
- Variants on a single product: can request up to **2,048** via `variants(first: 2048)`
- Pagination limit: 25,000 objects max
- Count queries return 25,001 when there are more than 25,000 items

## Bulk Operations
- For reading/writing large volumes of data asynchronously
- No max cost limits or standard rate limits
- Designed for handling large datasets
- Use `bulkOperationRunQuery` for exports, `bulkOperationRunMutation` for imports
- Important: always prefer bulk operations over single queries for large-scale sync

## Error Handling
- `THROTTLED` — exceeded rate limit
- `ACCESS_DENIED` — bad authentication
- `MAX_COST_EXCEEDED` — query exceeds 1,000 point single-query limit
- `INTERNAL_SERVER_ERROR` — Shopify internal error
- Always query `userErrors` on mutations for detailed error info

## Client Libraries
- React Router: `@shopify/shopify-app-react-router`
- Node.js: `@shopify/shopify-api`
- Ruby: `shopify_api` gem
- Direct API Access: `fetch('shopify:admin/api/2026-04/graphql.json', ...)`
