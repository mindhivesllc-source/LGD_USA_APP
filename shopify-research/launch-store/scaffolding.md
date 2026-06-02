# App Scaffolding Best Practices

Source: https://shopify.dev/docs/apps/build/scaffold-app

## What the Official Template Sets Up

### Template Choice
- **React Router template** is the recommended path for most apps (`shopify app init` → "Build a React Router app")
- Alternative: **Extension-only template** for simple custom-distribution apps with no server-side logic
- Simple integrations needing only API credentials: Use Dev Dashboard directly (no CLI scaffold)

### What `shopify app init` Creates
- Full React Router app project structure
- Shopify CLI installed with all dependencies
- Partner Dashboard app record linked to local code
- Prisma SQLite database for application storage
- Cloudflare tunnel for HTTPS local dev access

### What `shopify app dev` Does
- Guides through login to developer account (Partner or merchant with permissions)
- Creates app in Dev Dashboard and connects local code
- Creates Prisma SQLite database
- Creates tunnel between local machine and dev store
- Watches for file changes and hot-reloads

## Project Structure
The React Router template sets up:

### Configuration
- `shopify.app.toml` — app configuration with client_id, name, URL, scopes, webhooks, auth settings
- `embedded = true` — enables embedding in Shopify admin

### Key Files/Directories
- `app/routes/` — React Router route modules
- `app/routes/app.jsx` — Layout route for authenticated admin routes, configures App Bridge and web components
- `app/models/` — Server-side data models (e.g. QRCode.server.js)
- `app/shopify.server.js` — Shopify authentication utilities
- `translations/` — Localization files

### Built-in Features
- **Authentication**: `@shopify/shopify-app-react-router` for session token auth
- **GraphQL Admin API**: Built-in client for data queries/mutations
- **App Bridge**: Web components for Shopify-native UI
- **Webhooks**: Pre-configured `app/uninstalled` and `app/scopes_update` subscriptions
- **Database**: Prisma SQLite for app storage
- **Dev tunnel**: Cloudflare TryCloudflare for HTTPS during development

### Built-in Dependencies
- `@shopify/shopify-app-react-router` — auth and admin API client
- `@shopify/polaris-icons` — icon library
- App Bridge web components (`s-page`, `s-button`, `s-text-field`, etc.)
- Session token authentication

## Workflow
1. `shopify app init` → creates project
2. `shopify app dev` → starts dev server with tunnel
3. Press `p` → opens preview URL in browser
4. Click "Install app" → installs on dev store
5. Develop features, changes hot-reload

## Requirements
- User with app development permissions
- Dev store created
- Latest Shopify CLI
- Latest Chrome or Firefox
