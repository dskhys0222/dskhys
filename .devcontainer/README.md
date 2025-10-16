# DevContainer 開発環境

このプロジェクトは、VS Code の Dev Container を使用した開発環境をサポートしています。

## 必要な環境

- Docker Desktop
- Visual Studio Code
- Dev Containers 拡張機能

## 使い方

1. Docker Desktop を起動
2. VS Code でこのプロジェクトを開く
3. コマンドパレット (Ctrl+Shift+P / Cmd+Shift+P) を開く
4. "Dev Containers: Reopen in Container" を実行

## 含まれる機能

### 開発ツール

- Node.js 22.16.0
- Git
- GitHub CLI

### VS Code 拡張機能

- Biome (フォーマッター & リンター)
- TypeScript
- GitHub Copilot
- GitLens
- Error Lens

### ポートフォワーディング

- 3000: API Server
- 5173: Client (Vite)

## 初回起動後

コンテナが起動すると、自動的に `npm install` が実行されます。

開発を開始するには:

```bash
# API サーバーの起動
cd apps/server/api
npm run dev

# テストの実行
npm test
```

## SSH キーの利用

ホストマシンの SSH キーが自動的にコンテナにマウントされます（読み取り専用）。
これにより、Git の操作が可能になります。

## トラブルシューティング

### コンテナのリビルド

設定を変更した場合や問題が発生した場合:

1. コマンドパレットを開く
2. "Dev Containers: Rebuild Container" を実行

### 依存関係の再インストール

```bash
# ルートで
npm install

# 各ワークスペースで
cd apps/server/api && npm install
```
