# mf-scraper npm グローバルインストール

## 概要

`mf-scraper` を npm グローバルインストール対応にする

## 要件

- ユーザーが `npm install -g @dskhys/mf-scraper` でインストール可能
- インストール後、`mf-scraper` コマンドで実行可能
- Playwright は初回実行時に自動でブラウザをダウンロード

## 対象パッケージ

- `packages/client/mf-scraper`

## 成功条件

1. `npm install -g @dskhys/mf-scraper` でグローバルインストールできる
2. `mf-scraper` コマンドで実行できる
3. 初回実行時に自動でブラウザが準備される
4. 以後の実行は Playwright のキャッシュを利用する
