# デプロイメント設定

このプロジェクトは GitHub Actions を使用して自動的にテスト、ビルド、デプロイを行います。

## 概要

GitHub Actions ワークフローは以下の順序で実行されます：

1. **Lint** - コードのリントを実行
2. **Test** - テストを実行
3. **Build** - `api` と `budget` をそれぞれビルド（成果物作成）
4. **Deploy** - `api` と `budget` を並列でデプロイ

## 必要な GitHub Secrets

以下のシークレットを GitHub リポジトリの Settings > Secrets and variables > Actions に設定してください：

### SSH 接続情報

- `SSH_PRIVATE_KEY`: デプロイサーバーへの SSH 秘密鍵（OpenSSH 形式）
- `SSH_HOST`: デプロイサーバーのホスト名または IP アドレス
- `SSH_USER`: SSH 接続に使用するユーザー名
- `SSH_PORT`: SSH ポート（デフォルト: 22）
- `DEPLOY_PATH`: サーバー上のデプロイ先ディレクトリの絶対パス

### SSH 秘密鍵の生成方法

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy"
```

生成された秘密鍵（例: `~/.ssh/id_ed25519`）の内容を `SSH_PRIVATE_KEY` に設定し、
公開鍵（例: `~/.ssh/id_ed25519.pub`）をデプロイサーバーの `~/.ssh/authorized_keys` に追加してください。

## サーバー側の準備

### 1. Docker と Docker Compose のインストール

```bash
# Docker のインストール
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose のインストール
sudo apt-get update
sudo apt-get install docker-compose-plugin
```

### 2. デプロイディレクトリの作成

```bash
# デプロイディレクトリを作成（例: /opt/dskhys）
sudo mkdir -p /opt/dskhys
sudo chown $USER:$USER /opt/dskhys
```

### 3. 環境変数ファイルの作成

デプロイディレクトリに `.env` ファイルを作成します：

```bash
cd /opt/dskhys
cp .env.example .env
# .env ファイルを編集して本番環境の値を設定
nano .env
```

必要な環境変数：

- `JWT_SECRET`: JWT トークンの署名に使用する秘密鍵（ランダムな長い文字列）
- `API_PORT`: API サーバーのポート（デフォルト: 3000）
- `JWT_ACCESS_EXPIRATION`: アクセストークンの有効期限（デフォルト: 15m）
- `JWT_REFRESH_EXPIRATION`: リフレッシュトークンの有効期限（デフォルト: 7d）

### 4. データディレクトリの作成

```bash
mkdir -p /opt/dskhys/data
```

## デプロイの実行

### 自動デプロイ

`main` ブランチへのプッシュで自動的にデプロイされます。

### 手動デプロイ

GitHub の Actions タブから "Deploy to Server" ワークフローを選択し、"Run workflow" をクリックします。

## デプロイ後の確認

デプロイが成功したら、サーバー上で以下のコマンドで状態を確認できます：

```bash
# コンテナの状態を確認
docker-compose ps

# ログを確認
docker-compose logs -f api

# ヘルスチェック
curl http://localhost:3000/health
```

## トラブルシューティング

### デプロイが失敗する場合

1. GitHub Actions のログを確認
2. SSH 接続が正しく設定されているか確認
3. サーバー上のディスク容量を確認
4. Docker サービスが起動しているか確認

### コンテナが起動しない場合

```bash
# ログを確認
docker-compose logs api

# コンテナを再起動
docker-compose restart api

# コンテナを再ビルド
docker-compose up -d --build
```

## セキュリティ注意事項

- SSH 秘密鍵は絶対にコードリポジトリにコミットしないでください
- `.env` ファイルは `.gitignore` に含まれており、コミットされません
- JWT_SECRET は十分に長いランダムな文字列を使用してください
- 本番環境では HTTPS を使用することを推奨します
- 初回デプロイ時、GitHub Actions は自動的に SSH ホストキーを収集します。セキュリティを強化するには、事前にホストキーのフィンガープリントを確認することを推奨します
