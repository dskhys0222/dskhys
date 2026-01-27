import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ExpenseItem {
    id: string;
    category: string;
    name: string;
    pricePerMonth: number;
    pricePerYear: number;
    remark?: string;
}

export interface ExpenseStore {
    items: ExpenseItem[];
    addItem: (item: Omit<ExpenseItem, 'id'>) => void;
    updateItem: (id: string, item: Partial<ExpenseItem>) => void;
    removeItem: (id: string) => void;
    getTotalMonthly: () => number;
    getTotalYearly: () => number;
}

export const useExpenseStore = create<ExpenseStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item: Omit<ExpenseItem, 'id'>) => {
                set((state: ExpenseStore) => ({
                    items: [
                        ...state.items,
                        {
                            ...item,
                            id: crypto.randomUUID(),
                        },
                    ],
                }));
            },
            updateItem: (id: string, item: Partial<ExpenseItem>) => {
                set((state: ExpenseStore) => ({
                    items: state.items.map((i) =>
                        i.id === id ? { ...i, ...item } : i
                    ),
                }));
            },
            removeItem: (id: string) => {
                set((state: ExpenseStore) => ({
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
            name: 'expense-store',
        }
    )
);
