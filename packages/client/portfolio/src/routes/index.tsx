import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { useMFDataStore, useStocksStore } from '../stores';
import { indexStyles } from './index.styles';

export const Route = createFileRoute('/')({
    component: HomePage,
});

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY',
        maximumFractionDigits: 0,
    }).format(value);
}

function HomePage() {
    const stocks = useStocksStore((state) => state.stocks);
    const deleteStock = useStocksStore((state) => state.deleteStock);
    const navigate = useNavigate();

    const isLoading = useMFDataStore((state) => state.isLoading);
    const syncConfig = useMFDataStore((state) => state.syncConfig);
    const accessToken = useMFDataStore((state) => state.accessToken);
    const encryptionKey = useMFDataStore((state) => state.encryptionKey);
    const fetchAndDecrypt = useMFDataStore((state) => state.fetchAndDecrypt);
    const applySync = useMFDataStore((state) => state.applySync);
    const loadEncryptionKey = useMFDataStore(
        (state) => state.loadEncryptionKey
    );
    const loadSyncConfig = useMFDataStore((state) => state.loadSyncConfig);
    const loadTokens = useMFDataStore((state) => state.loadTokens);

    const [sortBy, setSortBy] = useState<string>('value');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [touchStartX, setTouchStartX] = useState<number>(0);
    const [swipingId, setSwipingId] = useState<string | null>(null);
    const [swipeOffset, setSwipeOffset] = useState<number>(0);

    // 初期化
    useEffect(() => {
        loadEncryptionKey();
        loadSyncConfig();
        loadTokens();
    }, [loadEncryptionKey, loadSyncConfig, loadTokens]);

    const isConfigured = encryptionKey && syncConfig.apiUrl;
    const isLoggedIn = !!accessToken;

    const handleQuickUpdate = async () => {
        await fetchAndDecrypt(syncConfig.apiUrl, accessToken);
        setTimeout(() => {
            const updateStock = useStocksStore.getState().updateStock;
            applySync(updateStock);
        }, 100);
    };

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    // ソート
    const sortedStocks = useMemo(() => {
        const result = [...stocks];

        result.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'ticker':
                    comparison = a.ticker.localeCompare(b.ticker);
                    break;
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'value':
                    comparison = a.value - b.value;
                    break;
                default:
                    comparison = 0;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [stocks, sortBy, sortOrder]);

    const handleDelete = (id: string, ticker: string, source: string) => {
        if (source === 'mf') {
            alert(
                'MoneyForwardから自動取得された銘柄は削除できません。\n同期を実行して削除するか、別アプリで削除してください。'
            );
            return;
        }
        if (confirm(`${ticker}を削除しますか？`)) {
            deleteStock(id);
        }
    };

    const handleEdit = (id: string) => {
        navigate({ to: '/stocks/$id/edit', params: { id } });
    };

    const handleSwipe = (
        stockId: string,
        ticker: string,
        source: string,
        e: React.TouchEvent<HTMLDivElement>
    ) => {
        const touchEndX = e.changedTouches[0].clientX;
        const swipeDistance = touchStartX - touchEndX;

        // 右から左へのスワイプ（100px以上）
        if (swipeDistance > 100) {
            handleDelete(stockId, ticker, source);
        }

        // リセット
        setSwipingId(null);
        setSwipeOffset(0);
    };

    const handleTouchStart = (
        stockId: string,
        e: React.TouchEvent<HTMLDivElement>
    ) => {
        setTouchStartX(e.touches[0].clientX);
        setSwipingId(stockId);
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (swipingId) {
            const currentX = e.touches[0].clientX;
            const offset = currentX - touchStartX;
            // 左方向のみ許可（負の値）
            if (offset < 0) {
                setSwipeOffset(offset);
            }
        }
    };

    if (stocks.length === 0) {
        return (
            <div className={indexStyles.page}>
                <div className={indexStyles.header}>
                    <h2 className={indexStyles.title}>銘柄一覧</h2>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {isConfigured && isLoggedIn && (
                            <button
                                type="button"
                                onClick={handleQuickUpdate}
                                disabled={isLoading}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#22c55e',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    cursor: isLoading
                                        ? 'not-allowed'
                                        : 'pointer',
                                    opacity: isLoading ? 0.6 : 1,
                                }}
                            >
                                {isLoading ? '更新中' : '更新'}
                            </button>
                        )}
                        <Link
                            to="/stocks/new"
                            className={indexStyles.addButton}
                        >
                            追加
                        </Link>
                    </div>
                </div>
                <div className={indexStyles.emptyState}>
                    <p>まだ銘柄が登録されていません。</p>
                </div>
            </div>
        );
    }

    return (
        <div className={indexStyles.page}>
            <div className={indexStyles.header}>
                <h2 className={indexStyles.title}>銘柄一覧</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {isConfigured && isLoggedIn && (
                        <button
                            type="button"
                            onClick={handleQuickUpdate}
                            disabled={isLoading}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#22c55e',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.6 : 1,
                            }}
                        >
                            {isLoading ? '更新中' : '更新'}
                        </button>
                    )}
                    <Link to="/stocks/new" className={indexStyles.addButton}>
                        追加
                    </Link>
                </div>
            </div>

            {/* ソート */}
            <div className={indexStyles.filters}>
                <select
                    className={indexStyles.filterSelect}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="ticker">ティッカー順</option>
                    <option value="name">銘柄名順</option>
                    <option value="value">評価額順</option>
                </select>
                <select
                    className={indexStyles.filterSelect}
                    value={sortOrder}
                    onChange={(e) =>
                        setSortOrder(e.target.value as 'asc' | 'desc')
                    }
                >
                    <option value="asc">昇順</option>
                    <option value="desc">降順</option>
                </select>
            </div>

            {/* モバイル用カードリスト */}
            <div className={indexStyles.mobileCard}>
                <div className={indexStyles.cardList}>
                    {sortedStocks.map((stock) => (
                        <div
                            key={stock.id}
                            className={indexStyles.swipeContainer}
                        >
                            {/* 削除背景 */}
                            <div className={indexStyles.deleteBackground}>
                                🗑️
                            </div>
                            {/* カード本体 */}
                            {/** biome-ignore lint/a11y/useKeyWithClickEvents: スマホ専用UIのため不要 */}
                            {/** biome-ignore lint/a11y/noStaticElementInteractions: しかたなし */}
                            <div
                                className={indexStyles.card}
                                onClick={() => handleEdit(stock.id)}
                                onTouchStart={(e) =>
                                    handleTouchStart(stock.id, e)
                                }
                                onTouchMove={handleTouchMove}
                                onTouchEnd={(e) =>
                                    handleSwipe(
                                        stock.id,
                                        stock.ticker,
                                        stock.source,
                                        e
                                    )
                                }
                                style={{
                                    cursor: 'pointer',
                                    transform:
                                        swipingId === stock.id
                                            ? `translateX(${swipeOffset}px)`
                                            : 'translateX(0)',
                                    transition:
                                        swipingId === stock.id
                                            ? 'none'
                                            : 'transform 0.3s ease',
                                    position: 'relative',
                                }}
                            >
                                <div className={indexStyles.cardHeader}>
                                    <div className={indexStyles.cardTicker}>
                                        {stock.ticker}
                                    </div>
                                    <div
                                        className={indexStyles.cardValueAmount}
                                    >
                                        {formatCurrency(stock.value)}
                                    </div>
                                </div>
                                <div className={indexStyles.cardName}>
                                    {stock.name}
                                </div>
                                <div className={indexStyles.cardBody}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* デスクトップ用テーブル */}
            <div className={indexStyles.desktopTable}>
                <div className={indexStyles.tableContainer}>
                    <table className={indexStyles.table}>
                        <thead>
                            <tr>
                                <th
                                    className={indexStyles.th}
                                    onClick={() => handleSort('ticker')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    ティッカー{' '}
                                    {sortBy === 'ticker' &&
                                        (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th
                                    className={indexStyles.th}
                                    onClick={() => handleSort('name')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    銘柄名{' '}
                                    {sortBy === 'name' &&
                                        (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th
                                    className={indexStyles.th}
                                    onClick={() => handleSort('value')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    評価額{' '}
                                    {sortBy === 'value' &&
                                        (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th className={indexStyles.th}>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedStocks.map((stock) => (
                                <tr key={stock.id}>
                                    <td
                                        className={`${indexStyles.td} ${indexStyles.ticker}`}
                                    >
                                        {stock.ticker}
                                    </td>
                                    <td className={indexStyles.td}>
                                        {stock.name}
                                    </td>
                                    <td className={indexStyles.td}>
                                        {formatCurrency(stock.value)}
                                    </td>
                                    <td className={indexStyles.td}>
                                        <button
                                            type="button"
                                            className={`${indexStyles.actionButton} ${indexStyles.editButton}`}
                                            onClick={() => handleEdit(stock.id)}
                                        >
                                            編集
                                        </button>
                                        <button
                                            type="button"
                                            className={`${indexStyles.actionButton} ${indexStyles.deleteButton}`}
                                            onClick={() =>
                                                handleDelete(
                                                    stock.id,
                                                    stock.ticker,
                                                    stock.source
                                                )
                                            }
                                        >
                                            削除
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
