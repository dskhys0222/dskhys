# Nginx 設定仕様

## 概要

Nginx のリバースプロキシおよび SSL 終端設定の仕様を定義します。

## 設定ファイル

| ファイル                      | 用途                     |
| ----------------------------- | ------------------------ |
| `deployment/nginx/nginx.conf` | HTTPS 対応版（通常運用） |

## HTTP サーバー設定

以下の 3 つの場所を処理します：

1. **ACME チャレンジ応答**: `/.well-known/acme-challenge/` → certbot に応答
2. **API リクエスト**: `/api*` → OPTIONS は 204、その他は HTTPS へ 301 リダイレクト
3. **その他**: 全て HTTPS へ 301 リダイレクト

```nginx
server {
    listen 80;
    server_name _;

    # ACME Challenge（証明書取得・更新用）
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # API リクエスト（開発環境などの場合）
    location /api {
        # プリフライトリクエスト（OPTIONS）への対応
        if ($request_method = 'OPTIONS') {
            return 204;
        }

        # HTTP で来た場合は HTTPS へリダイレクト
        return 301 https://$host$request_uri;
    }

    # その他のリクエストを HTTPS へリダイレクト
    location / {
        return 301 https://$host$request_uri;
    }
}
```

## HTTPS サーバー設定

### 証明書パス

| 項目   | パス                                            |
| ------ | ----------------------------------------------- |
| 証明書 | `/etc/letsencrypt/live/${DOMAIN}/fullchain.pem` |
| 秘密鍵 | `/etc/letsencrypt/live/${DOMAIN}/privkey.pem`   |

## API プロキシ設定（CORS 対応）

### OPTIONS リクエスト処理

CORS プリフライトリクエスト（OPTIONS）は Nginx で直接処理：

```nginx
if ($request_method = 'OPTIONS') {
    return 204;
}
```

### CORS ヘッダーのパススルー

API サーバーで設定された CORS ヘッダーをクライアントへ通す：

```nginx
proxy_pass_header Access-Control-Allow-Origin;
proxy_pass_header Access-Control-Allow-Credentials;
proxy_pass_header Access-Control-Allow-Methods;
proxy_pass_header Access-Control-Allow-Headers;
proxy_pass_header Access-Control-Max-Age;
```

詳細は [Nginx CORS トラブルシューティング](./nginx-cors.md) を参照。
