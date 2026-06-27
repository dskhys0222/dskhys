import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useAutoSyncTriggerStore } from '@/store/autoSyncTriggerStore';
import { useBudgetSyncStore } from '@/store/budgetSyncStore';

const DEBOUNCE_MS = 2000;

let autoSyncTimer: ReturnType<typeof setTimeout> | null = null;
let autoSyncScheduledVersion: string | null = null;

export function useAutoSync(): void {
    const dataVersion = useAutoSyncTriggerStore((s) => s.dataVersion);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const encryptionKey = useBudgetSyncStore((s) => s.encryptionKey);
    const push = useBudgetSyncStore((s) => s.push);
    const isSyncing = useBudgetSyncStore((s) => s.isSyncing);

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
}
