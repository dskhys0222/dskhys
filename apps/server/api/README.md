# API Server

dskhysプロジェクトのAPIサーバーです。

## 技術スタック

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express
- **Database**: SQLite3
- **Validation**: Zod
- **Testing**: Vitest + Supertest
- **Linting**: Biome

## セットアップ

### 1. 依存関係のインストール

ルートディレクトリから:

```bash
npm install
```

### 2. 環境変数の設定

```bash
cp .env.example .env
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

## スクリプト

- `npm run dev` - 開発サーバーを起動（ホットリロード付き）
- `npm run build` - TypeScriptをコンパイル
- `npm start` - 本番サーバーを起動
- `npm test` - テストを実行（ウォッチモード）
- `npm run test:run` - テストを実行（1回のみ）
- `npm run typecheck` - 型チェックのみ実行

## API エンドポイント

### ヘルスチェック

- `GET /health` - サーバーの稼働状況を確認

### API

- `GET /api/` - API情報を取得

## ディレクトリ構成

```txt
src/
├── index.ts              # アプリケーションのエントリーポイント
├── database/
│   └── connection.ts     # データベース接続設定
├── middleware/
│   └── errorHandler.ts   # エラーハンドリングミドルウェア
├── routes/
│   ├── index.ts          # メインルーター
│   └── index.test.ts     # ルートのテスト
└── schemas/
    └── index.ts          # Zodスキーマ定義
```

## データベース

SQLite3を使用しています。データベースファイルは `data/database.sqlite` に作成されます。

## 📚 ドキュメント

- [開発ガイド](docs/development-guide.md) - 開発フローと基本的な使い方
- [API仕様書](docs/api-specification.md) - エンドポイントの詳細仕様
- [エラーハンドリング](docs/error-handling.md) - エラーハンドリングシステムの詳細
