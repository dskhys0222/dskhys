# PandaCSS 導入手順（budget クライアント）

## 対象

- パッケージ: `packages/client/budget`

## 追加する依存関係

- `@pandacss/dev`（devDependencies）

## 追加/変更するファイル

### Panda 設定

- `packages/client/budget/panda.config.ts`
  - `defineConfig` を使用して設定
  - 入力: `src/**/*.{ts,tsx}`
  - 出力: `styled-system/`
  - `preflight: true`

### PostCSS 設定

- `packages/client/budget/postcss.config.cjs`
  - `@pandacss/dev/postcss` を有効化

### エントリポイントで CSS 取り込み

- `packages/client/budget/src/main.tsx`
  - `import '../styled-system/styles.css'` ではなく、同階層に生成される `styled-system/styles.css` を import
  - 取り込みにより preflight を含む Panda の CSS が反映される

### npm scripts

- `packages/client/budget/package.json`
- `packages/client/budget/package.json`
  - `prepare`: `panda codegen`
  - 任意: `panda`: `panda`

## 動作確認手順

- `pnpm budget dev`
- `pnpm budget build`
- いずれも `styled-system/` が生成され、Vite/tsc が成功すること

## 注意点

- `packages/client/budget` は `type: module` のため、PostCSS 設定は `postcss.config.cjs` を推奨する
  - 理由: `postcss.config.js` は ESM 扱いになりやすく、PostCSS 側（または関連ツール）の設定読込が CommonJS 前提のケースで動かない/ハマりやすい
  - `.cjs` にすることで CommonJS として確実に読ませられる
- 生成物 `styled-system/` はコミットせず、CI/ローカル実行で都度生成する
