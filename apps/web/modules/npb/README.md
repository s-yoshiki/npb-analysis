# NPB module architecture

このモジュールは、読み取り中心のNPBデータを次の依存方向で扱います。

```text
app / components
       ↓
composition → application → domain
       ↓             ↑
infrastructure ──────┘
```

## Layers

- `domain/models`: UIやDBに依存しない読み取りモデル
- `domain/services`: リーグ判定、ランキング集計、選手区分などの純粋なルール
- `application/ports`: Application層が要求するRepositoryインターフェース
- `application/npb-query-service.ts`: Server Componentsから呼ぶ読み取りユースケース
- `infrastructure/sqlite`: `node:sqlite`とSQLを閉じ込めるAdapter
- `composition.ts`: Repository実装をApplicationサービスへ注入するComposition Root

## Dependency rules

1. UIは`infrastructure`を直接importしない。
2. Application層は`node:sqlite`やSQLを知らない。
3. Domain層はNext.js、React、DB実装へ依存しない。
4. 新しいDB実装はApplicationのRepositoryポートを実装する。
5. 集計規則は可能な限りDomainサービスの純粋関数として追加する。
