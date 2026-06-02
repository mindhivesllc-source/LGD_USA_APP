# Compliance Requirements — Shopify Docs Findings

> Source: https://shopify.dev/docs/apps/build/compliance/api-terms-compliance

---

## API Terms Compliance

All apps must comply with Shopify's [API terms](https://www.shopify.com/legal/api-terms). You agree to sync certain data to the merchant store.

---

## Customer Data Sync Requirements (NON-NEGOTIABLE)

### When these apply:
- Data **collected or updated by your app**.
- Customers that **originate from the merchant's online store or Shopify POS**.
- Sensitive personal information (as defined in API terms) is **excluded**.

### Data Fields You MUST Sync Back to Shopify:

**Via REST Admin API Customer resource:**
`email_marketing_consent`, `state`, `opt_in_level`, `consent_updated_at`, `sms_marketing_consent` (state + opt_in_level + consent_updated_at repeated for SMS), `accepts_marketing`, `accepts_marketing_updated_at`, `first_name`, `last_name`, `addresses`, `default_address`, `phone`, `currency`, `email`, `tax_exempt`

**Via GraphQL Admin API Customer object:**
`firstName`, `lastName`, `phone`, `email`, `taxExempt`, `addresses`

**Via GraphQL Storefront API Customer object:**
`acceptsMarketing`, `firstName`, `lastName`, `phone`, `email`, `customerAddress`

---

## Order Data Sync Requirements (NON-NEGOTIABLE)

Two types of orders must be synced:

### Type 1: Orders from a Shopify Checkout
Updates your app makes to orders originating from Shopify checkout must be synced using the appropriate mutations:

| Update Type | Required Mutations |
|---|---|
| Line items or quantities | `orderEditAddVariant`, `orderEditAddCustomItem`, `orderEditSetQuantity`, `orderEditAddLineItemDiscount` |
| Discounts | `orderEditUpdateDiscount`, `orderEditRemoveDiscount` |
| Shipping fees | `orderEditAddShippingLine`, `orderEditUpdateShippingLine`, `orderEditRemoveShippingLine` |
| Customer email or shipping address | `orderUpdate` |
| Refunds | `refundCreate` |
| Returns and exchanges | `returnCreate` |
| Cancellation | `orderCancel` |
| Fulfillment info/status | 18+ fulfillment mutations (see full list in docs) |
| Fulfillment tracking | `fulfillmentTrackingInfoUpdateV2` |
| Fulfillment services | `fulfillmentServiceCreate`, `fulfillmentServiceDelete`, `fulfillmentServiceUpdate` |

### Type 2: Orders from Third-Party Platform Product Listings
- Must use `orderCreate` mutation to import orders.
- Include all data fields except where Shopify has no input field to receive them.
- Subsequent updates to these orders: follow the same rules as Type 1.

### Exception
If Shopify blocks you from updating certain orders (due to platform restrictions), you are not required to sync.

---

## App Rejection Triggers (Compliance)

1. **Performance score reduction > 10 Lighthouse points** → app rejected.
2. **OWASP vulnerabilities found** → app rejected; must fix before resubmit.
3. **Obfuscated code** → prohibited, subject to Partner governance action.
4. **Search engine manipulation (cloaking)** → prohibited.
5. **Not syncing customer/order data back to Shopify** as required.
6. **Using deprecated APIs (within 90-day window)** → cannot submit.
7. **Missing privacy policy** in app listing.
8. **Requesting unnecessary access scopes** beyond what's needed.
9. **Non-deceptive code violations** — any practice Shopify deems deceptive or harmful.

---

## Legal Agreements Reference

- [API Terms of Service](https://www.shopify.com/legal/api-terms)
- [Partner Program Agreement](https://www.shopify.com/partners/terms)
- [Acceptable Use Policy](https://www.shopify.com/legal/aup)

Violations are subject to **Partner governance action**.

---

## Additional Compliance Notes

- Apps should use only supported, documented APIs.
- Billing must go through Shopify's Billing API or managed pricing (no external billing for app subscriptions).
- Apps must allow merchants to upgrade/downgrade plans without contacting support.
- Enterprise pricing must reference additional charges in the app listing.
- For donation apps: must provide proof of charitable status.
- For product sourcing: must not automatically fulfill orders in pending payment state.
- For mobile app builders: must not expose GraphQL Admin API credentials on mobile devices.
