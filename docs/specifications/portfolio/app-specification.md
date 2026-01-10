# 仕様：株式ポートフォリオ管理アプリ（Portfolio）

対象：`packages/client/portfolio`

## 技術スタック

### 必須依存関係

**本番依存関係（dependencies）:**

- `react`
- `react-dom`
- `@tanstack/react-router`
- `@tanstack/react-router-devtools`
- `@tanstack/router-plugin`
- `recharts`（グラフ描画ライブラリ）
- `zustand`（状態管理）
- `react-hook-form`（フォーム管理）
- `zod`（バリデーション）
- `@hookform/resolvers`（React Hook FormとZodの統合）

**開発依存関係（devDependencies）:**

- `typescript`
- `vite`
- `@vitejs/plugin-react`
- `@vitejs/plugin-basic-ssl`
- `@pandacss/dev`
- `@tanstack/devtools-vite`
- `vite-plugin-pwa`
- `vitest`
- `@testing-library/react`
- `@testing-library/dom`
- `jsdom`
- `@types/react`
- `@types/react-dom`
- `@types/node`
- `babel-plugin-react-compiler`

### Vite設定

- ポート: `3001`（budgetと被らないように）
- プラグイン:
  - `@tanstack/devtools-vite`
  - `@tanstack/router-plugin/vite`（自動ルート生成）
  - `@vitejs/plugin-react`（React Compiler有効化）
  - `vite-plugin-pwa`（PWA対応）
  - `@vitejs/plugin-basic-ssl`（HTTPS開発環境）

### Panda CSS設定

- 入力: `./src/**/*.{ts,tsx}`
- 出力: `styled-system/`
- `preflight: true`
- `jsxFramework: 'react'`
- PostCSS連携: `postcss.config.cjs`

### PWA設定

- `registerType: 'autoUpdate'`
- 開発環境でもService Worker有効（`devOptions.enabled: true`）
- グロブパターン: `**/*.{js,css,html,ico,png,svg,json}`
- マニフェスト:
  - name: `Portfolio`
  - short_name: `Portfolio`
  - description: `株式ポートフォリオ管理アプリケーション`
  - theme_color: `#1a472a`（緑系）
  - アイコン: 192x192, 512x512

## データモデル

### 銘柄（Stock）

```typescript
// クラス
type AssetClass = '現金' | '株式' | 'コモディティ';

// 地域
type Region = '日本' | '米国' | '全世界';

// 属性
type Attribute = '現金' | 'インデックス' | '増配' | 'ゴールド' | '暗号通貨';

// 口座
type Account = '預金' | '特定' | 'NISA' | 'DC' | '暗号資産';

interface Stock {
  id: string; // UUID
  name: string; // 銘柄名（必須）
  ticker: string; // ティッカーシンボル（必須）
  value: number; // 評価額（必須）
  units?: number; // 口数（任意）
  averageCost?: number; // 平均取得単価（任意）
  assetClass: AssetClass; // クラス（必須）
  region: Region; // 地域（必須）
  attribute: Attribute; // 属性（必須）
  account: Account; // 口座（必須）
  note?: string; // 備考（任意）
  createdAt: string; // 作成日時（ISO 8601）
  updatedAt: string; // 更新日時（ISO 8601）
}
```

### アプリケーション設定（AppSettings）

```typescript
interface AppSettings {
  version: string; // データフォーマットバージョン
}
```

## 状態管理（Zustand）

### ストア構成

#### stocksStore

```typescript
interface StocksStore {
  stocks: Stock[];
  addStock: (stock: Omit<Stock, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateStock: (id: string, updates: Partial<Stock>) => void;
  deleteStock: (id: string) => void;
  loadStocks: () => void;
  saveStocks: () => void;
}
```

#### settingsStore

```typescript
interface SettingsStore {
  settings: AppSettings;
  loadSettings: () => void;
  saveSettings: () => void;
}
```

### LocalStorage永続化

- キー:
  - `portfolio-stocks`: 銘柄データ
  - `portfolio-settings`: 設定データ
- 保存タイミング:
  - データ追加/更新/削除時に自動保存
  - 設定変更時に自動保存
- 読み込みタイミング:
  - アプリ起動時

## 画面設計

### ルート構成

```txt
/                          # ホーム（ダッシュボード）
/stocks                    # 銘柄一覧
/stocks/new                # 銘柄追加
/stocks/:id/edit           # 銘柄編集
/settings                  # 設定画面
```

### 画面詳細

#### 1. ホーム画面（/）

**コンポーネント:**

- `DashboardSummary`: サマリー情報カード
  - 総評価額
- `DonutChart`: ドーナツグラフコンポーネント
  - クラス別アロケーション
  - 地域別アロケーション
  - 属性別アロケーション
  - 口座別アロケーション
- `QuickActionButtons`: クイックアクションボタン

#### 2. 銘柄一覧画面（/stocks）

**コンポーネント:**

- `StocksTable`: 銘柄一覧テーブル
  - ソート機能（ティッカー、評価額など）
  - フィルタ機能（クラス、地域、属性、口座など）
- `AddStockButton`: 銘柄追加ボタン

**表示項目:**

- ティッカー
- 銘柄名
- 評価額
- 口数
- 平均取得単価
- クラス
- 地域
- 属性
- 口座
- 備考
- アクションボタン（編集/削除）
- アクションボタン（編集/削除）

#### 3. 銘柄追加/編集画面（/stocks/new, /stocks/:id/edit）

**コンポーネント:**

- `StockForm`: 銘柄入力フォーム
  - React Hook Form + Zod バリデーション
  - 全フィールド入力
  - 送信/キャンセルボタン

**入力フィールド:**

| フィールド | 型 | 必須 | バリデーション |
|-----------|-----|------|---------------|
| 銘柄 | text | ○ | 1-100文字 |
| ティッカー | text | ○ | 1-20文字 |
| 評価額 | number | ○ | 0以上 |
| 口数 | number | - | 0以上 |
| 平均取得単価 | number | - | 0以上 |
| クラス | select | ○ | 現金/株式/コモディティ |
| 地域 | select | ○ | 日本/米国/全世界 |
| 属性 | select | ○ | 現金/インデックス/増配/ゴールド/暗号通貨 |
| 口座 | select | ○ | 預金/特定/NISA/DC/暗号資産 |
| 備考 | textarea | - | 500文字以内 |

#### 4. 設定画面（/settings）

**コンポーネント:**

- `DataManagement`: データ管理
  - エクスポートボタン
  - インポートボタン
  - データクリアボタン

## グラフ仕様（Recharts）

### ドーナツグラフ（DonutChart）

**共通設定:**

- `<ResponsiveContainer>`: 親要素に応じてリサイズ
- `<PieChart>`: 円グラフコンテナ
- `<Pie>`: データ系列
  - `dataKey`: 値のキー
  - `nameKey`: ラベルのキー
  - `cx`/`cy`: 中心位置（%）
  - `innerRadius`: 内半径（ドーナツの穴）
  - `outerRadius`: 外半径
  - `fill`: 色（カテゴリごとに異なる色）
  - `label`: ラベル表示設定（パーセンテージ）
- `<Legend>`: 凡例
- `<Tooltip>`: ツールチップ（評価額と比率を表示）

**表示グラフ:**

1. クラス別アロケーション: 現金/株式/コモディティの配分
2. 地域別アロケーション: 日本/米国/全世界の配分
3. 属性別アロケーション: 現金/インデックス/増配/ゴールド/暗号通貨の配分
4. 口座別アロケーション: 預金/特定/NISA/DC/暗号資産の配分

**カラーパレット:**

```typescript
const COLORS = {
  // クラス
  '現金': '#F57C00',
  '株式': '#2E7D32',
  'コモディティ': '#FFD700',
  // 地域
  '日本': '#C62828',
  '米国': '#1976D2',
  '全世界': '#7B1FA2',
  // 属性
  'インデックス': '#2E7D32',
  '増配': '#1976D2',
  'ゴールド': '#FFD700',
  '暗号通貨': '#F57C00',
  // 口座
  '預金': '#F57C00',
  '特定': '#1976D2',
  'NISA': '#2E7D32',
  'DC': '#7B1FA2',
  '暗号資産': '#C62828',
};
```

## ユーティリティ関数

### 計算関数

```typescript
// 評価額の合計
function calculateTotalValue(stocks: Stock[]): number

// カテゴリ別評価額集計（ドーナツグラフ用）
function aggregateByField<T extends 'assetClass' | 'region' | 'attribute' | 'account'>(
  stocks: Stock[],
  field: T
): Array<{ name: string; value: number; percentage: number }>
```

### データ変換関数

```typescript
// LocalStorageからの読み込み
function loadFromLocalStorage<T>(key: string, defaultValue: T): T

// LocalStorageへの保存
function saveToLocalStorage<T>(key: string, value: T): void

// JSONエクスポート
function exportToJSON(data: unknown): string

// JSONインポート
function importFromJSON<T>(json: string): T
```

## エラーハンドリング

### バリデーションエラー

- フォーム入力時にZodスキーマでバリデーション
- エラーメッセージをフィールド下に表示

### データインポートエラー

- JSON parse エラー: ユーザーに通知
- スキーマ不一致: エラー詳細を表示

### LocalStorageエラー

- 容量超過: ユーザーに警告
- 読み込み失敗: デフォルト値で初期化

## レスポンシブデザイン

### ブレークポイント

- モバイル: `< 768px`
- タブレット: `768px - 1024px`
- デスクトップ: `> 1024px`

### モバイル最適化

- タッチ操作しやすいボタンサイズ（最小44x44px）
- スワイプジェスチャー対応（削除など）
- グラフのタッチ操作対応

## パフォーマンス最適化

- React Compilerによる自動最適化
- 銘柄一覧の仮想スクロール（100銘柄以上の場合）
- グラフの遅延ロード
- 計算結果のメモ化

## セキュリティ

- XSS対策: Reactのデフォルトエスケープ
- CSP設定: Viteのデフォルト設定
- データ暗号化: なし（ローカル専用のため）

## テスト方針

### 単体テスト（Vitest）

- ユーティリティ関数のテスト
- ストアのテスト
- コンポーネントのテスト（@testing-library/react）

### テストカバレッジ目標

- 関数: 80%以上
- ストア: 90%以上
- コンポーネント: 60%以上
