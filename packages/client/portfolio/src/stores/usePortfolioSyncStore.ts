import { create } from 'zustand';
import type { PortfolioSnapshot } from '@/types';
import { decryptData, encryptData } from '@/utils/crypto';
import { loadFromLocalStorage, saveToLocalStorage } from '@/utils/storage';
import {
    useCustomAggregationsStore,
    useMFDataStore,
    useSettingsStore,
    useStocksStore,
} from './index';

const LAST_SYNCED_STORAGE_KEY = 'portfolio-sync-last-synced';

interface PortfolioSyncStore {
    isSyncing: boolean;
    lastSyncedAt: string | null;
    syncError: string | null;
    hasConflict: boolean;
    serverSnapshot: PortfolioSnapshot | null;

    push: () => Promise<void>;
    pull: () => Promise<void>;
    resolveConflict: (strategy: 'local' | 'server') => void;
    clearError: () => void;
}

export const usePortfolioSyncStore = create<PortfolioSyncStore>((set, get) => ({
    isSyncing: false,
    lastSyncedAt: loadFromLocalStorage<string | null>(
        LAST_SYNCED_STORAGE_KEY,
        null
    ),
    syncError: null,
    hasConflict: false,
    serverSnapshot: null,

    push: async () => {
        const { encryptionKey, accessToken, syncConfig } =
            useMFDataStore.getState();
        const apiUrl = syncConfig.apiUrl;

        if (!encryptionKey) {
            set({ syncError: '暗号化キーが設定されていません' });
            return;
        }
        if (!accessToken) {
            set({ syncError: '認証されていません' });
            return;
        }
        if (!apiUrl) {
            set({ syncError: 'APIのURLが設定されていません' });
            return;
        }

        set({ isSyncing: true, syncError: null });

        try {
            const snapshot: PortfolioSnapshot = {
                version: '1.0',
                stocks: useStocksStore.getState().stocks,
                customAggregations:
                    useCustomAggregationsStore.getState().customAggregations,
                settings: useSettingsStore.getState().settings,
                mfMappings: useMFDataStore.getState().mappings,
                exportedAt: new Date().toISOString(),
            };

            const encrypted = await encryptData(
                JSON.stringify(snapshot),
                encryptionKey
            );

            const response = await fetch(`${apiUrl}/api/portfolio/snapshot`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(encrypted),
            });

            if (response.status === 409) {
                const conflictData = await response.json().catch(() => null);
                let serverSnapshot: PortfolioSnapshot | null = null;
                if (
                    conflictData?.iv &&
                    conflictData?.data &&
                    conflictData?.tag
                ) {
                    const decrypted = await decryptData(
                        conflictData.iv,
                        conflictData.data,
                        conflictData.tag,
                        encryptionKey
                    );
                    serverSnapshot = JSON.parse(decrypted) as PortfolioSnapshot;
                }
                set({ hasConflict: true, serverSnapshot });
                return;
            }

            if (!response.ok) {
                throw new Error(`サーバーエラー: ${response.status}`);
            }

            const now = new Date().toISOString();
            set({
                lastSyncedAt: now,
                hasConflict: false,
                serverSnapshot: null,
            });
            saveToLocalStorage(LAST_SYNCED_STORAGE_KEY, now);
        } catch (e) {
            const errorMessage =
                e instanceof Error ? e.message : 'プッシュに失敗しました';
            set({ syncError: errorMessage });
        } finally {
            set({ isSyncing: false });
        }
    },

    pull: async () => {
        const { encryptionKey, accessToken, syncConfig } =
            useMFDataStore.getState();
        const apiUrl = syncConfig.apiUrl;

        if (!encryptionKey) {
            set({ syncError: '暗号化キーが設定されていません' });
            return;
        }
        if (!accessToken) {
            set({ syncError: '認証されていません' });
            return;
        }
        if (!apiUrl) {
            set({ syncError: 'APIのURLが設定されていません' });
            return;
        }

        set({ isSyncing: true, syncError: null });

        try {
            const response = await fetch(`${apiUrl}/api/portfolio/snapshot`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    set({
                        syncError: 'サーバーにスナップショットが見つかりません',
                    });
                    return;
                }
                throw new Error(`サーバーエラー: ${response.status}`);
            }

            const encryptedData = await response.json();
            const decrypted = await decryptData(
                encryptedData.iv,
                encryptedData.data,
                encryptedData.tag,
                encryptionKey
            );
            const snapshot = JSON.parse(decrypted) as PortfolioSnapshot;

            // 各storeに適用
            useStocksStore.setState({ stocks: snapshot.stocks });
            useStocksStore.getState().saveStocks();
            useCustomAggregationsStore.setState({
                customAggregations: snapshot.customAggregations,
            });
            useCustomAggregationsStore.getState().saveCustomAggregations();
            useSettingsStore.setState({ settings: snapshot.settings });
            useSettingsStore.getState().saveSettings();
            useMFDataStore.setState({ mappings: snapshot.mfMappings });
            useMFDataStore.getState().saveMappings();

            const now = new Date().toISOString();
            set({
                lastSyncedAt: now,
                hasConflict: false,
                serverSnapshot: null,
            });
            saveToLocalStorage(LAST_SYNCED_STORAGE_KEY, now);
        } catch (e) {
            const errorMessage =
                e instanceof Error ? e.message : 'プルに失敗しました';
            set({ syncError: errorMessage });
        } finally {
            set({ isSyncing: false });
        }
    },

    resolveConflict: (strategy) => {
        if (strategy === 'server') {
            const { serverSnapshot } = get();
            if (serverSnapshot) {
                useStocksStore.setState({ stocks: serverSnapshot.stocks });
                useStocksStore.getState().saveStocks();
                useCustomAggregationsStore.setState({
                    customAggregations: serverSnapshot.customAggregations,
                });
                useCustomAggregationsStore.getState().saveCustomAggregations();
                useSettingsStore.setState({
                    settings: serverSnapshot.settings,
                });
                useSettingsStore.getState().saveSettings();
                useMFDataStore.setState({
                    mappings: serverSnapshot.mfMappings,
                });
                useMFDataStore.getState().saveMappings();

                const now = new Date().toISOString();
                set({
                    hasConflict: false,
                    serverSnapshot: null,
                    lastSyncedAt: now,
                });
                saveToLocalStorage(LAST_SYNCED_STORAGE_KEY, now);
            }
        } else {
            // 'local': ローカルを優先してプッシュ（競合フラグをクリアしてリトライ）
            set({ hasConflict: false, serverSnapshot: null });
            get().push();
        }
    },

    clearError: () => {
        set({ syncError: null });
    },
}));
