# Knowledge Guard — Mandatory Rules

This project uses a permanent knowledge guard system. These rules are NOT optional.
Violating them has caused damage in the past. Follow them exactly.

## BEFORE any code modification (Edit, Write, create file):

1. **Read the graph report:** `graphify-out/GRAPH_REPORT.md` — understand communities, god nodes, and connections
2. **Query relevant communities:** Run `graphify explain "<concept>"` for the module you're about to change
3. **Check the Obsidian work log:** `~/obsidian-brain/vault/Projects/LGD_USA_APP/Work Log.md`
   - Search `errors/` for related past issues
   - Search `pending/` for blocked or WIP items
   - Search `decisions/` for architecture rationale
   - Search `sessions/` for recent session context
4. **Check Claude Code memory:** Review memory files for this project for session-persistent context

## DURING code modification:

1. **Do not modify code you have not traced through the graph**
2. **When in doubt, query:** `graphify path "<A>" "<B>"` to understand how modules connect
3. **Prefer small, targeted changes** over sweeping rewrites
4. **If a change affects multiple communities**, trace all affected paths first

## AFTER any code modification:

1. **Update the graph:** Run `graphify update .`
2. **Write a session note** to `~/obsidian-brain/vault/Projects/LGD_USA_APP/sessions/` — what was changed, why, files, commit hash
3. **If fixing a bug:** Also write to `fixes/` with root cause analysis
4. **If encountering an error:** Log it to `errors/` before fixing
5. **If making an architecture decision:** Write to `decisions/` with rationale

## On error or failure:

1. **Log to Obsidian:** Create note in `errors/` with symptoms, root cause after investigation
2. **The error itself is valuable:** Note what went wrong even if you don't fix it yet
3. **Check Railway:** If the error is deployment-related, use Railway MCP `get_logs` to capture build/deploy errors
4. **Axiom:** Errors are also routed to Axiom datasets automatically via OTLP telemetry

## graphify reference

- **Graph:** `graphify-out/graph.json` (214 nodes, 270 edges, 37 communities)
- **Report:** `graphify-out/GRAPH_REPORT.md`
- **Obsidian export:** `graphify-out/obsidian/` (214 notes, wikilink connected)
- **Global graph:** `~/.graphify/global-graph.json`
- `graphify query "<question>"` — BFS traversal for broad context
- `graphify query "<question>" --dfs` — depth-first for specific dependency paths
- `graphify path "<A>" "<B>"` — shortest path between two concepts
- `graphify explain "<concept>"` — explain a node and all its neighbors
- `graphify update .` — incremental update after code changes (AST-only, no API cost)

## Obsidian work log

- **Vault:** `~/obsidian-brain/vault/`
- **Project:** `Projects/LGD_USA_APP/`
- **Master index:** `Work Log.md` — Dataview queries for open issues, pending tasks, recent fixes
- **Templates:** `_templates/` — error, fix, pending, decision, session

## Project summary

- **Stack:** Shopify Remix (Node.js/React), Prisma/SQLite, Railway
- **Key modules:** scheduler → fetchSupplier → classify → mapFields → pushToShopify
- **Sync state:** `src/syncState.js` — cooldown tracking, stop requests
- **Remotes:** origin (mindhivesllc-source), mindhives (Mind-Hives)
