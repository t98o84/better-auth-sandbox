# AGENTS.md

このドキュメントは、AI エージェントがこのプロジェクトで作業する際のガイドラインを提供します。

## 開発環境

このプロジェクトは Docker Compose を使用してコンテナ化された開発環境で動作します。

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
