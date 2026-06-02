# App Structure Guidelines

**Source:** https://shopify.dev/docs/apps/design/app-structure

## App Anatomy (6 parts)
1. Shopify admin
2. App nav
3. App header
4. Page header
5. Overflow menu
6. App body

## Required Polaris Components & Patterns
- App navigation — strictly configured (see navigation guidelines)
- App body — where main experience lives (see layout guidelines)
- **App window** — for focused immersive tasks (complex editors, image editing, previews)

## Layout Rules
- App body must follow layout guidelines
- Admin blocks: content must be **< 600px** in height (use pagination if needed)
- Admin actions: avoid content exceeding **1200px**, max 2 steps of pagination
- App window launches from app body only (NOT from app nav) — **App Store requirement**
- App window must prompt to save unsaved changes before exit

## Admin UI Extensions
Four types: Admin block, Admin action, Admin link, Bulk action

### Admin Blocks
- Embed in Product, Order, Customer detail pages
- Input fields must be visible at all times
- Must have empty state explaining what the block does
- Must work with contextual save bar via form component
- **Hard requirement:** Cannot display promotions, advertisements, app reviews — **App Store requirement**

### Admin Actions
- Can have unlimited admin actions
- Use for discrete purposes only
- Avoid duplicating content with admin blocks

## Hard Requirements for Design Compliance
- App window must NOT launch from app nav (launch from app body only)
- Admin UI extensions cannot display promotions/advertisements/reviews
- App blocks must be < 600px height
- App blocks must show empty states
- Input fields must always be visible in app blocks
- Avoid FullscreenBar inside app window (redundant dismiss mechanism)
