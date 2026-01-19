import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BudgetItem {
    id: string;
    name: string;
}

export interface BudgetStore {
    items: BudgetItem[];
    addItem: (name: string) => void;
    removeItem: (id: string) => void;
}

export const useBudgetStore = create<BudgetStore>()(
    persist(
        (set) => ({
            items: [],
            addItem: (name: string) => {
                set((state: BudgetStore) => ({
                    items: [
                        ...state.items,
                        {
                            id: crypto.randomUUID(),
                            name,
                        },
                    ],
                }));
            },
            removeItem: (id: string) => {
                set((state: BudgetStore) => ({
                    items: state.items.filter(
                        (item: BudgetItem) => item.id !== id
                    ),
                }));
            },
        }),
        {
            name: 'budget-store',
        }
    )
);
