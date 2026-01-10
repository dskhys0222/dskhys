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

    const [filterAccount, setFilterAccount] = useState<string>('all');
    const [filterAssetClass, setFilterAssetClass] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('ticker');

    // ユニークな値を取得
    const accounts = useMemo(
        () => [...new Set(stocks.map((s) => s.account).filter(Boolean))],
        [stocks]
    );
    const assetClasses = useMemo(
        () => [...new Set(stocks.map((s) => s.assetClass).filter(Boolean))],
        [stocks]
    );

    // フィルタリングとソート
    const filteredStocks = useMemo(() => {
        let result = [...stocks];

        if (filterAccount !== 'all') {
            result = result.filter((s) => s.account === filterAccount);
        }
        if (filterAssetClass !== 'all') {
            result = result.filter((s) => s.assetClass === filterAssetClass);
        }

        result.sort((a, b) => {
            switch (sortBy) {
                case 'ticker':
                    return a.ticker.localeCompare(b.ticker);
                case 'value':
                    return b.value - a.value;
                default:
                    return 0;
            }
        });

        return result;
    }, [stocks, filterAccount, filterAssetClass, sortBy]);

    const handleDelete = (id: string, ticker: string) => {
        if (confirm(`${ticker}を削除しますか？`)) {
            deleteStock(id);
        }
    };

    const handleEdit = (id: string) => {
        navigate({ to: '/stocks/$id/edit', params: { id } });
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
                    銘柄一覧（{filteredStocks.length}件）
                </h2>
                <Link to="/stocks/new" className={stocksStyles.addButton}>
                    銘柄を追加
                </Link>
            </div>

            {/* フィルター */}
            <div className={stocksStyles.filters}>
                <select
                    className={stocksStyles.filterSelect}
                    value={filterAccount}
                    onChange={(e) => setFilterAccount(e.target.value)}
                >
                    <option value="all">全ての口座</option>
                    {accounts.map((account) => (
                        <option key={account} value={account}>
                            {account}
                        </option>
                    ))}
                </select>
                <select
                    className={stocksStyles.filterSelect}
                    value={filterAssetClass}
                    onChange={(e) => setFilterAssetClass(e.target.value)}
                >
                    <option value="all">全てのクラス</option>
                    {assetClasses.map((cls) => (
                        <option key={cls} value={cls}>
                            {cls}
                        </option>
                    ))}
                </select>
                <select
                    className={stocksStyles.filterSelect}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="ticker">ティッカー順</option>
                    <option value="value">評価額順</option>
                </select>
            </div>

            {/* モバイル用カードリスト */}
            <div className={stocksStyles.mobileCard}>
                <div className={stocksStyles.cardList}>
                    {filteredStocks.map((stock) => (
                        <div key={stock.id} className={stocksStyles.card}>
                            <div className={stocksStyles.cardHeader}>
                                <div>
                                    <div className={stocksStyles.cardTicker}>
                                        {stock.ticker}
                                    </div>
                                    <div className={stocksStyles.cardName}>
                                        {stock.name}
                                    </div>
                                </div>
                            </div>
                            <div className={stocksStyles.cardBody}>
                                <span className={stocksStyles.cardLabel}>
                                    評価額
                                </span>
                                <span className={stocksStyles.cardValue}>
                                    {formatCurrency(stock.value)}
                                </span>
                                {stock.units && (
                                    <>
                                        <span
                                            className={stocksStyles.cardLabel}
                                        >
                                            口数
                                        </span>
                                        <span
                                            className={stocksStyles.cardValue}
                                        >
                                            {stock.units}
                                        </span>
                                    </>
                                )}
                                <span className={stocksStyles.cardLabel}>
                                    クラス
                                </span>
                                <span className={stocksStyles.cardValue}>
                                    {stock.assetClass}
                                </span>
                                <span className={stocksStyles.cardLabel}>
                                    口座
                                </span>
                                <span className={stocksStyles.cardValue}>
                                    {stock.account}
                                </span>
                            </div>
                            <div className={stocksStyles.cardActions}>
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
                                        handleDelete(stock.id, stock.ticker)
                                    }
                                >
                                    削除
                                </button>
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
                                <th className={stocksStyles.th}>ティッカー</th>
                                <th className={stocksStyles.th}>銘柄名</th>
                                <th className={stocksStyles.th}>評価額</th>
                                <th className={stocksStyles.th}>口数</th>
                                <th className={stocksStyles.th}>クラス</th>
                                <th className={stocksStyles.th}>地域</th>
                                <th className={stocksStyles.th}>属性</th>
                                <th className={stocksStyles.th}>口座</th>
                                <th className={stocksStyles.th}>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStocks.map((stock) => (
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
                                        {stock.units ?? '-'}
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
