# mf-scraper npm グローバルインストール設定

## 実装概要

### 変更内容

#### 1. `package.json` に `bin` フィールドを追加

```json
{
  "bin": {
    "mf-scraper": "./dist/index.js"
  }
}
```

#### 2. `src/index.ts` に shebang を追加

```typescript
#!/usr/bin/env node
```

shebang により、スクリプトを直接実行可能にする（Unix/Linux/Mac）

### 実行フロー

```txt
┌─────────────────────────────────────┐
│ npm install -g @dskhys/mf-scraper   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ node_modules/.bin/mf-scraper へ     │
│ シンボリックリンクが作成            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ $ mf-scraper (コマンドで実行)        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ dist/index.js が実行される           │
│ shebang により Node.js で解釈       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Playwright が初回時に自動で         │
│ ブラウザをダウンロード              │
└─────────────────────────────────────┘
```

### 必要な設定

| 項目             | 説明                     |
| ---------------- | ------------------------ |
| `bin` フィールド | npm にコマンドとして登録 |
| `shebang`        | スクリプトの実行権限設定 |
| `type: "module"` | ESM 形式でのコンパイル   |

## 使用方法

### インストール

```bash
npm install -g @dskhys/mf-scraper
```

### 初回実行（ブラウザをダウンロード）

```bash
mf-scraper
```

初回実行時は Playwright がブラウザをダウンロードするため、時間がかかります（約 1-5 分）

### 以後の実行

```bash
mf-scraper
```

キャッシュされたブラウザを使用するため、高速に実行されます

### ログイン（初回のみ）

```bash
mf-scraper login
```

セッションを `~/.config/mf-scraper/auth.json` に保存

### アンインストール

```bash
npm uninstall -g @dskhys/mf-scraper
```

## 環境変数

Playwright のオプション制御：

```bash
# ブラウザをダウンロード
PLAYWRIGHT_DOWNLOAD_HOST=https://... mf-scraper

# デバッグモード
DEBUG=pw:api mf-scraper
```

## トラブルシューティング

### コマンドが見つからない

```bash
# npm の bin ディレクトリを確認
npm bin -g

# シンボリックリンクを確認
ls -la /usr/local/bin/mf-scraper
```

### ブラウザのダウンロードに失敗

```bash
# Playwright キャッシュをクリア
rm -rf ~/.cache/ms-playwright

# 再度実行
mf-scraper
```

### 権限不足エラー

```bash
# ユーザーの npm グローバルディレクトリを確認・修正
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH

# 再度インストール
npm install -g @dskhys/mf-scraper
```
