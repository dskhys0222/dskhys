import { useEffect, useRef } from 'react';
import { useMFDataStore } from '@/stores/index';
import { useAutoSyncTriggerStore } from '@/stores/useAutoSyncTriggerStore';
import { usePortfolioSyncStore } from '@/stores/usePortfolioSyncStore';

const DEBOUNCE_MS = 2000;

let autoSyncTimer: ReturnType<typeof setTimeout> | null = null;
let autoSyncScheduledVersion: string | null = null;

/**
 * データ変更時に自動同期するフック。
 * 変更トリガーが増えたときだけ debounce 後に push を実行する。
 */
export function useAutoSync(): void {
    const dataVersion = useAutoSyncTriggerStore((s) => s.dataVersion);
    const accessToken = useMFDataStore((s) => s.accessToken);
    const encryptionKey = useMFDataStore((s) => s.encryptionKey);
    const push = usePortfolioSyncStore((s) => s.push);
    const isSyncing = usePortfolioSyncStore((s) => s.isSyncing);

    const isAuthenticated = accessToken !== '';
    const hasKey = encryptionKey !== '';

    const hasMountedRef = useRef(false);

    useEffect(() => {
        if (!hasMountedRef.current) {
            hasMountedRef.current = true;
            autoSyncScheduledVersion = String(dataVersion);
            return;
        }

        if (!isAuthenticated || !hasKey || isSyncing) {
            if (autoSyncTimer !== null) {
                clearTimeout(autoSyncTimer);
                autoSyncTimer = null;
            }
            autoSyncScheduledVersion = null;
            return;
        }

        const triggerKey = String(dataVersion);
        if (autoSyncScheduledVersion === triggerKey) {
            return;
        }

        if (autoSyncTimer !== null) {
            clearTimeout(autoSyncTimer);
            autoSyncTimer = null;
        }

        autoSyncScheduledVersion = triggerKey;
        autoSyncTimer = setTimeout(() => {
            autoSyncTimer = null;
            autoSyncScheduledVersion = null;
            push();
        }, DEBOUNCE_MS);
    }, [dataVersion, isAuthenticated, hasKey, isSyncing, push]);

    useEffect(() => {
        return () => {
            if (autoSyncTimer !== null) {
                clearTimeout(autoSyncTimer);
                autoSyncTimer = null;
            }
            autoSyncScheduledVersion = null;
        };
    }, []);
}
