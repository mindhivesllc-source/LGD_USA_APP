# Localization Requirements

Source: https://shopify.dev/docs/apps/build/localize-your-app

## Why Localize
- **Market opportunity**: European markets growing at 3x US rate; only 5-7% of public apps localized
- **82% of active merchants have at least one app installed**
- **Business impact**: Reduced churn, increased visibility, expanded user base, competitive advantage
- **Localized apps convert up to 4x better in non-English markets**

## Which Languages Must Be Translated

### Shopify Admin Supported Languages
The Shopify admin can be used in any of the [supported languages](https://help.shopify.com/en/manual/your-account/languages).

### Automated Translation (English primary listing → auto-translated to)
- Brazilian Portuguese
- Danish
- Dutch
- French
- German
- Simplified Chinese
- Spanish
- Swedish

*Automated translation covers: App card subtitle, App introduction, App details, Features, Pricing details, Search terms, and image alt text.*

### Custom Translations
- You can add your own translations via Partner Dashboard
- Custom translation overwrites automated one for that language
- Deleting custom translation re-enables automated translation

## What Must Be Translated

### App UI Strings
- All hard-coded strings must be externalized into translation files (even if not initially translating)
- Use `translations/en.json` pattern
- Text within graphics/images must also be externalized (overlay text or generate locale-specific graphics)

### App Store Listing
- App card subtitle
- App introduction (100 chars)
- App details (500 chars)
- Features list
- Pricing details
- Search terms
- Image alt text

### Must NOT Be Hard-coded (use i18n library for formatting)
- **Dates and times** — format varies by region, not language (use `Intl.DateTimeFormat`)
- **Numbers** — format varies by region (use `Intl.NumberFormat`)
- **Prices** — format varies by currency and region
- **Lists** — item combination varies by region (use `Intl.ListFormat`)
- **Names** — addressing conventions vary by context and region

## Internationalization Process

### Step 1: Externalize Strings
- Move all hard-coded strings to translation files (`translations/en.json`)
- Use descriptive keys
- Even if not translating yet, externalize during initial development

### Step 2: Get Access to User's Locale
- Admin apps: `locale` request parameter in Shopify's GET requests
- Mechanism depends on app extension type

### Step 3: Format Strings
- Remove dates, numbers, prices, lists, names from translation strings
- Use locale-aware formatting APIs
- Use pluralization for variable numbers

### Step 4: Translate Strings

#### Step 4.1: Pseudolocalization (Optional)
- Test for text expansion (most languages are 50% longer than English)
- Test for vertical space in CJK languages
- Use pseudolocalization tools before real translation

#### Step 4.2: Choose Languages
- Start with most common languages in your supported regions/markets

#### Step 4.3: Translate Content
Options ranked by quality/cost:
1. **Third party translation service** (highest quality) — Shopify recommends Blend, Crowdin, TranslateCI
2. **Machine translation** (quick, cost-effective, variable quality)
3. **Crowdsourced translation** (requires large community)
4. **Do it yourself** (requires fluency)

### Recommended Tool
- [i18n-ally](https://marketplace.visualstudio.com/items?itemName=Lokalise.i18n-ally) VS Code extension for string externalization, navigation, and machine translation

## Market-Specific Opportunities
- **Europe**: Payment solutions (cash on delivery), compliance features, ad measurement
- **Japan**: LINE messaging integrations, loyalty programs, page customization
- **Cross-market**: Shipping integrations for local carriers
