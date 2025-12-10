# API開発ガイド

## 🚀 クイックスタート

### 開発サーバーの起動

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev
```

サーバーは `http://localhost:3000` で起動します。

### 基本的なAPIテスト

```bash
# ヘルスチェック
curl http://localhost:3000/health

# API情報取得
curl http://localhost:3000/api/

# ユーザー取得（例）
curl http://localhost:3000/api/users/1
```

## 📁 プロジェクト構成

```txt
src/
├── index.ts              # アプリケーションエントリーポイント
├── database/
│   └── connection.ts     # SQLite接続設定
├── middleware/
│   └── errorHandler.ts   # エラーハンドリング
├── routes/
│   ├── index.ts          # メインルーター
│   ├── users.ts          # ユーザー関連ルート
│   └── *.test.ts         # テストファイル
├── schemas/
│   └── index.ts          # Zodバリデーションスキーマ
└── utils/
    └── errors.ts         # カスタムエラークラス
```

## 🛠️ 開発フロー

### 1. 新しいAPIエンドポイントの追加

#### ステップ1: スキーマ定義

```typescript
// src/schemas/posts.ts
export const PostSchema = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  userId: z.number().int().positive(),
  created_at: z.string().datetime().optional()
})

export const CreatePostSchema = PostSchema.omit({ 
  id: true, 
  created_at: true 
})
```

#### ステップ2: ルート実装

```typescript
// src/routes/posts.ts
import { Router } from 'express'
import { CreatePostSchema } from '../schemas/posts.js'
import { ValidationError, NotFoundError, asyncHandler } from '../utils/errors.js'

export const postRoutes = Router()

postRoutes.post('/', asyncHandler(async (req, res) => {
  // バリデーション
  const postData = CreatePostSchema.parse(req.body)
  
  // 作成処理
  const newPost = await createPost(postData)
  
  res.status(201).json(newPost)
}))
```

#### ステップ3: ルーターに追加

```typescript
// src/routes/index.ts
import { postRoutes } from './posts.js'

router.use('/posts', postRoutes)
```

#### ステップ4: テスト作成

```typescript
// src/routes/posts.test.ts
describe('Posts API', () => {
  it('should create a new post', async () => {
    const postData = {
      title: 'Test Post',
      content: 'Test content',
      userId: 1
    }

    const response = await request(app)
      .post('/api/posts')
      .send(postData)
      .expect(201)

    expect(response.body.title).toBe(postData.title)
  })
})
```

### 2. データベース操作

#### マイグレーション

```typescript
// src/database/migrations/001_create_posts.ts
export const createPostsTable = `
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )
`
```

#### データアクセス層

```typescript
// src/database/repositories/postRepository.ts
export class PostRepository {
  static async create(postData: CreatePost): Promise<Post> {
    return new Promise((resolve, reject) => {
      const { title, content, userId } = postData
      
      db.run(
        'INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)',
        [title, content, userId],
        function(err) {
          if (err) reject(err)
          else resolve({ id: this.lastID, ...postData })
        }
      )
    })
  }

  static async findById(id: number): Promise<Post | null> {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM posts WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err)
          else resolve(row || null)
        }
      )
    })
  }
}
```

## 🧪 テスト戦略

### 単体テスト

```bash
# 全テスト実行
npm test

# 特定ファイルのテスト
npm test -- src/routes/users.test.ts

# カバレッジ付きテスト
npm test -- --coverage
```

### テストの種類

1. **ルートテスト** - APIエンドポイントの動作確認
2. **ミドルウェアテスト** - エラーハンドリング等の確認
3. **ユーティリティテスト** - ヘルパー関数の確認

## 🔒 セキュリティ

### 入力値検証

```typescript
// Zodスキーマによる厳密なバリデーション
const userInput = UserSchema.parse(req.body)
```

### CORS設定

```typescript
// 開発環境での設定例
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))
```

### 環境変数

```bash
# .env
NODE_ENV=development
PORT=3000
DATABASE_PATH=./data/database.sqlite
CORS_ORIGIN=http://localhost:5173
```

## 📊 監視とログ

### ログ出力

```typescript
// エラーログ
console.error('Database error:', error)

// 情報ログ
console.log(`Server started on port ${PORT}`)
```

### ヘルスチェック

```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})
```

## 🚀 デプロイ

### ビルド

```bash
npm run build
```

### 本番起動

```bash
npm start
```

### Docker対応

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 トラブルシューティング

### よくある問題

1. **ポートが使用中**

   ```bash
   # ポート使用状況確認
   netstat -an | find "3000"
   ```

2. **データベース接続エラー**

   ```bash
   # データディレクトリ作成
   mkdir -p data
   ```

3. **TypeScriptエラー**

   ```bash
   # 型チェック
   npm run typecheck
   ```

## 📚 参考資料

- [Express.js公式ドキュメント](https://expressjs.com/)
- [Zod公式ドキュメント](https://zod.dev/)
- [Vitest公式ドキュメント](https://vitest.dev/)
- [SQLite3公式ドキュメント](https://www.sqlite.org/docs.html)
