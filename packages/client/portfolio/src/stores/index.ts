import { create } from 'zustand';
import type {
    AppSettings,
    CustomAggregation,
    EncryptedPortfolioResponse,
    MFPortfolioData,
    Stock,
    StockMapping,
} from '@/types';
import { decryptPortfolioData } from '@/utils/crypto';
import { createInitialMappings } from '@/utils/mf-mapping';
import { loadFromLocalStorage, saveToLocalStorage } from '@/utils/storage';

const STORAGE_KEY = 'portfolio-stocks';

interface StocksStore {
    stocks: Stock[];
    addStock: (stock: Omit<Stock, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateStock: (id: string, updates: Partial<Stock>) => void;
    deleteStock: (id: string) => void;
    loadStocks: () => void;
    saveStocks: () => void;
}

export const useStocksStore = create<StocksStore>((set, get) => ({
    stocks: [],

    addStock: (stock) => {
        const newStock: Stock = {
            ...stock,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        set((state) => ({
            stocks: [...state.stocks, newStock],
        }));

        get().saveStocks();
    },

    updateStock: (id, updates) => {
        const updatedStocks = get().stocks.map((stock) =>
            stock.id === id
                ? {
                      ...stock,
                      ...updates,
                      updatedAt: new Date().toISOString(),
                  }
                : stock
        );

        set({ stocks: updatedStocks });

        saveToLocalStorage(STORAGE_KEY, updatedStocks);
    },

    deleteStock: (id) => {
        set((state) => ({
            stocks: state.stocks.filter((stock) => stock.id !== id),
        }));

        get().saveStocks();
    },

    loadStocks: () => {
        const stocks = loadFromLocalStorage<Stock[]>(STORAGE_KEY, []);
        set({ stocks });
    },

    saveStocks: () => {
        const stocks = get().stocks;
        saveToLocalStorage(STORAGE_KEY, stocks);
    },
}));

const SETTINGS_STORAGE_KEY = 'portfolio-settings';

const defaultSettings: AppSettings = {
    version: '2.0.0',
};

interface SettingsStore {
    settings: AppSettings;
    loadSettings: () => void;
    saveSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
    settings: defaultSettings,

    loadSettings: () => {
        const settings = loadFromLocalStorage<AppSettings>(
            SETTINGS_STORAGE_KEY,
            defaultSettings
        );
        set({ settings });
    },

    saveSettings: () => {
        saveToLocalStorage(SETTINGS_STORAGE_KEY, get().settings);
    },
}));

// カスタム集計ストア
const CUSTOM_AGGREGATIONS_STORAGE_KEY = 'portfolio-custom-aggregations';

interface CustomAggregationsStore {
    customAggregations: CustomAggregation[];
    addCustomAggregation: (
        aggregation: Omit<CustomAggregation, 'id' | 'createdAt' | 'updatedAt'>
    ) => void;
    updateCustomAggregation: (
        id: string,
        updates: Partial<Omit<CustomAggregation, 'id' | 'createdAt'>>
    ) => void;
    deleteCustomAggregation: (id: string) => void;
    loadCustomAggregations: () => void;
    saveCustomAggregations: () => void;
}

export const useCustomAggregationsStore = create<CustomAggregationsStore>(
    (set, get) => ({
        customAggregations: [],

        addCustomAggregation: (aggregation) => {
            const newAggregation: CustomAggregation = {
                ...aggregation,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            set((state) => ({
                customAggregations: [
                    ...state.customAggregations,
                    newAggregation,
                ],
            }));

            get().saveCustomAggregations();
        },

        updateCustomAggregation: (id, updates) => {
            const updatedAggregations = get().customAggregations.map(
                (aggregation) =>
                    aggregation.id === id
                        ? {
                              ...aggregation,
                              ...updates,
                              updatedAt: new Date().toISOString(),
                          }
                        : aggregation
            );

            set({ customAggregations: updatedAggregations });
            get().saveCustomAggregations();
        },

        deleteCustomAggregation: (id) => {
            set((state) => ({
                customAggregations: state.customAggregations.filter(
                    (a) => a.id !== id
                ),
            }));

            get().saveCustomAggregations();
        },

        loadCustomAggregations: () => {
            const customAggregations = loadFromLocalStorage<
                CustomAggregation[]
            >(CUSTOM_AGGREGATIONS_STORAGE_KEY, []);
            set({ customAggregations });
        },

        saveCustomAggregations: () => {
            const customAggregations = get().customAggregations;
            saveToLocalStorage(
                CUSTOM_AGGREGATIONS_STORAGE_KEY,
                customAggregations
            );
        },
    })
);

// マネーフォワードデータストア
const MF_ENCRYPTION_KEY_STORAGE_KEY = 'portfolio-mf-encryption-key';
const MF_MAPPINGS_STORAGE_KEY = 'portfolio-mf-mappings';
const MF_SYNC_CONFIG_STORAGE_KEY = 'portfolio-mf-sync-config';
const MF_ACCESS_TOKEN_STORAGE_KEY = 'portfolio-mf-access-token';
const MF_REFRESH_TOKEN_STORAGE_KEY = 'portfolio-mf-refresh-token';

interface MFSyncConfig {
    apiUrl: string;
}

interface MFDataStore {
    /** マネーフォワードから取得したポートフォリオデータ（復号済み） */
    mfData: MFPortfolioData | null;
    /** 暗号化キー（ローカルストレージに保存） */
    encryptionKey: string;
    /** アクセストークン */
    accessToken: string;
    /** リフレッシュトークン */
    refreshToken: string;
    /** 読み込み中フラグ */
    isLoading: boolean;
    /** エラーメッセージ */
    error: string | null;
    /** MF銘柄とポートフォリオ銘柄のマッピング */
    mappings: StockMapping[];
    /** 同期設定 */
    syncConfig: MFSyncConfig;

    /** 暗号化キーを設定 */
    setEncryptionKey: (key: string) => void;
    /** 暗号化キーを読み込み */
    loadEncryptionKey: () => void;
    /** APIにログイン */
    login: (
        apiUrl: string,
        username: string,
        password: string
    ) => Promise<boolean>;
    /** トークンを読み込み */
    loadTokens: () => void;
    /** ログアウト */
    logout: () => void;
    /** リフレッシュトークンでアクセストークンを更新 */
    refreshAccessToken: (apiUrl: string) => Promise<boolean>;
    /** APIから暗号化データを取得して復号 */
    fetchAndDecrypt: (apiUrl: string, token: string) => Promise<void>;
    /** データをクリア */
    clearMFData: () => void;
    /** マッピングを読み込み */
    loadMappings: () => void;
    /** マッピングを保存 */
    saveMappings: () => void;
    /** 個別のマッピングを更新 */
    updateMapping: (
        mappingId: string,
        updates: Partial<Pick<StockMapping, 'stockId' | 'action'>>
    ) => void;
    /** MFデータから初期マッピングを生成 */
    generateMappings: (stocks: Stock[]) => void;
    /** マッピングに基づいて銘柄を更新 */
    applySync: (updateStock: (id: string, updates: Partial<Stock>) => void) => {
        updatedCount: number;
        skippedCount: number;
    };
    /** 同期設定を読み込み */
    loadSyncConfig: () => void;
    /** 同期設定を保存 */
    saveSyncConfig: (config: MFSyncConfig) => void;
}

export const useMFDataStore = create<MFDataStore>((set, get) => ({
    mfData: null,
    encryptionKey: '',
    accessToken: '',
    refreshToken: '',
    isLoading: false,
    error: null,
    mappings: [],
    syncConfig: { apiUrl: '' },

    setEncryptionKey: (key: string) => {
        set({ encryptionKey: key });
        saveToLocalStorage(MF_ENCRYPTION_KEY_STORAGE_KEY, key);
    },

    loadEncryptionKey: () => {
        const key = loadFromLocalStorage<string>(
            MF_ENCRYPTION_KEY_STORAGE_KEY,
            ''
        );
        set({ encryptionKey: key });
    },

    login: async (apiUrl: string, username: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
            const response = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'ログインに失敗しました');
            }

            const data = await response.json();
            const { accessToken, refreshToken } = data;

            set({ accessToken, refreshToken });
            saveToLocalStorage(MF_ACCESS_TOKEN_STORAGE_KEY, accessToken);
            saveToLocalStorage(MF_REFRESH_TOKEN_STORAGE_KEY, refreshToken);

            return true;
        } catch (e) {
            const errorMessage =
                e instanceof Error ? e.message : 'ログインに失敗しました';
            set({ error: errorMessage });
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    loadTokens: () => {
        const accessToken = loadFromLocalStorage<string>(
            MF_ACCESS_TOKEN_STORAGE_KEY,
            ''
        );
        const refreshToken = loadFromLocalStorage<string>(
            MF_REFRESH_TOKEN_STORAGE_KEY,
            ''
        );
        set({ accessToken, refreshToken });
    },

    logout: () => {
        set({ accessToken: '', refreshToken: '', mfData: null });
        saveToLocalStorage(MF_ACCESS_TOKEN_STORAGE_KEY, '');
        saveToLocalStorage(MF_REFRESH_TOKEN_STORAGE_KEY, '');
    },

    refreshAccessToken: async (apiUrl: string) => {
        const { refreshToken } = get();

        if (!refreshToken) {
            set({ error: 'リフレッシュトークンが見つかりません' });
            return false;
        }

        set({ isLoading: true, error: null });

        try {
            const response = await fetch(`${apiUrl}/api/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (response.status === 401) {
                    set({ accessToken: '', refreshToken: '', mfData: null });
                    saveToLocalStorage(MF_ACCESS_TOKEN_STORAGE_KEY, '');
                    saveToLocalStorage(MF_REFRESH_TOKEN_STORAGE_KEY, '');
                }
                throw new Error(
                    errorData.error || 'トークンリフレッシュに失敗しました'
                );
            }

            const data = await response.json();
            const newAccessToken = data.accessToken;
            const newRefreshToken = data.refreshToken;

            set({ accessToken: newAccessToken, refreshToken: newRefreshToken });
            saveToLocalStorage(MF_ACCESS_TOKEN_STORAGE_KEY, newAccessToken);
            saveToLocalStorage(MF_REFRESH_TOKEN_STORAGE_KEY, newRefreshToken);

            return true;
        } catch (e) {
            const errorMessage =
                e instanceof Error
                    ? e.message
                    : 'トークンリフレッシュに失敗しました';
            set({ error: errorMessage });
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    fetchAndDecrypt: async (apiUrl: string, token: string) => {
        const { encryptionKey } = get();

        if (!encryptionKey) {
            set({ error: '暗号化キーが設定されていません' });
            return;
        }

        set({ isLoading: true, error: null });

        try {
            let response = await fetch(`${apiUrl}/api/portfolio/encrypted`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // accessToken が期限切れの場合、リフレッシュしてリトライ
            if (response.status === 401) {
                const refreshed = await get().refreshAccessToken(apiUrl);
                if (!refreshed) {
                    throw new Error(
                        'トークンのリフレッシュに失敗しました。再度ログインしてください。'
                    );
                }

                const newAccessToken = get().accessToken;
                response = await fetch(`${apiUrl}/api/portfolio/encrypted`, {
                    headers: {
                        Authorization: `Bearer ${newAccessToken}`,
                    },
                });
            }

            if (!response.ok) {
                if (response.status === 404) {
                    set({
                        mfData: null,
                        error: 'マネーフォワードデータが見つかりません',
                    });
                    return;
                }
                throw new Error(`API error: ${response.status}`);
            }

            const encryptedData: EncryptedPortfolioResponse =
                await response.json();

            const decryptedData = await decryptPortfolioData<MFPortfolioData>(
                encryptedData,
                encryptionKey
            );

            set({ mfData: decryptedData, error: null });
        } catch (e) {
            const errorMessage =
                e instanceof Error ? e.message : '復号に失敗しました';
            set({ error: errorMessage });
        } finally {
            set({ isLoading: false });
        }
    },

    clearMFData: () => {
        set({ mfData: null, error: null });
    },

    loadMappings: () => {
        const mappings = loadFromLocalStorage<StockMapping[]>(
            MF_MAPPINGS_STORAGE_KEY,
            []
        );
        set({ mappings });
    },

    saveMappings: () => {
        saveToLocalStorage(MF_MAPPINGS_STORAGE_KEY, get().mappings);
    },

    updateMapping: (mappingId, updates) => {
        const updatedMappings = get().mappings.map((mapping) =>
            mapping.id === mappingId
                ? {
                      ...mapping,
                      ...updates,
                      updatedAt: new Date().toISOString(),
                  }
                : mapping
        );
        set({ mappings: updatedMappings });
        saveToLocalStorage(MF_MAPPINGS_STORAGE_KEY, updatedMappings);
    },

    generateMappings: (stocks: Stock[]) => {
        const { mfData, mappings: existingMappings } = get();
        if (!mfData) return;

        const newMappings = createInitialMappings(
            mfData.stocks,
            stocks,
            existingMappings
        );
        set({ mappings: newMappings });
        saveToLocalStorage(MF_MAPPINGS_STORAGE_KEY, newMappings);
    },

    applySync: (updateStock) => {
        const { mfData } = get();
        if (!mfData) {
            return { updatedCount: 0, skippedCount: 0 };
        }

        // useStocksStore から現在の stocks を取得
        const stocks = useStocksStore.getState().stocks;

        let updatedCount = 0;
        let addedCount = 0;
        let deletedCount = 0;

        // 1. MFに存在しない、且つ source='mf' の銘柄を削除
        const mfStockIds = mfData.stocks.map((s) => s.id);
        const mfStocksToDelete = stocks.filter(
            (stock: Stock) =>
                stock.source === 'mf' && !mfStockIds.includes(stock.id)
        );

        for (const stock of mfStocksToDelete) {
            useStocksStore.getState().deleteStock(stock.id);
            deletedCount++;
        }

        // 2. MFの銘柄に対して、ポートフォリオで既存の mf 銘柄を更新
        // またはなければ新規追加
        for (const mfStock of mfData.stocks) {
            const existingStock = stocks.find(
                (s: Stock) => s.id === mfStock.id && s.source === 'mf'
            );

            if (existingStock) {
                // 既存の MF 銘柄を更新
                // ティッカーと属性は既に設定されていれば保持する
                updateStock(existingStock.id, {
                    name: mfStock.name,
                    value: mfStock.value,
                    units: mfStock.units,
                    currentPrice: mfStock.currentPrice,
                    averageCost: mfStock.averageCost,
                    // ティッカー、属性（assetClass, region, attribute, account）は上書きしない
                });
                updatedCount++;
            } else {
                // 新規追加
                // MFStockのIDをそのまま使用して、既存の mf 銘柄を正しく認識できるようにする
                const newStock: Stock = {
                    id: mfStock.id,
                    source: 'mf',
                    name: mfStock.name,
                    ticker: '', // ティッカーはMFから取得できないため空
                    value: mfStock.value,
                    units: mfStock.units,
                    currentPrice: mfStock.currentPrice,
                    averageCost: mfStock.averageCost,
                    assetClass: '現金', // デフォルト値
                    region: '全世界', // デフォルト値
                    attribute: '現金', // デフォルト値
                    account: '預金', // デフォルト値
                    note: 'MoneyForwardから自動取得',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                const currentStocks = useStocksStore.getState().stocks;
                useStocksStore.setState({
                    stocks: [...currentStocks, newStock],
                });
                useStocksStore.getState().saveStocks();
                addedCount++;
            }
        }

        return {
            updatedCount: updatedCount + deletedCount + addedCount,
            skippedCount: 0,
        };
    },

    loadSyncConfig: () => {
        const config = loadFromLocalStorage<MFSyncConfig>(
            MF_SYNC_CONFIG_STORAGE_KEY,
            { apiUrl: '' }
        );
        set({ syncConfig: config });
    },

    saveSyncConfig: (config: MFSyncConfig) => {
        set({ syncConfig: config });
        saveToLocalStorage(MF_SYNC_CONFIG_STORAGE_KEY, config);
    },
}));
