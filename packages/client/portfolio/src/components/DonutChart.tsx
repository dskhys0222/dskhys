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
    displayMode?: 'percentage' | 'difference'; // スマホでの表示モード
    isMobileMode?: boolean; // スマホ表示か（true=スマホ、false=PC）
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
}: DonutChartProps) {
    const getColor = (name: string, index: number): string => {
        if (colors?.[name]) return colors[name];
        return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
    };

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
                                    {!isMobileDisplayDifference && (
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
                                {showDifference && !isMobileMode && (
                                    <td
                                        className={`${donutChartStyles.legendTd} ${donutChartStyles.legendTdRight}`}
                                    >
                                        -
                                    </td>
                                )}
                                {!(
                                    isMobileMode && displayMode === 'difference'
                                ) && (
                                    <td
                                        className={`${donutChartStyles.legendTd} ${donutChartStyles.legendTdRight}`}
                                    >
                                        100.0%
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
