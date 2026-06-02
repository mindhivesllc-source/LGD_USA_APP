# Visual Design Rules

**Source:** https://shopify.dev/docs/apps/design/visual-design

## Required Polaris Components & Patterns
- **Polaris** — unified system for building admin interfaces (mandatory for fitting into admin)
- **Text** component — streamlines typography
- **Icon** component — or create custom icons following Polaris icon guidelines
- **Admin UI extensions** — blend seamlessly with admin UI
- App Home workflows must follow Polaris — otherwise merchant experience breaks between app and extensions

## Color Requirements

### Semantic Color Usage
| Color | Meaning | Do | Don't |
|-------|---------|-----|-------|
| **Black/Dark Gray** | Default text | Present majority of text in neutral, legible colors | — |
| **Green** | Success/positive status | Use for completed actions, positive status | Don't use to entice or draw unnecessary attention |
| **Yellow** | Caution/incomplete | Use for paused status, non-urgent attention | Don't use for announcements |
| **Orange** | Warning/pending | Use for in-progress, needs attention (strongest non-blocking color) | Don't use for "under construction" or "coming soon" |
| **Red** | Critical/error | Use only for impossible, blocked, or error states | Don't use to entice or draw unnecessary attention |

### Contrast Requirements
- Background-to-text contrast ratio: **minimum 4.5:1** (WCAG AA compliant)
- Test with WebAIM Contrast Checker
- Don't rely on color only to provide context — always include messaging or iconography

## App Icon Specifications

### Format Requirements
- PNG or JPG
- **1200px × 1200px** (square)
- No rounded corners
- Follow Shopify App Store icon guidelines

### Design Specs
- Icon fill: **10/16ths to 12/16ths** (750px–900px for 1200px canvas)
- **1/16th margin** (75px) free of visual elements
- Avoid excessive text — hard to read at small sizes
- Don't use Shopify logo or any icon you don't own
- Nav icon should look similar to App Store icon (not mandatory to have SVG)
- Nav icons cropped with 4px border radius — don't submit pre-rounded
- Design for white/light gray backgrounds

## Typography Requirements

### Type Hierarchy
- Clear hierarchy between headings and body text
- Page title should be largest heading size
- Headings: **bold** or **larger** (or both) — distinct from body text
- Never use underlines (can be mistaken for links)
- Never use color alone to distinguish headings (accessibility)

### Minimum Font Sizes
- **13px** — headings, body text, text in interactive elements
- **12px** — captions, subheadings (smaller copy)

## Icon Rules
- Help merchants understand actions and technical terms
- Use consistently — avoid mixing icon/no-icon in repeating lists
- Pair with text to disambiguate

## Illustration Rules
- Keep consistent illustration style throughout
- Avoid low resolution images (conveys poor quality)

## Hard Requirements for Design Compliance
- 4.5:1 contrast ratio minimum (WCAG AA)
- Green/yellow/orange/red must be used per semantic rules above
- App icon: 1200×1200px, PNG/JPG, square, no rounded corners
- Minimum font size 13px for headings/body/interactive; 12px for captions
- Never use color alone for meaning (always pair with icon/text)
- App Home must follow Polaris to match admin UI extensions
