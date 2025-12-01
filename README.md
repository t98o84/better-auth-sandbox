# Better Auth Sandbox

Hono + Drizzle ORM + PostgreSQL のサンドボックスプロジェクト

## 技術スタック

- **フレームワーク**: [Hono](https://hono.dev/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **データベース**: PostgreSQL 15
- **バリデーション**: Zod + drizzle-zod
- **ランタイム**: Node.js

## セットアップ

### 必要な環境

- Docker & Docker Compose

### 起動

```bash
docker compose up -d
```

サーバーが `http://localhost:3000` で起動します。

### データベースマイグレーション

```bash
# マイグレーションファイル生成
docker compose exec node pnpm db:generate

# マイグレーション実行
docker compose exec node pnpm db:migrate

# 開発時: スキーマを直接反映（マイグレーションファイルなし）
docker compose exec node pnpm db:push
```

## API エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/` | ヘルスチェック |
| GET | `/samples` | 全件取得 |
| GET | `/samples/:id` | 1件取得 |
| POST | `/samples` | 作成 |
| PUT | `/samples/:id` | 更新 |
| DELETE | `/samples/:id` | 削除（ソフトデリート） |

### 使用例

```bash
# 全件取得
curl http://localhost:3000/samples

# 作成
curl -X POST http://localhost:3000/samples \
  -H "Content-Type: application/json" \
  -d '{"text": "hello"}'

# 更新
curl -X PUT http://localhost:3000/samples/{id} \
  -H "Content-Type: application/json" \
  -d '{"text": "updated"}'

# 削除
curl -X DELETE http://localhost:3000/samples/{id}
```

## 開発

### スクリプト

```bash
# 開発サーバー起動
pnpm dev

# ビルド
pnpm build

# 本番起動
pnpm start
```

### ディレクトリ構成

```
src/
├── index.ts          # エントリポイント & ルート定義
└── db/
    ├── index.ts      # DB接続
    ├── schema.ts     # テーブル定義
    └── soft-delete.ts # ソフトデリートヘルパー
```
