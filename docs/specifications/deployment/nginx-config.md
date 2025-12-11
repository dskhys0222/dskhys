# Nginx 設定仕様

## 概要

Nginx のリバースプロキシおよび SSL 終端設定の仕様を定義します。

## 設定ファイル

| ファイル                      | 用途                     |
| ----------------------------- | ------------------------ |
| `deployment/nginx/nginx.conf` | HTTPS 対応版（通常運用） |

## HTTP サーバー設定

1. **ACME チャレンジ応答**: `/.well-known/acme-challenge/` へのリクエストに応答
2. **HTTPS リダイレクト**: 上記以外のリクエストを HTTPS へ 301 リダイレクト

## HTTPS サーバー設定

### 証明書パス

| 項目   | パス                                            |
| ------ | ----------------------------------------------- |
| 証明書 | `/etc/letsencrypt/live/${DOMAIN}/fullchain.pem` |
| 秘密鍵 | `/etc/letsencrypt/live/${DOMAIN}/privkey.pem`   |
