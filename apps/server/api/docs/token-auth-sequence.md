# トークンベース認証シーケンス図

以下は、JWTを利用した認証フローのシーケンス図です。

---

## 1. 初回認証・トークン発行

```mermaid
sequenceDiagram
    participant Client
    participant API_Server
    participant DB

    Client->>API_Server: 認証情報（ユーザー名・パスワード）でログインリクエスト
    API_Server->>DB: ユーザー情報を照合
    DB-->>API_Server: 認証結果（成功/失敗）
    alt 認証成功
        API_Server->>API_Server: アクセストークン・リフレッシュトークンを生成
        API_Server-->>Client: アクセストークン・リフレッシュトークンを返却
    else 認証失敗
        API_Server-->>Client: エラーレスポンス
    end
```

---

## 2. 通常APIリクエスト

```mermaid
sequenceDiagram
    participant Client
    participant API_Server
    participant DB

    Client->>API_Server: アクセストークン付きでAPIリクエスト
    API_Server->>API_Server: アクセストークンを検証
    alt アクセストークン有効
        API_Server->>DB: 必要に応じてデータ取得
        DB-->>API_Server: データ返却
        API_Server-->>Client: レスポンス返却
    else アクセストークン無効（期限切れ等）
        Client->>API_Server: リフレッシュトークンでアクセストークン再取得リクエスト
        API_Server->>API_Server: リフレッシュトークンを検証
        alt リフレッシュトークン有効
            API_Server->>API_Server: 新しいアクセストークンを生成
            API_Server-->>Client: 新しいアクセストークンを返却
        else リフレッシュトークン無効
            API_Server-->>Client: 認証エラー（再ログイン要求）
        end
    end
```

---

## 3. リフレッシュトークン失効（ログアウト・漏洩時など）

```mermaid
sequenceDiagram
    participant Client
    participant API_Server
    participant DB

    Client->>API_Server: ログアウトリクエスト または トークン失効リクエスト
    API_Server->>DB: リフレッシュトークンを無効化（削除・失効フラグ付与等）
    DB-->>API_Server: 失効処理完了
    API_Server-->>Client: 失効完了レスポンス
```

---

## 補足

- アクセストークン・リフレッシュトークンはHTTPヘッダーやCookie等で送信してください。
- アクセストークンの検証には署名や有効期限の確認が含まれます。
- リフレッシュトークンは安全に管理し、漏洩時は失効処理を行ってください。
- 失効処理は、DB等でリフレッシュトークンを無効化することで再利用を防ぎます。
