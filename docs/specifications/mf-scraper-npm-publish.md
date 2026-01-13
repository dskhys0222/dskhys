# mf-scraper npm パッケージ自動パブリッシュ設定

## 実装概要

`.github/workflows/publish.yaml` を作成して、GitHub Actions で npm パッケージを自動パブリッシュします。

## ワークフロー設定

### トリガー条件

```yaml
on:
  push:
    branches:
      - "main"
    paths:
      - "packages/client/mf-scraper/package.json"
      - "packages/client/mf-scraper/src/**"
      - ".github/workflows/publish.yaml"
  workflow_dispatch:
```

- **main ブランチへのプッシュ** で自動実行
- **以下の変更** をトリガー:
  - `package.json` の変更（バージョン更新）
  - `src/` ディレクトリの変更（コード更新）
  - ワークフローファイル自体の変更
- **workflow_dispatch** で手動実行可能

### ジョブ構成

#### 1. コード取得

```yaml
- name: Checkout code
  uses: actions/checkout@v4
```

#### 2. pnpm セットアップ

```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v4
```

#### 3. Node.js セットアップ

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version-file: "package.json"
    cache: "pnpm"
    registry-url: "https://registry.npmjs.org"
```

`registry-url` により npm レジストリ認証が自動設定される

#### 4. 依存関係のインストール

```yaml
- name: Install dependencies
  run: pnpm install --frozen-lockfile
```

#### 5. ビルド

```yaml
- name: Build mf-scraper
  run: pnpm mf-scraper build
```

TypeScript をコンパイルして `dist/` を生成

#### 6. npm パブリッシュ

```yaml
- name: Publish to npm
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
  run: |
    cd packages/client/mf-scraper
    npm publish --access public
```

- `NODE_AUTH_TOKEN` に `NPM_TOKEN` シークレットを指定
- `--access public` でパブリックパッケージとして公開

## バージョン管理

### package.json バージョン更新フロー

```txt
┌────────────────────────────────┐
│ ローカルでバージョン更新        │
│ npm version patch/minor/major   │
└──────────────┬─────────────────┘
               │
               ▼
┌────────────────────────────────┐
│ タグが自動作成される           │
│ v0.0.2 など                    │
└──────────────┬─────────────────┘
               │
               ▼
┌────────────────────────────────┐
│ git push main --tags で push    │
└──────────────┬─────────────────┘
               │
               ▼
┌────────────────────────────────┐
│ GitHub Actions 起動             │
│ package.json の変更を検知       │
└──────────────┬─────────────────┘
               │
               ▼
┌────────────────────────────────┐
│ npm publish で新バージョンを    │
│ レジストリに公開                │
└────────────────────────────────┘
```

## npm 認証設定

### NPM_TOKEN シークレットの登録

1. npm アカウントを作成・ログイン
2. npm.org で API Token を生成（read:packages, publish スコープ）
3. GitHub リポジトリの Settings > Secrets and variables > Actions で `NPM_TOKEN` を登録

```txt
Secret name: NPM_TOKEN
Secret value: npm_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 使用方法

### ローカルでバージョン更新

```bash
cd packages/client/mf-scraper

# パッチバージョン更新（0.0.1 → 0.0.2）
npm version patch

# マイナーバージョン更新（0.0.1 → 0.1.0）
npm version minor

# メジャーバージョン更新（0.0.1 → 1.0.0）
npm version major
```

このコマンド実行時：

- `package.json` のバージョンが自動更新
- `package-lock.json` が自動更新
- Git タグが自動作成（例：v0.0.2）

### リポジトリに push

```bash
# タグを含めて push
git push origin main --tags
```

または

```bash
# main ブランチを push
git push origin main

# その後、タグを push
git push origin --tags
```

### ワークフロー実行を確認

GitHub リポジトリの Actions タブで実行状況を確認：

- Publish to npm ワークフローが実行
- ビルドとパブリッシュのログが表示

## トラブルシューティング

### パブリッシュが失敗する

#### 原因 1: NPM_TOKEN が設定されていない

```txt
Error: Unable to authenticate with npm
```

解決: GitHub Secrets に NPM_TOKEN を登録

#### 原因 2: バージョンがすでに存在

```txt
You cannot publish over the previously published version
```

解決: `npm version` でバージョンを更新してから push

#### 原因 3: パッケージ名が既に使用されている

```txt
ERR! 403 Forbidden
```

解決: `package.json` の name を確認（スコープ付き名前 @dskhys/mf-scraper）

### ワークフローが起動しない

#### 原因: paths フィルタで引っかかっている

手動実行で確認：

```txt
GitHub Actions > Publish to npm > Run workflow > Run workflow
```

手動実行で成功する場合、paths フィルタをダブルチェック

## 参考リンク

- [GitHub Actions: setup-node](https://github.com/actions/setup-node)
- [npm CLI: publish](https://docs.npmjs.com/cli/v10/commands/npm-publish)
- [npm: Creating and publishing unscoped public packages](https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
