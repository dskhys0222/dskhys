import { createFileRoute, Link } from '@tanstack/react-router';
import { DonutChart } from '../components/DonutChart';
import { useStocksStore } from '../stores';
import { aggregateByField, calculateTotalValue } from '../utils/aggregation';
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

    const totalValue = calculateTotalValue(stocks);

    // 各カテゴリ別の集計データ
    const assetClassData = aggregateByField(stocks, 'assetClass');
    const regionData = aggregateByField(stocks, 'region');
    const attributeData = aggregateByField(stocks, 'attribute');
    const accountData = aggregateByField(stocks, 'account');

    if (stocks.length === 0) {
        return (
            <div className={indexStyles.page}>
                <div className={indexStyles.emptyState}>
                    <p>まだ銘柄が登録されていません。</p>
                    <Link to="/stocks/new" className={indexStyles.addButton}>
                        銘柄を追加する
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={indexStyles.page}>
            {/* サマリーカード */}
            <div className={indexStyles.summaryGrid}>
                <div className={indexStyles.summaryCard}>
                    <div className={indexStyles.summaryLabel}>総評価額</div>
                    <div className={indexStyles.summaryValue}>
                        {formatCurrency(totalValue)}
                    </div>
                </div>
            </div>

            {/* ドーナツグラフ */}
            <div className={indexStyles.chartsGrid}>
                <DonutChart title="クラス別" data={assetClassData} />
                <DonutChart title="地域別" data={regionData} />
                <DonutChart title="属性別" data={attributeData} />
                <DonutChart title="口座別" data={accountData} />
            </div>
        </div>
    );
}
