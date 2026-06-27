import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    useCustomAggregationsStore,
    useMFDataStore,
    useSettingsStore,
    useStocksStore,
} from './index';
import { usePortfolioSyncStore } from './usePortfolioSyncStore';

const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value;
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('usePortfolioSyncStore', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.restoreAllMocks();

        usePortfolioSyncStore.setState({
            isSyncing: false,
            lastSyncedAt: null,
            syncError: null,
            hasConflict: false,
            serverSnapshot: null,
        });

        useMFDataStore.setState({
            mfData: null,
            encryptionKey: 'test-encryption-key',
            accessToken: 'expired-token',
            refreshToken: 'refresh-token',
            isLoading: false,
            error: null,
            mappings: [],
            syncConfig: { apiUrl: 'https://example.com' },
        });

        useStocksStore.setState({ stocks: [] });
        useCustomAggregationsStore.setState({ customAggregations: [] });
        useSettingsStore.setState({ settings: { version: '2.0.0' } });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('401時にアクセストークンをリフレッシュして再試行する', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(
                new Response(JSON.stringify({ error: 'unauthorized' }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' },
                })
            )
            .mockResolvedValueOnce(
                new Response(JSON.stringify({ message: 'ok' }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                })
            );

        vi.stubGlobal('fetch', fetchMock);

        const refreshSpy = vi
            .spyOn(useMFDataStore.getState(), 'refreshAccessToken')
            .mockImplementation(async () => {
                useMFDataStore.setState({ accessToken: 'fresh-token' });
                return true;
            });

        await usePortfolioSyncStore.getState().push();

        expect(refreshSpy).toHaveBeenCalledWith('https://example.com');
        expect(fetchMock).toHaveBeenCalledTimes(2);
        const retryHeaders = fetchMock.mock.calls[1]?.[1]?.headers as Headers;
        expect(retryHeaders.get('Authorization')).toBe('Bearer fresh-token');
        expect(usePortfolioSyncStore.getState().syncError).toBeNull();
    });
});
