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
    source: 'manual' | 'mf'; // 手動入力またはMoneyForwardから取得
    name: string; // 銘柄名（必須）
    ticker: string; // ティッカーシンボル（必須）
    value: number; // 評価額（必須）
    currentPrice?: number; // 基準価額（任意、MoneyForward同期時に更新）
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

// マネーフォワード連携用の型定義

/** マネーフォワードから取得した銘柄情報 */
export interface MFStock {
    id: string; // 一意のID（銘柄名_金融機関名、重複時は_2, _3...）
    name: string; // 銘柄名
    units: number; // 保有数
    averageCost: number; // 平均取得単価
    currentPrice: number; // 基準価額
    value: number; // 評価額
    profitLoss: number; // 評価損益
    account: string; // 保有金融機関
}

/** マネーフォワードから取得したポートフォリオデータ */
export interface MFPortfolioData {
    stocks: MFStock[];
    scrapedAt: string; // ISO 8601
}

/** APIから取得した暗号化データ */
export interface EncryptedPortfolioResponse {
    iv: string;
    data: string;
    tag: string;
    scrapedAt: string;
}

/** 銘柄マッピング（MF銘柄とportfolio銘柄の紐づけ） */
export interface StockMapping {
    id: string;
    mfStockId: string; // MFStock.id（バッチ側で割り当てられたID）
    stockId: string | null; // portfolio側の銘柄ID（null=未マッピング）
    action: 'update' | 'skip' | 'new'; // 同期時のアクション
    createdAt: string;
    updatedAt: string;
}

/** MF同期設定 */
export interface MFSyncConfig {
    apiUrl: string;
    encryptionKey: string;
}

/** 認証トークン */
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
