# Nginx 設定と CORS トラブルシューティング

## Nginx での CORS サポート

### 問題

クライアント（budget、portfolio サブドメイン）から API（メインドメイン）へのリクエストが CORS エラーでブロックされる。

### 原因

Nginx がリバースプロキシとして機能する際、以下の問題が発生することがあります：

1. **CORS プリフライトリクエスト（OPTIONS）が処理されていない**

   - ブラウザは GET/POST 前に OPTIONS リクエストを送信
   - OPTIONS に対して正しいレスポンスがないとブロックされる

2. **CORS ヘッダーがプロキシを通す際にドロップされている**
   - `Access-Control-*` ヘッダーが API サーバーから返っても、Nginx が削除することがある
   - `proxy_pass_header` で明示的に指定する必要がある

### 解決方法

#### 1. OPTIONS リクエストへの対応

```nginx
location / {
    # プリフライトリクエスト（OPTIONS）への対応
    if ($request_method = 'OPTIONS') {
        return 204;
    }

    # その他のリクエスト処理
    proxy_pass http://api:3000;
}
```

#### 2. CORS ヘッダーのパススルー

```nginx
# CORS ヘッダーをスルー（API サーバーで設定されている CORS ヘッダーを通す）
proxy_pass_header Access-Control-Allow-Origin;
proxy_pass_header Access-Control-Allow-Credentials;
proxy_pass_header Access-Control-Allow-Methods;
proxy_pass_header Access-Control-Allow-Headers;
proxy_pass_header Access-Control-Max-Age;
```

### 現在の Nginx 設定

[deployment/nginx/nginx.conf](../../../deployment/nginx/nginx.conf) の API プロキシセクション：

```nginx
# API Proxy
location / {
    # プリフライトリクエスト（OPTIONS）への対応
    if ($request_method = 'OPTIONS') {
        return 204;
    }

    # 変数を使用して動的にホスト名を解決
    set $api_backend http://api:3000;
    proxy_pass $api_backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # CORS ヘッダーをスルー
    proxy_pass_header Access-Control-Allow-Origin;
    proxy_pass_header Access-Control-Allow-Credentials;
    proxy_pass_header Access-Control-Allow-Methods;
    proxy_pass_header Access-Control-Allow-Headers;
    proxy_pass_header Access-Control-Max-Age;

    # APIサービスが存在しない場合のエラー処理
    proxy_intercept_errors on;
    error_page 502 503 504 = @api_unavailable;
}
```

## デバッグ方法

### ブラウザの DevTools で確認

1. **Network タブで確認**

   - API リクエストの **Response Headers** で `Access-Control-*` が存在するか確認
   - OPTIONS プリフライトが 204 を返しているか確認

2. **Console タブで CORS エラーを確認**
   - エラーメッセージに「origin」という文字列が含まれているか
   - どのヘッダーが不足しているか確認

### Nginx ログで確認

```bash
# Nginx コンテナのログ確認
docker compose logs -f nginx

# ブラウザの Request Headers でオリジンを確認
# Origin: https://budget.example.com
```

### API サーバーの確認

API サーバーが CORS ヘッダーを正しく返しているか確認：

```bash
# API にオリジン情報付きでリクエスト
curl -H "Origin: https://budget.example.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://example.com/api/auth/login

# レスポンスに CORS ヘッダーが含まれているか確認
# Access-Control-Allow-Origin: https://budget.example.com
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
# etc...
```

## CORS ヘッダーの流れ

```txt
1. ブラウザ（budget.example.com）
        ↓
   OPTIONS リクエスト送信
        ↓
2. Nginx（example.com）
        ↓
   OPTIONS → 204 No Content で返却
        ↓
3. ブラウザ
        ↓
   OK なら実データリクエスト
        ↓
4. Nginx（プロキシ）
        ↓
   API サーバー
        ↓
   CORS ヘッダー付きレスポンス返却
        ↓
5. Nginx
        ↓
   CORS ヘッダーをスルー
        ↓
6. ブラウザ
        ↓
   CORS チェック OK → データ受け取り
```

## 関連ドキュメント

- [API CORS 設定](../../../packages/server/api/src/index.ts)
- [Nginx 設定](../../../deployment/nginx/nginx.conf)
- [Docker Compose](../../../deployment/compose.yaml)
