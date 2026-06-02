# Shopify Authentication & Authorization Research

## Source: https://shopify.dev/docs/apps/build/authentication-authorization

---

## Authentication vs. Authorization

- **Authentication**: Verifying identity of the user or app. All apps connecting with Shopify APIs must authenticate.
- **Authorization**: Giving permissions to apps. Happens when a merchant installs an app, granting it an access token.

---

## Auth Methods by App Type

| App Type | Recommended Auth Flow | Token Acquisition |
|---|---|---|
| App rendered in Shopify admin | Session tokens + Token exchange | Token exchange (grant_type: `urn:ietf:params:oauth:grant-type:token-exchange`) |
| Standalone app | Session tokens | Authorization code grant |
| Admin-created custom app | N/A | Generate in Shopify admin |

**Key principle**: Shopify managed installation + token exchange is the recommended modern path. Authorization code grant is legacy.

---

## Session Tokens (JWT-based Authentication)

**Source**: https://shopify.dev/docs/apps/build/authentication-authorization/session-tokens

- **Lifetime**: 1 minute — must be fetched on each request to avoid stale tokens.
- **Format**: JWT (JSON Web Token) with header, payload, signature.
- **Purpose**: Authenticate frontend-to-backend requests. NOT a replacement for API access tokens.
- **Flow**:
  1. App loads unauthenticated, renders skeleton/loading UI
  2. Frontend calls App Bridge `authenticatedFetch` to get session token
  3. Token included in `Authorization` header on all backend requests
  4. Backend verifies JWT using app's shared secret
- **Payload fields**: `iss` (shop admin domain), `dest` (shop domain), `aud` (client ID), `sub` (user ID), `exp`, `nbf`, `iat`, `jti` (random UUID), `sid` (session ID), `sig` (Shopify signature)
- **Limitations**: Only fully supported for single-page apps. Multi-page apps must be converted to SPA-like behavior. Ad blockers can interfere with session token fetching.
- **Critical**: All apps rendered in Shopify admin MUST use session tokens — cookies won't work due to third-party cookie restrictions.

---

## Token Exchange (Admin Apps — Modern Flow)

**Source**: https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/token-exchange

**POST** `https://{shop}.myshopify.com/admin/oauth/access_token`

### Required Parameters
| Parameter | Value |
|---|---|
| `client_id` | App's API key |
| `client_secret` | App's client secret |
| `grant_type` | `urn:ietf:params:oauth:grant-type:token-exchange` |
| `subject_token` | Session token (ID token) from App Bridge |
| `subject_token_type` | `urn:ietf:params:oauth:token-type:id_token` |
| `requested_token_type` | `urn:shopify:params:oauth:token-type:offline-access-token` (default) or `urn:shopify:params:oauth:token-type:online-access-token` |
| `expiring` | `0` (non-expiring, default) or `1` (expiring) — offline only |

### Response Types

#### Online Access Token Response
```json
{
  "access_token": "f85632530bf277ec9ac6f649fc327f17",
  "scope": "write_orders,read_customers",
  "expires_in": 86399,
  "associated_user_scope": "write_orders",
  "associated_user": {
    "id": 902541635,
    "first_name": "John",
    "last_name": "Smith",
    "email": "john@example.com",
    "email_verified": true,
    "account_owner": true,
    "locale": "en",
    "collaborator": false
  }
}
```

#### Expiring Offline Access Token Response
```json
{
  "access_token": "f85632530bf277ec9ac6f649fc327f17",
  "scope": "write_orders,read_customers",
  "expires_in": 3600,
  "refresh_token": "shprt_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "refresh_token_expires_in": 7776000
}
```

#### Non-Expiring Offline Access Token Response
```json
{
  "access_token": "f85632530bf277ec9ac6f649fc327f17",
  "scope": "write_orders,read_customers"
}
```

### Making Authenticated Requests
After obtaining an access token, use header `X-Shopify-Access-Token: {access_token}` with GraphQL Admin API calls.

---

## Authorization Code Grant (Standalone Apps — Legacy)

**Source**: https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/authorization-code-grant

**CAUTION**: Apps rendered in the Shopify admin should use token exchange, not authorization code grant.

### Flow Steps
1. **Verify installation request**: Validate HMAC signature on GET request (`shop`, `timestamp`, `hmac` params). Remove `hmac` from query string, HMAC-SHA256 hash remaining params with client secret, compare.
2. **Request authorization code**: Redirect to `https://{shop}/admin/oauth/authorize?client_id={client_id}&scope={scopes}&redirect_uri={redirect_uri}&state={nonce}&grant_options[]={access_mode}`. Set `grant_options[]=per-user` for online tokens; omit for offline.
3. **Validate authorization code**: Check nonce matches (via signed cookie), HMAC valid, shop hostname valid (regex: `/[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com/`).
4. **Get access token**: POST to `https://{shop}.myshopify.com/admin/oauth/access_token` with `client_id`, `client_secret`, `code`, optional `expiring=1`.
5. **Redirect to app UI**: Use `Shopify.Utils.getEmbeddedAppUrl(req)` for embedded apps.
6. **Confirm requested scopes**: Always verify granted scopes match what was requested — user could modify URL params. Write scope implies read; only check for write scope.

### Iframe Escape Pattern
When `embedded=1` in query params, render a page using App Bridge redirect action to break out of iframe before OAuth redirect (Shopify admin pages set `X-Frame-Options: DENY`).

---

## Session Storage Requirements

### For Expiring Offline Tokens (Modern, Dec 2025+)
Must store:
- `access_token` — the token itself
- `expires_at` — when the access token expires (derived from `expires_in`)
- `refresh_token` — for refreshing (format: `shprt_...`)
- `refresh_token_expires_at` — when the refresh token expires (90 days from issue)

### For Non-Expiring Offline Tokens (Legacy)
- Just the `access_token` — no expiry, no refresh token
- Revoked only on app uninstall or secret rotation

### For Online Tokens
- `access_token` with `expires_in` (24 hours or user session end, whichever first)
- `associated_user` info for per-user caching

---

## Token Types Deep Dive

### Online Access Tokens
- **Source**: https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/online-access-tokens
- Linked to individual user's web session
- Expire when user logs out or after 24 hours
- Respect individual user's permission level
- `403 Forbidden` if user lacks permission; `401 Unauthorized` if expired
- Best practice: scope cache per-user when using online tokens
- Install fails if installing user doesn't have all required scopes

### Offline Access Tokens
- **Source**: https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/offline-access-tokens
- For service-to-service / background jobs (webhooks, cron jobs)
- No user interaction needed
- Two variants:
  - **Non-expiring** (legacy): Valid indefinitely until uninstall/secret revocation
  - **Expiring** (Dec 2025+): 90-day refresh token lifetime, 1-hour access token

### Token Refresh Flow (Expiring Offline)
```
POST https://{shop}.myshopify.com/admin/oauth/access_token
  client_id={client_id}
  client_secret={client_secret}
  grant_type=refresh_token
  refresh_token={refresh_token}
```
- Returns new `access_token` and new `refresh_token` (both with updated expiries)
- Previous refresh token invalidated immediately
- Retry same request with same refresh_token if no response received (short retry window)
- If refresh token expires (90 days), user MUST relaunch app to re-trigger token acquisition

### Migration: Non-Expiring → Expiring
- Use token exchange POST with `subject_token` = the non-expiring offline token, `subject_token_type` = `urn:shopify:params:oauth:token-type:offline-access-token`, `expiring=1`
- **Irreversible** — original non-expiring token is revoked upon successful exchange
- Can be done via background job or next app launch

---

## Shopify Managed Installation

**Source**: https://shopify.dev/docs/apps/build/authentication-authorization/app-installation

- Shopify installs app and updates scopes without calling the app
- **No browser redirects** during installation/updates — no screen flickering
- Scopes declared in `shopify.app.toml` under `[access_scopes]`:
  ```toml
  [access_scopes]
  scopes = "read_orders,write_customers"
  ```
- Deploy with `shopify app deploy`
- Admin apps use token exchange afterward; standalone apps use authorization code grant

---

## Access Scopes Management

**Source**: https://shopify.dev/docs/apps/build/authentication-authorization/app-installation/manage-access-scopes

### Two Scope Categories
| Field | Behavior |
|---|---|
| `scopes` | **Mandatory** — merchant MUST grant all before install. Guaranteed after install. |
| `optional_scopes` | **Post-install only** — app requests dynamically. Merchant can grant or decline. Can be revoked. |

### Dynamic Scope Request (Admin Apps)
```javascript
shopify.scopes.request(['read_discounts', 'write_products']);
```
- Client-side, displays permission grant modal over running app
- No browser redirect needed

### Dynamic Scope Request (Standalone Apps)
```
https://admin.shopify.com/store/{STORE_NAME}/oauth/install?client_id={CLIENT_ID}&optional_scopes={REQUESTED_SCOPES}
```

### Scope Management Operations
- **Query granted scopes**: `currentAppInstallation { accessScopes { handle } }` GraphQL query
- **Revoke scopes**: `appRevokeAccessScopes(scopes: [...])` mutation — only optional scopes
- **Subscribe to changes**: `app/scopes_update` webhook topic
- **Modify declared scopes**: Update TOML, run `shopify app deploy`, merchants prompted on next app open for additions; auto-removed for reductions

### Scope for Product Write Access
```toml
[access_scopes]
scopes = "write_products"
```
`write_products` implies `read_products`. Covers products, variants, and collections.

---

## Error Handling for Auth Failures

### Common Failure Scenarios
| Situation | HTTP Code | Action |
|---|---|---|
| Expired online token | `401 Unauthorized` | Re-trigger OAuth/token exchange |
| User lacks permission (online token) | `403 Forbidden` | Handle gracefully, inform user |
| Invalid/expired session token for exchange | `400 Bad Request` | Re-acquire session token from App Bridge |
| Scope mismatch | — | Confirm granted scopes match requested; re-request if missing |
| Refresh token expired (90 days) | — | User must relaunch app to re-trigger token acquisition |
| Secret rotation | — | Existing tokens invalid; await up to 1 hour for HMAC rotation to propagate |

### App-Level Auth Middleware Pattern
- Backend middleware verifies session token on every request
- If session token invalid/expired, return 401 → frontend re-fetches session token
- Before API calls, check if access token exists and is not expired
- If expired and refresh token exists, attempt refresh before making call
- If no valid token at all, trigger token exchange (admin apps) or OAuth redirect (standalone)

---

## How the Remix/React Router Template Handles Auth

Based on the docs references to `shopify.server.ts`, `authenticate`, and `shopifyApp`:

1. **`shopifyApp()` config** in `app/shopify.server.ts` sets up the auth infrastructure
2. **`authenticate.webhook(request)`** — automatically verifies HMAC, returns `{ shop, session, topic }`
3. **`authenticate.admin(request)`** — verifies session token, returns session for GraphQL calls
4. **After-auth hooks** like `afterAuth: async ({ session }) => { ... }` run after token acquisition
5. **Webhook registration** happens in `afterAuth` via `shopify.registerWebhooks({ session })`
6. **Session storage** is handled by the template — configurable (default: in-memory for dev, requires DB adapter for production)
7. The template uses **token exchange** (not authorization code grant) for admin apps
