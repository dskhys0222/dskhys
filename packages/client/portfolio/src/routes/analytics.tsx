import { createFileRoute } from '@tanstack/react-router';
import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import { useStocksStore } from '../stores';
import { aggregateByField } from '../utils/aggregation';
import { analyticsStyles } from './analytics.styles';

export const Route = createFileRoute('/analytics')({
    component: AnalyticsPage,
});

const COLORS = [
    '#2E7D32',
    '#1976D2',
    '#F57C00',
    '#7B1FA2',
    '#C62828',
    '#00838F',
    '#558B2F',
    '#6D4C41',
    '#283593',
    '#AD1457',
];

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

            {/* グラフセクション */}
            <div className={analyticsStyles.chartsGrid}>
                {/* クラス別 */}
                <div className={analyticsStyles.chartCard}>
                    <h3 className={analyticsStyles.chartTitle}>クラス別</h3>
                    <div className={analyticsStyles.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={assetClassData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    label={({ name, percentage }) =>
                                        `${name}: ${percentage.toFixed(1)}%`
                                    }
                                >
                                    {assetClassData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${entry.name}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) =>
                                        formatCurrency(value)
                                    }
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 地域別 */}
                <div className={analyticsStyles.chartCard}>
                    <h3 className={analyticsStyles.chartTitle}>地域別</h3>
                    <div className={analyticsStyles.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={regionData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    label={({ name, percentage }) =>
                                        `${name}: ${percentage.toFixed(1)}%`
                                    }
                                >
                                    {regionData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${entry.name}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) =>
                                        formatCurrency(value)
                                    }
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 属性別 */}
                <div className={analyticsStyles.chartCard}>
                    <h3 className={analyticsStyles.chartTitle}>属性別</h3>
                    <div className={analyticsStyles.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={attributeData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    label={({ name, percentage }) =>
                                        `${name}: ${percentage.toFixed(1)}%`
                                    }
                                >
                                    {attributeData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${entry.name}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) =>
                                        formatCurrency(value)
                                    }
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 口座別 */}
                <div className={analyticsStyles.chartCard}>
                    <h3 className={analyticsStyles.chartTitle}>口座別</h3>
                    <div className={analyticsStyles.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={accountData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    label={({ name, percentage }) =>
                                        `${name}: ${percentage.toFixed(1)}%`
                                    }
                                >
                                    {accountData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${entry.name}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) =>
                                        formatCurrency(value)
                                    }
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

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
