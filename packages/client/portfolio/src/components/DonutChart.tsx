import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { AggregatedData } from '@/types';
import { css } from '../../styled-system/css';

interface DonutChartProps {
    title: string;
    data: AggregatedData[];
    colors?: Record<string, string>;
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

const CATEGORY_COLORS: Record<string, string> = {
    // クラス
    現金: '#757575',
    株式: '#C62828',
    コモディティ: '#ffd9009c',
    // 地域
    日本: '#C62828',
    米国: '#1976D2',
    全世界: '#2E7D32',
    // 属性
    インデックス: '#1976D2',
    増配: '#C62828',
    ゴールド: '#ffd900ce',
    暗号通貨: '#7B1FA2',
    // 口座
    預金: '#757575',
    特定: '#C62828',
    NISA: '#F57C00',
    DC: '#2E7D32',
    暗号資産: '#7B1FA2',
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY',
        maximumFractionDigits: 0,
    }).format(value);
}

interface CustomLabelProps {
    cx: number;
    cy: number;
    midAngle: number;
    outerRadius: number;
    name: string;
    percentage: number;
}

function renderCustomLabel({
    cx,
    cy,
    midAngle,
    outerRadius,
    name,
    percentage,
}: CustomLabelProps) {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text
            x={x}
            y={y}
            fill="gray"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            fontSize="14"
        >
            {`${name} ${percentage}%`}
        </text>
    );
}

const styles = {
    container: css({
        backgroundColor: 'white',
        borderRadius: 'lg',
        padding: '1rem',
        boxShadow: 'sm',
    }),
    title: css({
        fontSize: 'md',
        fontWeight: 'semibold',
        color: 'gray.700',
        marginBottom: '0.5rem',
        textAlign: 'center',
    }),
    chartContainer: css({
        height: '250px',
    }),
    emptyState: css({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '250px',
        color: 'gray.500',
        fontSize: 'sm',
    }),
};

export function DonutChart({ title, data, colors }: DonutChartProps) {
    const getColor = (name: string, index: number): string => {
        if (colors?.[name]) return colors[name];
        if (CATEGORY_COLORS[name]) return CATEGORY_COLORS[name];
        return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
    };

    if (data.length === 0) {
        return (
            <div className={styles.container}>
                <h3 className={styles.title}>{title}</h3>
                <div className={styles.emptyState}>データがありません</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={100}
                            label={renderCustomLabel}
                            labelLine={{
                                stroke: 'gray',
                                strokeWidth: 1,
                            }}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={entry.name}
                                    fill={getColor(entry.name, index)}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number, name: string) => [
                                `${formatCurrency(value)} (${data.find((d) => d.name === name)?.percentage}%)`,
                                name,
                            ]}
                        />
                        <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize="16"
                            fontWeight="600"
                            fill="gray"
                        >
                            {title}
                        </text>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
