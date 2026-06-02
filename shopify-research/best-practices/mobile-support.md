# Mobile Support Requirements — Shopify Docs Findings

> Source: https://shopify.dev/docs/apps/build/mobile-support

---

## Responsive Design (NON-NEGOTIABLE)

### UI Must Adapt
- App UI must **automatically adjust** to fit smaller mobile screens.
- Must ensure a **consistent experience on any device**.
- Prioritize **vertical scroll** over horizontal scroll.
- **Avoid horizontal scrolling elements** if at all possible.

---

## Core Feature Availability (NON-NEGOTIABLE)

### All Core Functionality Must Work on Mobile
- The **core functionality** of your app or theme must be available using a mobile device.
- If any features are NOT available on mobile, the app **must notify users** of this limitation.

---

## Seamless Setup (Best Practice)

### Theme Integration
- Apps requiring theme setup **must use theme app extensions**:
  - **App blocks** for themes.
  - **App embed blocks** for automatic inclusion.
- This prevents merchants from needing to **manually edit theme code**.

### Onboarding
- Configuration and onboarding should be **easy to follow**.
- Setup should **primarily take place inside the app** (not on external websites).
- **Minimize external web property redirects** post-installation.

---

## Additional Mobile Performance Considerations

From the general performance guide and storefront performance pages:

### Viewport Meta Tag
```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```
- **Always include this** to avoid double-rendering in WebViews (Shopify Mobile app).
- If missing, Shopify injects it but causes UI to render twice.

### Bundle Size
- Minified **JavaScript bundle should be ≤ 16KB**.
- App entry point: ≤ 10KB JS, ≤ 50KB CSS on a page.

### Responsive Images & Assets
- Host assets on **Shopify CDN** for globally distributed, cached delivery.
- Use lazy loading for images.
- Use `defer`/`async` for script tags to avoid parser-blocking.

### App Listing Screenshots
- If your app is mobile-responsive or works with POS, **include mobile screenshots** in your App Store listing.
- Screenshots: 1600px × 900px (16:9 ratio).

---

## Mobile-Specific Requirements Summary

| Requirement | Type |
|---|---|
| Responsive UI (auto-adjust to screen size) | Hard |
| Vertical scroll prioritized | Hard |
| No horizontal scroll | Hard (avoid if possible) |
| Core features work on mobile | Hard |
| Notify users of mobile limitations | Hard |
| Use theme app extensions for setup | Best practice |
| Setup inside app, not external sites | Best practice |
| Include viewport meta tag | Hard (for WebView) |
| JS bundle ≤ 16KB | Best practice |
| Include mobile screenshots in listing | Best practice |
