# Portfolio - 株式ポートフォリオ管理アプリ

保有している株式銘柄の情報を一元管理し、スマートフォンから簡単にポートフォリオ状況を確認できるPWAアプリケーションです。

## 機能

- 📊 銘柄情報の管理（ティッカー、株数、取得単価、現在価格など）
- 💹 評価額・損益の自動計算と集計
- 📈 各種グラフによるビジュアライゼーション
- 💾 LocalStorageでのデータ永続化
- 📱 PWAとしてオフライン対応

## 技術スタック

- React 19
- TypeScript
- Vite
- Panda CSS
- TanStack Router
- Zustand
- React Hook Form
- Zod
- Recharts
- Vitest

## 開発

```bash
# 依存関係のインストール
pnpm install

# 開発サーバー起動（https://localhost:3001）
pnpm portfolio dev

# ビルド
pnpm portfolio build

# プレビュー
pnpm portfolio preview

# テスト実行
pnpm portfolio test

# テストウォッチモード
pnpm portfolio test:watch
```

## ドキュメント

- [要件定義](../../docs/requirements/portfolio.md)
- [アプリ仕様](../../docs/specifications/portfolio/app-specification.md)
- [PWA仕様](../../docs/specifications/portfolio/offline-pwa.md)
- [Panda CSSセットアップ](../../docs/specifications/portfolio/pandacss-setup.md)
