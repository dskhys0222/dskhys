# 仕様書：マネーフォワード同期機能

## 概要

portfolio アプリにマネーフォワードから取得した評価額データを反映する機能を実装した。MF 株式は完全自動同期（追加・更新・削除）され、手動入力株式は保持されるため、両者を効率的に管理できる。

## 機能仕様

### 1. 設定管理

#### 1.1 設定項目

```typescript
interface MFSyncConfig {
  apiUrl: string; // APIサーバーのURL
  encryptionKey: string; // 暗号化キー（64文字の16進数）
  accessToken?: string; // JWTアクセストークン
  refreshToken?: string; // リフレッシュトークン
}
```

#### 1.2 設定画面（`/settings`）

設定画面にマネーフォワード連携セクションを統合：

##### ログイン・ログアウト

- メールアドレス・パスワード入力
- ログイン状態の表示
- ログアウトボタン（ログイン済み時）

##### 最終更新情報

- 最後の同期日時（ISO8601 形式）
- MF 銘柄の登録数表示

##### API 設定

- API サーバー URL 入力欄
- 暗号化キー入力欄（マスク表示）

### 2. データ取得・復号化

#### 2.1 API 通信

```typescript
// APIクライアント
interface MFApiClient {
  login(email: string, password: string): Promise<void>;
  getEncryptedPortfolio(): Promise<EncryptedPortfolioData>;
  refreshAccessToken(): Promise<void>;
}

interface EncryptedPortfolioData {
  iv: string; // Base64エンコードされたIV
  encryptedData: string; // Base64エンコードされた暗号文
  authTag: string; // Base64エンコードされた認証タグ
  scrapedAt: string; // スクレイピング日時（ISO8601）
}
```

#### 2.2 復号化

- Web Crypto API を使用（`crypto.ts`）
- AES-256-GCM 方式

```typescript
// 復号化後のデータ
interface MFPortfolioData {
  stocks: MFStock[];
  scrapedAt: string;
}

interface MFStock {
  id: string; // MFサーバー側のストック ID
  name: string; // 銘柄名
  units: number; // 保有数量
  averageCost: number; // 平均取得単価
  currentPrice: number; // 現在価格（基準価額）
  value: number; // 評価額
  profitLoss: number; // 損益
  account: string; // 口座名（金融機関名）
}
```

### 3. 銘柄管理戦略

#### 3.1 ソースの分離

Stock オブジェクトに `source` フィールドを追加：

```typescript
interface Stock {
  id: string; // UUID
  source: "manual" | "mf"; // manual: 手動入力, mf: マネーフォワード同期
  // ... その他のフィールド
}
```

#### 3.2 同期ロジック

##### MF 銘柄（source='mf'）

- 完全自動同期：追加・更新・削除
- ユーザーが以下を変更しても上書きされない（MF 同期時は復元）：
  - ティッカー
  - assetClass
  - region
  - attribute
  - account
- 自動更新される項目：
  - name, value, units, currentPrice, averageCost

##### 手動銘柄（source='manual'）

- MF 同期の影響を受けない
- 完全にユーザー管理

#### 3.3 マッピング規則

MFStock の`id`を使用して、再同期時の重複登録を防止：

- 初回同期：mfStock.id をそのまま使用して Stock 作成
- 再同期：同じ mfStock.id を持つ Stock を更新

### 4. 同期フロー

#### 4.1 ホーム画面（`/`）での同期

##### 「更新」ボタン配置

- ホーム画面（銘柄一覧ページ）の右上に配置
- 「銘柄を追加」ボタンの左に配置
- ボタンは `isConfigured && isLoggedIn` の時のみ有効

##### 同期処理

1. 「更新」ボタンをクリック
2. MFDataStore から最新データを取得・復号化
3. `applySync()`でストアの銘柄に反映
4. 成功メッセージを表示（5 秒で自動消去）

#### 4.2 操作フロー

```txt
ホーム画面（/）
├── 「更新」ボタン（MF銘柄を同期）
├── 「銘柄を追加」ボタン（手動入力）
└── ✓ 更新完了メッセージ

設定画面（/settings）
├── MFログイン/ログアウト
├── 最終更新情報表示
└── API URL・暗号化キー設定
```

### 5. Zustand ストア

#### 5.1 MF データストア（`stores/index.ts`）

```typescript
interface MFDataStore {
  // 状態
  mfData: MFPortfolioData | null;
  syncConfig: MFSyncConfig;
  accessToken: string | null;
  refreshToken: string | null;
  encryptionKey: string;
  isLoading: boolean;
  isConfigured: boolean;

  // アクション
  setEncryptionKey: (key: string) => void;
  saveSyncConfig: (config: Partial<MFSyncConfig>) => void;
  loadEncryptionKey: () => void;
  loadSyncConfig: () => void;
  loadTokens: () => void;
  login: (apiUrl: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchAndDecrypt: () => Promise<MFPortfolioData | null>;
  applySync: () => void; // ストアの銘柄にMFデータを反映
}
```

#### 5.2 Stocks ストア（`stores/index.ts`）

```typescript
interface StocksStore {
  stocks: Stock[];

  addStock: (stock: Omit<Stock, "id" | "createdAt" | "updatedAt">) => void;
  updateStock: (id: string, stock: Partial<Stock>) => void;
  deleteStock: (id: string) => void;
  saveStocks: () => void;
  loadStocks: () => void;
}
```

### 6. ローカルストレージ

#### 6.1 保存キー

- `portfolio-stocks`: Stock[]
- `mf-sync-config`: MFSyncConfig
- `mf-encryption-key`: string
- `mf-access-token`: string
- `mf-refresh-token`: string

#### 6.2 セキュリティ考慮

- 暗号化キー：入力時のみ表示、ローカルストレージ保存
- アクセストークン：自動更新、期限切れで再ログイン促進
- リフレッシュトークン：自動更新

## エラーハンドリング

| エラー           | 対応                                           |
| ---------------- | ---------------------------------------------- |
| API 接続失敗     | 「サーバーに接続できません」メッセージ表示     |
| 認証失敗         | 「ログインに失敗しました」メッセージ表示       |
| 復号化失敗       | 「暗号化キーが正しくありません」メッセージ表示 |
| トークン期限切れ | 自動リフレッシュ試行、失敗時は再ログイン促進   |

## 実装ファイル

| ファイル                  | 説明                         |
| ------------------------- | ---------------------------- |
| `src/utils/crypto.ts`     | 復号化処理                   |
| `src/stores/index.ts`     | MFDataStore + StocksStore    |
| `src/routes/index.tsx`    | ホーム画面（更新ボタン追加） |
| `src/routes/settings.tsx` | 設定画面（ログイン機能）     |
