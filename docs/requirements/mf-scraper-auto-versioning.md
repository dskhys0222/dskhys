# mf-scraper 自動バージョン採番

## 概要

ビルド時にコミットハッシュを使用してバージョンを自動採番します。
手動でバージョン番号を更新する必要はありません。

## 要件

- ビルド前にコミットハッシュを取得
- `src/version.ts` に VERSION、GIT_HASH、BUILD_DATE を自動生成
- `--version` オプションで自動生成バージョンを表示
- Git リポジトリでない場合も処理を続行

## バージョン形式

```txt
0.0.0+git.{7文字のコミットハッシュ}
```

例: `0.0.0+git.6d898ff`

## 成功条件

1. `pnpm build` 実行時に `prebuild` スクリプトが自動実行される
2. `scripts/generate-version.js` がコミットハッシュを取得できる
3. `src/version.ts` が自動生成される
4. `mf-scraper --version` で `0.0.0+git.{hash}` 形式で表示される
5. npm publish 時に自動生成バージョンがパッケージに含まれる
