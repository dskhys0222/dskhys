import { useEffect, useRef } from 'react';
import {
    useCustomAggregationsStore,
    useMFDataStore,
    useStocksStore,
} from '@/stores/index';
import { usePortfolioSyncStore } from '@/stores/usePortfolioSyncStore';

const DEBOUNCE_MS = 2000;

/**
 * stocksまたはcustomAggregationsが更新されたとき、
 * デバウンス後に自動プッシュを実行するフック。
 * 認証済みかつencryptionKeyが設定済みの場合のみ発火。
 */
export function useAutoSync(): void {
    const stocks = useStocksStore((s) => s.stocks);
    const customAggregations = useCustomAggregationsStore(
        (s) => s.customAggregations
    );
    const accessToken = useMFDataStore((s) => s.accessToken);
    const encryptionKey = useMFDataStore((s) => s.encryptionKey);
    const push = usePortfolioSyncStore((s) => s.push);
    const isSyncing = usePortfolioSyncStore((s) => s.isSyncing);

    const isAuthenticated = accessToken !== '';
    const hasKey = encryptionKey !== '';

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // biome-ignore lint/correctness/useExhaustiveDependencies: stocks と customAggregations は変更検知のためのトリガー
    useEffect(() => {
        if (!isAuthenticated || !hasKey || isSyncing) return;

        if (timerRef.current !== null) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
            push();
        }, DEBOUNCE_MS);

        return () => {
            if (timerRef.current !== null) {
                clearTimeout(timerRef.current);
            }
        };
    }, [stocks, customAggregations, isAuthenticated, hasKey, isSyncing, push]);
}
