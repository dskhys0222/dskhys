import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BudgetSnapshot, HistoryEntry } from '@/types/sync';
import { apiFetch } from '@/utils/api';
import { decryptBudgetData, encryptData } from '@/utils/crypto';
import { useAuthStore } from './authStore';
import { useBudgetStore } from './budgetStore';
import { useExpenseStore } from './expenseStore';
import { useIncomeStore } from './incomeStore';
import {
    useActiveSubscriptionStore,
    useSubscriptionCandidateStore,
} from './subscriptionStore';

interface BudgetSyncState {
    encryptionKey: string;
    isSyncing: boolean;
    lastSyncedAt: string | null;
    lastPullAt: string | null;
    syncError: string | null;
    push: () => Promise<void>;
    pull: () => Promise<void>;
    setEncryptionKey: (key: string) => void;
    clearError: () => void;
}

export const useBudgetSyncStore = create<BudgetSyncState>()(
    persist(
        (set, get) => ({
            encryptionKey: '',
            isSyncing: false,
            lastSyncedAt: null,
            lastPullAt: null,
            syncError: null,

            push: async () => {
                const { encryptionKey } = get();
                const {
                    accessToken,
                    apiUrl,
                    isAuthenticated,
                    refreshAccessToken,
                } = useAuthStore.getState();

                if (!encryptionKey) {
                    set({ syncError: '暗号化キーが設定されていません' });
                    return;
                }
                if (!isAuthenticated || !accessToken) {
                    set({ syncError: '認証されていません' });
                    return;
                }
                if (!apiUrl) {
                    set({ syncError: 'APIのURLが設定されていません' });
                    return;
                }

                set({ isSyncing: true, syncError: null });

                try {
                    const budgetItemNames = useBudgetStore
                        .getState()
                        .items.map((item) => item.name);

                    const budgetAmounts: Record<string, number> = {};
                    for (const name of budgetItemNames) {
                        const raw = localStorage.getItem(name);
                        const parsed = raw !== null ? Number(raw) : 0;
                        budgetAmounts[name] = Number.isSafeInteger(parsed)
                            ? parsed
                            : 0;
                    }

                    const budgetHistories: Record<string, HistoryEntry[]> = {};
                    for (const name of budgetItemNames) {
                        const raw = localStorage.getItem(
                            `budget:history:${name}`
                        );
                        if (raw !== null) {
                            try {
                                const parsed = JSON.parse(raw) as unknown;
                                budgetHistories[name] = Array.isArray(parsed)
                                    ? parsed.filter(isHistoryEntry)
                                    : [];
                            } catch {
                                budgetHistories[name] = [];
                            }
                        } else {
                            budgetHistories[name] = [];
                        }
                    }

                    const snapshot: BudgetSnapshot = {
                        version: 1,
                        budgetItems: useBudgetStore.getState().items,
                        expenseItems: useExpenseStore.getState().items,
                        incomeItems: useIncomeStore.getState().items,
                        activeSubscriptions:
                            useActiveSubscriptionStore.getState().items,
                        subscriptionCandidates:
                            useSubscriptionCandidateStore.getState().items,
                        budgetAmounts,
                        budgetHistories,
                        exportedAt: new Date().toISOString(),
                    };

                    const encrypted = await encryptData(
                        JSON.stringify(snapshot),
                        encryptionKey
                    );

                    const response = await apiFetch(
                        `${apiUrl}/api/budget/snapshot`,
                        {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(encrypted),
                        },
                        () => useAuthStore.getState().accessToken,
                        refreshAccessToken
                    );

                    if (!response.ok) {
                        throw new Error(`サーバーエラー: ${response.status}`);
                    }

                    set({ lastSyncedAt: new Date().toISOString() });
                } catch (e) {
                    const msg =
                        e instanceof Error
                            ? e.message
                            : 'プッシュに失敗しました';
                    set({ syncError: msg });
                } finally {
                    set({ isSyncing: false });
                }
            },

            pull: async () => {
                const { encryptionKey } = get();
                const {
                    accessToken,
                    apiUrl,
                    isAuthenticated,
                    refreshAccessToken,
                } = useAuthStore.getState();

                if (!encryptionKey) {
                    set({ syncError: '暗号化キーが設定されていません' });
                    return;
                }
                if (!isAuthenticated || !accessToken) {
                    set({ syncError: '認証されていません' });
                    return;
                }
                if (!apiUrl) {
                    set({ syncError: 'APIのURLが設定されていません' });
                    return;
                }

                set({ isSyncing: true, syncError: null });

                try {
                    const response = await apiFetch(
                        `${apiUrl}/api/budget/snapshot`,
                        { method: 'GET' },
                        () => useAuthStore.getState().accessToken,
                        refreshAccessToken
                    );

                    if (!response.ok) {
                        if (response.status === 404) {
                            set({
                                syncError:
                                    'サーバーにスナップショットが見つかりません',
                            });
                            return;
                        }
                        throw new Error(`サーバーエラー: ${response.status}`);
                    }

                    const encryptedData = (await response.json()) as {
                        iv: string;
                        data: string;
                        tag: string;
                    };
                    const snapshot = await decryptBudgetData<BudgetSnapshot>(
                        encryptedData,
                        encryptionKey
                    );

                    useBudgetStore.setState({ items: snapshot.budgetItems });
                    useExpenseStore.setState({ items: snapshot.expenseItems });
                    useIncomeStore.setState({ items: snapshot.incomeItems });
                    useActiveSubscriptionStore.setState({
                        items: snapshot.activeSubscriptions,
                    });
                    useSubscriptionCandidateStore.setState({
                        items: snapshot.subscriptionCandidates,
                    });

                    if (snapshot.budgetAmounts) {
                        for (const [name, amount] of Object.entries(
                            snapshot.budgetAmounts
                        )) {
                            localStorage.setItem(name, String(amount));
                        }
                    }
                    if (snapshot.budgetHistories) {
                        for (const [name, history] of Object.entries(
                            snapshot.budgetHistories
                        )) {
                            localStorage.setItem(
                                `budget:history:${name}`,
                                JSON.stringify(history)
                            );
                        }
                    }

                    set({
                        lastSyncedAt: new Date().toISOString(),
                        lastPullAt: new Date().toISOString(),
                    });
                } catch (e) {
                    const msg =
                        e instanceof Error ? e.message : 'プルに失敗しました';
                    set({ syncError: msg });
                } finally {
                    set({ isSyncing: false });
                }
            },

            setEncryptionKey: (key: string) => {
                set({ encryptionKey: key });
            },

            clearError: () => {
                set({ syncError: null });
            },
        }),
        {
            name: 'budget-sync-config',
            partialize: (state) => ({
                encryptionKey: state.encryptionKey,
                lastSyncedAt: state.lastSyncedAt,
            }),
        }
    )
);

function isHistoryEntry(value: unknown): value is HistoryEntry {
    if (!value || typeof value !== 'object') return false;
    const record = value as Record<string, unknown>;
    return (
        typeof record.id === 'string' &&
        typeof record.at === 'string' &&
        (record.kind === 'increase' || record.kind === 'decrease') &&
        typeof record.delta === 'number' &&
        Number.isSafeInteger(record.delta) &&
        record.delta > 0 &&
        typeof record.after === 'number' &&
        Number.isSafeInteger(record.after)
    );
}
