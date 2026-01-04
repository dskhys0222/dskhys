import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo } from 'react';

import { styles } from './styles';

export const Route = createFileRoute('/history/$name')({
    component: HistoryPage,
});

interface HistoryEntry {
    id: string;
    at: string;
    kind: 'increase' | 'decrease';
    delta: number;
    after: number;
}

function HistoryPage() {
    const navigate = useNavigate();
    const { name } = Route.useParams();

    const entries = useMemo(
        () => readHistoryFromLocalStorage(createHistoryStorageKey(name)),
        [name]
    );

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                navigate({ to: '/' });
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [navigate]);

    return (
        <section aria-label="履歴" className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>履歴</h1>
                    <div className={styles.subtitle}>{name}</div>
                </div>
                <button
                    type="button"
                    className={styles.backButton()}
                    aria-label="戻る"
                    onClick={() => navigate({ to: '/' })}
                >
                    戻る
                </button>
            </div>

            <div className={styles.list}>
                {entries.length === 0 ? (
                    <div className={styles.empty}>履歴はありません</div>
                ) : (
                    entries.map((entry) => (
                        <div key={entry.id} className={styles.entry}>
                            <div className={styles.entryTopRow}>
                                <div className={styles.entryAt}>
                                    {formatDate(entry.at)}
                                </div>
                                <div className={styles.entryDelta}>
                                    {formatDelta(entry.kind, entry.delta)}
                                </div>
                            </div>
                            <div className={styles.entryAfter}>
                                操作後：{formatCurrency(entry.after)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}

function createHistoryStorageKey(name: string) {
    return `budget:history:${name}`;
}

function readHistoryFromLocalStorage(key: string): HistoryEntry[] {
    if (typeof window === 'undefined') return [];
    if (!('localStorage' in window)) return [];

    const raw = window.localStorage.getItem(key);
    if (raw === null) return [];

    try {
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return [];

        return parsed.filter(isHistoryEntry);
    } catch {
        return [];
    }
}

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

function formatDelta(kind: 'increase' | 'decrease', delta: number) {
    return kind === 'increase'
        ? `+${formatCurrency(delta)}`
        : `-${formatCurrency(delta)}`;
}

function formatCurrency(value: number) {
    return `￥${value.toLocaleString()}`;
}

function formatDate(iso: string) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;

    return date.toLocaleString();
}
