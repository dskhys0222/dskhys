import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { AggregatedData } from '@/types';
import { donutChartStyles } from './DonutChart.styles';

interface DonutChartProps {
    title: string;
    data: AggregatedData[];
    colors?: Record<string, string>;
    showLegendTable?: boolean;
    showTotal?: boolean;
    showDifference?: boolean; // 差額を表示するか
    displayMode?:
        | 'percentage'
        | 'difference'
        | 'profitLossAmount'
        | 'profitLossRate'; // スマホでの表示モード
    isMobileMode?: boolean; // タブレット以下の表示か
    isSmallScreen?: boolean; // スマホのみ true
}

const DEFAULT_COLORS = [
    '#2E7D32', // 緑
    '#1976D2', // 青
    '#F57C00', // オレンジ
    '#7B1FA2', // 紫
    '#C62828', // 赤
    '#00838F', // シアン
    '#558B2F', // ライム
    '#6D4C41', // 茶
    '#FFD700', // 金
];

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY',
        maximumFractionDigits: 0,
    }).format(value);
}

export function DonutChart({
    title,
    data,
    colors,
    showLegendTable = false,
    showTotal = false,
    showDifference = false,
    displayMode = 'percentage',
    isMobileMode = false,
    isSmallScreen = false,
}: DonutChartProps) {
    const getColor = (name: string, index: number): string => {
        if (colors?.[name]) return colors[name];
        return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
    };

    const isProfitLossMode =
        displayMode === 'profitLossAmount' || displayMode === 'profitLossRate';

    // PC/タブレット (isSmallScreen=false): 両方同時表示
    // スマホ (isSmallScreen=true): 1列ずつ（amount/rate モードに対応）
    const showProfitLossAmount =
        isProfitLossMode &&
        (displayMode === 'profitLossAmount' || !isSmallScreen);

    const showProfitLossRate =
        isProfitLossMode &&
        (displayMode === 'profitLossRate' || !isSmallScreen);

    if (data.length === 0) {
        return (
            <div className={donutChartStyles.container}>
                <h3 className={donutChartStyles.title}>{title}</h3>
                <div className={donutChartStyles.emptyState}>
                    データがありません
                </div>
            </div>
        );
    }

    return (
        <div className={donutChartStyles.container}>
            <div className={donutChartStyles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            startAngle={90}
                            endAngle={-270}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={entry.name}
                                    fill={getColor(entry.name, index)}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value, name) => [
                                `${formatCurrency(Number(value))} (${(data.find((d) => d.name === name)?.percentage ?? 0).toFixed(1)}%)`,
                                String(name ?? ''),
                            ]}
                        />
                        <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize="14"
                            fontWeight="600"
                            fill="gray"
                        >
                            {title}
                        </text>
                    </PieChart>
                </ResponsiveContainer>
            </div>
            {showLegendTable && (
                <table className={donutChartStyles.legendTable}>
                    <tbody>
                        {data.map((item, index) => {
                            const showDiff =
                                showDifference && item.difference !== undefined;
                            const isMobileDisplayDifference =
                                isMobileMode &&
                                displayMode === 'difference' &&
                                showDiff;

                            return (
                                <tr key={item.name}>
                                    <td className={donutChartStyles.legendTd}>
                                        <span
                                            className={
                                                donutChartStyles.colorIndicator
                                            }
                                            style={{
                                                backgroundColor: getColor(
                                                    item.name,
                                                    index
                                                ),
                                            }}
                                        />
                                        {item.name}
                                    </td>
                                    <td
                                        className={`${donutChartStyles.legendTd} ${donutChartStyles.legendTdRight}`}
                                    >
                                        {formatCurrency(item.value)}
                                    </td>
                                    {showDiff &&
                                        !isMobileMode &&
                                        !isProfitLossMode &&
                                        item.difference !== undefined && (
                                            <td
                                                className={`${donutChartStyles.legendTd} ${donutChartStyles.legendTdRight}`}
                                            >
                                                {item.difference >= 0
                                                    ? '+'
                                                    : ''}
                                                {Math.round(
                                                    item.difference
                                                ).toLocaleString('ja-JP')}
                                            </td>
                                        )}
                                    {!isProfitLossMode &&
                                        (!isMobileMode ||
                                            displayMode === 'percentage') && (
                                            <td
                                                className={`${donutChartStyles.legendTd} ${donutChartStyles.legendTdRight}`}
                                            >
                                                {item.percentage.toFixed(1)}%
                                            </td>
                                        )}
                                    {isMobileDisplayDifference &&
                                        item.difference !== undefined && (
                                            <td
                                                className={`${donutChartStyles.legendTd} ${donutChartStyles.legendTdRight}`}
                                            >
                                                {item.difference >= 0
                                                    ? '+'
                                                    : ''}
                                                {Math.round(
                                                    item.difference
                                                ).toLocaleString('ja-JP')}
                                            </td>
                                        )}
                                    {showProfitLossAmount && (
                                        <td
                                            className={`${donutChartStyles.legendTd} ${donutChartStyles.legendTdRight}`}
                                            style={{
                                                color:
                                                    item.profitLoss ===
                                                    undefined
                                                        ? undefined
                                                        : item.profitLoss >= 0
                                                          ? '#16a34a'
                                                          : '#dc2626',
                                            }}
                                        >
                                            {item.profitLoss === undefined
                                                ? '-'
                                                : `${item.profitLoss >= 0 ? '+' : ''}${Math.round(item.profitLoss).toLocaleString('ja-JP')}`}
                                        </td>
                                    )}
                                    {showProfitLossRate && (
                                        <td
                                            className={`${donutChartStyles.legendTd} ${donutChartStyles.legendTdRight}`}
                                            style={{
                                                color:
                                                    item.profitLossRate ===
                                                    undefined
                                                        ? undefined
                                                        : item.profitLossRate >=
                                                            0
                                                          ? '#16a34a'
                                                          : '#dc2626',
                                            }}
                                        >
                                            {item.profitLossRate === undefined
                                                ? '-'
                                                : `${item.profitLossRate >= 0 ? '+' : ''}${item.profitLossRate.toFixed(2)}%`}
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                        {showTotal && (
                            <tr
                                style={{
                                    borderTop: '2px solid',
                                    borderColor: '#d1d5db',
                                    fontWeight: 'bold',
                                }}
                            >
                                <td className={donutChartStyles.legendTd}>
                                    合計
                                </td>
                                <td
                                    className={`${donutChartStyles.legendTd} ${donutChartStyles.legendTdRight}`}
                                >
                                    {formatCurrency(
                                        data.reduce(
                                            (sum, item) => sum + item.value,
                                            0
                                        )
                                    )}
                                </td>
                                {showDifference &&
                                    !isMobileMode &&
                                    !isProfitLossMode && (
                                        <td
                                            className={`${donutChartStyles.legendTd} ${donutChartStyles.legendTdRight}`}
                                        >
                                            -
                                        </td>
                                    )}
                                {!isProfitLossMode &&
                                    (!isMobileMode ||
                                        displayMode === 'percentage') && (
                                        <td
                                            className={`${donutChartStyles.legendTd} ${donutChartStyles.legendTdRight}`}
                                        >
                                            100.0%
                                        </td>
                                    )}
                                {showProfitLossAmount && (
                                    <td
                                        className={`${donutChartStyles.legendTd} ${donutChartStyles.legendTdRight}`}
                                    >
                                        -
                                    </td>
                                )}
                                {showProfitLossRate && (
                                    <td
                                        className={`${donutChartStyles.legendTd} ${donutChartStyles.legendTdRight}`}
                                    >
                                        -
                                    </td>
                                )}
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}
