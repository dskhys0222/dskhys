import { createFileRoute } from '@tanstack/react-router';
import { useStocksStore } from '../stores';
import { aggregateByField } from '../utils/aggregation';
import { analyticsStyles } from './analytics.styles';

export const Route = createFileRoute('/analytics')({
    component: AnalyticsPage,
});

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY',
        maximumFractionDigits: 0,
    }).format(value);
}

function AnalyticsPage() {
    const stocks = useStocksStore((state) => state.stocks);

    if (stocks.length === 0) {
        return (
            <div className={analyticsStyles.page}>
                <h2 className={analyticsStyles.title}>分析</h2>
                <div className={analyticsStyles.emptyState}>
                    <p>銘柄を登録すると分析結果が表示されます。</p>
                </div>
            </div>
        );
    }

    // 各カテゴリ別の集計
    const assetClassData = aggregateByField(stocks, 'assetClass');
    const regionData = aggregateByField(stocks, 'region');
    const attributeData = aggregateByField(stocks, 'attribute');
    const accountData = aggregateByField(stocks, 'account');

    return (
        <div className={analyticsStyles.page}>
            <h2 className={analyticsStyles.title}>分析</h2>

            {/* テーブルセクション */}
            <div className={analyticsStyles.tablesSection}>
                {/* クラス別集計 */}
                <div className={analyticsStyles.tableCard}>
                    <h3 className={analyticsStyles.tableTitle}>クラス別集計</h3>
                    <table className={analyticsStyles.table}>
                        <thead>
                            <tr>
                                <th className={analyticsStyles.th}>クラス</th>
                                <th
                                    className={`${analyticsStyles.th} ${analyticsStyles.thRight}`}
                                >
                                    評価額
                                </th>
                                <th
                                    className={`${analyticsStyles.th} ${analyticsStyles.thRight}`}
                                >
                                    割合
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {assetClassData.map((item) => (
                                <tr key={item.name}>
                                    <td className={analyticsStyles.td}>
                                        {item.name}
                                    </td>
                                    <td
                                        className={`${analyticsStyles.td} ${analyticsStyles.tdRight}`}
                                    >
                                        {formatCurrency(item.value)}
                                    </td>
                                    <td
                                        className={`${analyticsStyles.td} ${analyticsStyles.tdRight}`}
                                    >
                                        {item.percentage.toFixed(1)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 地域別集計 */}
                <div className={analyticsStyles.tableCard}>
                    <h3 className={analyticsStyles.tableTitle}>地域別集計</h3>
                    <table className={analyticsStyles.table}>
                        <thead>
                            <tr>
                                <th className={analyticsStyles.th}>地域</th>
                                <th
                                    className={`${analyticsStyles.th} ${analyticsStyles.thRight}`}
                                >
                                    評価額
                                </th>
                                <th
                                    className={`${analyticsStyles.th} ${analyticsStyles.thRight}`}
                                >
                                    割合
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {regionData.map((item) => (
                                <tr key={item.name}>
                                    <td className={analyticsStyles.td}>
                                        {item.name}
                                    </td>
                                    <td
                                        className={`${analyticsStyles.td} ${analyticsStyles.tdRight}`}
                                    >
                                        {formatCurrency(item.value)}
                                    </td>
                                    <td
                                        className={`${analyticsStyles.td} ${analyticsStyles.tdRight}`}
                                    >
                                        {item.percentage.toFixed(1)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 属性別集計 */}
                <div className={analyticsStyles.tableCard}>
                    <h3 className={analyticsStyles.tableTitle}>属性別集計</h3>
                    <table className={analyticsStyles.table}>
                        <thead>
                            <tr>
                                <th className={analyticsStyles.th}>属性</th>
                                <th
                                    className={`${analyticsStyles.th} ${analyticsStyles.thRight}`}
                                >
                                    評価額
                                </th>
                                <th
                                    className={`${analyticsStyles.th} ${analyticsStyles.thRight}`}
                                >
                                    割合
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {attributeData.map((item) => (
                                <tr key={item.name}>
                                    <td className={analyticsStyles.td}>
                                        {item.name}
                                    </td>
                                    <td
                                        className={`${analyticsStyles.td} ${analyticsStyles.tdRight}`}
                                    >
                                        {formatCurrency(item.value)}
                                    </td>
                                    <td
                                        className={`${analyticsStyles.td} ${analyticsStyles.tdRight}`}
                                    >
                                        {item.percentage.toFixed(1)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 口座別集計 */}
                <div className={analyticsStyles.tableCard}>
                    <h3 className={analyticsStyles.tableTitle}>口座別集計</h3>
                    <table className={analyticsStyles.table}>
                        <thead>
                            <tr>
                                <th className={analyticsStyles.th}>口座</th>
                                <th
                                    className={`${analyticsStyles.th} ${analyticsStyles.thRight}`}
                                >
                                    評価額
                                </th>
                                <th
                                    className={`${analyticsStyles.th} ${analyticsStyles.thRight}`}
                                >
                                    割合
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {accountData.map((item) => (
                                <tr key={item.name}>
                                    <td className={analyticsStyles.td}>
                                        {item.name}
                                    </td>
                                    <td
                                        className={`${analyticsStyles.td} ${analyticsStyles.tdRight}`}
                                    >
                                        {formatCurrency(item.value)}
                                    </td>
                                    <td
                                        className={`${analyticsStyles.td} ${analyticsStyles.tdRight}`}
                                    >
                                        {item.percentage.toFixed(1)}%
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
