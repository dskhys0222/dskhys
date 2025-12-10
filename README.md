# dskhys

このプロジェクトは、システムのバックエンド、フロントエンド、インフラのドキュメントやソースコードなど、関連するものを一括で管理するためのものです。
このシステムは、私が個人的に使用するものであり、商用利用や第三者への提供は予定していません。

## ディレクトリ構成

pnpm workspace を利用したモノレポとする。

```txt
dskhys/
├── .devcontainer/         # 開発環境の設定
├── .github/workflows/     # CI/CDの設定
├── docs/                  # ドキュメント
├── packages/
│   ├── server/           # サーバー用アプリケーション
│   └── client/           # クライアント用アプリケーション
│   └── libs/             # 共通ライブラリ
└── deployment/            # デプロイ用
```

## 基本コマンド

```bash
# linter
pnpm lint

# formatter
pnpm format

# テスト（APIサーバー）
pnpm api test

# ビルド（APIサーバー）
pnpm api build

# 開発サーバー起動（APIサーバー）
pnpm api dev
```

## 開発規約

[開発規約](./docs/guidelines/development-guidelines.md)を参照すること。
