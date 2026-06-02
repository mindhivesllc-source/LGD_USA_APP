# LGD Jewelry Sync — Fix Roadmap

Research completed 2026-06-01 from Shopify Dev Docs by 5 parallel agents (32 files, 3,656 lines).

---

## CRITICAL — Fix Now (data loss / app broken)

### C1. ~~SKU Lookup Broken~~ → FIXED (deploy pending)
- Shopify REST `products.json` does NOT support `?sku=` query param. It silently ignores it, returns first product.
- **Fix applied**: Switched to `productVariants(query: "sku:SKU")` GraphQL query.
- **Deploy in progress.**

### C2. ~~Sync Blocks HTTP Request~~ → FIXED (deploy pending)  
- Dashboard "Sync Now" ran 1,922-product loop inside Remix action handler.
- **Fix applied**: Action now calls `runSync()` fire-and-forget, returns immediately.
- **Deploy in progress.**

### C3. ~~`state.isRunning` Never Reset~~ → FIXED (deploy pending)
- After first sync, all subsequent cron/scheduler calls blocked forever.
- **Fix applied**: `isRunning: false` set in `finally` block.

### C4. Use `productSet` Instead of REST API (NEW — most impactful fix)
**Problem**: Current code uses REST API for product push. Shopify recommends `productSet` GraphQL mutation for external sync apps:
- **True upsert**: Creates or updates in one operation
- **Exempt from variant creation limits** (REST has 1,000/day cap on Standard)
- **Declarative**: Replaces complete product state (correct for "supplier is source of truth")
- **Supports async mode**: Initiate + poll for large catalogs (no timeout)
- **Eliminates 2 API calls per product** (no separate SKU lookup + update/create)
- **Single GraphQL call** = ~10 cost points instead of 8+ REST calls

**Impact**: ~90% reduction in API calls. 1,922 products would cost ~19,220 GraphQL points (11,920 calls currently). At 100 pts/sec, sync completes in ~3 min instead of ~2+ hours.

```graphql
# Replace entire pushToShopify with:
mutation {
  productSet(synchronous: true, input: {
    title: "Tennis Necklace 14KW DEF VS2 HPHT Dia 45.72 cts"
    productOptions: [{ name: "Size", values: [{ name: "19\"" }] }]
    variants: [{
      sku: "TJ7112NHW"
      price: "11705.00"
      optionValues: [{ optionName: "Size", name: "19\"" }]
      inventoryQuantities: [{ availableQuantity: 1, locationId: "gid://..." }]
    }]
    metafields: [
      { namespace: "lgd", key: "total_ct_wt", value: "45.72", type: "single_line_text_field" },
      { namespace: "lgd", key: "video_url", value: "https://...", type: "single_line_text_field" }
      # ... up to 25 per productSet call
    ]
    # TOML defines must exist for metafields (see M2)
  }) {
    product { id title }
    userErrors { field message }
  }
}
```

### C5. SQLite DB is Ephemeral → DATA LOSS on Redeploy
**Problem**: `prisma/schema.prisma` uses `file:dev.sqlite` — the file lives on the container, destroyed on every restart/redeploy. All OAuth sessions and sync history are lost.

**Fix**: Mount a Railway volume at `/app/prisma`:
```bash
railway volume add --mount-path /app/prisma
```
Then update `schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:/app/prisma/dev.sqlite"
}
```

---

## HIGH — Fix This Week (compliance / reliability)

### H1. `SUPPLIER_API_KEY` in Railway Env → Must Be in DB Settings Only
**Problem**: `SUPPLIER_API_KEY=26869a19...` is visible in Railway dashboard. The app does read from DB settings, but the env var fallback exposes the key.

**Fix**: Remove `SUPPLIER_API_KEY` from Railway environment variables. Keep only in DB `setting` table. Update `fetchSupplier.js`:
```js
// Remove fallback: || process.env.SUPPLIER_API_KEY
// DB query is the only source
```

### H2. No Rate Limit Monitoring
**Problem**: `pushToShopify.js` retries on 429 but does not read `extensions.cost.throttleStatus` from GraphQL responses. Cannot predict when bucket will be full.

**Fix**: After each GraphQL call, read `throttleStatus.currentlyAvailable`. Slow down when < 50% capacity. Log `restoreRate` for monitoring.

### H3. Scheduler Runs on Wrong Cron
**Problem**: `0 */6 * * *` means "at minute 0, every 6 hours" (midnight, 6am, noon, 6pm). The first sync may wait up to 6 hours after deploy.

**Fix**: Run `runSync()` immediately on startup, then schedule:
```js
runSync() // immediate first run
cron.schedule(`0 */${hours} * * *`, runSync)
```

### H4. Metafields Need Definitions Before Values
**Problem**: Code creates metafield values via REST POST without ensuring definitions exist. Shopify requires definitions first for typed metafields.

**Fix**: Add metafield definitions to `shopify.app.toml`:
```toml
[product.metafields.app.total_ct_wt]
name = "Total Diamond Weight"
type = "single_line_text_field"
access.admin = "merchant_read"

[product.metafields.app.video_url]
name = "Video URL"
type = "url"
access.admin = "merchant_read"

[product.metafields.app.gross_wt]
name = "Gross Weight"
type = "single_line_text_field"
access.admin = "merchant_read"

[product.metafields.app.setting]
name = "Setting Type"
type = "single_line_text_field"
access.admin = "merchant_read"

[product.metafields.app.diamond_pcs]
name = "Diamond Pieces"
type = "single_line_text_field"
access.admin = "merchant_read"

[product.metafields.app.certificate]
name = "Certificate"
type = "single_line_text_field"
access.admin = "merchant_read"
```

### H5. Banner Colors Wrong for Sync Status
**Problem**: Dashboard uses `tone="info"` for "Sync in progress..." — correct. But uses `tone="success"` for completion ✅ and `tone="critical"` for errors ✅. Per Shopify guidelines: info=blue, success=green (only with CTA), critical=red. Current usage matches.

**Issue**: Success banner auto-dismisses after showing. Shopify requires success banners have a CTA or don't use them. Consider replacing success banner with a Toast for "Sync complete!" (toast at bottom center, max 3 words, success only per Shopify rules).

---

## MEDIUM — Fix This Month (quality / UX)

### M1. Migrate Metafields to `metafieldsSet`
**Problem**: REST POST/PUT per metafield = 6 extra API calls per product. `metafieldsSet` supports up to 25 per call, atomic, true upsert.

**Fix**: Include metafields in `productSet` input (up to 25), or use `metafieldsSet` in batches of 25.

### M2. No Webhook Integration
**Problem**: If a merchant edits a product in Shopify admin, next sync won't know it was changed and could overwrite manual edits.

**Fix**: Register `PRODUCTS_UPDATE` webhook. On webhook fire, skip that SKU in the next sync, or flag it for review.

### M3. Dashboard "Categories" Card Shows `—` Instead of Counts
**Problem**: The category count card shows "—" for all categories. Counts could be fetched from Shopify via `productVariantsCount` grouped by `product_type`.

**Fix**: Poll Shopify for product counts by type and populate the card.

### M4. Missing Accessibility Attributes
**Problem**: Shop per research:
- No `lang` attribute checked on `<html>`
- No skip link
- Touch targets < 44×44px on mobile (buttons)
- No `prefers-reduced-motion` support
- No `aria-live` for dynamic content updates (sync status)

**Fix**: Audit all routes for WCAG 2.1 AA compliance (required for Built for Shopify).

### M5. No `productSet` Async Mode for Large Catalogs
**Problem**: Even with `productSet`, 1,922 synchronous mutations still run sequentially. Async mode (`synchronous: false`) returns immediately and polls for completion — no timeout risk.

**Fix**: For catalogs > 100 items, use async mode:
```js
const { productSetOperation: { id } } = await shopifyFetch("graphql.json", {
  body: JSON.stringify({
    query: `mutation($input: ProductSetInput!) {
      productSet(synchronous: false, input: $input) {
        productSetOperation { id status }
        userErrors { field message }
      }
    }`,
    variables: { input }
  })
})
// Then poll: productOperation(id: "...") until COMPLETE
```

---

## LOW — Polish (pre-Built for Shopify submission)

### L1. Add Setup Wizard / Onboarding
Must guide merchant to core functionality immediately after install (Built for Shopify 4.2.2).

### L2. Add Privacy Policy Link
Required for App Store listing.

### L3. Mobile Layout Audit
Ensure no horizontal scrolling, cards stack properly, touch targets ≥ 44px.

### L4. Add `aria-live` Region for Sync Status
Announce sync completion/errors to screen readers.

### L5. Localization
Built for Shopify requires at least English, auto-translation covers 8 languages. String externalization not yet implemented.

---

## Summary of API Changes Needed

| Current | Should Be | Why |
|---------|-----------|-----|
| REST `products.json?sku=X` | GraphQL `productVariants(query:"sku:X")` | SKU filter not supported in REST |
| REST `POST products/X/meta-fields` | GraphQL `metafieldsSet` | True upsert, atomic, batched |
| REST `POST/PUT products/X.json` | GraphQL `productSet` | Declarative sync, exempt from limits |
| Inline sync in action handler | Background `runSync()` fire-and-forget | Request timeout |
| SQLite in container FS | SQLite on Railway volume | Data survives redeploy |
| No rate limit awareness | Monitor `throttleStatus` | Avoid hitting rate limits |
| No webhooks | `PRODUCTS_UPDATE` webhook | Avoid overwriting manual edits |

---

## Estimated Effort

| Tier | Items | Est. Time |
|------|-------|-----------|
| Critical | C4, C5 | 3-4 hours |
| High | H1-H5 | 4-6 hours |
| Medium | M1-M5 | 6-8 hours |
| Low | L1-L5 | 8-10 hours |
| **Total** | | **21-28 hours** |
