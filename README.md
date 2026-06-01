# LGD Jewelry Sync — Shopify App

> Pulls jewelry inventory from the LGD supplier API and publishes it to your Shopify store — with category-aware browsing and smart media handling.

![Shopify App](https://img.shields.io/badge/Shopify-App-96BF48?style=flat-square) ![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=flat-square) ![DeepSeek v4](https://img.shields.io/badge/AI-DeepSeek_v4-5865F2?style=flat-square)

---

## About the Project

This app connects a Shopify store to the LGD supplier API and syncs jewelry products automatically. Products are categorised on ingestion — rings, bracelets, necklaces, earrings, pendants, and more — so store owners can browse by category in the Shopify admin and verify what has synced and where.

Because Shopify's Basic plan does not support embedded video, any product video is surfaced as an external link button that opens the supplier's video URL in a new tab. No embedded player, no broken iframes.

---

## Why It Exists

Manual product entry for large diamond jewelry catalogs is slow and error-prone. This app treats the supplier's inventory as the single source of truth — every sync overwrites stale data and surfaces new SKUs automatically. No copy-pasting, no missed updates.

---

## Features

- **Automated sync** — polls the supplier API on a configurable schedule (default: every 6 hours)
- **Category detection** — classifies products into Rings, Bracelets, Necklaces, Earrings, Pendants, and Others using the `jewelry_type` field and title keyword matching
- **Full field mapping** — maps SKU, price, metal type, diamond specs, setting, size, and more to Shopify product fields and metafields
- **Video support** — stores video URLs in a metafield and renders a "Watch Video" button that opens in a new tab (Basic plan compatible)
- **Idempotent updates** — syncs check by SKU; existing products are updated, new ones are created, delisted ones are archived
- **Manual sync CLI** — run `npm run sync` any time to force an immediate full sync

---

## Supported Categories

| Category   | Matched On                        |
|------------|-----------------------------------|
| Rings      | `jewelry_type: RING`              |
| Bracelets  | `jewelry_type: BRACELET`          |
| Necklaces  | `jewelry_type: TENNIS / NECKLACE` |
| Earrings   | `jewelry_type: EARRING`           |
| Pendants   | `jewelry_type: PENDANT`           |
| Others     | Everything else                   |

---

## Sample Product

```
SKU:            TJ7112NHW
Title:          Tennis Necklace 14KW DEF VS2 HPHT Dia 45.72 cts
Price:          $11,705
Jewelry Type:   TENNIS NECKLACE
Metal Type:     14KW
Shape:          ROUND
Color:          DEF
Clarity:        VS2
Diamond Pieces: 91
Total Ct Wt:    45.72
Gross Wt:       50.65
Type:           HPHT
Size:           19"
Setting:        4 PRONG
Video:          [Opens in new tab via supplier link]
```

---

## Field Mapping — Supplier API → Shopify

```js
// Supplier API response → Shopify product fields
{
  "sku"          → "variants[0].sku"
  "title"        → "title"
  "price"        → "variants[0].price"
  "jewelry_type" → "product_type"        // Used for category filtering
  "metal_type"   → "tags[]"
  "color"        → "tags[]"
  "clarity"      → "tags[]"
  "total_ct_wt"  → "metafields.diamond_ct_wt"
  "video_url"    → "metafields.video_url" // Rendered as external link button
  "gross_wt"     → "metafields.gross_wt"
  "setting"      → "metafields.setting"
  "size"         → "variants[0].option1"
}
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Shopify integration | Shopify Admin API (REST + GraphQL) |
| Backend | Node.js with cron scheduler |
| Supplier data | LGD Supplier REST API |
| AI classification | DeepSeek v4 (category & title normalisation) |
| Extended fields | Shopify Metafields |
| Video | External URL — opens in new tab |

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/your-org/lgd-shopify-sync
cd lgd-shopify-sync
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in your credentials (see Environment Variables below).

### 3. Run a manual sync

```bash
npm run sync
```

### 4. Start the scheduler

```bash
npm start
```

---

## Environment Variables

```env
SHOPIFY_STORE=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxx
SUPPLIER_API_BASE=https://api.lgdusallc.com
SUPPLIER_API_KEY=your_api_key
SYNC_INTERVAL_HOURS=6
VIDEO_OPEN_IN_NEW_TAB=true
```

---

## Known Constraints

| Constraint | Detail |
|---|---|
| No video embed | Shopify Basic does not support native video on product pages. Videos are surfaced via an "Watch Video" button that opens the supplier link in a new tab. |
| Sync latency | New supplier products appear on the next scheduled cycle. Use `npm run sync` for an immediate update. |
| Shopify API rate limits | Bulk syncs use exponential backoff on 429 responses. Large catalogs may take several minutes on first run. |

---

## Project Structure

```
lgd-shopify-sync/
├── src/
│   ├── sync/
│   │   ├── fetchSupplier.js      # Pulls data from supplier API
│   │   ├── mapFields.js          # Supplier → Shopify field mapping
│   │   ├── classify.js           # Category detection (DeepSeek v4)
│   │   └── pushToShopify.js      # Shopify Admin API write layer
│   ├── scheduler.js              # Cron job runner
│   └── index.js                  # Entry point
├── .env.example
├── package.json
└── README.md
```

---

## Contact

Built for **LGD USA LLC × Theia Jewels** · Managed by **Mindhives**

- Email: info@lgdusallc.com
- Phone: +1-212-921-0118
- Web: lgdusallc.com