# SSL 証明書フロー

## 概要

Let's Encrypt を使用した SSL 証明書の取得・更新フローを定義します。

## 証明書取得フロー

初回セットアップ時に GitHub Actions から実行される証明書取得のフローです。

```mermaid
sequenceDiagram
    participant GHA as GitHub Actions
    participant Server as VPS Server
    participant Nginx as Nginx Container
    participant Certbot as Certbot Container
    participant LE as Let's Encrypt

    GHA->>Server: SSH接続
    GHA->>Server: setup-ssl.sh実行
    Server->>Nginx: HTTP-only構成で起動
    Certbot->>LE: 証明書リクエスト
    LE->>Nginx: HTTP-01チャレンジ
    Nginx->>LE: チャレンジ応答
    LE->>Certbot: 証明書発行
    Certbot->>Server: 証明書をボリュームに保存
    Server->>Nginx: HTTPS構成で再起動
```

## 証明書更新フロー

定期的に実行される証明書更新のフローです。

```mermaid
sequenceDiagram
    participant Cron as Cron/Timer
    participant Certbot as Certbot Container
    participant Nginx as Nginx Container
    participant LE as Let's Encrypt

    Cron->>Certbot: certbot renew実行
    alt 更新が必要（有効期限30日以内）
        Certbot->>LE: 更新リクエスト
        LE->>Certbot: 新しい証明書
        Certbot->>Nginx: reload signal
        Nginx->>Nginx: 設定リロード
    else 更新不要
        Certbot->>Certbot: スキップ（ログ出力）
    end
```

### 更新スケジュール

| 項目                         | 値                 |
| ---------------------------- | ------------------ |
| Let's Encrypt 証明書有効期限 | 90 日              |
| Certbot 更新開始タイミング   | 有効期限の 30 日前 |
| 更新チェック間隔             | 12 時間            |
| cron 式                      | `0 */12 * * *`     |

## エラーハンドリング

### 証明書取得失敗時

```mermaid
flowchart TD
    A[証明書取得開始] --> B{取得成功?}
    B -->|Yes| C[HTTPS構成で起動]
    B -->|No| D[エラーログ出力]
    D --> E[HTTP構成を維持]
    E --> F[GitHub Actionsでエラー報告]
```

| 状態       | 動作                        |
| ---------- | --------------------------- |
| 取得成功   | HTTPS 構成で Nginx を再起動 |
| 取得失敗   | HTTP 構成のまま継続稼働     |
| エラー通知 | GitHub Actions のログに出力 |

### 証明書更新失敗時

| 状態       | 動作                                            |
| ---------- | ----------------------------------------------- |
| 更新成功   | 新しい証明書で Nginx をリロード                 |
| 更新失敗   | 既存の証明書で継続稼働                          |
| エラー通知 | 有効期限が近づくと Let's Encrypt からメール警告 |
