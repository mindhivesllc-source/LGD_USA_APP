# Alert/Banner UX Patterns

**Source:** https://shopify.dev/docs/apps/design/user-experience/alerts

## Required Polaris Components & Patterns
- **Banner** web component — page-level alerts, system or contextual
- **Inline** alerts — feedback close to source (text field errors)
- **Toast** API — short temporary messages
- **Badge** web component — inline warnings/errors in lists

## Two Alert Categories

### 1. Task Alerts (merchant-initiated feedback)
- Triggered by merchant actions during a task
- Examples: form submitted, upload problem, incorrect info
- Patterns: **Inline** and **Toast**

### 2. System Alerts (app/system-initiated)
- Independent of merchant actions
- Examples: lost connection, planned upgrade, subscription expiring
- Pattern: **Banner**

## Alert Pattern Matrix

| Pattern | Use For | Duration | Scenarios |
|---------|---------|----------|-----------|
| **Banner** | Page-level, system, card/section/modal contextual | Persists until dismissed; can include action button/link | Info, Success, Warning, Error |
| **Inline** | Close to source (form fields) | Persists until resolved | Warning, Error |
| **Toast** | Short, temporary feedback | Auto-disappears or dismissible | Success only |

## Banner Usage by Type

### Informational Banners
- **Blue header**
- Lower priority information only
- Must be **dismissible** (unless critical info merchants must resolve)
- Dismissed banners: don't re-display in same session

### Success Banners
- **Green header**
- Only when feedback is delayed, persistent, or has a CTA
- Include next steps if applicable
- **Do NOT use** for user-initiated action feedback (use toast instead)
- **Do NOT use** if there's no CTA

### Warning Banners
- **Yellow header**
- Information needing attention or action
- Use intentionally — can be stressful for merchants

### Error Banners
- **Red header**
- Always tell merchants what happened + offer path forward
- Avoid scary language, technical terms, jargon
- Avoid humor, idioms (may not translate)

### Critical Banners
- **Red header**, use sparingly
- Problems needing immediate resolution to proceed
- Provide troubleshooting steps + clear way to get support

## Inline Error Rules (Forms)
- Place error message **directly below affected field**
- Use **red text** for error messages (common convention)
- **Do NOT** show errors while merchant is typing — wait until focus leaves field (on blur)
- Never use color alone — pair with error icon for accessibility

## Inline Warnings/Errors in Lists
- Use Badge component to highlight exceptions
- Pair with icon (never color alone)
- Lead with what went wrong

## Errors in Cards/Sections/Modals
- Place error near top of affected element
- Avoid nesting errors too deeply — if broader, place higher
- Avoid modals for error messages (only if modal itself has error)

## Toast Rules
- Display at **bottom center** of app screen
- Use for **short messages only** (confirm an action)
- Max **3 words or fewer**
- Non-critical messages only, relevant at the moment
- Avoid toasts for error messages (except persistent errors like connection errors)

## Hard Requirements for Design Compliance
- Informational: blue, dismissible
- Success: green, only with CTA or delayed feedback
- Warning: yellow
- Error/Critical: red, with resolution path
- Inline errors: below field, on blur (not while typing), red + icon
- Toasts: bottom center, ≤3 words, success only
- Never use color alone for meaning (always pair with icon)
- Dismissed banners must not reappear in same session
