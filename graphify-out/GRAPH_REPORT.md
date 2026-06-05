# Graph Report - LGD_USA_APP  (2026-06-05)

## Corpus Check
- 36 files · ~29,297 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 214 nodes · 270 edges · 37 communities (29 shown, 8 thin omitted)
- Extraction: 82% EXTRACTED · 18% INFERRED · 0% AMBIGUOUS · INFERRED: 49 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a0e811de`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Shopify Design System & UX Guidelines|Shopify Design System & UX Guidelines]]
- [[_COMMUNITY_Supplier API & Shopify Product APIs|Supplier API & Shopify Product APIs]]
- [[_COMMUNITY_Sync Engine Scheduler & State|Sync Engine: Scheduler & State]]
- [[_COMMUNITY_Auth, Security & Compliance|Auth, Security & Compliance]]
- [[_COMMUNITY_pushToShopify GraphQL productSet Pipeline|pushToShopify: GraphQL productSet Pipeline]]
- [[_COMMUNITY_App Entry Auth Login & Index Routes|App Entry: Auth Login & Index Routes]]
- [[_COMMUNITY_Webhooks & Events System|Webhooks & Events System]]
- [[_COMMUNITY_Content, Onboarding & BFS Helpful UX|Content, Onboarding & BFS Helpful UX]]
- [[_COMMUNITY_Product Classification & Field Mapping|Product Classification & Field Mapping]]
- [[_COMMUNITY_Dashboard Page (app._index)|Dashboard Page (app._index)]]
- [[_COMMUNITY_Onboarding Page|Onboarding Page]]
- [[_COMMUNITY_App Extensions & UI Extension Model|App Extensions & UI Extension Model]]
- [[_COMMUNITY_Localization & i18n|Localization & i18n]]
- [[_COMMUNITY_Changelog History|Changelog History]]
- [[_COMMUNITY_Fix Roadmap|Fix Roadmap]]
- [[_COMMUNITY_OAuth Flows|OAuth Flows]]
- [[_COMMUNITY_Performance Bundle Size|Performance: Bundle Size]]
- [[_COMMUNITY_Performance Storefront Patterns|Performance: Storefront Patterns]]

## God Nodes (most connected - your core abstractions)
1. `runSync()` - 12 edges
2. `Built for Shopify Requirements Checklist` - 12 edges
3. `LGD Jewelry Sync Shopify App` - 11 edges
4. `action()` - 9 edges
5. `pushToShopifyBatch()` - 9 edges
6. `BFS 4.1 Familiar Design (Looks Like Shopify Admin)` - 8 edges
7. `Shopify GraphQL Admin API` - 7 edges
8. `Built for Shopify Program` - 7 edges
9. `Polaris Design System` - 7 edges
10. `graphqlRequest()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `action()` --calls--> `runSync()`  [INFERRED]
  app/routes/app._index.jsx → src/scheduler.js
- `action()` --calls--> `runSync()`  [INFERRED]
  app/routes/app.onboarding.jsx → src/scheduler.js
- `SQLite Railway Volume Mount` --references--> `LGD Jewelry Sync Shopify App`  [EXTRACTED]
  shopify-research/FIX_ROADMAP.md → README.md
- `Shopify Bulk Operations API` --conceptually_related_to--> `LGD Jewelry Sync Shopify App`  [INFERRED]
  shopify-research/product-api/graphql.md → README.md
- `loader()` --calls--> `getState()`  [INFERRED]
  app/routes/api.sync.jsx → src/syncState.js

## Hyperedges (group relationships)
- **Sync Data Pipeline** — readme_lgd_jewelry_sync_app, api_docs_lgd_supplier_api, graphql_shopify_graphql_admin_api, readme_field_mapping, readme_sync_scheduler, readme_deepseek_v4 [INFERRED 0.95]
- **Shopify OAuth Token Flow** — authentication_token_exchange, authentication_session_tokens, authentication_offline_tokens, authentication_online_tokens, authentication_managed_installation [INFERRED 0.95]
- **Built for Shopify Compliance Requirements** — integrating_built_for_shopify, security_owasp_top_10, performance_lighthouse_criteria, compliance_app_rejection_triggers, non_deceptive_code_requirements [INFERRED 0.95]
- **Built for Shopify Design Compliance Pillars** — bfs_design_familiar, bfs_design_helpful, bfs_design_userfriendly [EXTRACTED 1.00]
- **Shopify Admin Interface Technology Stack** — polaris_design_system, shopify_app_bridge, web_components_polaris [INFERRED 0.85]

## Communities (37 total, 8 thin omitted)

### Community 0 - "Shopify Design System & UX Guidelines"
Cohesion: 0.11
Nodes (33): Accessibility Requirements, Admin UI Extensions (Block, Action, Link, Bulk Action), Alert and Banner UX Patterns, App Navigation Sidebar Rules, App Scaffolding Best Practices, App Structure Guidelines, BFS 4.1 Familiar Design (Looks Like Shopify Admin), BFS 4.3 User-Friendly Design (No Dark Patterns) (+25 more)

### Community 1 - "Supplier API & Shopify Product APIs"
Cohesion: 0.08
Nodes (31): Jewelry Inventory API Endpoint, LGD Supplier REST API, WCAG Accessibility Audit, Async productSet for Large Catalogs, TOML Metafield Definitions, productSet Migration, GraphQL Rate Limit Monitoring, Immediate Sync on Startup (+23 more)

### Community 2 - "Sync Engine: Scheduler & State"
Cohesion: 0.24
Nodes (14): action(), loader(), runSync(), clearCooldown(), getCooldownRemaining(), getState(), isCooldownActive(), requestStop() (+6 more)

### Community 3 - "Auth, Security & Compliance"
Cohesion: 0.11
Nodes (20): App Home Iframe Model, Shopify Managed Installation, Offline Access Tokens, Online Access Tokens, Session Tokens (JWT), Token Exchange Grant Flow, Shopify App Rejection Triggers, Customer Data Sync Requirements (+12 more)

### Community 4 - "pushToShopify: GraphQL productSet Pipeline"
Cohesion: 0.24
Nodes (16): shouldStop(), buildProductSetInput(), execProductSet(), getAccessToken(), getItemSku(), getItemTitle(), getLocationId(), graphqlRequest() (+8 more)

### Community 5 - "App Entry: Auth Login & Index Routes"
Cohesion: 0.23
Nodes (6): getShopifyAdminAppUrl(), isIframeRequest(), normalizeStoreHandle(), action(), loader(), loader()

### Community 6 - "Webhooks & Events System"
Cohesion: 0.25
Nodes (8): Shopify Events (Developer Preview), Event Query Filter (Conditional Suppression), Event Triggers (Field-Level Filtering), Webhook Integration for Sync Safety, Mandatory Compliance Webhooks, Webhook HMAC Signature Verification, Webhook Reconciliation Jobs, Shopify Webhooks

### Community 7 - "Content, Onboarding & BFS Helpful UX"
Cohesion: 0.25
Nodes (8): App Home Page UX, App Home Page: Status Updates, CTAs, Metrics, BFS 4.2 Helpful Design (Works Well, Easy to Use), Content Guidelines, Onboarding UX Guide, Plain Language at US Grade 7 Reading Level, Progressive Disclosure for Forms, Progressive Onboarding (Max 5 Steps, Dismissible)

### Community 9 - "Product Classification & Field Mapping"
Cohesion: 0.6
Nodes (3): classifyProduct(), formatDescription(), mapToShopifyProduct()

### Community 16 - "App Extensions & UI Extension Model"
Cohesion: 0.67
Nodes (3): App Home UI Extension Model, Shopify App Extensions, UI Extension 64KB Bundle Limit

## Knowledge Gaps
- **44 isolated node(s):** `Jewelry Inventory API Endpoint`, `DeepSeek v4 AI Classifier`, `Video External Link Button Pattern`, `Jewelry Category Detection`, `Shopify App Template Remix Changelog` (+39 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `LGD Jewelry Sync Shopify App` connect `Supplier API & Shopify Product APIs` to `Auth, Security & Compliance`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `SQLite Railway Volume Mount` connect `Auth, Security & Compliance` to `Supplier API & Shopify Product APIs`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `runSync()` (e.g. with `action()` and `action()`) actually correct?**
  _`runSync()` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `action()` (e.g. with `getState()` and `requestStop()`) actually correct?**
  _`action()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `pushToShopifyBatch()` (e.g. with `runSync()` and `shouldStop()`) actually correct?**
  _`pushToShopifyBatch()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Jewelry Inventory API Endpoint`, `DeepSeek v4 AI Classifier`, `Video External Link Button Pattern` to the rest of the system?**
  _44 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Shopify Design System & UX Guidelines` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._