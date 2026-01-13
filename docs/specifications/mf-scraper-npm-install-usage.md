# mf-scraper グローバルインストール手順

## ステップ 1: npm パッケージの公開設定

### 前提条件

- npm アカウント登録済み
- パッケージのバージョンを更新

### 1.1 package.json のバージョン更新

```bash
cd packages/client/mf-scraper
npm version patch  # v0.0.1 → v0.0.2 など
```

### 1.2 npm にパブリッシュ（オプション）

```bash
npm publish --access public
```

**注）プライベートレジストリを使用する場合：**

```bash
npm config set registry https://your-private-registry.com
npm publish
```

---

## ステップ 2: ローカルでのグローバルインストール

### 2.1 開発中のテスト方法

```bash
# プロジェクトルートから
cd packages/client/mf-scraper

# ビルド
pnpm build

# グローバルインストール（シンボリックリンク）
npm link

# コマンドが利用可能か確認
which mf-scraper
mf-scraper --version
```

### 2.2 サブコマンドのテスト

```bash
# ヘルプ表示
mf-scraper --help

# ログイン
mf-scraper login

# スクレイピング（デフォルト）
mf-scraper
```

### 2.3 テスト完了後のクリーンアップ

```bash
npm unlink
```

---

## ステップ 3: ユーザー向けインストール手順

### 3.1 npm グローバルインストール

```bash
# npm レジストリから直接インストール
npm install -g @dskhys/mf-scraper

# または pnpm
pnpm add -g @dskhys/mf-scraper
```

### 3.2 設定ファイルの準備

設定ファイルの場所：

- **Windows**: `%USERPROFILE%\.config\mf-scraper\config.json`
- **macOS/Linux**: `~/.config/mf-scraper/config.json`

必要な内容：

```json
{
  "encryptionKey": "Base64エンコードされた32バイトのキー",
  "apiUrl": "https://api.example.com",
  "apiUsername": "ユーザー名",
  "apiPassword": "パスワード"
}
```

**ファイル権限の設定（macOS/Linux）:**

```bash
chmod 600 ~/.config/mf-scraper/config.json
```

### 3.3 ログイン（初回のみ）

```bash
# マネーフォワードにログイン、セッションを保存
mf-scraper login
```

**実行内容:**

1. ブラウザが開く
2. メールアドレスとパスワードを入力
3. 2FA コードを入力
4. ログイン完了を自動検知 → セッション保存

### 3.4 スクレイピング実行

```bash
mf-scraper
```

**初回実行時の挙動:**

- Playwright が Chromium ブラウザをダウンロード（1-5 分）
- ターミナルに進捗が表示されます
- 以後はキャッシュから高速に実行

### 3.5 コマンド一覧

```bash
mf-scraper                 # スクレイピング実行（デフォルト）
mf-scraper login           # マネーフォワードにログイン
mf-scraper --help          # ヘルプを表示
mf-scraper --version       # バージョンを表示
```

---

## ステップ 4: クロンジョブでの定期実行

### 4.1 crontab 設定（macOS/Linux）

```bash
# エディタを開く
crontab -e

# 毎日午前 3 時に実行
0 3 * * * /usr/local/bin/mf-scraper

# または自動出力をログに記録
0 3 * * * /usr/local/bin/mf-scraper >> ~/.local/share/mf-scraper.log 2>&1
```

**確認:**

```bash
# 登録されたジョブを確認
crontab -l
```

### 4.2 タスクスケジューラー設定（Windows）

PowerShell（管理者）で実行：

```powershell
# タスクアクションを定義
$action = New-ScheduledTaskAction -Execute "mf-scraper"

# トリガーを定義（毎日午前 3 時）
$trigger = New-ScheduledTaskTrigger -Daily -At 3:00AM

# タスクを登録
Register-ScheduledTask `
  -Action $action `
  -Trigger $trigger `
  -TaskName "mf-scraper" `
  -Description "MoneyForward portfolio scraper"
```

**確認:**

```powershell
# タスクを確認
Get-ScheduledTask -TaskName "mf-scraper"
```

### 4.3 出力をログに記録（Windows）

PowerShell スクリプト（`run-mf-scraper.ps1`）を作成：

```powershell
$LogPath = "$env:APPDATA\mf-scraper\logs"
if (!(Test-Path $LogPath)) {
    New-Item -ItemType Directory -Path $LogPath -Force | Out-Null
}

$LogFile = "$LogPath\$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss').log"
& mf-scraper | Tee-Object -FilePath $LogFile
```

スクリプトをタスクスケジューラーから実行：

```powershell
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-File C:\Path\to\run-mf-scraper.ps1"
```

---

## ステップ 5: アップデート方法

### 5.1 npm からアップデート

```bash
npm update -g @dskhys/mf-scraper
```

### 5.2 バージョン確認

```bash
mf-scraper --version

# または npm 経由で確認
npm list -g @dskhys/mf-scraper
```

---

## ステップ 6: アンインストール

```bash
npm uninstall -g @dskhys/mf-scraper

# 設定ファイルは手動で削除
rm -rf ~/.config/mf-scraper  # macOS/Linux
rmdir /s %USERPROFILE%\.config\mf-scraper  # Windows
```

---

## トラブルシューティング

### コマンドが見つからない

```bash
# npm グローバルパスを確認
npm config get prefix

# 環境変数 PATH に npm/bin が含まれているか確認
echo $PATH  # macOS/Linux
echo %PATH%  # Windows
```

**解決方法（Windows）:**

```powershell
# npm のグローバルパスを確認
npm config get prefix

# PATH に追加されていない場合、手動で追加
$env:Path += ";$([Environment]::GetEnvironmentVariable('APPDATA'))\npm"
```

### ブラウザのダウンロード失敗

```bash
# Playwright キャッシュをクリア
rm -rf ~/.cache/ms-playwright  # macOS/Linux
rmdir /s %USERPROFILE%\AppData\Local\ms-playwright  # Windows

# 再度実行
mf-scraper
```

### Playwright のブラウザ互換性エラー

```bash
# Playwright の再インストール
npm uninstall -g @dskhys/mf-scraper
npm install -g @dskhys/mf-scraper
```

### ログイン処理がタイムアウト

```bash
# 5 分以内にログインを完了してください
# 再度実行
mf-scraper login
```

### セッションが期限切れ

```bash
# ログイン情報を更新
mf-scraper login
```

### API サーバーへの接続エラー

- 設定ファイルの `apiUrl`、`apiUsername`、`apiPassword` を確認
- API サーバーが稼働しているか確認
- ネットワーク接続を確認

```bash
# 設定ファイルの確認
cat ~/.config/mf-scraper/config.json  # macOS/Linux
type %USERPROFILE%\.config\mf-scraper\config.json  # Windows
```

---

## セキュリティ考慮事項

### 1. 設定ファイルのアクセス権限

```bash
# macOS/Linux: 所有者のみ読取可能
chmod 600 ~/.config/mf-scraper/config.json

# Windows: 自動的に保護されます
```

### 2. API パスワードの保護

- API パスワードを設定ファイルに保存しないか、環境変数を使用する検討
- 定期的にパスワードをリセット

### 3. セッション情報の管理

- `~/.config/mf-scraper/auth.json` にもアクセス権限を設定

```bash
chmod 600 ~/.config/mf-scraper/auth.json
```

### 4. npm パッケージの署名

公開時に署名を推奨：

```bash
npm publish --sign-git-tag
```

---

## 参考リンク

- [npm bin 詳細](https://docs.npmjs.com/cli/v10/using-npm/package-json#bin)
- [Node.js shebang](https://nodejs.org/en/knowledge/command-line/how-to-write-command-line-applications/)
- [Playwright 公式ドキュメント](https://playwright.dev/docs/intro)
- [Crontab ジェネレータ](https://crontab.guru/)
