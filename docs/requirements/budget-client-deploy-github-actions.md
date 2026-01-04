# 要件定義：Budget クライアント自動デプロイ（GitHub Actions）

## 目的

`packages/client/budget` をビルドし、サーバーへ自動デプロイして HTTPS 配下で配信できるようにする。

## 対象範囲

- クライアント：`packages/client/budget`
- CI/CD：GitHub Actions（新規 workflow）
- 配信：既存のデプロイ基盤（SSH + Docker Compose + Nginx）を利用

## 前提・制約

- デプロイ先は既存の `DEPLOY_PATH` 配下（サーバー上の絶対パス）
- Nginx は `deployment/compose.yaml` により稼働している
- SSL 証明書は既存の `setup-ssl.yaml` で取得済み
- Budget は `budget.${DOMAIN_NAME}` のサブドメインで配信する

## 機能要件

1. `main` ブランチへの push（または手動実行）で Budget の静的成果物がデプロイされる
2. デプロイは Budget に関係する変更のみで走る（例：`packages/client/budget/**`）
3. デプロイ完了後、ブラウザから Budget が配信される

## 非機能要件

- 失敗時に途中状態が残りにくい（原則として原子的に切り替える）
- 既存の API デプロイ（[.github/workflows/deploy.yaml](../../.github/workflows/deploy.yaml)）を壊さない
- Secrets は GitHub Actions の Secrets で管理し、リポジトリへコミットしない

## 受け入れ条件

- GitHub Actions の workflow が成功し、サーバー上に `dist` が配置される
- `https://budget.${DOMAIN_NAME}/` で Budget のトップが表示できる

## 未確定事項（レビューで確定する）

- 証明書に `budget.${DOMAIN_NAME}` が含まれていること（含まれない場合は `setup-ssl.yaml` の取得対象を更新する）
