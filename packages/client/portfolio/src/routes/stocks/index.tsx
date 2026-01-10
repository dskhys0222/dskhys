import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useStocksStore } from '../../stores';
import { stocksStyles } from './styles';

export const Route = createFileRoute('/stocks/')({
    component: StocksPage,
});

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY',
        maximumFractionDigits: 0,
    }).format(value);
}

function StocksPage() {
    const stocks = useStocksStore((state) => state.stocks);
    const deleteStock = useStocksStore((state) => state.deleteStock);
    const navigate = useNavigate();

    const [sortBy, setSortBy] = useState<string>('ticker');
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
                    comparison = a.account.localeCompare(b.account);
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
            <div className={stocksStyles.page}>
                <div className={stocksStyles.header}>
                    <h2 className={stocksStyles.title}>銘柄一覧</h2>
                    <Link to="/stocks/new" className={stocksStyles.addButton}>
                        銘柄を追加
                    </Link>
                </div>
                <div className={stocksStyles.emptyState}>
                    <p>まだ銘柄が登録されていません。</p>
                </div>
            </div>
        );
    }

    return (
        <div className={stocksStyles.page}>
            <div className={stocksStyles.header}>
                <h2 className={stocksStyles.title}>
                    銘柄一覧（{sortedStocks.length}件）
                </h2>
                <Link to="/stocks/new" className={stocksStyles.addButton}>
                    銘柄を追加
                </Link>
            </div>

            {/* ソート */}
            <div className={stocksStyles.filters}>
                <select
                    className={stocksStyles.filterSelect}
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
                    className={stocksStyles.filterSelect}
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
            <div className={stocksStyles.mobileCard}>
                <div className={stocksStyles.cardList}>
                    {sortedStocks.map((stock) => (
                        <div
                            key={stock.id}
                            className={stocksStyles.swipeContainer}
                        >
                            {/* 削除背景 */}
                            <div className={stocksStyles.deleteBackground}>
                                🗑️
                            </div>
                            {/* カード本体 */}
                            {/** biome-ignore lint/a11y/useKeyWithClickEvents: スマホ専用UIのため不要 */}
                            {/** biome-ignore lint/a11y/noStaticElementInteractions: しかたなし */}
                            <div
                                className={stocksStyles.card}
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
                                <div className={stocksStyles.cardHeader}>
                                    <div className={stocksStyles.cardTicker}>
                                        {stock.ticker}
                                    </div>
                                    <div
                                        className={stocksStyles.cardValueAmount}
                                    >
                                        {formatCurrency(stock.value)}
                                    </div>
                                </div>
                                <div className={stocksStyles.cardName}>
                                    {stock.name}
                                </div>
                                <div className={stocksStyles.cardBody}>
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
            <div className={stocksStyles.desktopTable}>
                <div className={stocksStyles.tableContainer}>
                    <table className={stocksStyles.table}>
                        <thead>
                            <tr>
                                <th
                                    className={stocksStyles.th}
                                    onClick={() => handleSort('ticker')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    ティッカー{' '}
                                    {sortBy === 'ticker' &&
                                        (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th
                                    className={stocksStyles.th}
                                    onClick={() => handleSort('name')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    銘柄名{' '}
                                    {sortBy === 'name' &&
                                        (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th
                                    className={stocksStyles.th}
                                    onClick={() => handleSort('value')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    評価額{' '}
                                    {sortBy === 'value' &&
                                        (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th
                                    className={stocksStyles.th}
                                    onClick={() => handleSort('assetClass')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    クラス{' '}
                                    {sortBy === 'assetClass' &&
                                        (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th
                                    className={stocksStyles.th}
                                    onClick={() => handleSort('region')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    地域{' '}
                                    {sortBy === 'region' &&
                                        (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th
                                    className={stocksStyles.th}
                                    onClick={() => handleSort('attribute')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    属性{' '}
                                    {sortBy === 'attribute' &&
                                        (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th
                                    className={stocksStyles.th}
                                    onClick={() => handleSort('account')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    口座{' '}
                                    {sortBy === 'account' &&
                                        (sortOrder === 'asc' ? '▲' : '▼')}
                                </th>
                                <th className={stocksStyles.th}>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedStocks.map((stock) => (
                                <tr key={stock.id}>
                                    <td
                                        className={`${stocksStyles.td} ${stocksStyles.ticker}`}
                                    >
                                        {stock.ticker}
                                    </td>
                                    <td className={stocksStyles.td}>
                                        {stock.name}
                                    </td>
                                    <td className={stocksStyles.td}>
                                        {formatCurrency(stock.value)}
                                    </td>
                                    <td className={stocksStyles.td}>
                                        {stock.assetClass}
                                    </td>
                                    <td className={stocksStyles.td}>
                                        {stock.region}
                                    </td>
                                    <td className={stocksStyles.td}>
                                        {stock.attribute}
                                    </td>
                                    <td className={stocksStyles.td}>
                                        {stock.account}
                                    </td>
                                    <td className={stocksStyles.td}>
                                        <button
                                            type="button"
                                            className={`${stocksStyles.actionButton} ${stocksStyles.editButton}`}
                                            onClick={() => handleEdit(stock.id)}
                                        >
                                            編集
                                        </button>
                                        <button
                                            type="button"
                                            className={`${stocksStyles.actionButton} ${stocksStyles.deleteButton}`}
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
