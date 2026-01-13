# Docker Compose 設定仕様

## 概要

デプロイ環境の Docker Compose 設定仕様を定義します。

## 設定ファイル

| ファイル                  | 用途                   |
| ------------------------- | ---------------------- |
| `deployment/compose.yaml` | 通常運用（HTTPS 対応） |

## 環境変数

### 必須変数

#### JWT_SECRET

**説明:** JWT トークン署名用の秘密鍵

### オプション変数

#### IMAGE_TAG

**デフォルト:** `latest`

#### JWT_ACCESS_EXPIRATION

**デフォルト:** `15m` (15 分)

#### JWT_REFRESH_EXPIRATION

**デフォルト:** `7d` (7 日)

#### ALLOWED_DOMAIN

**説明:** CORS で許可するメインドメイン

**デフォルト:** `localhost`

**用途:** 指定したドメイン配下のすべてのサブドメインからのリクエストを許可

#### CORS_WHITELIST

**説明:** 明示的に許可する追加オリジンのカンマ区切りリスト

**デフォルト:** 空（未設定）

## .env.production ファイル例

デプロイサーバーの `deployment/` ディレクトリに配置:

```bash
JWT_SECRET=your-very-secure-secret-key-min-32-chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=30d
ALLOWED_DOMAIN=example.com
CORS_WHITELIST=
IMAGE_TAG=latest
```

## 操作コマンド

### 起動

```bash
cd deployment
docker compose up -d
```

### 停止

```bash
docker compose down
```

### ログ確認

```bash
# 全サービス
docker compose logs -f

# API サーバー
docker compose logs -f api
```

### Nginx リロード

```bash
docker compose exec nginx nginx -s reload
```

### 環境変数変更後の再起動

```bash
docker compose up -d
```
