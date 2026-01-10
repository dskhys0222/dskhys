import { create } from 'zustand';
import type { AppSettings, Stock } from '@/types';
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
        set((state) => ({
            stocks: state.stocks.map((stock) =>
                stock.id === id
                    ? {
                          ...stock,
                          ...updates,
                          updatedAt: new Date().toISOString(),
                      }
                    : stock
            ),
        }));

        get().saveStocks();
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
        saveToLocalStorage(STORAGE_KEY, get().stocks);
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
