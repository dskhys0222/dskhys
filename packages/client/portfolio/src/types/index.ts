// クラス
export const ASSET_CLASSES = ['現金', '株式', 'コモディティ'] as const;
export type AssetClass = (typeof ASSET_CLASSES)[number];

// 地域
export const REGIONS = ['日本', '米国', '全世界'] as const;
export type Region = (typeof REGIONS)[number];

// 属性
export const ATTRIBUTES = [
    '現金',
    'インデックス',
    '増配',
    'ゴールド',
    '暗号通貨',
] as const;
export type Attribute = (typeof ATTRIBUTES)[number];

// 口座
export const ACCOUNTS = ['預金', '特定', 'NISA', 'DC', '暗号資産'] as const;
export type Account = (typeof ACCOUNTS)[number];

export interface Stock {
    id: string;
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
    createdAt: string;
    updatedAt: string;
}

export interface AppSettings {
    version: string;
}

export interface AggregatedData {
    name: string;
    value: number;
    percentage: number;
}

// カスタム集計の属性設定
export interface CustomAggregationAttribute {
    name: string; // 属性名（例: "サテライト", "コア"）
    color: string; // グラフの色
}

// カスタム集計での銘柄への属性割り当て
export interface CustomAggregationStockAssignment {
    stockId: string;
    attributeName: string; // 割り当てられた属性名
}

// カスタム集計定義
export interface CustomAggregation {
    id: string;
    name: string; // 集計名称（例: "コア・サテライト"）
    attributes: CustomAggregationAttribute[]; // 属性一覧
    stockAssignments: CustomAggregationStockAssignment[]; // 銘柄への属性割り当て
    createdAt: string;
    updatedAt: string;
}
