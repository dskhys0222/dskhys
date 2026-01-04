# PandaCSS 導入（クライアントのスタイリング基盤）

## 背景

クライアントサイドのスタイリング手段として PandaCSS を採用する（開発規約の技術スタックに準拠）。
現状、`packages/client/budget` は CSS の導入がなく、コンポーネントの見た目が未整備である。

## 目的

- `packages/client/budget` に PandaCSS を導入し、型安全なスタイリングを可能にする
- Vite でビルド/開発時に Panda の生成物を参照できる状態にする

## スコープ

- 対象: `packages/client/budget`
- 非対象（本要件では対応しない）:
  - `packages/client/web` への PandaCSS 導入
  - 既存コンポーネントのデザイン改修（見た目の作り込み）
  - デザイントークン策定

## 受け入れ条件

- `packages/client/budget` に PandaCSS の設定が追加されている
- `pnpm --filter @dskhys/budget dev` と `pnpm --filter @dskhys/budget build` が成功する
- Panda が生成する CSS（`styled-system/styles.css`）がアプリに取り込まれている
- `panda codegen` を実行すると `styled-system/` が生成され、型エラーなく参照できる

## 運用ルール

- 生成物（`styled-system/`）はコミットしない方針とし、必要なタイミングで `panda codegen` を実行する
- `prepare` で `panda codegen` が実行されるよう npm scripts で担保する
