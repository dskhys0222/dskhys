# 開発規約

- ドキュメントは markdown 形式で作成すること
- 図は mermaid 形式で作成し、markdown 内に埋め込むこと
- yaml ファイルの拡張子は`.yaml`にすること

## 最低限必要な環境

- Docker
- Visual Studio Code
- Dev Containers 拡張機能

## 開発フロー

すべての開発は以下のステップで進めること。
また、各ステップの間にレビューを挟むこと。

1. ドキュメントを作成する
2. テストコードを作成する
3. プロダクトコードを作成する

## 使用するライブラリ

### 🌐 サーバーサイド

- プログラミング言語: TypeScript
- ランタイム: Node.js
- フレームワーク: Express
- データベース: SQLite3
- ORM: Drizzle
- API 設計: REST API
- バリデーション: Zod
- リンター: Biome
- 単体テスト: Vitest
- API テスト：Supertest
- サーバー構成:
  - VPS 上にデプロイ
  - OS: Ubuntu Server
  - HTTP サーバー: Nginx (Express へのリバースプロキシを設定)
  - 構成管理: Docker Compose

### 🖥️ クライアントサイド

- 開発対象: PWA
- ローカル動作: サポート必須
- プログラミング言語: TypeScript
- フロントエンド: React
- バンドラー: Vite
- フォーム: React Hook Form
- バリデーション: Zod
- 状態管理: Zustand
- ルーティング: React Router
- リンター: Biome
- 単体テスト: Vitest
- UI テスト：Storybook
- E2E テスト：Playwright
