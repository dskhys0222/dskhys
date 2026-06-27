import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    useCustomAggregationsStore,
    useMFDataStore,
    useStocksStore,
} from '@/stores/index';
import { useAutoSyncTriggerStore } from '@/stores/useAutoSyncTriggerStore';
import { usePortfolioSyncStore } from '@/stores/usePortfolioSyncStore';
import { useAutoSync } from './useAutoSync';

describe('useAutoSync', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        vi.clearAllTimers();

        useMFDataStore.setState({
            accessToken: 'token',
            encryptionKey: 'key',
        });
        useStocksStore.setState({ stocks: [] });
        useCustomAggregationsStore.setState({ customAggregations: [] });
        useAutoSyncTriggerStore.setState({ dataVersion: 0 });
        usePortfolioSyncStore.setState({
            isSyncing: false,
            push: vi.fn(),
        } as never);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('初回レンダリング時には同期せず、実際の変更時だけ同期する', () => {
        const push = vi.fn();
        usePortfolioSyncStore.setState({ push } as never);

        renderHook(() => useAutoSync());

        act(() => {
            vi.advanceTimersByTime(2000);
        });
        expect(push).not.toHaveBeenCalled();

        act(() => {
            useStocksStore.getState().addStock({
                name: 'Test',
                ticker: 'TEST',
                value: 100,
                units: 1,
                averageCost: 100,
                source: 'manual',
            });
        });

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(push).toHaveBeenCalledTimes(1);
    });

    it('同期状態の変化で追加の自動同期が走らない', () => {
        const push = vi.fn();
        usePortfolioSyncStore.setState({ push } as never);

        renderHook(() => useAutoSync());

        act(() => {
            useStocksStore.getState().addStock({
                name: 'Test',
                ticker: 'TEST',
                value: 100,
                units: 1,
                averageCost: 100,
                source: 'manual',
            });
        });

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(push).toHaveBeenCalledTimes(1);

        act(() => {
            usePortfolioSyncStore.setState({ isSyncing: true } as never);
        });
        act(() => {
            usePortfolioSyncStore.setState({ isSyncing: false } as never);
        });

        expect(push).toHaveBeenCalledTimes(1);
    });
});
