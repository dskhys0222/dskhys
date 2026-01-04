# 仕様：PWA オフライン対応（Budget）

対象：`packages/client/budget`

## ゴール

- 初回にオンラインでアクセスした後、オフラインでもアプリが起動し `/` が表示できる

## 方式

- Vite のビルド成果物を Service Worker で事前キャッシュ（precache）する
- SPA のため、ナビゲーションは `index.html` にフォールバックする

## キャッシュ方針

- `index.html` およびビルド生成された静的アセット（JS/CSS 等）を precache
- `public/` 配下の必須アセット（`favicon.ico`, `logo192.png`, `logo512.png`）も precache 対象に含める
- runtime キャッシュ（API 応答のキャッシュ等）は本仕様の範囲外

## Service Worker の登録

- 本番環境（`import.meta.env.PROD === true`）のみ登録する
- `navigator.serviceWorker` が利用可能なブラウザのみ登録する

## 動作確認（手動）

1. `pnpm budget build`（または `pnpm --filter @dskhys/budget build`）
2. `pnpm budget preview`
3. ブラウザでアクセスして一度表示する
4. DevTools > Network を `Offline` にする
5. リロードしても `/` が表示されること

## 制約

- 初回アクセス（キャッシュ作成）にはネットワーク接続が必要
- ブラウザのキャッシュ/ストレージを消去すると再度オンラインが必要
