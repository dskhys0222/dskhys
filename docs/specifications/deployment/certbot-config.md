# Certbot 設定仕様

## 概要

Let's Encrypt 証明書の取得・更新に使用する Certbot の設定仕様を定義します。

## 証明書取得

### 出力ファイル

証明書取得後、以下のファイルが `/etc/letsencrypt/live/${DOMAIN}/` に生成されます。

| ファイル        | 説明                                          |
| --------------- | --------------------------------------------- |
| `fullchain.pem` | 証明書チェーン（サーバー証明書 + 中間証明書） |
| `privkey.pem`   | 秘密鍵                                        |
| `cert.pem`      | サーバー証明書のみ                            |
| `chain.pem`     | 中間証明書のみ                                |

## 証明書更新

### 更新条件

- 証明書の有効期限が 30 日以内の場合に更新を実行
- 有効期限が 30 日以上ある場合はスキップ

## 環境変数

| 変数名              | 説明                       | 例                  |
| ------------------- | -------------------------- | ------------------- |
| `DOMAIN_NAME`       | 証明書を取得するドメイン   | `example.com`       |
| `LETSENCRYPT_EMAIL` | Let's Encrypt 通知用メール | `admin@example.com` |

## 更新スケジュール

| 項目     | 値          |
| -------- | ----------- |
| 実行間隔 | 12 時間ごと |
| 実行時刻 | 0:00, 12:00 |

## ディレクトリ構造

```txt
/etc/letsencrypt/
├── live/
│   └── ${DOMAIN}/
│       ├── fullchain.pem -> ../../archive/${DOMAIN}/fullchainN.pem
│       ├── privkey.pem -> ../../archive/${DOMAIN}/privkeyN.pem
│       ├── cert.pem -> ../../archive/${DOMAIN}/certN.pem
│       └── chain.pem -> ../../archive/${DOMAIN}/chainN.pem
├── archive/
│   └── ${DOMAIN}/
│       ├── fullchain1.pem
│       ├── privkey1.pem
│       ├── cert1.pem
│       └── chain1.pem
└── renewal/
    └── ${DOMAIN}.conf
```

## エラーハンドリング

### よくあるエラー

| エラー             | 原因                             | 対処                |
| ------------------ | -------------------------------- | ------------------- |
| DNS 検証失敗       | ドメインが正しく設定されていない | DNS 設定を確認      |
| ポート 80 到達不可 | ファイアウォールでブロック       | ポート 80 を開放    |
| Rate Limit 超過    | 短期間に多数のリクエスト         | 1 時間後に再試行    |
| Webroot パス不正   | ボリュームマウントの設定ミス     | compose.yaml を確認 |
