import { create } from 'zustand';
import type { AppSettings, CustomAggregation, Stock } from '@/types';
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
