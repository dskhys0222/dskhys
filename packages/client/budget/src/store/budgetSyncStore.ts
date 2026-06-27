import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BudgetSnapshot } from '@/types/sync';
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
                    const snapshot: BudgetSnapshot = {
                        version: 1,
                        budgetItems: useBudgetStore.getState().items,
                        expenseItems: useExpenseStore.getState().items,
                        incomeItems: useIncomeStore.getState().items,
                        activeSubscriptions:
                            useActiveSubscriptionStore.getState().items,
                        subscriptionCandidates:
                            useSubscriptionCandidateStore.getState().items,
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

                    set({ lastSyncedAt: new Date().toISOString() });
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
