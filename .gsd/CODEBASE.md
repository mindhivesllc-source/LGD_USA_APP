# Codebase Map

Generated: 2026-06-05T20:29:40Z | Files: 91 | Described: 0/91
<!-- gsd:codebase-meta {"generatedAt":"2026-06-05T20:29:40Z","fingerprint":"aa7b21d94f0fcc64a27de2b7b924162c5d400960","fileCount":91,"truncated":false} -->

### (root)/
- *(21 files: 7 (no ext), 3 .js, 3 .md, 3 .json, 2 .toml, 1 .example, 1 .cjs, 1 .ts)*

### app/
- `app/db.server.js`
- `app/entry.server.jsx`
- `app/root.jsx`
- `app/routes.js`
- `app/shopify-admin-url.server.js`
- `app/shopify.server.js`

### app/routes/
- `app/routes/api.products.jsx`
- `app/routes/api.settings.jsx`
- `app/routes/api.sync.jsx`
- `app/routes/app._index.jsx`
- `app/routes/app.jsx`
- `app/routes/app.onboarding.jsx`
- `app/routes/app.privacy.jsx`
- `app/routes/app.products.jsx`
- `app/routes/app.settings.jsx`
- `app/routes/auth.$.jsx`
- `app/routes/webhooks.app.products_update.jsx`
- `app/routes/webhooks.app.scopes_update.jsx`
- `app/routes/webhooks.app.uninstalled.jsx`

### app/routes/_index/
- `app/routes/_index/route.jsx`
- `app/routes/_index/styles.module.css`

### app/routes/auth.login/
- `app/routes/auth.login/error.server.jsx`
- `app/routes/auth.login/route.jsx`

### extensions/
- `extensions/.gitkeep`

### prisma/
- `prisma/schema.prisma`

### prisma/migrations/
- `prisma/migrations/migration_lock.toml`

### prisma/migrations/20240530213853_create_session_table/
- `prisma/migrations/20240530213853_create_session_table/migration.sql`

### prisma/migrations/20260601182035_add_sync_run/
- `prisma/migrations/20260601182035_add_sync_run/migration.sql`

### prisma/migrations/20260601190000_add_settings_table/
- `prisma/migrations/20260601190000_add_settings_table/migration.sql`

### prisma/migrations/20260602154759_add_manual_edit/
- `prisma/migrations/20260602154759_add_manual_edit/migration.sql`

### shopify-research/
- `shopify-research/FIX_ROADMAP.md`

### shopify-research/auth-webhooks/
- `shopify-research/auth-webhooks/app-home.md`
- `shopify-research/auth-webhooks/authentication.md`
- `shopify-research/auth-webhooks/events.md`
- `shopify-research/auth-webhooks/integrating.md`
- `shopify-research/auth-webhooks/webhooks.md`

### shopify-research/best-practices/
- `shopify-research/best-practices/compliance.md`
- `shopify-research/best-practices/mobile-support.md`
- `shopify-research/best-practices/non-deceptive.md`
- `shopify-research/best-practices/performance.md`
- `shopify-research/best-practices/security.md`

### shopify-research/design-ux/
- `shopify-research/design-ux/app-structure.md`
- `shopify-research/design-ux/content.md`
- `shopify-research/design-ux/layout.md`
- `shopify-research/design-ux/navigation.md`
- `shopify-research/design-ux/overview.md`
- `shopify-research/design-ux/ux-alerts.md`
- `shopify-research/design-ux/ux-app-home.md`
- `shopify-research/design-ux/ux-forms.md`
- `shopify-research/design-ux/ux-onboarding.md`
- `shopify-research/design-ux/visual-design.md`

### shopify-research/launch-store/
- `shopify-research/launch-store/accessibility.md`
- `shopify-research/launch-store/build-guide.md`
- `shopify-research/launch-store/built-for-shopify.md`
- `shopify-research/launch-store/cli-reference.md`
- `shopify-research/launch-store/launch-overview.md`
- `shopify-research/launch-store/localization.md`
- `shopify-research/launch-store/scaffolding.md`

### shopify-research/product-api/
- `shopify-research/product-api/extensions.md`
- `shopify-research/product-api/graphql.md`
- `shopify-research/product-api/metafields.md`
- `shopify-research/product-api/metaobjects.md`
- `shopify-research/product-api/product-merchandising.md`

### src/
- `src/index.js`
- `src/scheduler.js`
- `src/syncState.js`

### src/sync/
- `src/sync/classify.js`
- `src/sync/fetchSupplier.js`
- `src/sync/mapFields.js`
- `src/sync/pushToShopify.js`
