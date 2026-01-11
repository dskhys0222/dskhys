import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { DonutChart } from '../../components/DonutChart';
import { useCustomAggregationsStore, useStocksStore } from '../../stores';
import type { AggregatedData, CustomAggregation, Stock } from '../../types';
import { aggregateByField, calculateTotalValue } from '../../utils/aggregation';
import { summaryStyles } from './index.styles';

export const Route = createFileRoute('/summary/')({
    component: SummaryLayout,
});

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY',
        maximumFractionDigits: 0,
    }).format(value);
}

// カスタム集計のデータを計算
function aggregateCustom(
    stocks: Stock[],
    aggregation: CustomAggregation
): AggregatedData[] {
    const totals: Record<string, number> = {};

    // 各属性の初期化
    for (const attr of aggregation.attributes) {
        totals[attr.name] = 0;
    }

    // 銘柄の評価額を属性ごとに集計
    for (const assignment of aggregation.stockAssignments) {
        const stock = stocks.find((s) => s.id === assignment.stockId);
        if (stock) {
            totals[assignment.attributeName] =
                (totals[assignment.attributeName] || 0) + stock.value;
        }
    }

    // 合計を計算
    const total = Object.values(totals).reduce((sum, val) => sum + val, 0);

    // AggregatedData形式に変換
    return aggregation.attributes
        .map((attr) => ({
            name: attr.name,
            value: totals[attr.name] || 0,
            percentage: total > 0 ? (totals[attr.name] / total) * 100 : 0,
        }))
        .filter((item) => item.value > 0);
}

// カスタム集計の色マップを取得
function getCustomColors(
    aggregation: CustomAggregation
): Record<string, string> {
    const colors: Record<string, string> = {};
    for (const attr of aggregation.attributes) {
        colors[attr.name] = attr.color;
    }
    return colors;
}

function SummaryLayout() {
    const stocks = useStocksStore((state) => state.stocks);
    const customAggregations = useCustomAggregationsStore(
        (state) => state.customAggregations
    );
    const deleteCustomAggregation = useCustomAggregationsStore(
        (state) => state.deleteCustomAggregation
    );

    const totalValue = calculateTotalValue(stocks);

    // 各カテゴリ別の集計データ
    const assetClassData = aggregateByField(stocks, 'assetClass');
    const regionData = aggregateByField(stocks, 'region');
    const attributeData = aggregateByField(stocks, 'attribute');
    const accountData = aggregateByField(stocks, 'account');

    const handleDeleteCustomAggregation = (id: string, name: string) => {
        if (confirm(`「${name}」を削除しますか？`)) {
            deleteCustomAggregation(id);
        }
    };

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
        <>
            <div className={summaryStyles.page}>
                {/* サマリーカード */}
                <div className={summaryStyles.summaryGrid}>
                    <div className={summaryStyles.summaryCard}>
                        <div className={summaryStyles.summaryLabel}>
                            総評価額
                        </div>
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
                    <DonutChart
                        title="地域別"
                        data={regionData}
                        showLegendTable
                    />
                    <DonutChart
                        title="属性別"
                        data={attributeData}
                        showLegendTable
                    />
                    <DonutChart
                        title="口座別"
                        data={accountData}
                        showLegendTable
                    />
                </div>

                {customAggregations.length > 0 && (
                    <div className={summaryStyles.chartsGrid}>
                        {customAggregations.map((aggregation) => {
                            const data = aggregateCustom(stocks, aggregation);
                            const colors = getCustomColors(aggregation);
                            return (
                                <div
                                    key={aggregation.id}
                                    className={
                                        summaryStyles.customChartContainer
                                    }
                                >
                                    <Link
                                        to="/summary/$id/edit"
                                        params={{ id: aggregation.id }}
                                        className={summaryStyles.editButton}
                                    >
                                        編集
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDeleteCustomAggregation(
                                                aggregation.id,
                                                aggregation.name
                                            )
                                        }
                                        className={summaryStyles.deleteButton}
                                    >
                                        削除
                                    </button>
                                    <DonutChart
                                        title={aggregation.name}
                                        data={data}
                                        colors={colors}
                                        showLegendTable
                                        showTotal
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* 追加ボタン */}
                <div className={summaryStyles.addButtonContainer}>
                    <Link
                        to="/summary/new"
                        className={summaryStyles.addCustomButton}
                    >
                        + カスタム集計を追加
                    </Link>
                </div>
            </div>
            <Outlet />
        </>
    );
}
