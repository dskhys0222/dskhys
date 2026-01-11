import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useStocksStore } from '../stores';
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

    const [sortBy, setSortBy] = useState<string>('account');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [touchStartX, setTouchStartX] = useState<number>(0);
    const [swipingId, setSwipingId] = useState<string | null>(null);
    const [swipeOffset, setSwipeOffset] = useState<number>(0);

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

        // 口座の順序定義
        const accountOrder: Record<string, number> = {
            預金: 1,
            暗号資産: 2,
            特定: 3,
            NISA: 4,
            DC: 5,
        };

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
                case 'assetClass':
                    comparison = a.assetClass.localeCompare(b.assetClass);
                    break;
                case 'region':
                    comparison = a.region.localeCompare(b.region);
                    break;
                case 'attribute':
                    comparison = a.attribute.localeCompare(b.attribute);
                    break;
                case 'account':
                    comparison =
                        (accountOrder[a.account] || 999) -
                        (accountOrder[b.account] || 999);
                    break;
                default:
                    comparison = 0;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [stocks, sortBy, sortOrder]);

    const handleDelete = (id: string, ticker: string) => {
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
        e: React.TouchEvent<HTMLDivElement>
    ) => {
        const touchEndX = e.changedTouches[0].clientX;
        const swipeDistance = touchStartX - touchEndX;

        // 右から左へのスワイプ（100px以上）
        if (swipeDistance > 100) {
            handleDelete(stockId, ticker);
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
                    <Link to="/stocks/new" className={indexStyles.addButton}>
                        銘柄を追加
                    </Link>
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
                <h2 className={indexStyles.title}>
                    銘柄一覧（{sortedStocks.length}件）
                </h2>
                <Link to="/stocks/new" className={indexStyles.addButton}>
                    銘柄を追加
                </Link>
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
                    <option value="assetClass">クラス順</option>
                    <option value="region">地域順</option>
                    <option value="attribute">属性順</option>
                    <option value="account">口座順</option>
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
                                    handleSwipe(stock.id, stock.ticker, e)
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
                                <div className={indexStyles.cardBody}>
                                    <span>{stock.assetClass}</span>
                                    <span>{stock.region}</span>
                                    <span>{stock.attribute}</span>
                                    <span>{stock.account}</span>
                                </div>
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
                                <th
                                    className={indexStyles.th}
                                    onClick={() => handleSort('assetClass')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    クラス{' '}
                                    {sortBy === 'assetClass' &&
                                        (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th
                                    className={indexStyles.th}
                                    onClick={() => handleSort('region')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    地域{' '}
                                    {sortBy === 'region' &&
                                        (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th
                                    className={indexStyles.th}
                                    onClick={() => handleSort('attribute')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    属性{' '}
                                    {sortBy === 'attribute' &&
                                        (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th
                                    className={indexStyles.th}
                                    onClick={() => handleSort('account')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    口座{' '}
                                    {sortBy === 'account' &&
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
                                        {stock.assetClass}
                                    </td>
                                    <td className={indexStyles.td}>
                                        {stock.region}
                                    </td>
                                    <td className={indexStyles.td}>
                                        {stock.attribute}
                                    </td>
                                    <td className={indexStyles.td}>
                                        {stock.account}
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
                                                    stock.ticker
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
