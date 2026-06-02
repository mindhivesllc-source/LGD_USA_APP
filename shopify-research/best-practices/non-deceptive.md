# Non-Deceptive Code Requirements — Shopify Docs Findings

> Source: https://shopify.dev/docs/apps/build/non-deceptive-code

---

## Hard Rule: Deceptive Practices Are PROHIBITED

Shopify expects app developers to act with **integrity and in the best interests of app users**. Developers must regularly review and remain compliant with the **Partner Program Agreement** and **API Terms of Service**.

**Violation consequence**: Subject to **Partner governance action**.

---

## Prohibited Practice #1: Code Obfuscation

### Definition
Changing simple, straightforward code into code that is **difficult to understand**, obscuring the intended behavior — usually to hide that behavior from users.

### Why It's Prohibited
- Obscures intended behavior from users (and reviewers).
- May hinder the **performance** of a user's site.
- **There is no legitimate reason for developers to use obfuscated code in their apps.**

### Examples of Obfuscation
- Minification that goes beyond size optimization and deliberately hides logic.
- Encoding strings/URLs to hide what the code connects to.
- Using `eval()` with encoded strings.
- Deliberately confusing variable names and control flow to prevent code review.

---

## Prohibited Practice #2: Search Engine Manipulation

### Definition
Any code that targets search engines to **misrepresent site content**.

### "Cloaking"
Presenting **different content to search engines** than is presented to users. This is strictly prohibited.

### Prohibited Purposes Include
- Increasing page speed scores through deception.
- Showing different product data to crawlers vs customers.
- Hiding affiliate links or injected content from search engines.
- **Any attempt to trick search engines for any purpose.**

---

## Enforcement References

The following agreements govern this policy:

1. **[Partner Program Agreement](https://www.shopify.com/partners/terms)** — governs your relationship as a Shopify Partner.
2. **[API Terms of Service](https://www.shopify.com/legal/api-terms)** — governs your use of Shopify APIs.

Shopify reserves the right to determine what constitutes deceptive or harmful behavior. The list above is not exhaustive — **any practice Shopify considers deceptive or harmful to merchants** is subject to governance action.

---

## What This Means For Your App

1. **All code must be reviewable.** If a human reviewer (or Shopify's automated systems) cannot understand what your code does, it's a violation.
2. **Do not hide functionality from merchants.** Any behavior your app performs on a merchant's store must be transparent.
3. **Do not game performance measurements.** Don't inject code that artificially inflates Lighthouse scores or manipulates how search engines see content.
4. **Regularly review compliance.** The Partner Program Agreement and API Terms may be updated; you are responsible for staying compliant.
