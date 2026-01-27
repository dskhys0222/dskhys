import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface IncomeItem {
    id: string;
    category: string;
    name: string;
    pricePerMonth: number;
    pricePerYear: number;
    remark?: string;
}

export interface IncomeStore {
    items: IncomeItem[];
    addItem: (item: Omit<IncomeItem, 'id'>) => void;
    updateItem: (id: string, item: Partial<IncomeItem>) => void;
    removeItem: (id: string) => void;
    getTotalMonthly: () => number;
    getTotalYearly: () => number;
}

export const useIncomeStore = create<IncomeStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item: Omit<IncomeItem, 'id'>) => {
                set((state: IncomeStore) => ({
                    items: [
                        ...state.items,
                        {
                            ...item,
                            id: crypto.randomUUID(),
                        },
                    ],
                }));
            },
            updateItem: (id: string, item: Partial<IncomeItem>) => {
                set((state: IncomeStore) => ({
                    items: state.items.map((i) =>
                        i.id === id ? { ...i, ...item } : i
                    ),
                }));
            },
            removeItem: (id: string) => {
                set((state: IncomeStore) => ({
                    items: state.items.filter((i) => i.id !== id),
                }));
            },
            getTotalMonthly: () => {
                return get().items.reduce(
                    (sum, item) => sum + item.pricePerMonth,
                    0
                );
            },
            getTotalYearly: () => {
                return get().items.reduce(
                    (sum, item) => sum + item.pricePerYear,
                    0
                );
            },
        }),
        {
            name: 'income-store',
        }
    )
);
