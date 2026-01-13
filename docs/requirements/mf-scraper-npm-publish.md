# mf-scraper npm パッケージ自動パブリッシュ

## 概要

GitHub Actions を使用して mf-scraper パッケージを npm に自動パブリッシュするワークフロー

## 要件

- main ブランチへのプッシュ時に自動的に npm パッケージをパブリッシュ
- mf-scraper の変更（package.json または src/）をトリガーとして動作
- NPM_TOKEN を使用して認証

## 対象

- `packages/client/mf-scraper`

## 成功条件

1. `.github/workflows/publish.yaml` が存在する
2. main ブランチへのプッシュで自動実行される
3. パッケージが npm レジストリに公開される
4. 成功結果が GitHub Actions の実行ログに記録される
