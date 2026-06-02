# Onboarding UX

**Source:** https://shopify.dev/docs/apps/design/user-experience/onboarding

## Required Polaris Components & Patterns
- **Setup guide** pattern — compose with Polaris components
- **Cancel icon** — for dismissible onboarding
- **Progress indicator** — encouraging feedback during setup

## Onboarding Purpose
- Welcome merchants and make them eager to use the app
- Make merchants comfortable and set expectations
- After onboarding: merchants should know what to do
- Leads to higher usage retention

## Onboarding Design Requirements

### Structure
- Brief and direct
- Clear instructions guiding merchants to completion
- Present basics as quickly as possible
- Can use cards with title, body text, and action button per step
- Can use selection of quick-choice actions

### Step Limit
- **Maximum 5 steps** — more leads to merchant drop-off

### Dismissibility
- If onboarding isn't essential: make it dismissible (Cancel/X icon)
- Give option to "Remind me later" / complete at a later time

### Information Gathering
- **Only request information if necessary**
- Don't ask merchants for data they don't need to provide to use the app

### Progress Tracking
- Include progress indicator (not a ready-made Polaris pattern, compose your own)
- Steps automatically marked complete
- Acts as quick-start with discrete steps

## Hard Requirements for Design Compliance
- Max 5 onboarding steps
- Must be dismissible if non-essential
- Only request necessary information
- Must include progress/status feedback
- Must leave merchants knowing what to do in the app
- Avoid blocking merchant workflow (offer "complete later")
