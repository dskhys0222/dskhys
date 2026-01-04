# 仕様：Budget クライアント自動デプロイ（GitHub Actions）

対象：`packages/client/budget`

## ゴール

- Budget のビルド成果物をサーバーへ配布し、Nginx から配信できる

## デプロイ方式

- GitHub Actions 上で `pnpm --filter @dskhys/budget build` を実行
- 生成物 `packages/client/budget/dist/` を SSH でサーバーへ転送
- 既存の `deployment/compose.yaml` の Nginx コンテナから参照できる位置に配置し、必要に応じて `nginx -s reload`

## 公開URL

既存の Nginx は `/` を API へ proxy しているため、Budget は衝突しないよう **`budget.${DOMAIN_NAME}` のサブドメイン**で配信する。

- 公開 URL：`https://budget.${DOMAIN_NAME}/`
- サーバー配置先：`${DEPLOY_PATH}/static/budget/`

## GitHub Actions workflow

### トリガー

- `push`（`main`）かつ `packages/client/budget/**` に変更がある場合
- `workflow_dispatch`

### ジョブ構成（最小）

1. **build**
   - `pnpm install --frozen-lockfile`
   - `pnpm --filter @dskhys/budget build`
   - `dist/` を成果物として扱う

2. **deploy**
   - SSH 接続を確立
   - 配置ディレクトリを作成（例：`${DEPLOY_PATH}/static/budget`）
   - `dist/` を転送（`rsync` または `scp`）
   - 原子的切り替え（例：`budget.tmp` へ転送→リネーム）
   - 必要に応じて `docker compose exec nginx nginx -s reload`

## 必要な GitHub Secrets

既存デプロイと同様に以下を使用する。

- `SSH_PRIVATE_KEY`
- `SSH_HOST`
- `SSH_USER`
- `SSH_PORT`
- `DEPLOY_PATH`
- `DOMAIN_NAME`

## Nginx 設定

`deployment/nginx/nginx.conf` に以下を追加する想定。

- `budget.${DOMAIN_NAME}` を配信する `server`（HTTP/HTTPS）
  - HTTPS で `root` を Budget の静的ファイルに向ける（例：`/usr/share/nginx/html/budget`）
  - SPA 対応：`try_files $uri $uri/ /index.html;`

また、Nginx コンテナが静的ファイルを参照できるように、`deployment/compose.yaml` の `nginx` サービスに以下の volume を追加する。

- `./static/budget:/usr/share/nginx/html/budget:ro`

## 動作確認（手動）

1. Workflow を実行してデプロイを完了させる
2. ブラウザで `https://budget.${DOMAIN_NAME}/` へアクセスして表示できること
3. DevTools > Application > Service Workers が登録されていること（PWA）
4. DevTools > Network を Offline にしてリロードしても表示できること（要件次第）
