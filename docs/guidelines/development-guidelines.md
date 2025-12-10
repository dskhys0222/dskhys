# 開発規約

- ドキュメントは markdown 形式で作成すること
- ただし、API 仕様書だけは yaml の OpenAPI 形式とすること
- 図は mermaid 形式で作成し、markdown 内に埋め込むこと
- yaml ファイルの拡張子は`.yaml`にすること

## 最低限必要な環境

- Docker
- Visual Studio Code
- Dev Containers 拡張機能

## 技術スタック

### 共通

- リンタ―: Biome

### 🌐 サーバーサイド

- プログラミング言語: TypeScript
- ランタイム: Node.js
- フレームワーク: Express
- データベース: SQLite3
- ORM: Drizzle
- API 設計: REST API
- バリデーション: Zod
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
- スタイリング: Panda CSS
- バンドラー: Vite
- フォーム: React Hook Form
- バリデーション: Zod
- 状態管理: Zustand
- ルーティング: React Router
- 単体テスト: Vitest
- UI テスト：Storybook
- E2E テスト：Playwright
