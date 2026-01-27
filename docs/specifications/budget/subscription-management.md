# 仕様：サブスク管理機能（Budget）

対象：`packages/client/budget` の `/` ルート

## ルーティング

- トップページ：`/`

## 画面構成

### トップページ（`/`）

- ヘッダー：既存のヘッダーを維持
- メインコンテンツエリア：4つのテーブルセクション（水平スクロール対応）
  1. **収入予算セクション**
  2. **支出予算セクション**
  3. **契約中のサブスクセクション**
  4. **追加候補のサブスクセクション**

### テーブルセクション共通構成

各セクションは以下の要素で構成：

1. **セクションヘッダー**
   - タイトル（例：「収入」）
   - フィルターボタン（表示/非表示を切り替え）
   - 統計情報：合計月額、合計年額、アイテム数

2. **テーブルビュー**
   - 列：カテゴリー、名前、月額、年額、備考
   - 行：各アイテム
   - スクロール：テーブル内で縦スクロール可能

3. **追加フォーム**
   - フォーム内容：カテゴリー（ドロップダウン）、名前、月額、年額、備考
   - 入力後、行として追加

## データモデル

### 収入・支出・サブスクアイテム

```typescript
interface BudgetItemData {
  id: string;
  category: string;
  name: string;
  pricePerMonth: number;
  pricePerYear: number;
  remark?: string;
}
```

### サブスク固有フィールド

```typescript
interface SubscriptionItemData extends BudgetItemData {
  renewalMonth?: string; // 更新月
}
```

## 状態管理

Zustandを使用した一元管理：

### Income Store

```typescript
interface IncomeItem extends BudgetItemData {}

interface IncomeStore {
  items: IncomeItem[];
  addItem: (item: Omit<IncomeItem, "id">) => void;
  updateItem: (id: string, item: Partial<IncomeItem>) => void;
  removeItem: (id: string) => void;
  getTotalMonthly: () => number;
  getTotalYearly: () => number;
}
```

### Expense Store

```typescript
interface ExpenseItem extends BudgetItemData {}

interface ExpenseStore {
  items: ExpenseItem[];
  addItem: (item: Omit<ExpenseItem, "id">) => void;
  updateItem: (id: string, item: Partial<ExpenseItem>) => void;
  removeItem: (id: string) => void;
  getTotalMonthly: () => number;
  getTotalYearly: () => number;
}
```

### Active Subscription Store

```typescript
interface ActiveSubscriptionItem extends SubscriptionItemData {}

interface ActiveSubscriptionStore {
  items: ActiveSubscriptionItem[];
  addItem: (item: Omit<ActiveSubscriptionItem, "id">) => void;
  updateItem: (id: string, item: Partial<ActiveSubscriptionItem>) => void;
  removeItem: (id: string) => void;
  getTotalMonthly: () => number;
  getTotalYearly: () => number;
  moveToCandidate: (id: string) => void; // 追加候補へ移動
}
```

### Subscription Candidate Store

```typescript
interface SubscriptionCandidateItem extends SubscriptionItemData {}

interface SubscriptionCandidateStore {
  items: SubscriptionCandidateItem[];
  addItem: (item: Omit<SubscriptionCandidateItem, "id">) => void;
  updateItem: (id: string, item: Partial<SubscriptionCandidateItem>) => void;
  removeItem: (id: string) => void;
  getTotalMonthly: () => number;
  getTotalYearly: () => number;
  moveToActive: (id: string) => void; // 契約中へ移動
}
```

## カテゴリーマスタ

### 収入カテゴリー

- 給与（#81C784 緑）
- 配当（#64B5F6 青）
- 税金・社会保障（#FFB74D 橙）
- 投資（#FFD54F 黄）
- その他（#B0BEC5 グレー）

### 支出カテゴリー

- 税金（#7E57C2 紫）
- 投資（#FFD54F 黄）
- 生活（固定）（#66BB6A 緑）
- 生活（変動）（#AB47BC 紫ピンク）
- 趣味（#EC407A ピンク）
- その他（#B0BEC5 グレー）

### サブスクカテゴリー

- 生活（#66BB6A 緑）
- 旅行（#FF7043 深橙）
- エンタメ（#FFD54F 黄）
- 開発（#42A5F5 青）
- その他（#B0BEC5 グレー）

## UI コンポーネント

### BudgetTable コンポーネント

- Props：
  - `title: string` - テーブルタイトル
  - `items: BudgetItemData[]` - テーブル行
  - `categories: string[]` - カテゴリーリスト
  - `onAdd: (item: BudgetItemData) => void` - 追加時コールバック
  - `onUpdate: (id: string, item: Partial<BudgetItemData>) => void` - 更新時コールバック
  - `onRemove: (id: string) => void` - 削除時コールバック

### SubscriptionTable コンポーネント

- Props：
  - `title: string`
  - `items: SubscriptionItemData[]`
  - `categories: string[]`
  - `onAdd: (item: SubscriptionItemData) => void`
  - `onUpdate: (id: string, item: Partial<SubscriptionItemData>) => void`
  - `onRemove: (id: string) => void`
  - `onMove?: (id: string, target: 'active' | 'candidate') => void` - 移動時コールバック

## インタラクション

1. **アイテム追加**
   - フォーム入力後、Enterキーまたは「追加」ボタンで行として追加

2. **アイテム削除**
   - 行をスワイプ（左方向）または削除アイコンクリックで削除
   - 削除確認ダイアログ表示

3. **アイテム編集**
   - セル直接編集またはダイアログ表示

4. **カテゴリーフィルター**
   - ドロップダウンで選択
   - 全て表示がデフォルト

5. **移動（サブスクのみ）**
   - 契約中 ⇔ 追加候補間で移動可能
   - 移動ボタン表示
