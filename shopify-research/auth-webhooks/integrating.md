# Shopify Admin Integration Best Practices

## Source: https://shopify.dev/docs/apps/build/integrating-with-shopify

---

## Overview

For **Built for Shopify** status eligibility, apps must follow these guidelines. These are mandatory criteria for meeting the Built for Shopify achievement standards.

---

## Four Core Requirements

### 1. Keep Primary App Workflows Within Shopify

- All primary workflows must be completable inside the Shopify admin (no external site required)
- Use the latest version of [App Bridge](https://shopify.dev/docs/api/app-home)
- Merchants should never need to leave the admin for core functionality

**Examples of primary workflows that MUST stay in-admin:**
- Setup and configuration
- Status dashboards
- Day-to-day operational features
- Settings pages

**Exception**: Apps with functionality exceeding admin capabilities (ad buying, ERP) are allowed to have standalone sites, BUT must still keep setup, configuration, status, and dashboards in the admin.

**Example**: Shopify Inbox — chat settings, automated replies, and notification config live in the admin, but the continuous conversation inbox is an external site (since merchants need to monitor it alongside other admin tasks).

---

### 2. Enable Seamless Sign Up Based on Shopify Credentials

- Apps must be usable immediately after install — no additional login/sign-up prompt
- Use the merchant's existing Shopify credentials
- **NO secondary login screen** for self-service apps

**Exception**: Apps requiring complex B2B contracts (ad networks, enterprise services) can require separate credentials. However, the first in-admin onboarding step must be a workflow to link the store with existing credentials.

**If offering BOTH self-service and B2B sign-up**: Onboarding must include an option to sign up using Shopify credentials.

---

### 3. Include Simplified Monitoring or Reporting

- Expose key metrics on the app's home page
- If full reporting requires an external site, include a **simplified version** in the Shopify admin
- Helpful metrics for merchants to see at a glance

**Example**: Shopify Search & Discovery shows click rate and purchase rate on the home page

---

### 4. Keep Third-Party Connection Settings Within Shopify

- Any settings/config controlling the connection between Shopify and a third-party system must be available inside the Shopify admin
- Connection health, sync status, troubleshooting controls — all in-admin

---

## Admin Embedding Architecture

### App Bridge
- Latest version recommended
- Provides APIs for admin interactions (modals, toasts, navigation, resource pickers)
- Enables communication between your iframe and the Shopify admin chrome

### Iframe-Based Embedding
- Your app runs in an iframe within the Shopify admin
- Uses session tokens for authentication (not cookies)
- App Bridge APIs for cross-frame communication

### Key Technical Requirements
- **HTTPS**: All app pages must be served over HTTPS
- **Session tokens**: Required for admin-embedded apps (third-party cookies blocked)
- **Responsive**: Must work on mobile devices
- **Polaris components**: Use Shopify's design system for consistent look and feel

---

## App Surface Architecture

From the App Home and integrating docs, the Shopify admin app surface consists of:

1. **Admin Chrome** (Shopify-controlled): Title bar, nav menus, save bars — your app uses App Bridge web components to interact with these
2. **App Surface** (your iframe): Your app's actual UI, built with Polaris web components
3. **APIs**: App Bridge APIs let your app communicate across the iframe boundary

---

## Design Requirements

### Polaris Design System
- Use Polaris web components for buttons, forms, tables, pages
- Follow Shopify's design patterns and layouts
- Maintain visual consistency with the admin

### Mobile Support
- Apps must be responsive and work on mobile devices
- Test on mobile viewports

### Accessibility
- Follow WCAG guidelines
- Use semantic HTML with Polaris components (they handle accessibility)
- Required for Built for Shopify status

---

## Developer Tools

### App Bridge APIs
| API | Purpose |
|---|---|
| Resource Fetching | Make GraphQL Admin API calls directly from frontend |
| Intents API | Launch admin workflows (e.g., create collection) and receive results |
| Toast API | Show feedback notifications |
| Modal API | Open confirmation/prompt dialogs |
| Navigation API | Navigate within admin |
| Scopes API | Request/query/revoke access scopes |
| Title Bar API | Set title, breadcrumbs, action buttons |

### Polaris Web Components
- Standard HTML custom elements
- Work with any framework or vanilla JS
- Include: Layout (Page, Section, Card), Forms (TextField, Select, Button), Data display (DataTable, Badge), Feedback (Banner, Toast), etc.

### App Bridge Web Components
- Render in the admin chrome outside your iframe
- `ui-title-bar` — breadcrumb navigation, status badge, action buttons
- `ui-nav-menu` — navigation menu items
- `ui-save-bar` — save/discard bar

---

## Common Anti-Patterns (DO NOT do)

| Anti-Pattern | Why It's Wrong |
|---|---|
| Opening external URLs for core workflows | Merchants should stay in admin |
| Secondary login page after install | Use Shopify credentials |
| No key metrics on home page | Missing Built for Shopify criteria |
| Configuration only on external site | Third-party settings must be in admin |
| Using cookies for auth | Won't work with third-party cookie blocking |
| Not verifying HMAC on webhooks | Security risk |
| Blocking on webhook processing | Must respond 200 within 5 seconds |
| No reconciliation jobs | Webhook delivery not guaranteed |

---

## Built for Shopify Criteria Summary

For full Built for Shopify status, apps must:
1. Keep primary workflows in Shopify admin
2. Enable seamless Shopify-credential sign up
3. Show simplified monitoring/reporting on home page
4. Keep third-party connection settings in Shopify admin
5. Be accessible (WCAG)
6. Be mobile-responsive
7. Localize the app
8. Follow performance best practices
9. Use non-deceptive code patterns
10. Meet compliance and security requirements
