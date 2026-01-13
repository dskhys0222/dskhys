# mf-scraper サブコマンド実装

## 概要

`mf-scraper` コマンドでサブコマンド方式に対応しました。
単一の npm コマンドで複数の機能を実行できます。

## 実装内容

### 1. `index.ts` にコマンドライン処理を実装

```typescript
#!/usr/bin/env node

const command = process.argv[2];
switch (command) {
  case "login":
    await login();
    break;
  case "--help":
  case "-h":
    printHelp();
    break;
  case "--version":
  case "-v":
    printVersion();
    break;
  default:
    // コマンドがない場合: スクレイピング実行
    await scrape();
}
```

### 2. `login.ts` をモジュール化

`main()` を `login()` にリネームしてエクスポート：

```typescript
export const login = async (): Promise<void> => {
  // ログイン処理
};
```

これにより `index.ts` から import して実行可能に。

### 3. スクレイピング処理を関数化

元の `main()` を `scrape()` に抽出して、`index.ts` から呼び出し可能に。

## サポートするコマンド

| コマンド                      | 説明                                         |
| ----------------------------- | -------------------------------------------- |
| `mf-scraper`                  | ポートフォリオをスクレイピング（デフォルト） |
| `mf-scraper login`            | MarketForward にログイン（初回必須）         |
| `mf-scraper --help` / `-h`    | ヘルプを表示                                 |
| `mf-scraper --version` / `-v` | バージョン情報を表示                         |

## 実行フロー

```txt
$ mf-scraper login
  ↓
package.json の "bin" → ./dist/index.js
  ↓
Node.js で index.js を実行
  ↓
process.argv[2] === 'login' を検出
  ↓
login.ts の login() 関数を実行
  ↓
ブラウザが開く → ユーザーが手動でログイン
```

## 使用方法

### ヘルプの表示

```bash
mf-scraper --help
```

```txt
=== mf-scraper ===

MoneyForward からポートフォリオデータをスクレイピングして、
APIサーバーに送信するバッチアプリケーション

【使用方法】

  mf-scraper              ポートフォリオをスクレイピング
  mf-scraper login        マネーフォワードにログイン（初回必須）
  mf-scraper --help       このヘルプを表示
  mf-scraper --version    バージョン情報を表示
```

### 初回ログイン

```bash
mf-scraper login
```

設定ファイルが存在しない場合、先に作成が必要：

```bash
mkdir -p ~/.config/mf-scraper
cat > ~/.config/mf-scraper/config.json << 'EOF'
{
  "encryptionKey": "...",
  "apiUrl": "https://...",
  "apiUsername": "...",
  "apiPassword": "..."
}
EOF
```

### スクレイピング実行

```bash
mf-scraper
```

or

```bash
mf-scraper scrape
```

（デフォルトはスクレイピングなので、コマンド省略可能）

## ビルド

```bash
pnpm build
```

変更後は必ずビルドして、`dist/` が更新されることを確認してください。

## テスト

```bash
# ビルド後、ローカルでテスト
cd packages/client/mf-scraper
npm link

# コマンドが利用可能か確認
mf-scraper --help
mf-scraper --version
```
