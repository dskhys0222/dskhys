# dskhys

個人用アプリ開発プロジェクト

モノレポにする予定

## プロジェクト構成

```
dskhys/
├── apps/
│   ├── server/api/      # APIサーバー（Express + TypeScript）
│   └── client/memo/     # クライアントアプリ（予定）
├── libs/
│   └── util/            # 共通ユーティリティ
├── .github/workflows/   # GitHub Actions CI/CD
├── docs/                # ドキュメント
└── docker-compose.yml   # デプロイ設定
```

## 開発

### 前提条件

- Node.js 20以上
- npm

### セットアップ

```bash
# 依存関係のインストール
npm install

# リント
npm run lint

# テスト（APIサーバー）
cd apps/server/api
npm run test

# ビルド（APIサーバー）
npm run build

# 開発サーバー起動
npm run dev
```

## デプロイ

このプロジェクトは GitHub Actions を使用した自動デプロイに対応しています。

### 自動デプロイ

`main` ブランチへのプッシュで自動的に以下が実行されます：

1. **テスト** - リントとユニットテストの実行
2. **ビルド** - TypeScriptのコンパイル
3. **デプロイ** - Linux サーバーへ SSH で配布し、Docker Compose で起動

### デプロイ設定

詳細な設定手順は以下のドキュメントを参照してください：

- [デプロイメント設定](docs/deployment.md) - サーバー準備とデプロイの手順
- [GitHub Secrets 設定](docs/secrets-setup.md) - 必要なシークレットの設定方法

### 手動デプロイ

GitHub の Actions タブから "Deploy to Server" ワークフローを選択し、"Run workflow" をクリックして手動実行できます。

## ライセンス

ISC
