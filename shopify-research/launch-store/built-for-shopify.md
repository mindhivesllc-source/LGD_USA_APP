# Built for Shopify Requirements - Complete Checklist

Source: https://shopify.dev/docs/apps/launch/built-for-shopify/requirements

## 1. PREREQUISITES

### 1.1 General
- **(1.1.1)** Meet App Store requirements — must continue to meet all [requirements for distributing apps on the Shopify App Store](https://shopify.dev/docs/apps/launch/app-requirements-checklist)
- **(1.1.2)** Have a good Partner standing — comply with Partner Program Agreement and Shopify API License and Terms of Use. No active or outstanding infractions.

### 1.2 Merchant Utility
- **(1.2.1)** Minimum 50 net installs from active shops on paid plans
- **(1.2.2)** Minimum 5 reviews
- **(1.2.3)** Meet a minimum recent app rating threshold in Shopify App Store

## 2. PERFORMANCE

### 2.1 Admin Performance (Web Vitals at 75th percentile)
- **(2.1.1)** LCP (Largest Contentful Paint) ≤ 2.5 seconds (min 100 calls over 28 days)
- **(2.1.2)** CLS (Cumulative Layout Shift) ≤ 0.1 (min 100 calls over 28 days)
- **(2.1.3)** INP (Interaction to Next Paint) ≤ 200ms (min 100 calls over 28 days)
- Must use latest version of App Bridge for Web Vitals gathering

### 2.2 Storefront Performance
- **(2.2.1)** Must not reduce storefront Lighthouse performance score by more than 10 points

### 2.3 Checkout Performance
- **(2.3.1)** Checkout requests: p95 ≤ 500ms, failure rate ≤ 0.1% (min 1000 requests over 28 days)

## 3. INTEGRATION

### 3.1 Embedded Apps
- **(3.1.1)** Embed the app in Shopify admin using latest App Bridge (`app-bridge.js` in `<head>`). Use session token authentication. Do NOT embed external web pages.
- **(3.1.2)** Keep primary app workflows within Shopify admin. Merchants should complete primary workflows without external websites.
- **(3.1.3)** Enable seamless sign-up based on Shopify credentials. No additional login/sign-up required. Start using immediately after install.
- **(3.1.4)** Include simplified monitoring or reporting — expose key metrics on the app's home page.
- **(3.1.5)** Keep third-party connection settings within Shopify admin.

### 3.2 Installation and Asset Management
- **(3.2.1)** Provide clean uninstallation — use theme app extensions (blocks auto-removed on uninstall).
- **(3.2.2)** Don't use Asset API to create/modify/delete theme files. Exceptions: page builders, theme backup/restore, SEO/content-locking tools (can read but not write).

## 4. DESIGN

### 4.1 Familiar (looks and behaves like Shopify admin)

**(4.1.1) Follow UX best practices** — UI must mimic Shopify core look/feel.
REJECTION REASONS:
1. Buggy/unpolished UI (flickering, excessive layout shifts)
2. Content not in card-like containers
3. Buttons don't match Polaris (e.g. green/purple instead of Shopify blue)
4. Serif/script fonts for majority of content
5. Body text size significantly different from Shopify admin
6. Background color significantly different (e.g. black background)
7. Tabs modifying content above them
8. Icons inconsistently applied in groups/lists
9. Layout spacing significantly different from Shopify
10. Text doesn't meet **WCAG 2.1 AA** contrast requirements
11. Sub-page missing back button to parent

**(4.1.2) Mobile-friendly** — responsive design that adapts to all screen sizes.
REJECTION REASONS:
1. Horizontal scrolling required on mobile
2. Content entirely inaccessible on mobile (collapsed, no wrap/scroll)
3. Content unreasonably condensed (two-column stays two-column on mobile)

**(4.1.3) Concise app name** — must not truncate in Shopify nav menu.
REJECTION: App name truncated with ellipsis when pinned on desktop.

**(4.1.4) Use the nav menu** — use App Bridge `s-app-nav` for primary navigation.
REJECTION REASONS:
1. App has own navigation menu instead of Shopify admin nav
2. Sub-page fails to highlight parent nav item
3. Separate nav item duplicating app homepage link
4. Emojis in Shopify admin nav menu

**(4.1.5) Use the contextual save bar** — forms saved via App Bridge CSB.
REJECTION REASONS:
1. Form doesn't integrate with CSB when reasonable
2. Can navigate away without Save/Discard interaction

**(4.1.6) Use modals appropriately** — use `heading`, `primary-action`, `secondary-actions` slots.
REJECTION REASONS:
1. Modal action buttons outside component slots
2. Using deprecated Polaris Fullscreen bar

### 4.2 Helpful (works well, easy to use)

**(4.2.1) Spelling, grammar and phrasing** — clear, proper language.
REJECTION REASONS:
1. Prominent spelling/grammatical errors in headings, nav, CTAs
2. Phrases/labels that lack context (e.g. "Time" without unit)

**(4.2.2) Helpful onboarding** — concise, guides merchants to core functionality.
REJECTION REASONS:
1. Onboarding doesn't guide to completion
2. Onboarding not concise
3. Onboarding difficult to locate (collapsed, out of view)
4. Implying additional app install is required step
5. Asking for info without justification
6. No way to remove onboarding UI after completion

**(4.2.3) Helpful homepage** — shows if app is set up and working, with metrics.
REJECTION REASONS:
1. Fails to communicate theme extension activation status
2. Fails to include helpful metrics/analytics on homepage
3. Homepage only contains static content after dismissing all dismissible elements

**(4.2.4) Helpful error messages** — red, contextual, guides to solutions.
REJECTION REASONS:
1. Error auto-disappears (e.g. toast fading after 5s)
2. Error color other than red
3. Red field highlight without error message
4. Error not displayed contextually (e.g. at top instead of near field)
5. Errors displayed before any merchant interaction

**(4.2.5) Guide merchants to logical actions** — most logical action visually dominant.
REJECTION REASONS:
1. All buttons have same visual treatment
2. Most prominent button isn't most logical action

**(4.2.6) Visible previews** — real-time preview for visual customizations.
REJECTION REASONS:
1. No live-preview when customizing visuals
2. Can't simultaneously view editor + preview on desktop

### 4.3 User-friendly (no dark patterns, no deception)

**(4.3.1) Don't make false claims** — no guaranteed outcomes.
REJECTION REASONS:
1. Language stating merchant outcome (e.g. "increase sales by 18%")
2. Promoting another app with false star rating

**(4.3.2) Don't pressure merchants** — no timers, guilt/shame language, no 5-star review rewards.
REJECTION REASONS:
1. Animated countdown timer pushing upgrade
2. Guilt-inducing CTAs (e.g. "No thanks, I prefer less sales")

**(4.3.3) Don't distract merchants** — no unnecessary animations, auto-modals, popovers.
REJECTION REASONS:
1. Modal/popover auto-appearing on load or timer
2. Large element dramatically animating into view
3. Attention-drawing animation unrelated to user action (e.g. wiggle)
4. Red used for non-error/non-destructive purposes

**(4.3.4) Don't overwhelm merchants** — no poorly organized forms, walls of text, multiple banners.
REJECTION REASONS:
1. Single large unsubdivided form
2. Two+ banners in close proximity
3. Large blocks of text instead of concise/scannable copy

**(4.3.5) Don't impersonate Shopify** — don't look like first-party Shopify apps.
REJECTION REASONS:
1. Icon could be mistaken for first-party Shopify app
2. Using Shopify Sidekick icon or "magic purple" for AI features

**(4.3.6) Dismissible ads** — all promotional content must be dismissible.
REJECTION REASONS:
1. Promotional content not dismissible
2. Dismissible content reappears later

**(4.3.7) Label and disable premium features** — gated features visually+functionally disabled with clear labels. Plus-exclusive features hidden from non-Plus.
REJECTION REASONS:
1. Plan-gated feature interactive and visually enabled until submission
2. Plan-gated feature interactive but visually disabled
3. Plan-gated feature non-interactive but visually enabled
4. Plus features visible to non-Plus merchants
5. Unclear which tier unlocks which feature

## 5. CATEGORY-SPECIFIC REQUIREMENTS

### 5.1 Ads Apps
- Use Web Pixel extensions (no script tags/manual JS)
- Use Shopify segments with customer segment action extension

### 5.2 Affiliate Program Apps
- Must use Web Pixel extensions

### 5.3 Analytics Apps
- Must use Web Pixel extensions

### 5.4 Carrier Services Apps
- Respond to rate requests in <500ms at p95 (min 1000 requests/28 days)
- Complete rate requests at 99.9% reliability

### 5.5 Discount Apps
- Use discount functions OR native discount APIs
- Do NOT use draft orders for custom discounts
- Use `discountRedeemCodeBulkAdd` for multi-code discounts
- High quality links from Create discount button to embedded app page

### 5.6 Email Marketing Apps
- Use Web Pixel extensions
- Sync customer data to/from Shopify
- Use Shopify segments with customer segment action extension
- Use visitors API to log identifying info

### 5.7 Forms Apps
- Use Shopify segments with customer segment action extension
- Use visitors API
- Sync customer data to/from Shopify

### 5.8 Fulfillment Services Apps
- Actively fulfilled 100+ fulfillment orders in 28 days
- Complete 99% of assigned fulfillment orders
- Respond to 99% of callback requests successfully
- Only fulfill after merchant requests
- Add tracking info to 80% of fulfillments within 1 hour
- Respond to 99% of fulfillment requests within 4 hours
- Respond to 99% of cancellation requests within 1 hour

### 5.9 Invoices and Receipts Apps
- Use admin print action extension for order printing

### 5.10 Product Bundles Apps
- Use bundles primitives (GraphQL Admin API for static, cartTransform for customized)

### 5.11 Product Reviews Apps
- Provide Flow trigger for new review collected
- Provide admin block extension on customer detail pages

### 5.12 Returns and Exchanges Apps
- Sync returns lifecycle events to Shopify via appropriate APIs
- Include exchange line items
- Include shipping and restocking fees

### 5.13 SMS Marketing Apps
- Use Web Pixel extensions
- Sync customer data
- Use Shopify segments with customer segment action extension
- Use visitors API

### 5.14 Subscription Apps
- Use subscription objects and APIs (Selling plan, Subscription contract, Customer payment method)
- Use theme app block extensions for product detail pages
- Follow subscriptions UX guidelines
- Use Customer Account UI extensions
