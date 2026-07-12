# Codex Instructions

## Project Goal

Build and maintain an NPB player analysis site. The data flow is:

1. Scrape player index and player detail pages from `https://npb.jp/bis/players/`.
2. Normalize player profile, batting stats, and pitching stats.
3. Write the data to SQLite.
4. Render searchable and visualized data in the Next.js web app.

## Runtime

- Use Node.js 26.
- Use pnpm 9.
- Prefer Node.js built-ins where practical. SQLite access currently uses `node:sqlite`.

## Important Paths

- Web app: `apps/web`
- Parser: `scripts/parser`
- SQLite output: `apps/web/data/npb.sqlite`
- Parser docs: `docs/scraping.md`

## Development Rules

- Use Tailwind CSS for new web UI.
- Keep generated SQLite files out of Git.
- For scraper changes, always run a small debug scrape before claiming success:

```sh
pnpm --filter npb-analysis exec tsx src/main.ts \
  --limit 3 \
  --kana-limit 1 \
  --debug \
  --delay 100 \
  --output-dir /private/tmp/npb-parser-debug \
  --db /private/tmp/npb-parser-debug/npb-debug.sqlite
```

- Do not run a full scrape unless explicitly requested or needed for the task.
- Avoid adding browser-only dependencies for charts unless the dashboard needs richer interactivity. Server-rendered SVG and Tailwind are preferred for simple visualizations.

## Verification

Run the narrowest relevant checks:

```sh
pnpm --filter web run lint
pnpm --filter web run check-types
pnpm --filter web run build
```
