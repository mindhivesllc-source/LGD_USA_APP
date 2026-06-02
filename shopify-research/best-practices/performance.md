# Performance Optimization — Shopify Docs Findings

> Source: https://shopify.dev/docs/apps/build/performance and sub-pages

---

## API Rate Limits (Exact Numbers)

### GraphQL Admin API — Calculated Query Cost (Leaky Bucket)

| Plan Tier | Points/second (restore rate) |
|---|---|
| Standard Shopify | 100 points/sec |
| Advanced Shopify | 200 points/sec |
| Shopify Plus | 1,000 points/sec |
| Shopify for Enterprise (Commerce Components) | 2,000 points/sec |

- **Bucket model**: Leaky bucket algorithm. Each request adds "marbles" (points) to a bucket; 1 marble drains per second per point of restore rate.
- **Throttle response**: `429 Too Many Requests` when bucket overflows.
- **Single query max cost**: 1,000 points (hard cap, enforced before execution on requested cost).
- **Maximum input array size**: 250 items for any array-accepting input argument.
- **Pagination limit**: 25,000 objects maximum; count queries cap at 25,001.

### GraphQL Response Throttle Metadata

```json
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
```

- **`requestedQueryCost`**: Calculated pre-execution from field composition.
- **`actualQueryCost`**: Calculated post-execution; may be lower due to fewer edges returned.
- **Refund**: Bucket is refunded the difference between requested and actual cost after execution.
- **Debug header**: `Shopify-GraphQL-Cost-Debug=1` returns per-field cost breakdown.

### Payments Apps API Rate Limits

| Plan Tier | Points/second |
|---|---|
| Standard / Advanced | 27,300 points/sec |
| Shopify Plus | 54,600 points/sec |
| Enterprise | 109,200 points/sec |

### Customer Account API Rate Limits

| Plan Tier | Points/second |
|---|---|
| Standard | 100 points/sec |
| Advanced / Plus | 200 points/sec |
| Enterprise | 400 points/sec |

### Storefront API

- **No rate limits** on requests from real buyers.
- Rate-limiting applies to automated traffic (bots, crawlers). Anonymous bots receive strictest limits.
- `430 Shopify Security Rejection` returned for suspected malicious requests.
- **Checkout-level throttle**: Limit on checkouts created per minute; returns `200 Throttled` on breach.

### Resource-Based Rate Limits

- Stores with **50,000+ product variants**: max **1,000 new variants per day** (not applicable to Shopify Plus).
- Applies to: `productCreate`, `productUpdate`, `productVariantCreate` mutations.

### Field Cost Defaults (GraphQL)

| Field returns | Cost |
|---|---|
| Scalar | 0 |
| Enum | 0 |
| Object | 1 |
| Interface | Max of possible selections |
| Union | Max of possible selections |
| Connection | Sized by `first`/`last` args |
| Mutation | 10 |

- Shopify reserves the right to set manual overrides on any field cost.

---

## Exponential Backoff & Retry Strategy

- **Recommended backoff time**: 1 second minimum.
- Queue API requests; stagger them for smooth distribution.
- Stop making requests until enough time passes; include error-catching code.
- For checkout throttles: implement a **request queue with exponential backoff**.

---

## Bulk Operations

- **No max cost limits or rate limits** on bulk operations (separate from single queries).
- Use for large data sets instead of paginating through 25,000+ objects.

---

## Performance Optimization Patterns

### GraphQL vs REST
- GraphQL is the primary API; REST Admin API is legacy.
- Use GraphQL's calculated cost system to minimize point consumption (request only needed fields).

### Bundle Size Requirements
- **JS entry point**: ≤ 10KB on a page.
- **CSS**: ≤ 50KB on a page.
- **Minified JS bundle**: ideally ≤ 16KB.
- Load non-critical resources on interaction (import-on-interaction pattern).

### App Store Performance Requirements (NON-NEGOTIABLE)
- App must **not reduce Lighthouse performance scores by more than 10 points**.
- Weighted average across: Home (17%), Product Details (40%), Collection (43%).
- Test with Horizon theme on clean install using PageSpeed Insights.

### Built for Shopify — Admin Performance Criteria (MANDATORY)

| Metric | Threshold | Over |
|---|---|---|
| Largest Contentful Paint (LCP) | ≤ 2.5 sec | 28 days |
| Cumulative Layout Shift (CLS) | ≤ 0.1 | 28 days |
| Interaction to Next Paint (INP) | ≤ 200 ms | 28 days |

- All must be met **75% of the time** over a 28-day period.
- Requires latest App Bridge script for Web Vitals collection.

### Storefront Performance Patterns
- Use **theme app extensions** — never edit theme code directly.
- Host assets on **Shopify CDN** via the `file` GraphQL resource.
- Use **app embed blocks** to load scripts only on pages where needed.
- Add `<meta name="viewport" content="width=device-width, initial-scale=1">` to avoid double-render in WebViews.
- Use `defer`/`async` on script tags; never parser-blocking.
- Stylesheets after inline JavaScript (not before).
- Avoid heavy frameworks (React, Angular, Vue, jQuery) on storefront.
- Use CSS over JavaScript where possible.
- Wrap JS in IIFE to prevent namespace collisions from minifiers.

### Checkout (Shipping Rate Apps)
- **Parallelize** external carrier calls.
- **Cache carrier rates** with pattern-based keys.
- Implement **backup rates** to avoid blocking checkout on external timeout.
- Set internal timeouts to cancel slow external requests.

### OAuth Optimization
- Use **token exchange** grant type (not authorization code grant) — eliminates multiple redirects.
- Use Shopify CLI-managed app configuration for automatic managed installation.
- Use the React Router app template which pre-implements OAuth correctly.
