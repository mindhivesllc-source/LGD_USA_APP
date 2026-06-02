# Accessibility Requirements

Source: https://shopify.dev/docs/apps/build/accessibility

## WCAG Level Required
- Based on **WCAG 2.0 / 2.1 Guidelines**
- **WCAG 2.1 AA** contrast requirements are explicitly enforced in BFS Design requirements (4.1.1, rejection reason #10)

## Four WCAG Principles

1. **Perceivable** — Information and UI must be presentable to users in ways they can perceive
2. **Operable** — UI components and navigation must be operable
3. **Understandable** — Information and UI operation must be understandable
4. **Robust** — Content must be interpretable by assistive technologies

## Testing Tools
- Accessibility Insights for Web
- Lighthouse
- WAVE

## Keyboard and Gesture Controls

### Keyboard Support
- Focus indicator visible and consistent on active elements (mouse AND keyboard)
- Focus style visible on desktop when using keyboard
- No mouse-hover-dependent functionality
- Tab / Shift+Tab works for navigation
- No sudden context changes when element receives focus

### Gesture Support
- Pinch-to-zoom always available
- Complex multi-finger gestures must have single-tap/click alternative

## Page Structure

### Global
- `lang` attribute set on `<html>` element for screen reader accent/dialect
- Viewport zoom enabled (no `maximum-scale` or `user-scalable=no`)
- Skip link available and visible when focused (`tabindex="-1"` on main content)
- Linear content flow, no `tabindex` > 0, no `autofocus`

### Headings
- Use HTML heading elements (`h1`-`h6`)
- Headings used in sequence for logical order (not for design)
- `h1` identifies main topic of page

### Navigation
- Navigation wrapped with `<nav>` element
- `aria-current` used for current page
- No `role="menu"` or `role="menuitem"` for navigation

### Drop-down Menu Navigation
- `aria-expanded` for collapsible state
- `aria-controls` for hidden container
- `aria-current` for current location
- Enter/Space opens menu, Tab moves to first item
- Esc collapses and returns focus

### Controls
- `<a>` for links (navigation, new pages, focus shift)
- `<button>` for on-screen actions (modals, sorting)
- Link destination clear from text alone
- New-window links include visual icon with alt text warning

### Tables
- `<table>` for tabular data
- `<caption>` to identify table
- `<th>` with `scope="col"` or `scope="row"`

### Forms
- All form fields have labels (`aria-label`, `.visuallyhidden`, floating, or visible)
- Labels use `for` attribute
- Required inputs have `required` attribute
- Fields use `autocomplete` attribute

### Form Errors
- Focus placed on feedback message
- Errors communicated to screen readers ASAP
- Error messages clear and descriptive
- `aria-describedby` on inputs referencing error container
- Notifications/errors/success announced via `aria-live`

## Media

- Respect `prefers-reduced-motion` browser setting
- Native HTML media controls with toggle state
- Pause media with Space key

### Images and Icons
- All `<img>` have `alt` attribute (screen readers announce file path otherwise)
- Product/content images have descriptive alt text
- Decorative images use `alt=""`

### Video
- Closed captions available
- Descriptive audio available
- Auto-playing video muted
- Videos with audio not visually obstructed
- Space key to pause/play

### Audio
- Transcripts available
- Auto-playing audio can be paused

## Color and Contrast
- **WCAG 1.4.3: Contrast (Minimum) Level AA**
- Use contrast ratio tools to verify
- BFS requirement 4.1.1 explicitly rejects apps not meeting WCAG 2.1 AA contrast

## Dynamic Components

### Drawers and Modals
- Focus moves to element labeling drawer/modal when opened
- Keyboard stays within open drawer/modal
- Esc closes and returns focus to launcher
- Role `dialog` for modals

### Slideshows
- Auto-playing content can be paused/stopped
- Next/previous buttons for navigation

## Touch Screens and Mobile Devices
- **Touch targets must be at least 44×44 pixels** for primary controls:
  - Main menu links (all levels)
  - Submit buttons (contact, comment, search, add to cart)
  - Menu buttons (cart, hamburger)
  - Close buttons (modals)
  - Product page variants (color, size, quantity)

## Next Steps from Shopify
- Review [Polaris accessibility guidelines](https://polaris.shopify.com/foundations/accessibility)
- Learn [keyboard accessibility design](https://www.shopify.com/partners/blog/keyboard-accessibility)
