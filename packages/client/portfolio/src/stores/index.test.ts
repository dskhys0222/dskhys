import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Stock } from '@/types';
import { useSettingsStore, useStocksStore } from './index';

// LocalStorageのモック
const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value;
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// crypto.randomUUIDのモック
const mockUUID = 'test-uuid-123';
Object.defineProperty(global, 'crypto', {
    value: {
        randomUUID: () => mockUUID,
    },
});

describe('stores', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
        // ストアをリセット
        useStocksStore.setState({ stocks: [] });
        useSettingsStore.setState({
            settings: {
                version: '2.0.0',
            },
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('useStocksStore', () => {
        describe('addStock', () => {
            it('新しい銘柄を追加する', () => {
                const newStock = {
                    name: 'Vanguard Total Stock Market ETF',
                    ticker: 'VTI',
                    value: 25000,
                    units: 100,
                    averageCost: 200,
                    assetClass: '株式' as const,
                    region: '米国' as const,
                    attribute: 'インデックス' as const,
                    account: '特定' as const,
                    source: 'manual' as const,
                };

                useStocksStore.getState().addStock(newStock);

                const stocks = useStocksStore.getState().stocks;
                expect(stocks).toHaveLength(1);
                expect(stocks[0]).toMatchObject(newStock);
                expect(stocks[0].id).toBe(mockUUID);
                expect(stocks[0].createdAt).toBeDefined();
                expect(stocks[0].updatedAt).toBeDefined();
            });

            it('追加後にLocalStorageに保存する', () => {
                const newStock = {
                    name: 'Vanguard S&P 500 ETF',
                    ticker: 'VOO',
                    value: 18000,
                    units: 50,
                    averageCost: 300,
                    assetClass: '株式' as const,
                    region: '米国' as const,
                    attribute: 'インデックス' as const,
                    account: 'NISA' as const,
                    source: 'manual' as const,
                };

                useStocksStore.getState().addStock(newStock);

                const saved = localStorage.getItem('portfolio-stocks');
                expect(saved).toBeDefined();
                const parsed = JSON.parse(saved as string);
                expect(parsed).toHaveLength(1);
                expect(parsed[0]).toMatchObject(newStock);
            });
        });

        describe('updateStock', () => {
            it('銘柄情報を更新する', () => {
                // 先に銘柄を追加
                const stock: Omit<Stock, 'id' | 'createdAt' | 'updatedAt'> = {
                    name: 'Vanguard Total Stock Market ETF',
                    ticker: 'VTI',
                    value: 25000,
                    units: 100,
                    averageCost: 200,
                    assetClass: '株式',
                    region: '米国',
                    attribute: 'インデックス',
                    account: '特定',
                    source: 'manual',
                };
                useStocksStore.getState().addStock(stock);

                const stockId = useStocksStore.getState().stocks[0].id;

                // 更新
                useStocksStore.getState().updateStock(stockId, {
                    value: 30000,
                    units: 150,
                });

                const updated = useStocksStore.getState().stocks[0];
                expect(updated.value).toBe(30000);
                expect(updated.units).toBe(150);
                expect(updated.ticker).toBe('VTI'); // 他のフィールドは変更なし
            });

            it('存在しないIDでは何も変更しない', () => {
                const stock: Omit<Stock, 'id' | 'createdAt' | 'updatedAt'> = {
                    name: 'Vanguard Total Stock Market ETF',
                    ticker: 'VTI',
                    value: 25000,
                    units: 100,
                    averageCost: 200,
                    assetClass: '株式',
                    region: '米国',
                    attribute: 'インデックス',
                    account: '特定',
                    source: 'manual',
                };
                useStocksStore.getState().addStock(stock);

                useStocksStore
                    .getState()
                    .updateStock('non-existent-id', { value: 999 });

                const stocks = useStocksStore.getState().stocks;
                expect(stocks).toHaveLength(1);
                expect(stocks[0].value).toBe(25000); // 変更なし
            });
        });

        describe('deleteStock', () => {
            it('銘柄を削除する', () => {
                const stock: Omit<Stock, 'id' | 'createdAt' | 'updatedAt'> = {
                    name: 'Vanguard Total Stock Market ETF',
                    ticker: 'VTI',
                    value: 25000,
                    units: 100,
                    averageCost: 200,
                    assetClass: '株式',
                    region: '米国',
                    attribute: 'インデックス',
                    account: '特定',
                    source: 'manual',
                };
                useStocksStore.getState().addStock(stock);

                const stockId = useStocksStore.getState().stocks[0].id;

                useStocksStore.getState().deleteStock(stockId);

                expect(useStocksStore.getState().stocks).toHaveLength(0);
            });

            it('存在しないIDでは何も変更しない', () => {
                const stock: Omit<Stock, 'id' | 'createdAt' | 'updatedAt'> = {
                    name: 'Vanguard Total Stock Market ETF',
                    ticker: 'VTI',
                    value: 25000,
                    units: 100,
                    averageCost: 200,
                    assetClass: '株式',
                    region: '米国',
                    attribute: 'インデックス',
                    account: '特定',
                    source: 'manual',
                };
                useStocksStore.getState().addStock(stock);

                useStocksStore.getState().deleteStock('non-existent-id');

                expect(useStocksStore.getState().stocks).toHaveLength(1);
            });
        });

        describe('loadStocks / saveStocks', () => {
            it('LocalStorageから銘柄データを読み込む', () => {
                const mockStocks: Stock[] = [
                    {
                        id: '1',
                        name: 'Vanguard Total Stock Market ETF',
                        ticker: 'VTI',
                        value: 25000,
                        units: 100,
                        averageCost: 200,
                        assetClass: '株式',
                        region: '米国',
                        attribute: 'インデックス',
                        account: '特定',
                        source: 'manual',
                        createdAt: '2024-01-01T00:00:00Z',
                        updatedAt: '2024-01-01T00:00:00Z',
                    },
                ];

                localStorage.setItem(
                    'portfolio-stocks',
                    JSON.stringify(mockStocks)
                );

                useStocksStore.getState().loadStocks();

                expect(useStocksStore.getState().stocks).toEqual(mockStocks);
            });
        });
    });

    describe('useSettingsStore', () => {
        describe('loadSettings / saveSettings', () => {
            it('LocalStorageから設定を読み込む', () => {
                const mockSettings = {
                    version: '2.0.0',
                };

                localStorage.setItem(
                    'portfolio-settings',
                    JSON.stringify(mockSettings)
                );

                useSettingsStore.getState().loadSettings();

                expect(useSettingsStore.getState().settings).toEqual(
                    mockSettings
                );
            });
        });
    });
});
