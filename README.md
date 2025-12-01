# Better Auth Sandbox

Hono + Better Auth + Drizzle ORM + PostgreSQL のサンドボックスプロジェクト

## 技術スタック

- **フレームワーク**: [Hono](https://hono.dev/)
- **認証**: [Better Auth](https://www.better-auth.com/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **データベース**: PostgreSQL 15
- **バリデーション**: Zod + drizzle-zod
- **API ドキュメント**: OpenAPI 3.0 + Swagger UI
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

## API ドキュメント

| エンドポイント | 説明 |
|---------------|------|
| `/api/ui` | Swagger UI (対話的なAPIドキュメント) |
| `/api/doc` | OpenAPI スキーマ (JSON) |

## API エンドポイント

### 認証 (Auth)

Better Auth が提供する認証エンドポイント。

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/api/auth/sign-up/email` | メールでサインアップ |
| POST | `/api/auth/sign-in/email` | メールでサインイン |
| POST | `/api/auth/sign-out` | サインアウト |
| GET | `/api/auth/session` | セッション取得 |

### セッション (Sessions)

| メソッド | パス | 認証 | 説明 |
|---------|------|------|------|
| GET | `/api/sessions/me` | 🔒 | 現在のセッションとユーザー情報を取得 |

### サンプル (Samples)

| メソッド | パス | 認証 | 説明 |
|---------|------|------|------|
| GET | `/api/samples` | - | 全件取得 |
| GET | `/api/samples/{id}` | - | 1件取得 |
| POST | `/api/samples` | 🔒 | 作成 |
| PUT | `/api/samples/{id}` | 🔒 | 更新 |
| DELETE | `/api/samples/{id}` | 🔒 | 削除（ソフトデリート） |

### 使用例

```bash
# サインアップ
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123", "name": "Test User"}'

# サインイン
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# 全件取得
curl http://localhost:3000/api/samples

# 作成（認証が必要）
curl -X POST http://localhost:3000/api/samples \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=<your-token>" \
  -d '{"text": "hello"}'

# 更新（認証が必要）
curl -X PUT http://localhost:3000/api/samples/{id} \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=<your-token>" \
  -d '{"text": "updated"}'

# 削除（認証が必要）
curl -X DELETE http://localhost:3000/api/samples/{id} \
  -H "Cookie: better-auth.session_token=<your-token>"
```

## 開発

### スクリプト

```bash
# 開発サーバー起動
docker compose exec node pnpm dev

# ビルド
docker compose exec node pnpm build

# 本番起動
docker compose exec node pnpm start
```

### ディレクトリ構成

```
src/
├── index.ts              # エントリポイント & ルートマウント
├── db/
│   ├── index.ts          # DB接続
│   ├── schema.ts         # テーブル定義 & Zodスキーマ
│   └── soft-delete.ts    # ソフトデリートヘルパー
├── lib/
│   └── auth.ts           # Better Auth 設定
├── middleware/
│   └── session.ts        # セッションミドルウェア
└── routes/
    ├── auth.ts           # 認証ルート（Better Auth ハンドラー）
    ├── session.ts        # セッションルート
    └── samples.ts        # サンプルCRUDルート
```
