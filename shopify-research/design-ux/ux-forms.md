# Form UX Patterns

**Source:** https://shopify.dev/docs/apps/design/user-experience/forms

## Required Polaris Components & Patterns
- **Stack** web component — proper spacing in forms
- **Data Save Bar** (Contextual Save Bar) API — for form saves
- **Section** web component — segmenting form content
- Follow the pattern: one page per object definition (like Shopify admin)

## Form Structure Rules

### Single-Page Forms
- Shopify admin uses **individual pages for object definitions**
- One page = one product/variant/entity definition
- Following this focuses merchant workflows and matches admin style

### Form Organization
- **≤5 inputs**: can be in a single simple layout
- **>5 inputs**: use sections with titles in one card, OR multiple cards with headers
- Use **progressive disclosure** when inputs change based on values — prevents overwhelming merchants

### Modal Restriction
- **Never place large forms in max-height/max-width modals**
- Instead: create a new page in your app for the form

### Form Width
- Keep forms at a readable width — don't stretch inputs edge-to-edge unnecessarily

## Save Behavior
- Forms **must use the Data Save Bar (Contextual Save Bar) API**
- This applies to forms within app windows too
- **Continuous data validation or auto-save is PROHIBITED** — incongruous with standard Shopify admin save UX
- Save bar shows: unsaved changes indicator, discard + save buttons

## Form Validation Patterns
- Refer to Alerts page for form error display
- Error messages: below affected field
- Red text for error messages
- Do NOT show errors while typing — wait for blur (focus leaves field)
- Use inline validation after field interaction

## Mobile-Responsive Requirements
- Forms must adapt to mobile viewports
- Use Stack component for proper responsive spacing
- Avoid overly wide inputs on mobile

## Hard Requirements for Design Compliance
- Must use Contextual Save Bar (NOT auto-save)
- No large forms in modals
- >5 inputs: must use sections with titles or multi-card layout
- One page per object definition (follow Shopify admin pattern)
- No continuous validation (use save bar + on-submit validation)
- Progressive disclosure for dynamic forms
