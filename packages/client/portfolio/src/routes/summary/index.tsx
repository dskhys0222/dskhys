import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { DonutChart } from '../../components/DonutChart';
import { useCustomAggregationsStore, useStocksStore } from '../../stores';
import type { CustomAggregation } from '../../types';
import {
    aggregateCustom,
    calculateTotalProfitLoss,
    calculateTotalValue,
} from '../../utils/aggregation';
import { aggregateDividendInfo } from '../../utils/dividend';
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

    // スマホでの表示モード（差額 or 比率）
    const [displayModes, setDisplayModes] = useState<
        Record<
            string,
            'percentage' | 'difference' | 'profitLossAmount' | 'profitLossRate'
        >
    >({});

    // タブレット以下かどうかの判定（コンパクトモード）
    const [isMobileMode, setIsMobileMode] = useState(false);
    // スマホのみかどうかの判定
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    useEffect(() => {
        const tabletQuery = window.matchMedia('(max-width: 1024px)');
        const phoneQuery = window.matchMedia('(max-width: 640px)');

        setIsMobileMode(tabletQuery.matches);
        setIsSmallScreen(phoneQuery.matches);

        const handleTablet = (e: MediaQueryListEvent) =>
            setIsMobileMode(e.matches);
        const handlePhone = (e: MediaQueryListEvent) =>
            setIsSmallScreen(e.matches);

        tabletQuery.addEventListener('change', handleTablet);
        phoneQuery.addEventListener('change', handlePhone);
        return () => {
            tabletQuery.removeEventListener('change', handleTablet);
            phoneQuery.removeEventListener('change', handlePhone);
        };
    }, []);

    const totalValue = calculateTotalValue(stocks);
    const totalProfitLoss = calculateTotalProfitLoss(stocks);
    const dividendInfo = aggregateDividendInfo(stocks);

    const handleDeleteCustomAggregation = (id: string, name: string) => {
        if (confirm(`「${name}」を削除しますか？`)) {
            deleteCustomAggregation(id);
        }
    };

    const toggleDisplayMode = (
        id: string,
        hasTargetRatios: boolean,
        hasProfitLoss: boolean
    ) => {
        setDisplayModes((prev) => {
            const current = prev[id] ?? 'percentage';
            type Mode =
                | 'percentage'
                | 'difference'
                | 'profitLossAmount'
                | 'profitLossRate';

            const profitLossModes: Mode[] = isSmallScreen
                ? ['profitLossAmount', 'profitLossRate']
                : ['profitLossAmount'];

            const allModes: Mode[] = isMobileMode
                ? [
                      'percentage',
                      ...(hasTargetRatios ? (['difference'] as Mode[]) : []),
                      ...(hasProfitLoss ? profitLossModes : []),
                  ]
                : [
                      // PC: 差額+割合 ⇔ 損益額+損益率 の2択
                      'percentage',
                      ...(hasProfitLoss
                          ? (['profitLossAmount'] as Mode[])
                          : []),
                  ];

            const currentIndex = allModes.indexOf(current as Mode);
            const nextIndex = (currentIndex + 1) % allModes.length;
            const next: Mode = allModes[nextIndex] ?? 'percentage';

            return { ...prev, [id]: next };
        });
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
                        <div className={summaryStyles.summaryLabel}>評価額</div>
                        <div className={summaryStyles.summaryValue}>
                            {formatCurrency(totalValue)}
                        </div>
                    </div>
                    <div className={summaryStyles.summaryCard}>
                        <div className={summaryStyles.summaryLabel}>
                            評価損益
                        </div>
                        <div
                            className={summaryStyles.summaryValue}
                            style={{
                                color:
                                    totalProfitLoss >= 0
                                        ? '#16a34a'
                                        : '#dc2626',
                            }}
                        >
                            {formatCurrency(totalProfitLoss)}
                        </div>
                    </div>
                    {dividendInfo.stockCount > 0 && (
                        <div className={summaryStyles.summaryCard}>
                            <div className={summaryStyles.summaryLabel}>
                                年間配当
                            </div>
                            <div className={summaryStyles.summaryValue}>
                                {formatCurrency(dividendInfo.annualAmount)}
                            </div>
                        </div>
                    )}
                </div>

                {/* ドーナツグラフ + 凡例テーブル */}
                {customAggregations.length > 0 && (
                    <div className={summaryStyles.chartsGrid}>
                        {customAggregations.map((aggregation) => {
                            const data = aggregateCustom(stocks, aggregation);
                            const colors = getCustomColors(aggregation);
                            const hasTargetRatios = data.some(
                                (item) => item.targetRatio !== undefined
                            );
                            const currentMode =
                                displayModes[aggregation.id] ?? 'percentage';
                            const hasProfitLoss = data.some(
                                (item) => item.profitLoss !== undefined
                            );

                            return (
                                <div
                                    key={aggregation.id}
                                    className={
                                        summaryStyles.customChartContainer
                                    }
                                >
                                    <div
                                        className={
                                            summaryStyles.buttonContainer
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
                                            className={
                                                summaryStyles.deleteButton
                                            }
                                        >
                                            削除
                                        </button>
                                        {(hasProfitLoss ||
                                            (hasTargetRatios &&
                                                isMobileMode)) && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleDisplayMode(
                                                        aggregation.id,
                                                        hasTargetRatios,
                                                        hasProfitLoss
                                                    )
                                                }
                                                className={
                                                    summaryStyles.toggleButton
                                                }
                                            >
                                                切替
                                            </button>
                                        )}
                                    </div>
                                    <DonutChart
                                        title={aggregation.name}
                                        data={data}
                                        colors={colors}
                                        showLegendTable
                                        showTotal
                                        showDifference={hasTargetRatios}
                                        displayMode={currentMode}
                                        isMobileMode={isMobileMode}
                                        isSmallScreen={isSmallScreen}
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
