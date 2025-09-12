# Agent Guide (Cline)

This repo works well with Cline (VS Code extension: `saoudrizwan.claude-dev`). These notes give Cline clear guardrails and ready-made tasks.

## Setup
- Node.js and npm installed.
- Run `npm install` in the repo root.
- Copy `.env.example` to `.env`. Only `OPENAI_API_KEY` is required for generation pipelines; the UI can run without it. Do NOT print secrets to logs or chat.

## Guardrails for Agents
- UI: Follow .clinerules/ui-guidelines.md non‑negotiable defaults (tokens, shadcn/ui primitives, a11y, mobile-first, smoke tests).
- Prefer `npm run` scripts over ad-hoc commands.
- Long-running: after `npm run next:dev`, use “Proceed While Running” and watch logs instead of stopping the task.
- Never delete project data (`canon/`, `facts/`, `rendered/`) without explicit instruction.
- Avoid committing or changing lockfiles unless asked.
- Keep changes scoped; don’t refactor unrelated files.

## Common Tasks
- Start UI: `npm run next:dev` → open http://localhost:3000
- Build catalog: `npm run catalog:build`
- Full pipeline (expensive): `npm run pipeline:real:all`
- Validate lore: `npm run validate:lore`
- Generate heraldry: `npm run heraldry:gen`
- Prepare assets (for build): `npm run prepare:assets`

Environment knobs used by scripts (optional): `PORT`, `DEBUG`, `DRY_RUN`, `LORE_*`, `HERALDRY_*`, `LINKS_*`, `DATA_ROOT`, `ARMORIA_BASE`, `FORCE_REGEN`, `OUTLINE_CONCURRENCY`.

## Suggested Initial Task for Cline
Paste this as your first instruction to Cline in this repo:

```
Bootstrap the dev environment and run the UI:
1) Run `npm install`.
2) If missing, copy `.env.example` to `.env` (do NOT print values).
3) Start dev server with `npm run next:dev`; proceed while running.
4) Confirm the homepage returns HTTP 200 and report the local URL.
5) Summarize any TODOs or warnings. Do not change unrelated files.
```

## Troubleshooting
- Port busy: set `PORT=3001` in `.env` and restart.
- Build warnings: safe to ignore `outputFileTracingRoot` in local dev; we can tune `next.config.js` later.
- Security audit: run `npm audit`; we enforce a patched `esbuild` via `overrides`.

## Optional: MCP Ideas (Future)
Expose domain tools to Cline via MCP (e.g., `listStates`, `genLoreForState(id)`, `validateLore`). If you want this, we can scaffold a small MCP server that wraps the existing `npm run` scripts and TypeScript pipeline entrypoints.
