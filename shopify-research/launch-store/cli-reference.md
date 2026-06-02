# Shopify CLI Command Reference

Source: https://shopify.dev/docs/apps/build/cli-for-apps
Full command reference: https://shopify.dev/docs/api/shopify-cli/app

## CLI Features
- Creates new apps using templates
- Generates app extensions
- Creates app records in Dev Dashboard
- Builds app and extensions, creates tunnel for preview
- Deploys app configuration and extensions
- Searches Shopify Dev Docs

## Requirements
- Latest Shopify CLI
- Latest Chrome or Firefox

## Available Commands

### App Lifecycle
| Command | Description |
|---------|-------------|
| `shopify app init` | Create a new app project (supports `--template` flag) |
| `shopify app dev` | Build and preview app on dev store, watch for changes |
| `shopify app dev clean` | Stop the dev preview |
| `shopify app build` | Execute build script from TOML file |
| `shopify app deploy` | Build and deploy app configuration and extensions |
| `shopify app release` | Release an existing app version |
| `shopify app versions list` | List deployed app versions |

### App Configuration
| Command | Description |
|---------|-------------|
| `shopify app config link` | Pull config from Developer Dashboard, create/overwrite config file |
| `shopify app config pull` | Pull latest config from linked Shopify app |
| `shopify app config use` | Set default configuration |
| `shopify app config validate` | Validate config file and extensions against schemas |

### Extensions & Data
| Command | Description |
|---------|-------------|
| `shopify app generate extension` | Generate a new app extension |
| `shopify app import-extensions` | Import dashboard-managed extensions |
| `shopify app import-custom-data-definitions` | Import metafield and metaobject definitions |

### Environment
| Command | Description |
|---------|-------------|
| `shopify app env pull` | Create/update .env files with app and extension env vars |
| `shopify app env show` | Display environment variables |

### Functions
| Command | Description |
|---------|-------------|
| `shopify app function build` | Compile function to WebAssembly (Wasm) |
| `shopify app function info` | Get function information |
| `shopify app function replay` | Run function for testing |
| `shopify app function run` | Run function for testing |
| `shopify app function schema` | Generate latest GraphQL schema for function |
| `shopify app function typegen` | Create GraphQL types from input query |

### GraphQL Operations
| Command | Description |
|---------|-------------|
| `shopify app execute` | Execute Admin API GraphQL query/mutation on store |
| `shopify app bulk execute` | Execute Admin API GraphQL as bulk operation |
| `shopify app bulk cancel` | Cancel running bulk operation by ID |
| `shopify app bulk status` | Check bulk operation status or list recent |

### Monitoring & Debugging
| Command | Description |
|---------|-------------|
| `shopify app logs` | Real-time stream of detailed app logs |
| `shopify app logs sources` | Output source names for log filtering |
| `shopify app webhook trigger` | Trigger sample Admin API event payload to address |
| `shopify app info` | Display app information |

## Installation Methods

### Global (Recommended)
```bash
# Install globally, then use directly
shopify app init
shopify app dev
```

### Local Dependency (Team sync)
```bash
npm install -D @shopify/cli
npm run shopify app generate extension
```

Note: As of CLI v3.59.0, `@shopify/app` is bundled with `@shopify/cli`.

## Switching Between Global/Local

### Move to Global
```bash
npm uninstall -D @shopify/cli @shopify/app
# then install globally
```

### Move to Local
```bash
npm install -D @shopify/cli
```

## CI/CD
- Use `shopify app deploy` in CI/CD pipelines for programmatic deployment
- Requires `SHOPIFY_CLI_NO_ANALYTICS=1` to opt out of usage reporting

## Conventional Directory Structure
All CLI-managed apps follow a standard structure that enables:
- Simultaneous serving/deployment of web app and extensions
- Easy extension generation
- Centralized dependency management
