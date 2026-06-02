# Layout Patterns

**Source:** https://shopify.dev/docs/apps/design/layout

## Required Polaris Components & Patterns
- **Page** web component — built-in responsiveness for aside slot; offers various layout options
- **Grid** web component — bespoke responsive handling
- **Stack** web component — simplifies spacing
- **Section** web component — segments content while respecting design guidelines
- **Table** web component — simple data summaries
- **Index table pattern** — for large data displays
- **Resource index layout** — for summarizing resource objects
- **Settings pattern** — for settings pages

## Layout Options

### Single-Column Layout
- For scanning content top-to-bottom, single obvious task
- Homepage default
- For resource index pages: use **full-width** page

### Two-Column Layout
- For visual editors, content-dense pages
- Real-time preview of edits

### Settings Layout
- Left column: title + description (thinner)
- Right column: form elements (wider)

## Spacing Rules
- All spacing on a **4px grid** — Shopify admin is built on this
- Use Stack component to maintain consistent spacing
- Looser spacing for low-density layouts
- Tighter spacing for high-density layouts
- **Do NOT change information density mid-page** — causes disjointed feel

## Container Rules
- **Majority of content must live in a container (card)** — creates visual structure
- Never place paragraphs of text directly on background — reduces legibility
- Cards with interactivity: **at most one primary styled action** (additional CTAs use secondary styling)
- Actions in tables: **use secondary action styling only** (text button, minor icon, dropdown menu)
- Never use primary style buttons in tables

## Mobile-Responsive Requirements
- Design for responsive — must adapt to different screen sizes and devices
- Page component provides built-in responsiveness
- Test at various app body widths (desktop and mobile)

## Hard Requirements for Design Compliance
- Must follow 4px spacing grid
- Majority of content must be in containers/cards
- No paragraphs directly on background
- Max one primary action per card
- No primary buttons in tables
- Must be responsive
