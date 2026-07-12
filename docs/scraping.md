# Scraping and Import

## Source

The parser starts at:

```txt
https://npb.jp/bis/players/all/index.html
```

It extracts kana index pages, then player detail URLs, then profile and stat tables for each player.

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

Run a full scrape:

```sh
pnpm --filter npb-analysis run scrape -- --delay 300
```

## CLI Options

- `--limit <number|all>`: maximum player detail pages to scrape.
- `--kana-limit <number|all>`: maximum kana index pages to scan.
- `--delay <ms>`: delay between requests.
- `--debug`: print extracted URL samples and parsed row counts.
- `--output-dir <path>`: directory for `player_urls.json`, `player_urls.txt`, and `player_data.json`.
- `--db <path>`: SQLite output path.
- `--from-json <path>`: skip network scraping and import an existing player JSON file.

## Debug Checklist

Expected signs from a healthy small scrape:

- `kanaPages=1/44` or another non-zero count when limited.
- Player URL samples look like `https://npb.jp/bis/players/01103800.html`.
- Each parsed player has a non-empty `name`.
- `detailKeys` is greater than zero for pages with profile tables.
- SQLite row counts match the debug limit for `players`.

## SQLite Tables

- `players`: player identity, profile fields, source URL, raw profile JSON.
- `batting_stats`: normalized batting columns plus raw row JSON.
- `pitching_stats`: normalized pitching columns plus raw row JSON.
