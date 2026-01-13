# GitHub Actions デプロイ仕様

## 概要

GitHub Actions CI/CD パイプラインでアプリケーションを自動デプロイします。

## ワークフロー定義

| ファイル                           | トリガー                            | 説明                                  |
| ---------------------------------- | ----------------------------------- | ------------------------------------- |
| `.github/workflows/deploy.yaml`    | `push` (main) / `workflow_dispatch` | API・Budget・Portfolio の自動デプロイ |
| `.github/workflows/setup-ssl.yaml` | `workflow_dispatch`                 | SSL 証明書初回セットアップ            |

## デプロイパイプライン

```txt
1. Lint → 2. Test → 3. Build → 4. Deploy Apps → 5. Deploy Nginx
         ↓          ↓          ↓                ↓
    変更検知   テスト実行   ビルド成果物    API/Budget/         最後にNginx
                         アップロード    Portfolio同時実行    一括再起動
```

**Nginx デプロイの特徴:**

- API、Budget、Portfolio のデプロイが**すべて完了**してから実行
- すべてのアプリが準備完了した状態で Nginx を再起動
- Nginx の設定競合を防止

## 必須 GitHub Secrets（デプロイ用）

### SSH 接続情報

| シークレット名    | 説明                         | 例                                         |
| ----------------- | ---------------------------- | ------------------------------------------ |
| `SSH_PRIVATE_KEY` | SSH 秘密鍵（改行含む）       | `-----BEGIN OPENSSH PRIVATE KEY-----\n...` |
| `SSH_HOST`        | デプロイサーバーホスト       | `example.com` または `192.168.1.100`       |
| `SSH_USER`        | SSH ユーザー名               | `deploy`                                   |
| `SSH_PORT`        | SSH ポート（デフォルト: 22） | `22` または `2222`                         |
| `DEPLOY_PATH`     | サーバー上のデプロイパス     | `/home/deploy/dskhys`                      |

### Docker Registry

| シークレット名    | 説明                  |
| ----------------- | --------------------- |
| `DOCKER_USERNAME` | Docker Hub ユーザー名 |
| `DOCKER_PASSWORD` | Docker Hub パスワード |

### アプリケーション設定

| シークレット名           | 説明                             | 例                             |
| ------------------------ | -------------------------------- | ------------------------------ |
| `JWT_SECRET`             | JWT 署名用秘密鍵                 | `your-secret-key-min-32-chars` |
| `JWT_ACCESS_EXPIRATION`  | アクセストークン有効期限         | `15m`                          |
| `JWT_REFRESH_EXPIRATION` | リフレッシュトークン有効期限     | `30d`                          |
| `ALLOWED_DOMAIN`         | CORS 許可ドメイン                | `example.com`                  |
| `CORS_WHITELIST`         | 追加許可オリジン（カンマ区切り） | `https://external.com`         |

### SSL セットアップ用（setup-ssl.yaml のみ）

| シークレット名      | 説明                       |
| ------------------- | -------------------------- |
| `DOMAIN_NAME`       | SSL 証明書取得対象ドメイン |
| `LETSENCRYPT_EMAIL` | Let's Encrypt 通知用メール |

## デプロイフロー詳細

### 1. API デプロイ（deploy_api）

**トリガー条件:**

- `packages/server/api/**` に変更がある
- または `workflow_dispatch` で手動実行

**処理内容:**

1. Docker イメージをビルド
2. Docker Hub にプッシュ
3. サーバーに `compose.yaml` を転送
4. `.env` ファイルを更新：
   - `JWT_SECRET`
   - `JWT_ACCESS_EXPIRATION`
   - `JWT_REFRESH_EXPIRATION`
   - `IMAGE_TAG`
   - `ALLOWED_DOMAIN`
   - `CORS_WHITELIST`
5. Docker Compose で再起動

**環境変数の更新方法:**

```bash
# .env ファイルが存在しない場合は作成、存在する場合は更新
# sed を使用して既存値を置き換えるか、新規行として追加
```

### 2. Budget デプロイ（deploy_budget）

**トリガー条件:**

- `packages/client/budget/**` に変更がある

**処理内容:**

1. Budget をビルド
2. `dist/` を `static/budget/` にアップロード
3. Nginx の再起動は `deploy_nginx` で実行

### 3. Portfolio デプロイ（deploy_portfolio）

**トリガー条件:**

- `packages/client/portfolio/**` に変更がある

**処理内容:**

1. Portfolio をビルド
2. `dist/` を `static/portfolio/` にアップロード
3. Nginx の再起動は `deploy_nginx` で実行

### 4. Nginx デプロイ（deploy_nginx）

**実行タイミング:**

- API、Budget、Portfolio のデプロイ**すべてが完了後**に実行
- 変更がない場合でも、compose.yaml と nginx.conf は常に更新

**処理内容:**

1. compose.yaml を転送
2. nginx.conf を転送
3. ドメイン名プレースホルダを置換
4. Nginx コンテナを再起動・リロード
   - `docker compose up -d --no-deps --force-recreate nginx`
   - `nginx -t` で設定構文チェック
   - `nginx -s reload` でホットリロード

**利点:**

- 複数アプリの静的ファイル更新と Nginx 設定を原子的に処理
- Nginx の再起動競合を排除

## 環境変数管理

### サーバー側（.env.production）

`${DEPLOY_PATH}/.env` にファイルを配置：

```bash
# API 設定
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=30d

# CORS 設定
ALLOWED_DOMAIN=example.com
CORS_WHITELIST=https://trusted-partner.com

# Docker 設定
IMAGE_TAG=latest
```

GitHub Actions が自動で `secrets.xxx` の値をこのファイルに反映します。

### compose.yaml での参照

```yaml
services:
  api:
    environment:
      - ALLOWED_DOMAIN=${ALLOWED_DOMAIN:-localhost}
      - CORS_WHITELIST=${CORS_WHITELIST:-}
```

## トラブルシューティング

### デプロイが失敗する

| エラー                      | 原因                             | 対応                                 |
| --------------------------- | -------------------------------- | ------------------------------------ |
| `Permission denied`         | SSH 秘密鍵が正しくない           | `SSH_PRIVATE_KEY` を確認             |
| `.env: Permission denied`   | SSH ユーザーに書き込み権限がない | `DEPLOY_PATH` のパーミッション確認   |
| `docker: command not found` | サーバーに Docker がない         | サーバー上で `docker --version` 確認 |

### 環境変数が反映されない

1. `.env` ファイルの内容確認：

   ```bash
   ssh user@host cat /path/to/deploy/.env
   ```

2. Docker Compose が正しく読み込んでいるか確認：

   ```bash
   docker compose config | grep -A5 environment
   ```

3. コンテナ内で確認：

   ```bash
   docker compose exec api env | grep ALLOWED_DOMAIN
   ```

## セキュリティベストプラクティス

- 秘密鍵は絶対にコミットしない
- 秘密鍵のパスフレーズ使用を検討
- SSH キーを定期的にローテーション
- `ALLOWED_DOMAIN` を厳密に設定（ホワイトリスト方式）
- `CORS_WHITELIST` には信頼できるオリジンのみを追加
- 本番環境では HTTPS を必須化
