# Security Best Practices — Shopify Docs Findings

> Source: https://shopify.dev/docs/apps/build/security/protect-against-common-vulnerabilities

---

## OWASP Top 10 Requirement (HARD REQUIREMENT)

Shopify requires all third-party apps be protected against **The OWASP Top 10** security risks.

> If any vulnerabilities are discovered during app review, **the app WILL BE REJECTED** and you must fix them before resubmitting.

Referenced resources:
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) — standard awareness document with cheat sheets
- [Web Security Academy](https://portswigger.net/web-security) — free online training with interactive labs

---

## API Keys, Access Tokens & Secrets

### Authentication / OAuth Requirements
- All apps MUST use **OAuth** for authorization — it is the first step before anything else.
- Use **session tokens** for authentication in admin-embedded apps.
- DO NOT use third-party cookies or `localStorage` — they may not work in all browsers.
- Apps MUST work in Chrome's **incognito mode** (no cookie dependencies).
- Use **token exchange** grant type for admin apps (more secure, fewer redirects).
- Request only the **minimum necessary access scopes** (`App Store requirement 3.2`).

### Mobile App Builders — CRITICAL SECURITY
- **NEVER store client secrets or access tokens on mobile devices**.
- Store them on a secure web server only.
- Mobile apps built by your builder must NOT make direct requests to the authenticated GraphQL Admin API.

### Secret Handling (General)
- Shopify-triggered webhooks should be verified with HMAC signatures.
- All app-to-Shopify communication should use HTTPS exclusively.
- Use Shopify-managed installation to eliminate the need for your app to handle OAuth redirects manually.

---

## Rate Limit-Related Security

### 423 Locked Status
- A shop can be **locked** if it repeatedly exceeds API rate limits, or if there is account compromise/fraud detected.
- Contact Shopify support if your shop gets locked.

### 430 Shopify Security Rejection
- Request rejected because it appears **malicious**.
- Ensure Storefront API requests include the correct **Buyer IP header**.

### 429 Too Many Requests
- Standard rate-limit throttle; stop making requests and wait.

---

## App Review Security Criteria

From the App Store best practices checklist:

- Apps must not use unsupported APIs (APIs being deprecated within 90 days cannot be submitted).
- Apps must be compliant with **SameSite cookie attribute** and latest Chrome cookie behavior.
- Apps must provide a **privacy policy** in their listing.
- Apps: do not use pop-up windows for OAuth or billing (pop-up blockers may compromise security).

---

## Data Protection

- **Protected customer data**: Sensitive personal information (as defined in API terms) is excluded from data sync requirements — handle with extreme care.
- If collecting customer data, you must have a clear privacy policy.
- Merchant trust is tied to proper handling of customer sensitive data — violations can lead to legal liability.

---

## Specific Prohibited API Patterns

- **No obfuscated code** — code must be reviewable.
- **No manipulating search engines** (e.g., cloaking — presenting different content to search engines vs users).
- **No unsupported/private APIs** — only documented Shopify APIs.
- Do not request broader access scopes than needed.
- Do not use deprecated API versions (within 90-day deprecation window).
