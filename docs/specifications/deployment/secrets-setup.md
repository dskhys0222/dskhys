# GitHub Actions シークレット設定

このドキュメントは、CI/CD パイプラインを動作させるために、GitHub リポジトリの設定で構成する必要があるすべてのシークレットをリストアップしています。

## シークレットの設定方法

1. GitHub リポジトリにアクセス
2. **Settings** → **Secrets and variables** → **Actions** をクリック
3. 以下の各シークレットに対して **New repository secret** をクリック

## 必須シークレット

### SSH_PRIVATE_KEY

**説明:** デプロイサーバーに接続するための SSH 秘密鍵

**生成方法:**

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy
```

その後、秘密鍵の内容をコピー:

```bash
cat ~/.ssh/github_deploy
```

すべての内容（`-----BEGIN OPENSSH PRIVATE KEY-----` と `-----END OPENSSH PRIVATE KEY-----` を含む）をシークレット値として貼り付けます。

**重要:** 公開鍵もサーバーに追加してください:

```bash
cat ~/.ssh/github_deploy.pub
# これをコピーして、デプロイサーバーの ~/.ssh/authorized_keys に追加してください
```

### SSH_HOST

**説明:** デプロイサーバーのホスト名または IP アドレス

**設定例:**

- `example.com`
- `192.168.1.100`
- `deploy.myapp.com`

### SSH_USER

**説明:** SSH 接続に使用するユーザー名

**設定例:**

- `ubuntu`
- `deploy`
- `myuser`

### SSH_PORT

**説明:** SSH ポート番号（オプション、デフォルトは 22）

**設定例:**

- `22`（デフォルト）
- `2222`
- `22000`

### DEPLOY_PATH

**説明:** アプリケーションがデプロイされるサーバー上の絶対パス

**設定例:**

- `/opt/dskhys`
- `/home/deploy/packages/dskhys`
- `/var/www/dskhys`

**注意:** このディレクトリはサーバー上に存在し、SSH ユーザーが書き込み可能である必要があります。

### DOMAIN_NAME

**説明:** SSL 証明書を取得するドメイン名

**設定例:**

- `example.com`
- `api.example.com`

**注意:** このドメインの DNS A レコードがデプロイサーバーの IP アドレスを指している必要があります。

### LETSENCRYPT_EMAIL

**説明:** Let's Encrypt からの通知を受け取るメールアドレス（証明書の有効期限警告など）

**設定例:**

- `admin@example.com`
- `devops@example.com`

**注意:** SSL セットアップワークフロー (`setup-ssl.yaml`) でのみ使用されます。

### ALLOWED_DOMAIN

**説明:** CORS で許可するメインドメイン（サブドメインからのリクエストを許可）

**設定例:**

- `example.com` → `portfolio.example.com`, `budget.example.com` などを許可
- `myapp.local` → `api.myapp.local` などを許可

**デフォルト:** `localhost`

**動作:**

- 環境変数で指定したドメイン配下のすべてのサブドメインからのリクエストを許可
- `http://localhost:5173` (開発環境) を常に許可
- 同一オリジン、モバイルアプリなど (オリジンなし) も許可

### CORS_WHITELIST

**説明:** 明示的に許可する追加オリジンのカンマ区切りリスト

**設定例:**

- `https://external-service.com,https://trusted-partner.com`
- `http://staging.example.com,https://production.example.com`

**注意:** `ALLOWED_DOMAIN` で許可されていない特定のドメインを追加で許可したい場合に使用します。

## 検証

すべてのシークレットを設定した後、以下の方法で検証できます:

1. リポジトリの **Actions** タブにアクセス
2. **Deploy to Server** ワークフローを選択
3. **Run workflow** をクリックして手動デプロイを実行
4. ワークフローの実行を確認し、すべてのシークレットが正しく設定されていることを確認

## セキュリティに関する注意事項

- シークレットをリポジトリにコミットしないこと
- SSH 鍵を定期的にローテーションすること
- 最小限の権限を持つ専用のデプロイユーザーを使用すること
- デプロイサーバーへのアクセスを定期的に監査すること
- セキュリティ強化のため、SSH 鍵のパスフレーズの使用を検討すること
