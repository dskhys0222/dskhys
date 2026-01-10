# PandaCSS 導入手順（portfolio クライアント）

## 対象

- パッケージ: `packages/client/portfolio`

## 追加する依存関係

- `@pandacss/dev`（devDependencies）

## 追加/変更するファイル

### Panda 設定

- `packages/client/portfolio/panda.config.ts`
  - `defineConfig` を使用して設定
  - 入力: `./src/**/*.{ts,tsx}`
  - 出力: `styled-system/`
  - `preflight: true`
  - `jsxFramework: 'react'`

### PostCSS 設定

- `packages/client/portfolio/postcss.config.cjs`
  - `@pandacss/dev/postcss` を有効化

### エントリポイントで CSS 取り込み

- `packages/client/portfolio/index.css`
  - Panda CSS のレイヤー定義を記述
  - `@layer reset, base, tokens, recipes, utilities;`
- `packages/client/portfolio/index.html`
  - `<link rel="stylesheet" href="/index.css" />` で読み込み

### npm scripts

- `packages/client/portfolio/package.json`
  - `prepare`: `panda codegen`
  - コード生成を自動化

## 動作確認手順

- `pnpm portfolio dev`
- `pnpm portfolio build`
- いずれも `styled-system/` が生成され、Vite/tsc が成功すること

## 注意点

- `packages/client/portfolio` は `type: module` のため、PostCSS 設定は `postcss.config.cjs` を推奨する
  - 理由: `postcss.config.js` は ESM 扱いになりやすく、PostCSS 側（または関連ツール）の設定読込が CommonJS 前提のケースで動かない/ハマりやすい
  - `.cjs` にすることで CommonJS として確実に読ませられる
- 生成物 `styled-system/` はコミットせず、CI/ローカル実行で都度生成する
- `.gitignore` に `styled-system/` を追加する

## スタイリング方針

### コンポーネントスタイル

```typescript
import { css } from '../styled-system/css';

const styles = {
  container: css({
    padding: '1rem',
    backgroundColor: 'gray.50',
  }),
};
```

### パターンの活用

```typescript
import { flex, grid } from '../styled-system/patterns';

<div className={flex({ direction: 'column', gap: '4' })}>
  {/* コンテンツ */}
</div>
```

### トークンの使用

- 色: `green.500`, `blue.600`, `gray.100` など
- スペーシング: `1`, `2`, `4`, `8` など
- フォントサイズ: `sm`, `md`, `lg`, `xl` など
- ブレークポイント: `sm`, `md`, `lg`, `xl` など

### レスポンシブデザイン

```typescript
const styles = css({
  fontSize: { base: 'sm', md: 'md', lg: 'lg' },
  padding: { base: '2', md: '4', lg: '6' },
});
```
