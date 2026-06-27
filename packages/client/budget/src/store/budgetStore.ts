import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAutoSyncTriggerStore } from './autoSyncTriggerStore';

export interface BudgetItem {
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
                useAutoSyncTriggerStore.getState().markChanged();
            },
            removeItem: (id: string) => {
                set((state: BudgetStore) => ({
                    items: state.items.filter(
                        (item: BudgetItem) => item.id !== id
                    ),
                }));
                useAutoSyncTriggerStore.getState().markChanged();
            },
        }),
        {
            name: 'budget-store',
        }
    )
);
