# Scraping and Import

## Source

By default, the parser starts at the active-player index:

```txt
https://npb.jp/bis/players/active/index.html
```

It extracts kana index pages, then player detail URLs, then profile and stat tables for each player. Use `--scope all` to scrape both active and retired players; active status is determined by membership in the active-player index.

## Commands

Import the checked-in JSON sample into the app DB:

```sh
pnpm --filter npb-analysis run import-json
```

Run a small live scrape for debugging:

```sh
pnpm --filter npb-analysis exec tsx src/main.ts \
  --limit 3 \
  --kana-limit 1 \
  --debug \
  --delay 100 \
  --output-dir /private/tmp/npb-parser-debug \
  --db /private/tmp/npb-parser-debug/npb-debug.sqlite
```

Run a full active-player scrape:

```sh
pnpm --filter npb-analysis run scrape -- --delay 300
```

Run a full scrape including retired players:

```sh
pnpm --filter npb-analysis run scrape -- --scope all --delay 300
```

## CLI Options

- `--limit <number|all>`: maximum player detail pages to scrape.
- `--scope <active|all>`: scrape active players only (default), or all players.
- `--kana-limit <number|all>`: maximum kana index pages to scan.
- `--delay <ms>`: delay between requests.
- `--debug`: print extracted URL samples and parsed row counts.
- `--output-dir <path>`: directory for `player_urls.json`, `player_urls.txt`, and `player_data.json`.
- `--db <path>`: SQLite output path.
- `--from-json <path>`: skip network scraping and import an existing player JSON file.

Older JSON without `isActive` remains importable and is treated as retired with a warning.

## Debug Checklist

Expected signs from a healthy small scrape:

- `kanaPages=1/44` or another non-zero count when limited.
- Player URL samples look like `https://npb.jp/bis/players/01103800.html`.
- Each parsed player has a non-empty `name`.
- `detailKeys` is greater than zero for pages with profile tables.
- SQLite row counts match the debug limit for `players`.

## SQLite Tables

- `players`: player identity, active status (`is_active`), profile fields, source URL, raw profile JSON.
- `batting_stats`: normalized batting columns plus raw row JSON.
- `pitching_stats`: normalized pitching columns plus raw row JSON.
