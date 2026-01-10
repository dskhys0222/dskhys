# 仕様：PWA オフライン対応（Portfolio）

対象：`packages/client/portfolio`

## ゴール

- 初回にオンラインでアクセスした後、オフラインでもアプリが起動し全画面が表示できる
- LocalStorageに保存されたデータを使用してオフラインでも完全に機能する

## 方式

- Vite のビルド成果物を Service Worker で事前キャッシュ（precache）する
- SPA のため、ナビゲーションは `index.html` にフォールバックする
- データはすべてLocalStorageに保存され、サーバー通信は不要

## キャッシュ方針

- `index.html` およびビルド生成された静的アセット（JS/CSS 等）を precache
- `public/` 配下の必須アセット（`favicon.ico`, `logo192.png`, `logo512.png`, `manifest.json`）も precache 対象に含める
- runtime キャッシュは不要（完全ローカルアプリのため）

## Service Worker の登録

- 本番環境（`import.meta.env.PROD === true`）のみ登録する
- 開発環境でも動作確認のため有効化（`devOptions.enabled: true`）
- `navigator.serviceWorker` が利用可能なブラウザのみ登録する

## マニフェスト設定

```json
{
  "name": "Portfolio",
  "short_name": "Portfolio",
  "description": "株式ポートフォリオ管理アプリケーション",
  "theme_color": "#1a472a",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/",
  "scope": "/",
  "icons": [
    {
      "src": "logo192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "logo512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "logo512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "logo512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

## 動作確認（手動）

1. `pnpm portfolio build`（または `pnpm --filter @dskhys/portfolio build`）
2. `pnpm portfolio preview`
3. ブラウザでアクセスして一度表示する
4. DevTools > Network を `Offline` にする
5. リロードしても全画面が表示されること
6. データの追加・編集・削除が正常に動作すること

## 制約

- 初回アクセス（キャッシュ作成）にはネットワーク接続が必要
- ブラウザのキャッシュ/ストレージを消去すると再度オンラインが必要
- LocalStorageの容量制限（通常5-10MB）に注意

## PWAインストール

### モバイル（iOS Safari）

1. Safariでアプリを開く
2. 共有ボタン → ホーム画面に追加
3. ホーム画面からアプリとして起動可能

### モバイル（Android Chrome）

1. Chromeでアプリを開く
2. メニュー → ホーム画面に追加
3. ホーム画面からアプリとして起動可能

### デスクトップ（Chrome/Edge）

1. アドレスバー右側のインストールアイコンをクリック
2. 「インストール」をクリック
3. スタンドアロンウィンドウで起動可能
