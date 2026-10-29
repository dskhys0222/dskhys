# API仕様書

## 📋 基本情報

- **ベースURL**: `http://localhost:3000`
- **API版数**: v0.0.1
- **認証**: JWT (JSON Web Token)
- **データ形式**: JSON

## 🔗 エンドポイント一覧

### 認証関連

#### ユーザー登録

```txt
POST /api/auth/register
```

**リクエストボディ:**

```json
{
    "name": "テストユーザー",
    "email": "user@example.com",
    "password": "password123"
}
```

**レスポンス例:**

```json
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "name": "テストユーザー",
        "email": "user@example.com"
    }
}
```

**エラー例:**

```json
// 409 Conflict (メールアドレス重複)
{
  "error": {
    "message": "Email already exists"
  }
}

// 400 Bad Request (バリデーションエラー)
{
  "error": {
    "message": "Password must be at least 8 characters"
  }
}
```

#### ログイン

```txt
POST /api/auth/login
```

**リクエストボディ:**

```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

**レスポンス例:**

```json
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "name": "テストユーザー",
        "email": "user@example.com"
    }
}
```

**エラー例:**

```json
// 401 Unauthorized (認証失敗)
{
  "error": {
    "message": "Invalid credentials"
  }
}
```

#### ログアウト

```txt
POST /api/auth/logout
```

**認証**: 必要 (Bearer Token)

**ヘッダー:**
```
Authorization: Bearer {accessToken}
```

**リクエストボディ:**

```json
{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**レスポンス例:**

```json
{
    "message": "Logged out successfully"
}
```

#### トークンリフレッシュ

```txt
POST /api/auth/refresh
```

**リクエストボディ:**

```json
{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**レスポンス例:**

```json
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**エラー例:**

```json
// 401 Unauthorized (無効なトークン)
{
  "error": {
    "message": "Invalid refresh token"
  }
}
```

#### 現在のユーザー情報取得

```txt
GET /api/auth/me
```

**認証**: 必要 (Bearer Token)

**ヘッダー:**
```
Authorization: Bearer {accessToken}
```

**レスポンス例:**

```json
{
    "id": 1,
    "name": "テストユーザー",
    "email": "user@example.com",
    "created_at": "2025-10-23T12:00:00.000Z"
}
```

### システム関連

#### ヘルスチェック

```txt
GET /health
```

**レスポンス例:**

```json
{
    "status": "OK",
    "timestamp": "2025-06-19T13:00:00.000Z"
}
```

#### API情報取得

```txt
GET /api/
```

**レスポンス例:**

```json
{
    "message": "API is running",
    "version": "0.0.1",
    "timestamp": "2025-06-19T13:00:00.000Z"
}
```

### ユーザー管理

#### ユーザー取得

```txt
GET /api/users/:id
```

**パラメータ:**
- `id` (number): ユーザーID

**レスポンス例:**

```json
{
    "id": 1,
    "name": "User 1",
    "email": "user1@example.com"
}
```

**エラー例:**

```json
// 400 Bad Request (無効なID)
{
  "error": {
    "message": "Invalid user ID"
  }
}

// 404 Not Found (ユーザーが存在しない)
{
  "error": {
    "message": "User not found"
  }
}
```

#### ユーザー作成

```txt
POST /api/users
```

**リクエストボディ:**

```json
{
    "name": "新しいユーザー",
    "email": "newuser@example.com"
}
```

**レスポンス例:**

```json
{
    "id": 123,
    "name": "新しいユーザー",
    "email": "newuser@example.com",
    "created_at": "2025-06-19T13:00:00.000Z"
}
```

**エラー例:**

```json
// 400 Bad Request (バリデーションエラー)
{
  "error": {
    "message": "Name and email are required"
  }
}

// 400 Bad Request (メール形式エラー)
{
  "error": {
    "message": "Invalid email format"
  }
}
```

## 📊 HTTPステータスコード

| コード | 意味                  | 説明                                               |
| ------ | --------------------- | -------------------------------------------------- |
| 200    | OK                    | 正常にリクエストが処理された                       |
| 201    | Created               | 新しいリソースが作成された                         |
| 400    | Bad Request           | リクエストに問題がある（バリデーションエラーなど） |
| 401    | Unauthorized          | 認証が必要                                         |
| 404    | Not Found             | リソースが見つからない                             |
| 500    | Internal Server Error | サーバー内部エラー                                 |

## 🔧 バリデーションルール

### ユーザー

| フィールド | 型     | 必須 | 制約                     |
| ---------- | ------ | ---- | ------------------------ |
| name       | string | ✅   | 1文字以上、100文字以下   |
| email      | string | ✅   | 有効なメールアドレス形式 |

## 🚨 エラーレスポンス形式

全てのエラーは以下の統一形式で返されます：

```json
{
    "error": {
        "message": "エラーメッセージ",
        "stack": "スタックトレース（開発環境のみ）"
    }
}
```

## 📝 使用例

### curl コマンド

```bash
# ヘルスチェック
curl -X GET http://localhost:3000/health

# ユーザー取得
curl -X GET http://localhost:3000/api/users/1

# ユーザー作成
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "テストユーザー",
    "email": "test@example.com"
  }'
```

### JavaScript (fetch)

```javascript
// ユーザー取得
const getUser = async (id) => {
    const response = await fetch(`http://localhost:3000/api/users/${id}`);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message);
    }

    return response.json();
};

// ユーザー作成
const createUser = async (userData) => {
    const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message);
    }

    return response.json();
};
```

## 🔮 今後の実装予定

### 認証機能の拡張

- パスワードリセット機能
- メール認証
- ソーシャルログイン (Google, GitHub)
- 二段階認証 (2FA)

### レート制限

認証エンドポイントへのレート制限を実装し、ブルートフォース攻撃を防ぐ：

```txt
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

### ページネーション

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### フィルタリング・ソート

```txt
GET /api/users?page=1&limit=10&sort=created_at&order=desc&name=john
```
