# 1. ビルドステージ
FROM node:22-alpine AS builder

WORKDIR /app

# pnpmバージョン取得のためpackage.jsonをコピー
COPY package.json ./

# packageManagerフィールドからpnpmをインストール
RUN corepack enable && corepack install

# ワークスペース設定とパッケージファイルをコピー
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/server/api/package.json ./packages/server/api/

# すべての依存関係をインストール
RUN pnpm install --frozen-lockfile

# 残りのソースコードをコピー
COPY . .

# アプリケーションをビルド
RUN pnpm --filter @dskhys/api run build


# 2. プロダクションステージ
FROM node:22-alpine

WORKDIR /app

# pnpmバージョン取得のためpackage.jsonをコピー
COPY package.json ./

# packageManagerフィールドからpnpmをインストール
RUN corepack enable && corepack install

# ワークスペース設定とパッケージファイルをコピー
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/server/api/package.json ./packages/server/api/

# プロダクション依存関係のみインストール
RUN pnpm install --prod --frozen-lockfile

# ビルダーステージからビルド済みアプリケーションをコピー
COPY --from=builder /app/packages/server/api/dist ./packages/server/api/dist

# ヘルスチェックスクリプトをコピー
COPY deployment/healthcheck.sh /healthcheck.sh
RUN chmod +x /healthcheck.sh

# SQLiteデータベース用のデータディレクトリを作成
RUN mkdir -p /app/data

# 環境変数を設定
ENV NODE_ENV=production
ENV PORT=3000

# ポートを公開
EXPOSE 3000

# アプリケーションを起動
CMD ["node", "packages/server/api/dist/index.js"]
