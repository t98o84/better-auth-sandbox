# AGENTS.md

このドキュメントは、AI エージェントがこのプロジェクトで作業する際のガイドラインを提供します。

## 開発環境

このプロジェクトは Docker Compose を使用してコンテナ化された開発環境で動作します。

### サービス一覧

| サービス | ポート | 説明 |
|---------|--------|------|
| node | 3000 | アプリケーションサーバー |
| db | 5432 | PostgreSQL データベース |
| mailpit | 8025 (UI), 1025 (SMTP) | 開発用メールキャッチャー |

### Mailpit

Mailpit は開発環境でメールをキャッチするためのツールです。

- **Web UI**: http://localhost:8025 - 送信されたメールを確認
- **SMTP**: `mailpit:1025` - コンテナ内からのメール送信先

サインアップ時のメール確認やパスワードリセットメールは Mailpit で確認できます。

## pnpm コマンドの実行

**重要**: すべての `pnpm` コマンドは Docker Compose を通じてコンテナ内で実行してください。

### 実行方法

```bash
docker compose exec node pnpm <command>
```

### 例

```bash
# 依存関係のインストール
docker compose exec node pnpm install

# パッケージの追加
docker compose exec node pnpm add <package-name>

# 開発パッケージの追加
docker compose exec node pnpm add -D <package-name>

# スクリプトの実行
docker compose exec node pnpm run <script-name>

# Drizzle マイグレーションの生成
docker compose exec node pnpm drizzle-kit generate

# Drizzle マイグレーションの実行
docker compose exec node pnpm drizzle-kit migrate
```

### 注意事項

- ホストマシンで直接 `pnpm` コマンドを実行しないでください
- コンテナが起動していることを確認してから実行してください（`docker compose up -d`）

## プロジェクト構成

### ディレクトリ構成

```
src/
├── index.ts              # エントリポイント & ルートマウント & OpenAPI設定
├── db/
│   ├── index.ts          # DB接続 (Drizzle)
│   ├── schema.ts         # テーブル定義 & Zodスキーマ
│   └── soft-delete.ts    # ソフトデリートヘルパー
├── lib/
│   ├── auth.ts           # Better Auth 設定
│   ├── email.ts          # メール送信ユーティリティ (nodemailer)
│   └── openapi.ts        # OpenAPI 設定
├── middleware/
│   └── session.ts        # セッションミドルウェア
├── views/                # JSX ビューコンポーネント (Hono JSX)
│   ├── Layout.tsx        # 共通レイアウト
│   ├── Home.tsx          # ホームページ
│   ├── SignIn.tsx        # サインインページ
│   └── SignUp.tsx        # サインアップページ
└── routes/
    ├── auth.ts           # 認証ルート（Better Auth ハンドラー）
    ├── session.ts        # セッションルート (OpenAPIHono)
    ├── samples.ts        # サンプルCRUDルート (OpenAPIHono)
    └── ui.tsx            # 認証 UI ルート (Hono JSX)
```

### 技術スタック

- **フレームワーク**: Hono (OpenAPIHono)
- **認証**: Better Auth
- **ORM**: Drizzle ORM
- **データベース**: PostgreSQL 15
- **バリデーション**: Zod + @hono/zod-openapi + drizzle-zod
- **API ドキュメント**: OpenAPI 3.0 + Swagger UI
- **メール**: Mailpit (開発用) + nodemailer
- **UI**: Hono JSX + TailwindCSS (CDN)

## コーディング規約

### ルートの追加

1. **新しいルートファイルの作成**: `src/routes/` に新しいファイルを作成
2. **OpenAPIHono を使用**: 型安全なAPIのために `OpenAPIHono` と `createRoute` を使用
3. **Zodスキーマを定義**: リクエスト・レスポンスのスキーマを定義
4. **チェーン形式で記述**: RPC型推論のためにメソッドチェーンで記述
5. **index.ts でマウント**: `app.route()` でルートをマウント

### ルートファイルのテンプレート

```typescript
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

// Schemas
const ResponseSchema = z.object({
  // ...
}).openapi("ResponseName");

// Routes
const exampleRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["TagName"],
  summary: "Short description",
  description: "Detailed description",
  security: [{ Bearer: [] }], // 認証が必要な場合
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ResponseSchema,
        },
      },
      description: "Success",
    },
  },
});

// App
const app = new OpenAPIHono()
  .openapi(exampleRoute, async (c) => {
    // Handler implementation
    return c.json({ /* response */ }, 200);
  });

export default app;
```

### 認証

- 認証が必要なルートには `security: [{ Bearer: [] }]` を追加
- セッション情報は `c.get("session")` と `c.get("user")` で取得

### データベース

- テーブル定義は `src/db/schema.ts` に追加
- ソフトデリートを使用する場合は `whereAndExcludeDeleted` ヘルパーを使用
- マイグレーションは `docker compose exec node pnpm db:generate` で生成

## APIドキュメント

- **Swagger UI**: `http://localhost:3000/api/ui`
- **OpenAPI スキーマ**: `http://localhost:3000/api/doc`

Better Auth と アプリケーションの API が統合されて表示されます。
