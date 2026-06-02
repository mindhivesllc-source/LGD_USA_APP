# Building Your First App Guide

Source: https://shopify.dev/docs/apps/build/build

## What You Build
A QR code generator app:
- Creates QR codes linked to products
- QR codes redirect to product page or checkout
- Tracks scan count per QR code
- Exposes scan metrics to app user

## Key Technologies Used

### Core Stack
- **React Router** (v7 framework mode) — routing, loaders, actions
- **Shopify App Bridge** — admin integration, save bar, resource picker, navigation
- **Web Components** (`s-page`, `s-button`, `s-text-field`, etc.) — UI that matches Shopify admin
- **GraphQL Admin API** — data operations
- **Metaobjects** — custom data storage in Shopify (not external DB)

### Key Packages
- `@shopify/shopify-app-react-router` — authentication and admin API client
- `qrcode` — QR code generation
- `@shopify/polaris-icons` — icons
- `tiny-invariant` — error throwing in loaders

## Architecture Patterns

### Data Model (Shopify Metaobjects)
- Define in `shopify.app.toml` under `[metaobjects.app.*]`
- Fields: title, product (reference), product_variant (reference), destination, scans
- Access: `admin = "merchant_read_write"`
- auto-created on dev store when `shopify app dev` runs

### Access Scopes
- `write_metaobject_definitions`
- `write_metaobjects`
- `write_products`

### Route Structure
- `app/routes/app.jsx` — layout route for authenticated admin pages
- `app/routes/app._index.jsx` — index/listing page
- `app/routes/app.qrcodes.$id.jsx` — QR code form (dynamic segment, `$id=new` for new)

### Authentication Pattern
- `authenticate.admin(request)` in every loader/action
- Returns `{ admin, session }` with `admin.graphql` client
- Handles redirects for unauthenticated users automatically

### Form State Management
- `useLoaderData` → `initialFormState` (only changes on submit)
- `useActionData` → errors from validation
- Local state for `formState` (tracks unsaved changes)
- `isDirty` flag for save bar enable/disable

### Key App Bridge Integrations
- **ResourcePicker** — product selection modal
- **Contextual Save Bar** (`shopify.saveBar`) — standardized save/discard
- **Navigation** — via `s-app-nav` linked to Shopify admin nav

### Web Components Used
- Layout: `s-page`, `s-section`, `s-box`, `s-grid`, `s-stack`
- Typography: `s-heading`, `s-paragraph`, `s-text`
- Forms: `s-text-field`, `s-select`
- Actions: `s-button`, `s-link`, `s-clickable`
- Media: `s-image`, `s-icon`
- Data: `s-table`, `s-table-row`, `s-table-cell`
- Feedback: `s-badge`

## Code Organization
- `/app/models/QRCode.server.js` — all data logic (get, save, delete, validate QR codes)
- `/app/routes/app.qrcodes.$id.jsx` — form for create/edit/delete
- `/app/routes/app._index.jsx` — QR code list with empty state
- Helper functions: `truncate()`, `slugify()`, `generateHandle()`

## Best Practices Demonstrated
1. All primary workflows within Shopify admin (no external pages)
2. Session token authentication (no third-party cookies)
3. Web components for admin-consistent UI
4. CSB for form saves
5. Empty states with clear CTAs
6. Breadcrumb navigation
7. Real-time previews (QR code image updates)
8. Two-column form layout (form + aside preview)
9. Error messages returned to form contextually
10. Delete with confirmation flow
