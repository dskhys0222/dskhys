import { createRootRoute, Outlet } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import Header from '../components/Header';
import { useAutoSync } from '../hooks/useAutoSync';
import { useMFDataStore } from '../stores';
import { usePortfolioSyncStore } from '../stores/usePortfolioSyncStore';
import { styles } from './styles';

function RootComponent() {
    useAutoSync();

    const accessToken = useMFDataStore((s) => s.accessToken);
    const encryptionKey = useMFDataStore((s) => s.encryptionKey);
    const pull = usePortfolioSyncStore((s) => s.pull);
    const hasPulledRef = useRef(false);

    useEffect(() => {
        if (hasPulledRef.current) return;
        if (!accessToken || !encryptionKey) return;
        hasPulledRef.current = true;
        pull();
    }, [accessToken, encryptionKey, pull]);

    return (
        <div className={styles.app}>
            <Header />
            <main className={styles.main}>
                <Outlet />
            </main>
        </div>
    );
}

function NotFound() {
    return (
        <div className={styles.notFound}>
            <p>ページが見つかりません</p>
        </div>
    );
}

export const Route = createRootRoute({
    component: RootComponent,
    notFoundComponent: NotFound,
});
