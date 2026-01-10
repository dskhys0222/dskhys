import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
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
    現金: '#F57C00',
    株式: '#2E7D32',
    コモディティ: '#FFD700',
    // 地域
    日本: '#C62828',
    米国: '#1976D2',
    全世界: '#7B1FA2',
    // 属性
    インデックス: '#2E7D32',
    増配: '#1976D2',
    ゴールド: '#FFD700',
    暗号通貨: '#F57C00',
    // 口座
    預金: '#F57C00',
    特定: '#1976D2',
    NISA: '#2E7D32',
    DC: '#7B1FA2',
    暗号資産: '#C62828',
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY',
        maximumFractionDigits: 0,
    }).format(value);
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
            <h3 className={styles.title}>{title}</h3>
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
                            outerRadius={80}
                            label={({ percentage }) => `${percentage}%`}
                            labelLine={false}
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
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
