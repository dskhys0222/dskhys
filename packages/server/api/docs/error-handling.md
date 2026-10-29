# エラーハンドリング

APIサーバーのエラーハンドリングシステムについて説明します。

## 📋 概要

このAPIサーバーでは、統一されたエラーハンドリングシステムを採用しています。全てのエラーは適切なHTTPステータスコードと共に、一貫した形式でクライアントに返されます。

## 🔧 システム構成

### エラーハンドラーミドルウェア

`src/middleware/errorHandler.ts`でグローバルエラーハンドラーを定義しています。

```typescript
export const errorHandler = (
    err: ApiError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    console.error('Error:', err);

    res.status(statusCode).json({
        error: {
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
};
```

### カスタムエラークラス

`src/utils/errors.ts`で定義されている専用エラークラス：
- **ValidationError** (400) - バリデーションエラー
- **NotFoundError** (404) - リソースが見つからない
- **UnauthorizedError** (401) - 認証エラー

### 非同期エラーハンドリング

`asyncHandler`ラッパーを使用して、非同期処理のエラーを自動的にキャッチします。

```typescript
export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
```

## 🎯 使用方法

### 基本的な使用例

```typescript
import {
    ValidationError,
    NotFoundError,
    asyncHandler,
} from '../utils/errors.js';

// ルート定義
router.get(
    '/:id',
    asyncHandler(async (req, res) => {
        const { id } = req.params;

        // バリデーションエラー
        if (!id || Number.isNaN(Number(id))) {
            throw new ValidationError('Invalid user ID');
        }

        // NotFoundエラー
        const user = await findUser(id);
        if (!user) {
            throw new NotFoundError('User');
        }

        res.json(user);
    })
);
```

### エラーレスポンス形式

全てのエラーは以下の形式で返されます：

```json
{
    "error": {
        "message": "エラーメッセージ",
        "stack": "スタックトレース（開発環境のみ）"
    }
}
```

## 📊 エラーの種類とステータスコード

| エラー種類        | ステータスコード | 説明                   |
| ----------------- | ---------------- | ---------------------- |
| ValidationError   | 400              | 入力値の検証エラー     |
| UnauthorizedError | 401              | 認証が必要             |
| NotFoundError     | 404              | リソースが見つからない |
| Generic Error     | 500              | サーバー内部エラー     |

## 🔄 エラー処理の流れ

```mermaid
graph TD
    A[リクエスト受信] --> B[ミドルウェア処理]
    B --> C[ルート処理]
    C --> D{エラー発生?}
    D -->|No| E[正常レスポンス]
    D -->|Yes| F[next(error)呼び出し]
    F --> G[ErrorHandler実行]
    G --> H[エラーレスポンス送信]
    G --> I[ログ出力]
```

## 🧪 テスト

エラーハンドリングのテストは`src/middleware/errorHandler.test.ts`で実装されています。

```bash
# テスト実行
npm test

# テスト実行（1回のみ）
npm run test:run
```

## 🔍 デバッグ

### 開発環境

- エラーレスポンスにスタックトレースが含まれます
- コンソールに詳細なエラー情報が出力されます

### 本番環境

- スタックトレースは含まれません
- 機密情報の漏洩を防ぎます

## 📝 ベストプラクティス

### 1. 適切なエラー種類の選択

```typescript
// ❌ 悪い例
throw new Error('User not found');

// ✅ 良い例
throw new NotFoundError('User');
```

### 2. asyncHandlerの使用

```typescript
// ❌ 悪い例（エラーがキャッチされない）
router.get('/users', async (req, res) => {
    const users = await getUsers();
    res.json(users);
});

// ✅ 良い例
router.get(
    '/users',
    asyncHandler(async (req, res) => {
        const users = await getUsers();
        res.json(users);
    })
);
```

### 3. バリデーションの実装

```typescript
// Zodスキーマを使用したバリデーション
const CreateUserSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
});

router.post(
    '/users',
    asyncHandler(async (req, res) => {
        try {
            const userData = CreateUserSchema.parse(req.body);
            // ユーザー作成処理...
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new ValidationError(error.errors[0].message);
            }
            throw error;
        }
    })
);
```

## 🚀 今後の拡張

- ログシステムの強化（Winston等の導入）
- エラー通知システム（Slack、メール等）
- レート制限エラーの追加
- カスタムエラーコードの実装
