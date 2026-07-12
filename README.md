# NPB Analysis

NPB公式サイトの選手ページから選手プロフィール、打撃成績、投手成績を取得し、SQLiteに取り込んで閲覧・可視化するNext.jsアプリです。

## Requirements

- Node.js 26
- pnpm 9

Node.jsのバージョンは `.node-version` と `.nvmrc` で `26` に固定しています。

## Setup

```sh
pnpm install
pnpm --filter npb-analysis run import-json
pnpm --filter web run dev
```

Webアプリは http://localhost:3000 で起動します。

## Data Pipeline

既存のJSONからDBを作る場合:

```sh
pnpm --filter npb-analysis run import-json
```

NPB公式サイトから全件取得する場合:

```sh
pnpm --filter npb-analysis run scrape -- --delay 300
```

少数件だけデバッグする場合:

```sh
pnpm --filter npb-analysis exec tsx src/main.ts \
  --limit 3 \
  --kana-limit 1 \
  --debug \
  --delay 100 \
  --output-dir /private/tmp/npb-parser-debug \
  --db /private/tmp/npb-parser-debug/npb-debug.sqlite
```

生成される本番用DBは `apps/web/data/npb.sqlite` です。SQLiteファイルは再生成可能なためGit管理対象外です。

## Apps and Packages

- `apps/web`: Next.js dashboard. Tailwind CSSでUIを構築し、Node.js 26の `node:sqlite` でDBを読みます。
- `scripts/parser`: NPB公式サイトのスクレイパーとSQLite importer。
- `packages/ui`: Turborepo starter由来の共有UIパッケージ。
- `packages/eslint-config`: 共有ESLint設定。
- `packages/typescript-config`: 共有TypeScript設定。

## Verification

```sh
pnpm --filter web run lint
pnpm --filter web run check-types
pnpm --filter web run build
```

## Notes

スクレイピング対象は `https://npb.jp/bis/players/` 配下です。実行時はアクセス間隔を置き、検証では `--limit` と `--kana-limit` を使って小さく確認してください。
