# Shopify App Extensions - Research Notes

## What Are App Extensions?
A mechanism that lets an app add features to specific Shopify user interfaces (Admin, POS, Checkout, etc.). Extensions surface app functionality inside Shopify's UI rather than requiring users to switch to an external app page.

**Important**: An app extension is NOT an app — it's an add-on that extends where an app appears.

## App Surfaces (Where Extensions Can Live)
- Admin (product pages, order pages, etc.)
- App Home
- Checkout
- Customer accounts
- Flow
- Online store
- Point of Sale (POS)
- Sidekick

## Configuration
- Extensions are configured via `shopify.extension.toml` files in the `extensions/` directory
- Generated automatically via `shopify app generate extension`
- All extensions are versioned as part of a single app version

## Versioning & Deployment
- App configuration + all extensions → versioned together as a single "app version"
- Deploy: `shopify app deploy`
- Releasing replaces the current active version (can take minutes to propagate)
- Can revert to previous versions
- API versions follow Shopify's versioning policy (12-month minimum support)
- CLI prevents deploys targeting API versions older than 12 months

## Key Limits
- **UI extensions**: strict 64 KB compressed size limit
- Bundle size can be analyzed via esbuild metafile (`.metafile.json`) with `shopify app build`
- Use [esbuild bundle analyzer](https://esbuild.github.io/analyze/) to visualize

## Extension-Only Apps
- Apps made entirely of extensions — no developer-hosted backend required
- Include an App Home UI extension for the main page
- Can only be installed with **custom distribution** (not public App Store)
- Useful for simple tools, field managers, configuration panels

## Reviews & Approvals
- Some extensions require review before release
- Cannot release app version until approved
- Check the [list of extension types](https://shopify.dev/docs/apps/build/app-extensions/list-of-app-extensions) for review requirements

## Removing Extensions
- Can be removed or temporarily disabled
- Learn: [Remove an app extension](https://shopify.dev/docs/apps/build/app-extensions/remove-app-extension)

## Authentication & Rate Limits
- Extensions use the SAME authentication and rate limits as the app
- No separate rate limit or auth for extensions

## Relevance to Product Sync App
- Admin link extensions can add actions on product pages (e.g., "Sync Now", "Re-sync from ERP")
- Product-level admin extensions can display sync status
- For a pure backend sync app: extensions are optional but useful for giving merchants visibility/control
- An App Home UI extension provides a dashboard/config page hosted by Shopify (no backend needed)
