# mf-scraper 自動バージョン採番

## 概要

ビルド時にコミットハッシュを使用して、バージョンを自動採番します。
手動でバージョン番号を更新する必要はありません。

## 実装方式

### バージョン形式

```txt
0.0.0+git.{7文字のコミットハッシュ}
```

例:

- `0.0.0+git.6d898ff`
- `0.0.0+git.a1b2c3d`

### 仕組み

```txt
ビルド実行（pnpm build）
    ↓
prebuild スクリプト（scripts/generate-version.js）
    ↓
git rev-parse --short HEAD でコミットハッシュ取得
    ↓
src/version.ts を自動生成
    ↓
TypeScript コンパイル
    ↓
dist/version.js にバージョン情報が埋め込まれる
    ↓
mf-scraper --version で表示
```

## ファイル構成

### 新規作成ファイル

#### `src/version.ts`（テンプレート）

```typescript
export const VERSION = "0.0.0+git.local";
export const GIT_HASH = "local";
export const BUILD_DATE = new Date().toISOString();
```

**注:** ビルド時に自動生成されるため、テンプレートとしてコミットします。

#### `scripts/generate-version.js`

```javascript
/**
 * バージョン自動生成スクリプト
 * ビルド前に実行され、git コミットハッシュからバージョンを生成
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

try {
  // Git コミットハッシュを取得（短い形式）
  const gitHash = execSync('git rev-parse --short HEAD', {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'ignore'],
  }).trim();

  // バージョンスト文字列
  const version = `0.0.0+git.${gitHash}`;

  // version.ts の内容を生成
  const versionContent = `...`;

  // ファイルに書き込み
  const versionFile = join(process.cwd(), 'src', 'version.ts');
  writeFileSync(versionFile, versionContent, 'utf-8');

  console.log(`✓ Version generated: ${version}`);
} catch (error) {
  // Git リポジトリでない場合はデフォルト値を使用
  ...
}
```

**主な機能:**

- `git rev-parse --short HEAD` でコミットハッシュを取得
- `src/version.ts` に VERSION、GIT_HASH、BUILD_DATE を書き込み
- Git リポジトリでない場合（npm tar ball など）のフォールバック処理

### 修正ファイル

#### `package.json`

```json
{
  "scripts": {
    "prebuild": "node scripts/generate-version.js",
    "build": "tsc",
    ...
  }
}
```

`prebuild` スクリプトを追加。`pnpm build` 実行時に自動実行されます。

#### `src/index.ts`

```typescript
import { VERSION } from "./version.js";

const printVersion = (): void => {
  console.log(`mf-scraper ${VERSION}`);
};
```

`version.ts` をインポートし、`--version` オプションで表示。

## ビルドフロー

### 標準的なビルド

```bash
pnpm build
```

実行内容:

1. **prebuild**: `scripts/generate-version.js` 実行
   - コミットハッシュ取得
   - `src/version.ts` 生成
2. **build**: `tsc` で TypeScript をコンパイル
   - `dist/version.js` に VERSION が埋め込まれる

### ビルド出力例

```txt
> @dskhys/mf-scraper@0.0.1 prebuild
> node scripts/generate-version.js

✓ Version generated: 0.0.0+git.6d898ff
  Git Hash: 6d898ff
  Build Date: 2026-01-13T22:50:45.159Z

> @dskhys/mf-scraper@0.0.1 build
> tsc
```

## バージョン表示

### コマンドから確認

```bash
mf-scraper --version
# mf-scraper 0.0.0+git.6d898ff
```

### npm レジストリで確認

```bash
npm info @dskhys/mf-scraper

# 出力例:
# @dskhys/mf-scraper@0.0.0+git.6d898ff
# MoneyForward portfolio scraper
# ...
```

## npm パブリッシュ時の注意

### パッケージのバージョン表示

npm に publish されたパッケージは `0.0.0+git.{hash}` というバージョンで公開されます。

例:

- `@dskhys/mf-scraper@0.0.0+git.6d898ff`

### タグ・リリースノートでのバージョン管理

Semantic Versioning に従うのであれば、GitHub Tags と Release Notes でバージョンを管理することを推奨：

```txt
GitHub Release v1.0.0  ← 人間が読むバージョン
    ↓
npm パッケージ 0.0.0+git.abc123  ← 実装バージョン（自動生成）
```

## エッジケース対応

### Git リポジトリでない場合

npm tar ball などから tar 展開した場合、Git リポジトリではありません。

この場合、スクリプトは以下を実行：

```typescript
export const VERSION = "0.0.0+git.unknown";
export const GIT_HASH = "unknown";
export const BUILD_DATE = "...";
```

デフォルト値が使用され、ビルドは失敗しません。

### ビルド環境での Git 設定

CI/CD パイプライン（GitHub Actions など）では、リポジトリが自動的にチェックアウトされるため問題ありません。

## メリット・デメリット

### メリット ✅

- **手動管理が不要** - コミットハッシュから自動採番
- **バージョンが確実に Git と同期** - ビルド時刻によるズレなし
- **CI/CD フレンドリー** - GitHub Actions などで自動化可能
- **トレーサビリティ** - どのコミットからビルドされたかが明確

### デメリット ❌

- **Semantic Versioning に準拠していない** - `0.0.0+git.xxx` という形式
- **npm レジストリ上のバージョンが常に `0.0.0.xxx`** - 人間にとって分かりにくい
- **バージョン文字列が長い** - `0.0.0+git.6d898ff` と冗長

## 改善案

より Semantic Versioning に準拠させたい場合、GitHub Actions と `conventional-changelog` を組み合わせることで、自動的に major/minor/patch を採番できます。
（別途実装が必要）

## 参考

- [npm Semver](https://docs.npmjs.com/about-semantic-versioning)
- [Git Describe](https://git-scm.com/docs/git-describe)
