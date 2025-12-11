# Docker Compose 設定仕様

## 概要

デプロイ環境の Docker Compose 設定仕様を定義します。

## 設定ファイル

| ファイル                  | 用途                   |
| ------------------------- | ---------------------- |
| `deployment/compose.yaml` | 通常運用（HTTPS 対応） |

## 操作コマンド

### 起動

```bash
docker compose up -d
```

### 停止

```bash
docker compose down
```

### ログ確認

```bash
# 全サービス
docker compose logs -f

# 特定サービス
docker compose logs -f nginx
```

### Nginx リロード

```bash
docker compose exec nginx nginx -s reload
```
