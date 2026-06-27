import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCustomAggregationsStore, useMFDataStore, useStocksStore } from '@/stores/index';
import { usePortfolioSyncStore } from '@/stores/usePortfolioSyncStore';
import { useAutoSync } from './useAutoSync';

describe('useAutoSync', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();

        useMFDataStore.setState({
            accessToken: 'token',
            encryptionKey: 'key',
        });
        useStocksStore.setState({ stocks: [] });
        useCustomAggregationsStore.setState({ customAggregations: [] });
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
            useStocksStore.setState({
                stocks: [
                    {
                        id: '1',
                        name: 'Test',
                        ticker: 'TEST',
                        value: 100,
                        units: 1,
                        averageCost: 100,
                        source: 'manual',
                        createdAt: '2024-01-01T00:00:00.000Z',
                        updatedAt: '2024-01-01T00:00:00.000Z',
                    },
                ],
            });
        });

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(push).toHaveBeenCalledTimes(1);
    });
});
