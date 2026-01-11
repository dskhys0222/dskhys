import { createFileRoute, Link } from '@tanstack/react-router';
import { DonutChart } from '../components/DonutChart';
import { useStocksStore } from '../stores';
import { aggregateByField, calculateTotalValue } from '../utils/aggregation';
import { summaryStyles } from './summary.styles';

export const Route = createFileRoute('/summary')({
    component: SummaryPage,
});

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY',
        maximumFractionDigits: 0,
    }).format(value);
}

function SummaryPage() {
    const stocks = useStocksStore((state) => state.stocks);

    const totalValue = calculateTotalValue(stocks);

    // 各カテゴリ別の集計データ
    const assetClassData = aggregateByField(stocks, 'assetClass');
    const regionData = aggregateByField(stocks, 'region');
    const attributeData = aggregateByField(stocks, 'attribute');
    const accountData = aggregateByField(stocks, 'account');

    if (stocks.length === 0) {
        return (
            <div className={summaryStyles.page}>
                <div className={summaryStyles.emptyState}>
                    <p>まだ銘柄が登録されていません。</p>
                    <Link to="/stocks/new" className={summaryStyles.addButton}>
                        銘柄を追加する
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={summaryStyles.page}>
            {/* サマリーカード */}
            <div className={summaryStyles.summaryGrid}>
                <div className={summaryStyles.summaryCard}>
                    <div className={summaryStyles.summaryLabel}>総評価額</div>
                    <div className={summaryStyles.summaryValue}>
                        {formatCurrency(totalValue)}
                    </div>
                </div>
            </div>

            {/* ドーナツグラフ + 凡例テーブル */}
            <div className={summaryStyles.chartsGrid}>
                <DonutChart
                    title="クラス別"
                    data={assetClassData}
                    showLegendTable
                />
                <DonutChart title="地域別" data={regionData} showLegendTable />
                <DonutChart
                    title="属性別"
                    data={attributeData}
                    showLegendTable
                />
                <DonutChart title="口座別" data={accountData} showLegendTable />
            </div>
        </div>
    );
}
