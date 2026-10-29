# mf-scraper

MoneyForward からポートフォリオデータをスクレイピングして、API サーバーに送信するバッチアプリケーション。

Playwright を使用して Chromium ブラウザで MoneyForward にアクセスし、ポートフォリオ情報を取得します。

## 機能

- 🔐 Playwright による自動スクレイピング
- 🔒 セッション管理（初回ログイン時に保存）
- 🛡️ データ暗号化（AES-256-GCM）
- 📡 REST API 経由でサーバーに送信
- ⏰ 定期実行対応（cron / systemd-timer）

## インストール

### npm グローバルインストール

```bash
npm install -g @dskhys/mf-scraper
```

### pnpm グローバルインストール

```bash
pnpm add -g @dskhys/mf-scraper
```

### ローカル開発インストール

```bash
# リポジトリをクローン
git clone https://github.com/dskhys/dskhys.git
cd dskhys/packages/client/mf-scraper

# 依存関係をインストール
pnpm install

# ビルド
pnpm build

# グローバルリンク（開発時）
pnpm link --global
```

## セットアップ

### 1. 設定ファイルを作成

設定ファイルの場所：
- **Linux/macOS**: `~/.config/mf-scraper/config.json`
- **Windows**: `%USERPROFILE%\.config\mf-scraper\config.json`

必要な内容：

```json
{
    "encryptionKey": "Base64エンコードされた32バイトのキー",
    "apiUrl": "https://api.example.com",
    "apiUsername": "APIサーバーのユーザー名",
    "apiPassword": "APIサーバーのパスワード"
}
```

**ファイル権限の設定（Linux/macOS）:**

```bash
chmod 600 ~/.config/mf-scraper/config.json
```

### 2. MoneyForward にログイン

```bash
mf-scraper login
```

実行内容：
1. ブラウザが開く
2. メールアドレスとパスワードを入力
3. 2FA コードを入力（有効な場合）
4. ログイン完了を自動検知
5. セッション情報が `~/.config/mf-scraper/auth.json` に保存

### 3. スクレイピングを実行

```bash
mf-scraper
```

初回実行時は Playwright がブラウザをダウンロードします（1-5 分）。

## 使用方法

### コマンド一覧

```bash
mf-scraper                 # ポートフォリオをスクレイピング（デフォルト）
mf-scraper login           # MoneyForward にログイン
mf-scraper --help          # ヘルプを表示
mf-scraper --version       # バージョン情報を表示
```

### スクレイピング実行

```bash
mf-scraper
```

実行内容：
1. 設定ファイルを読み込み
2. API サーバーにログイン
3. MoneyForward のログイン状態を確認
4. ポートフォリオデータを取得
5. データを AES-256-GCM で暗号化
6. API サーバーに送信

## 定期実行

### systemd-timer による定期実行（推奨）

systemd-timer は cron の代替で、ログ管理が優れています。

#### 1. サービスファイルを作成

`~/.config/systemd/user/mf-scraper.service` を作成：

```ini
[Unit]
Description=MoneyForward Portfolio Scraper
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/home/YOUR_USERNAME/.npm/_npx/mf-scraper/bin/mf-scraper.js
StandardOutput=journal
StandardError=journal
SyslogIdentifier=mf-scraper
```

**注意:**
- `YOUR_USERNAME` を自分のユーザー名に置き換え
- npm グローバルインストール先を確認：`npm bin -g`

または、以下で npm の bin パスを自動で取得：

```bash
npm_bin=$(npm bin -g)
sed "s|ExecStart=.*|ExecStart=$npm_bin/mf-scraper|" ~/.config/systemd/user/mf-scraper.service
```

#### 2. タイマーファイルを作成

`~/.config/systemd/user/mf-scraper.timer` を作成：

```ini
[Unit]
Description=MoneyForward Portfolio Scraper Timer
Requires=mf-scraper.service

[Timer]
# 毎日午前 3 時に実行
OnCalendar=*-*-* 03:00:00
# マシンがスリープ中だった場合、起動時に実行
Persistent=true

[Install]
WantedBy=timers.target
```

**タイマースケジュール例:**

```ini
# 毎日午前 3 時
OnCalendar=*-*-* 03:00:00

# 毎日午前 3 時 30 分
OnCalendar=*-*-* 03:30:00

# 毎日午前 0 時と午後 12 時
OnCalendar=*-*-* 00,12:00:00

# 毎週月曜日午前 3 時
OnCalendar=Mon *-*-* 03:00:00

# 毎月 1 日午前 3 時
OnCalendar=*-*-01 03:00:00
```

#### 3. タイマーを有効化・起動

```bash
# ユーザーサービスとして有効化
systemctl --user daemon-reload
systemctl --user enable mf-scraper.timer
systemctl --user start mf-scraper.timer

# 起動確認
systemctl --user status mf-scraper.timer
```

#### 4. 実行状況確認

```bash
# タイマーの実行履歴
journalctl --user -u mf-scraper.timer -n 10 --no-pager

# サービスの実行ログ
journalctl --user -u mf-scraper.service -n 50 --no-pager

# リアルタイム監視
journalctl --user -u mf-scraper.service -f
```

#### 5. トラブルシューティング

**タイマーが起動しない:**

```bash
# タイマーの状態確認
systemctl --user list-timers mf-scraper.timer

# サービスファイルの検証
systemd-analyze verify ~/.config/systemd/user/mf-scraper.service

# ユーザー systemd サービス有効化確認
systemctl --user is-enabled mf-scraper.timer
```

**手動テスト:**

```bash
# サービスを直接実行
systemctl --user start mf-scraper.service

# ログを確認
journalctl --user -u mf-scraper.service -n 20 --no-pager
```

### cron による定期実行（代替案）

systemd-timer の代わりに cron を使用することもできます：

```bash
# crontab エディタを開く
crontab -e

# 毎日午前 3 時に実行
0 3 * * * /usr/local/bin/mf-scraper >> ~/.local/share/mf-scraper.log 2>&1
```

**ログファイル管理（logrotate）:**

`/etc/logrotate.d/mf-scraper` を作成：

```txt
~/.local/share/mf-scraper.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 $USER $USER
}
```

## トラブルシューティング

### コマンドが見つからない

```bash
# npm の bin ディレクトリを確認
npm bin -g

# PATH に含まれているか確認
echo $PATH | grep -o '[^:]*npm[^:]*'
```

**解決方法（Linux/macOS）:**

```bash
# ~/.bashrc または ~/.zshrc に追加
export PATH="$(npm bin -g):$PATH"

# 再度ログインするか、以下で再読み込み
source ~/.bashrc  # または source ~/.zshrc
```

### ブラウザのダウンロード失敗

```bash
# Playwright キャッシュをクリア
rm -rf ~/.cache/ms-playwright

# 再度実行
mf-scraper
```

### セッションが期限切れ

```bash
# ログイン情報を更新
mf-scraper login
```

### systemd-timer が実行されない

**サービスファイルの ExecStart パスが間違っている:**

```bash
# 実際の npm の bin パスを確認
npm bin -g
# 例: /home/user/.npm/_npx/mf-scraper

# サービスファイルを更新
nano ~/.config/systemd/user/mf-scraper.service
# ExecStart=/full/path/to/mf-scraper に修正

# 再読み込みして起動
systemctl --user daemon-reload
systemctl --user restart mf-scraper.timer
```

### ログが表示されない

```bash
# journald がユーザーログを記録しているか確認
journalctl --user -n 10

# システムジャーナルを確認
sudo journalctl -u mf-scraper.timer -n 10
```

## セキュリティ

### 設定ファイルの保護

```bash
# ファイルの所有者のみが読取可能
chmod 600 ~/.config/mf-scraper/config.json
chmod 600 ~/.config/mf-scraper/auth.json

# ディレクトリの権限も確認
chmod 700 ~/.config/mf-scraper
```

### API パスワードの管理

- 設定ファイルのパスワードは定期的に変更
- API トークンベースの認証への移行を検討

### セッションの有効期限

MoneyForward のセッションは一定期間で期限切れになります。
定期的に `mf-scraper login` で更新してください：

```bash
# 毎月 1 日に手動でログイン更新
# または以下で自動化
0 3 1 * * /usr/local/bin/mf-scraper login
```

## 開発

### リポジトリ構成

```txt
packages/client/mf-scraper/
├── src/
│   ├── index.ts          # メインエントリポイント
│   ├── login.ts          # ログイン処理
│   ├── scraper.ts        # スクレイピング処理
│   ├── api.ts            # API クライアント
│   ├── config.ts         # 設定ファイル管理
│   ├── encrypt.ts        # 暗号化処理
│   └── version.ts        # バージョン情報（ビルド時に自動生成）
├── scripts/
│   └── generate-version.js  # ビルド時のバージョン自動生成スクリプト
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

### バージョン管理

バージョンは自動採番されます。手動更新は不要です。

**ビルド時に自動生成される流れ:**

```txt
1. pnpm build を実行
   ↓
2. prebuild スクリプト実行
   - git rev-parse --short HEAD でコミットハッシュを取得
   - src/version.ts を自動生成
   ↓
3. TypeScript をコンパイル
   - dist/version.js が生成される
   ↓
4. mf-scraper --version で表示
   mf-scraper 0.0.0+git.6d898ff
     ↑コミットハッシュが含まれる
```

**バージョン形式:**

```txt
0.0.0+git.{7文字のコミットハッシュ}
```

例:
- `0.0.0+git.6d898ff`
- `0.0.0+git.abc1234`

**バージョン確認:**

```bash
# ビルド後
mf-scraper --version
# mf-scraper 0.0.0+git.6d898ff

# または npm info で確認
npm info @dskhys/mf-scraper
```

### ビルド

```bash
pnpm build
```

実行内容:
1. `scripts/generate-version.js` でコミットハッシュから version.ts を自動生成
2. TypeScript を JavaScript にコンパイル（`dist/` に出力）

**ビルド時の出力例:**

```txt
✓ Version generated: 0.0.0+git.6d898ff
  Git Hash: 6d898ff
  Build Date: 2026-01-13T22:50:45.159Z
```

### テスト

```bash
pnpm test
```

vitest でユニットテストを実行。

### リント

```bash
pnpm lint
```

biome でコードをチェック・フォーマット。

## ライセンス

ISC

## サポート

問題が発生した場合：
1. [トラブルシューティング](#トラブルシューティング) を確認
2. ログを確認：`journalctl --user -u mf-scraper.service`
3. GitHub Issues で報告

## 参考リンク

- [Playwright 公式ドキュメント](https://playwright.dev/docs/intro)
- [systemd.timer マニュアル](https://www.freedesktop.org/software/systemd/man/systemd.timer.html)
- [Node.js npm グローバルインストール](https://docs.npmjs.com/cli/v10/commands/npm-install)
