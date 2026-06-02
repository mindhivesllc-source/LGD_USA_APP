# App Home Surface Research

## Source: https://shopify.dev/docs/apps/build/app-home

---

## What Is App Home?

App Home is the main experience inside the Shopify admin where your app's UI lives. Merchants go here to configure settings, view data, and manage workflows.

---

## Two Build Models

### 1. Iframe Model (Recommended for Most Apps)

| Characteristic | Details |
|---|---|
| Hosting | You host all components |
| Framework | Any web framework (React, Vue, Svelte, vanilla) |
| Bundle size | No limit |
| Browser APIs | Full browser API access |
| Shopify APIs | Full App Bridge APIs + GraphQL Admin API from frontend |
| UI Components | Any web components, including Polaris + App Bridge |
| Distribution | Public and custom |
| Best for | Multi-page apps, server-side logic, webhooks, full web platform |

### 2. UI Extension Model

| Characteristic | Details |
|---|---|
| Hosting | Shopify hosts the extension |
| Framework | Preact only |
| Bundle size | 64 KB compressed |
| Browser APIs | Subset of browser APIs |
| Shopify APIs | Focused set of target APIs + GraphQL Admin API from frontend |
| UI Components | Polaris web components only |
| Distribution | Custom only |
| Best for | Custom-distribution apps with no backend, single-page UIs |

**Migration**: If you outgrow the UI extension model, reauthor as an iframe app. The reverse is not supported.

---

## Iframe Model: Four Building Blocks

### 1. Patterns
Pre-built layouts combining APIs and web components for common screens.

**Two Types:**
- **Templates**: Full-page layouts (homepages, settings, resource index/detail). Use as starting point for familiar admin feel.
- **Compositions**: Smaller groupings solving specific tasks (data tables, empty states, setup guides). Combine inside templates.

**Example**: Setup Guide composition provides progress tracking and collapsible onboarding steps.

### 2. APIs
App Bridge APIs for cross-iframe communication with the admin.

| API | Purpose |
|---|---|
| **Resource Fetching API** | Query GraphQL Admin API directly from frontend code |
| **Intents API** | Launch admin workflows (create collection, add product) and receive results |
| **Toast API** | Show feedback notifications to merchants |
| **Modal API** | Open confirmation/prompt dialogs |
| **Navigation API** | Navigate between app pages, preserve admin context |
| **Scopes API** | Query currently granted scopes, request optional scopes, revoke scopes |
| **Title Bar API** | Configure title bar with breadcrumbs, status badges, action buttons |
| **Save Bar API** | Show save/discard bar for form workflows |

### 3. Polaris Web Components
Standard HTML custom elements matching Shopify admin look and feel.

| Category | Components |
|---|---|
| Layout & Structure | `ui-page`, `ui-section`, `ui-card`, `ui-layout` |
| Forms | `ui-text-field`, `ui-select`, `ui-button`, `ui-checkbox`, `ui-textarea` |
| Data Display | `ui-data-table`, `ui-badge`, `ui-tag`, `ui-resource-item`, `ui-resource-list` |
| Feedback | `ui-banner`, `ui-toast`, `ui-spinner`, `ui-progress-bar` |
| Navigation | `ui-tabs`, `ui-pagination`, `ui-link` |
| Structure | `ui-stack`, `ui-grid`, `ui-inline`, `ui-box` |

These work with any framework or vanilla JavaScript. Follow Web Components standard.

### 4. App Bridge Web Components
Render in admin chrome OUTSIDE your iframe.

| Component | Purpose |
|---|---|
| `ui-title-bar` | Breadcrumb navigation, status badge, action buttons, dropdown menu |
| `ui-nav-menu` | Navigation menu items in admin sidebar |
| `ui-save-bar` | Save/discard bar with confirmation handling |

---

## What You Can Build in App Home

| App Type | Description |
|---|---|
| **Real-time dashboards** | Live analytics from Shopify or your data sources |
| **Custom resource managers** | Browse, filter, act on products/orders/customers/your data |
| **Integration control centers** | Connect external services, monitor sync, troubleshoot |
| **Guided workflows** | Multi-step onboarding, campaign setup, inventory planning |
| **No-backend custom apps** | Single App Home UI extension (custom distribution only) |

---

## Authentication in App Home (Iframe Model)

Based on the auth docs cross-referenced with App Home:

1. App loads in iframe → unauthenticated, renders skeleton UI
2. Frontend calls App Bridge `authenticatedFetch` to get **session token** (JWT)
3. All backend requests include session token in `Authorization` header
4. Backend validates session token using middleware
5. Backend exchanges session token for **access token** via token exchange
6. Access token used for GraphQL Admin API calls from backend

---

## Frontend-to-Backend Data Flow

```
Frontend (iframe)
    │
    ├─ App Bridge authenticatedFetch → session token
    ├─ Send session token to backend in Authorization header
    │
Backend (your server)
    │
    ├─ Validate session token
    ├─ Exchange session token for access token (token exchange)
    ├─ Use access token for Shopify API calls
    ├─ Return data to frontend
    │
Frontend (iframe)
    │
    └─ Render data with Polaris web components
```

**Alternative (lightweight)**: Frontend can query GraphQL Admin API directly using Resource Fetching API (App Bridge), no backend round-trip needed for reads.

---

## Scaffolding an App

```bash
shopify app init
```

Generates boilerplate with:
- Session token authentication configured
- Token exchange implemented
- Shopify managed installation enabled
- Webhook handling set up
- App Home iframe rendering
- Polaris integration

The starter app handles all auth and authorization best practices out of the box.

---

## Page Patterns Reference

Common templates available for iframe apps:

| Pattern | Use Case |
|---|---|
| Homepage template | App landing page with key metrics |
| Settings template | Configuration and preferences |
| Resource index template | List/datatable of resources |
| Resource detail template | View/edit single resource |
| Setup guide composition | Onboarding wizard with progress tracking |
| Data table composition | Sortable, filtered data tables |
| Empty state composition | Shown when no data exists |

---

## UI Extension Model Details

Only for custom-distribution apps:
- Single target: `admin.app.home.render`
- Preact runtime with 64 KB compressed bundle limit
- Uses `shopify.query()` for GraphQL Admin API from frontend
- Limited browser APIs (no localStorage, restricted cookies)
- If you outgrow the constraints, reauthor as iframe app

---

## Anti-Patterns in App Home

- **Don't** use cookies for auth (third-party cookie blocking)
- **Don't** redirect to external pages for core workflows
- **Don't** show secondary login/signup after install
- **Don't** skip HMAC verification on webhooks
- **Don't** block webhook responses (>5 second timeout)
- **Don't** rely solely on webhooks without reconciliation jobs
