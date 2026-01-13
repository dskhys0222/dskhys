# mf-scraper npm パッケージ自動パブリッシュ設定手順

## 全体フロー

```txt
1. npm アカウント作成
    ↓
2. npm API Token 生成
    ↓
3. GitHub Secrets に NPM_TOKEN 登録
    ↓
4. ローカルでバージョン更新
    ↓
5. タグ付き push
    ↓
6. GitHub Actions 自動実行
    ↓
7. npm レジストリに自動公開
```

---

## ステップ 1: npm アカウント準備

### 1.1 npm アカウントを作成

1. [npm.com](https://www.npmjs.com/) にアクセス
2. Sign Up をクリック
3. メールアドレス、ユーザー名、パスワードを入力
4. メール認証を完了

### 1.2 npm にログイン

ローカルマシンで：

```bash
npm login
```

以下を入力：

- Username: npm ユーザー名
- Password: npm パスワード
- Email: 登録したメールアドレス

確認：

```bash
npm whoami
# ユーザー名が表示される
```

---

## ステップ 2: npm API Token 生成

### 2.1 npm.com で API Token を生成

1. npm.com にログイン
2. プロフィール > Access Tokens をクリック
3. Generate new token をクリック
4. Token type: **Publish** を選択
5. Token created をコピー

**注意: Token は表示されるのは 1 回だけです。忘れずにコピー。**

### 2.2 Token スコープ確認

生成された Token の権限：

- ✅ read:packages
- ✅ publish:packages

---

## ステップ 3: GitHub Secrets に NPM_TOKEN を登録

### 3.1 リポジトリ Settings を開く

1. GitHub リポジトリを開く
2. Settings タブをクリック
3. 左側メニュー > Secrets and variables > Actions をクリック

### 3.2 新規シークレット作成

1. New repository secret をクリック
2. 以下を入力:

   - **Name**: `NPM_TOKEN`
   - **Secret**: npm.com からコピーした Token

3. Add secret をクリック

確認：

```txt
Secrets
NPM_TOKEN  Updated just now
```

---

## ステップ 4: 初回パブリッシュ準備

### 4.1 package.json の最終確認

`packages/client/mf-scraper/package.json`:

```json
{
  "name": "@dskhys/mf-scraper",
  "version": "0.0.1",
  "description": "MoneyForward portfolio scraper",
  "license": "ISC",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "mf-scraper": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    ...
  },
  ...
}
```

確認項目：

- ✅ name がスコープ付き（@dskhys/mf-scraper）
- ✅ version が設定されている
- ✅ main が dist/index.js を指している
- ✅ bin フィールドが存在する

### 4.2 ローカルでビルド・テスト

```bash
cd packages/client/mf-scraper

# ビルド
pnpm build

# dist が生成されているか確認
ls -la dist/

# package.json が正しいか確認
npm pack --dry-run
```

---

## ステップ 5: GitHub Actions ワークフロー確認

### 5.1 ワークフローファイルが存在確認

`.github/workflows/publish.yaml` が存在することを確認：

```bash
cat .github/workflows/publish.yaml
```

出力例：

```yaml
name: Publish npm Packages

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

---

## ステップ 6: 初回パブリッシュ実行

### 6.1 バージョン更新（初回パブリッシュの場合）

初回は既に `v0.0.1` として登録されているはず。
変更がある場合のみバージョン更新：

```bash
cd packages/client/mf-scraper

# パッチバージョン更新
npm version patch
```

このコマンドで：

- `package.json` のバージョンが更新される
- `package-lock.json` が更新される
- Git タグが作成される（例：v0.0.2）
- 自動的に commit が作成される

確認：

```bash
git log --oneline -n 3
# v0.0.2 のコミットメッセージが表示される

git tag
# v0.0.2 が表示される
```

### 6.2 リポジトリに push

```bash
# タグを含めて push
git push origin main --tags
```

または：

```bash
# main を push
git push origin main

# その後、タグを push
git push origin --tags
```

---

## ステップ 7: GitHub Actions の実行確認

### 7.1 Actions タブで実行状況を確認

1. GitHub リポジトリを開く
2. Actions タブをクリック
3. 左側メニュー > Publish npm Packages をクリック
4. 最新の実行をクリック

実行ログ例：

```txt
✅ Checkout code
✅ Setup pnpm
✅ Setup Node.js
✅ Install dependencies
✅ Build mf-scraper
✅ Publish to npm

Published @dskhys/mf-scraper@0.0.2 to npm registry
```

### 7.2 npm レジストリで確認

1. npm.com にアクセス
2. プロフィール > Packages をクリック
3. `@dskhys/mf-scraper` が表示される
4. バージョン `0.0.2` が公開されているか確認

または CLI で確認：

```bash
npm info @dskhys/mf-scraper

# 出力例:
# @dskhys/mf-scraper@0.0.2 | ISC | deps: 1 | versions: 2
# MoneyForward portfolio scraper
# ...
# dist
# .tarball: https://registry.npmjs.org/@dskhys/mf-scraper/-/mf-scraper-0.0.2.tgz
# .shasum: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# ...
```

---

## ステップ 8: グローバルインストール確認

公開されたパッケージをインストールして動作確認：

```bash
# 古いバージョンをアンインストール（あれば）
npm uninstall -g @dskhys/mf-scraper

# 公開されたバージョンをインストール
npm install -g @dskhys/mf-scraper

# コマンドが利用可能か確認
mf-scraper --version
# mf-scraper v0.0.2

mf-scraper --help
# ヘルプが表示される
```

---

## 今後の更新フロー（簡単版）

```bash
# 1. コードを修正
# ... (編集)

# 2. バージョン更新
cd packages/client/mf-scraper
npm version patch  # または minor / major

# 3. Push
git push origin main --tags

# 4. GitHub Actions が自動実行 → npm に公開
```

---

## トラブルシューティング

### パッケージが公開されない

**ログを確認：**

1. GitHub > Actions > Publish npm Packages
2. 最新の実行をクリック
3. Publish to npm ステップを確認

**よくあるエラー:**

| エラー                                                     | 原因                     | 解決                                         |
| ---------------------------------------------------------- | ------------------------ | -------------------------------------------- |
| `Unable to authenticate with npm`                          | NPM_TOKEN が未設定       | GitHub Secrets に NPM_TOKEN を登録           |
| `You cannot publish over the previously published version` | 同じバージョンで公開済み | `npm version` でバージョンを更新             |
| `403 Forbidden`                                            | スコープ名が被っている   | @dskhys/ の権限確認                          |
| `ENEEDDOUBLE PUBLISH`                                      | npm publish 権限不足     | npm API Token の権限確認（Publish スコープ） |

### ワークフローが起動しない

**手動実行で確認:**

1. GitHub > Actions > Publish npm Packages
2. Run workflow をクリック
3. Run workflow をクリック

手動実行で成功する場合：

- paths フィルタが厳しい可能性
- `.github/workflows/publish.yaml` の paths を確認

---

## セキュリティ考慮事項

### 1. NPM_TOKEN の管理

- Token は GitHub Secrets に安全に保管
- リポジトリファイルに Token を保存しない
- 定期的に古い Token を削除

### 2. npm スコープの権限

- @dskhys スコープへの write 権限が必要
- npm.org で Organization 管理を確認

### 3. 本番パッケージの署名

署名を有効にすることで、パッケージの真正性を保証：

```bash
npm publish --sign-git-tag
```

---

## 参考リンク

- [npm API Token 作成](https://docs.npmjs.com/creating-and-viewing-access-tokens)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [npm publish コマンド](https://docs.npmjs.com/cli/v10/commands/npm-publish)
- [Semantic Versioning](https://semver.org/)
