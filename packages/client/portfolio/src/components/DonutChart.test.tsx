import { cleanup, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AggregatedData } from '@/types';
import { DonutChart } from './DonutChart';

afterEach(() => {
    cleanup();
});

vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: { children: ReactNode }) => (
        <div>{children}</div>
    ),
    PieChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Pie: () => null,
    Cell: () => null,
    Tooltip: () => null,
}));

const baseItem = (overrides: Partial<AggregatedData> = {}): AggregatedData => ({
    name: 'コア',
    value: 100000,
    percentage: 100,
    ...overrides,
});

describe('DonutChart', () => {
    describe('displayMode="profitLoss" isMobileMode（損益額列）', () => {
        it('損益額の列が表示される', () => {
            const data = [baseItem({ profitLoss: 5000, profitLossRate: 5 })];
            const { getByText } = render(
                <DonutChart
                    title="テスト"
                    data={data}
                    showLegendTable
                    displayMode="profitLossAmount"
                    isMobileMode
                />
            );
            getByText('+5,000');
        });

        it('正の損益額に + が付く', () => {
            const data = [baseItem({ profitLoss: 3000, profitLossRate: 3 })];
            const { getAllByText } = render(
                <DonutChart
                    title="テスト"
                    data={data}
                    showLegendTable
                    displayMode="profitLossAmount"
                    isMobileMode
                />
            );
            const cells = getAllByText(/\+/);
            expect(cells.length).toBeGreaterThan(0);
        });

        it('損失の場合: 負の値が + なしで表示される', () => {
            const data = [baseItem({ profitLoss: -2000, profitLossRate: -2 })];
            const { queryByText, getAllByText } = render(
                <DonutChart
                    title="テスト"
                    data={data}
                    showLegendTable
                    displayMode="profitLossAmount"
                    isMobileMode
                />
            );
            // 2000 を含む表示があること（- または minus sign でフォーマットされる）
            expect(getAllByText(/2,000/).length).toBeGreaterThan(0);
            // + は付かない
            expect(queryByText(/\+.*2,000/)).toBeNull();
        });

        it('profitLoss が undefined の場合: - が表示される', () => {
            const data = [baseItem({ profitLoss: undefined })];
            const { getAllByText } = render(
                <DonutChart
                    title="テスト"
                    data={data}
                    showLegendTable
                    displayMode="profitLossAmount"
                    isMobileMode
                />
            );
            expect(getAllByText('-').length).toBeGreaterThan(0);
        });
    });

    describe('displayMode="profitLoss" isMobileMode（損益率列）', () => {
        it('損益率の列が表示される（% 付き）', () => {
            const data = [baseItem({ profitLoss: 5000, profitLossRate: 5.25 })];
            const { getByText } = render(
                <DonutChart
                    title="テスト"
                    data={data}
                    showLegendTable
                    displayMode="profitLossAmount"
                    isMobileMode
                />
            );
            getByText('+5.25%');
        });

        it('損失率は + なしで表示される', () => {
            const data = [
                baseItem({ profitLoss: -1000, profitLossRate: -10.5 }),
            ];
            const { getByText } = render(
                <DonutChart
                    title="テスト"
                    data={data}
                    showLegendTable
                    displayMode="profitLossAmount"
                    isMobileMode
                />
            );
            getByText('-10.50%');
        });

        it('profitLossRate が undefined の場合: - が表示される', () => {
            const data = [baseItem({ profitLossRate: undefined })];
            const { getAllByText } = render(
                <DonutChart
                    title="テスト"
                    data={data}
                    showLegendTable
                    displayMode="profitLossAmount"
                    isMobileMode
                />
            );
            expect(getAllByText('-').length).toBeGreaterThan(0);
        });
    });

    describe('displayMode が profitLoss 以外のとき（損益非表示）', () => {
        it('損益列が表示されない', () => {
            const data = [baseItem({ profitLoss: 5000, profitLossRate: 5 })];
            const { queryByText } = render(
                <DonutChart title="テスト" data={data} showLegendTable />
            );
            expect(queryByText('+￥5,000')).toBeNull();
            expect(queryByText(/5\.00%/)).toBeNull();
        });
    });

    describe('データなし', () => {
        it('「データがありません」が表示される', () => {
            const { getByText } = render(
                <DonutChart title="テスト" data={[]} />
            );
            getByText('データがありません');
        });
    });
});
