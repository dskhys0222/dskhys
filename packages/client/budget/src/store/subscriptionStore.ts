import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SubscriptionItem {
    id: string;
    category: string;
    name: string;
    pricePerMonth: number;
    pricePerYear: number;
    remark?: string;
    renewalMonth?: string;
}

export interface ActiveSubscriptionStore {
    items: SubscriptionItem[];
    addItem: (item: Omit<SubscriptionItem, 'id'>) => void;
    updateItem: (id: string, item: Partial<SubscriptionItem>) => void;
    removeItem: (id: string) => void;
    getTotalMonthly: () => number;
    getTotalYearly: () => number;
    moveToCandidate: (id: string) => void;
}

export interface SubscriptionCandidateStore {
    items: SubscriptionItem[];
    addItem: (item: Omit<SubscriptionItem, 'id'>) => void;
    updateItem: (id: string, item: Partial<SubscriptionItem>) => void;
    removeItem: (id: string) => void;
    getTotalMonthly: () => number;
    getTotalYearly: () => number;
    moveToActive: (id: string) => void;
}

export const useActiveSubscriptionStore = create<ActiveSubscriptionStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item: Omit<SubscriptionItem, 'id'>) => {
                set((state: ActiveSubscriptionStore) => ({
                    items: [
                        ...state.items,
                        {
                            ...item,
                            id: crypto.randomUUID(),
                        },
                    ],
                }));
            },
            updateItem: (id: string, item: Partial<SubscriptionItem>) => {
                set((state: ActiveSubscriptionStore) => ({
                    items: state.items.map((i) =>
                        i.id === id ? { ...i, ...item } : i
                    ),
                }));
            },
            removeItem: (id: string) => {
                set((state: ActiveSubscriptionStore) => ({
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
            moveToCandidate: (id: string) => {
                const item = get().items.find((i) => i.id === id);
                if (item) {
                    get().removeItem(id);
                    // Candidate storeに追加する処理は別途実装
                }
            },
        }),
        {
            name: 'active-subscription-store',
        }
    )
);

export const useSubscriptionCandidateStore =
    create<SubscriptionCandidateStore>()(
        persist(
            (set, get) => ({
                items: [],
                addItem: (item: Omit<SubscriptionItem, 'id'>) => {
                    set((state: SubscriptionCandidateStore) => ({
                        items: [
                            ...state.items,
                            {
                                ...item,
                                id: crypto.randomUUID(),
                            },
                        ],
                    }));
                },
                updateItem: (id: string, item: Partial<SubscriptionItem>) => {
                    set((state: SubscriptionCandidateStore) => ({
                        items: state.items.map((i) =>
                            i.id === id ? { ...i, ...item } : i
                        ),
                    }));
                },
                removeItem: (id: string) => {
                    set((state: SubscriptionCandidateStore) => ({
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
                moveToActive: (id: string) => {
                    const item = get().items.find((i) => i.id === id);
                    if (item) {
                        get().removeItem(id);
                        // Active storeに追加する処理は別途実装
                    }
                },
            }),
            {
                name: 'subscription-candidate-store',
            }
        )
    );
