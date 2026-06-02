# Navigation Patterns

**Source:** https://shopify.dev/docs/apps/design/navigation

## Required Polaris Components & Patterns
- **App nav** web component — primary navigation in sidebar (desktop) or header (mobile)
- **Page** web component / **TitleBar** — app header, page title, actions, overflow menu

## Navigation Elements (3 display areas)
1. **App nav** — sidebar navigation
2. **App header** — app icon, name, page title, actions, overflow menu
3. **Page title** — describes general purpose of page

## Information Architecture Rules
- Use **fewest possible categories** to define what your app does
- Rely on app nav + app body relationship to guide merchants
- Merchants must be able to **return to previous page without browser button** — use breadcrumbs or Back button
- **Never send merchants outside Shopify admin** for key actions or primary workflows
- App nav tabs: use sparingly for secondary navigation only
  - Clicking a tab changes content below it only, not above
  - Tabs must not wrap onto multiple lines
  - Navigating between tabs must not change tab position

## App Nav Rules
- Navigation items: **short and scannable**
- Use **nouns instead of verbs** for navigation menu items
- **Max 7 items** visible — items 8+ truncated into "View more"
- **Never replicate app nav content in the app body** (unnecessary repetition)
- **Never place main navigation in page header** (reserved for in-page actions)

## App Name Rules
- **Max 20 characters** — longer names truncated
- No descriptions in app name (put in App Store listing)
- Can be shorter than App Store name to fit nav

## App Home (Hard Requirement)
- App URL in Dev Dashboard must point to app homepage
- App name in nav must link to homepage
- **Never duplicate app homepage URL in navigation**

## Page Title & Actions
- Page title: short, describes general purpose
- Each page: limit to **single purpose**
- Primary/secondary button labels:
  - {verb}+{noun} format
  - Clarity and predictability
  - Action-led with strong verb

## Overflow Menu (Non-Customizable)
Contains: "About this app" and "Support"
On mobile: pin option collapsed into overflow menu

## Mobile-Responsive Requirements
- App nav: sidebar on desktop, header on mobile
- Overflow menu includes pin on mobile

## Hard Requirements for Design Compliance
- Max 7 app nav items before truncation
- App name max 20 characters
- Never send merchants outside Shopify admin for key workflows
- App homepage URL must not be duplicated in nav
- Never replicate app nav in app body
- Never place main navigation in page header
