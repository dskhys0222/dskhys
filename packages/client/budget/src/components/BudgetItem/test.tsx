import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { BudgetItem } from '@/components/BudgetItem';

afterEach(() => {
    cleanup();
});

function renderBudgetItems() {
    return render(
        <>
            <BudgetItem name="モノ" />
            <BudgetItem name="コト" />
        </>
    );
}

describe('Budget / route', () => {
    it('増額: + -> ダイアログ -> 入力 -> 確定で金額が増える', async () => {
        renderBudgetItems();

        const plusButtons = screen.getAllByRole('button', { name: '+' });
        const firstPlus = plusButtons.at(0);
        if (!firstPlus) throw new Error('plus button not found');
        fireEvent.click(firstPlus);

        expect(screen.getByRole('dialog', { name: '増額' })).toBeTruthy();
        expect(screen.getByText('増額')).toBeTruthy();

        const input = screen.getByLabelText('差分金額') as HTMLInputElement;
        await waitFor(() => expect(document.activeElement).toBe(input));

        fireEvent.change(input, { target: { value: '1000' } });
        fireEvent.click(screen.getByRole('button', { name: '確定' }));

        expect(screen.queryByRole('dialog')).toBeNull();
        expect(screen.getAllByText('￥1,000').length).toBe(1);
    });

    it('減額: - -> ダイアログ -> 入力 -> 確定で金額が減る', () => {
        renderBudgetItems();

        const firstItemLabel = screen.getAllByText('モノ').at(0);
        if (!firstItemLabel) throw new Error('first item label not found');

        const firstItem = firstItemLabel.parentElement;
        if (!firstItem) throw new Error('first item not found');

        fireEvent.click(within(firstItem).getByRole('button', { name: '+' }));
        fireEvent.change(screen.getByLabelText('差分金額'), {
            target: { value: '1000' },
        });
        fireEvent.click(screen.getByRole('button', { name: '確定' }));
        expect(within(firstItem).getByText('￥1,000')).toBeTruthy();

        fireEvent.click(within(firstItem).getByRole('button', { name: '-' }));
        fireEvent.change(screen.getByLabelText('差分金額'), {
            target: { value: '500' },
        });
        fireEvent.click(screen.getByRole('button', { name: '確定' }));

        expect(within(firstItem).getByText('￥500')).toBeTruthy();
    });

    it('キャンセル: 金額は変わらない', () => {
        renderBudgetItems();

        const firstItemLabel = screen.getAllByText('モノ').at(0);
        if (!firstItemLabel) throw new Error('first item label not found');

        const firstItem = firstItemLabel.parentElement;
        if (!firstItem) throw new Error('first item not found');

        expect(within(firstItem).getByText('￥0')).toBeTruthy();

        fireEvent.click(within(firstItem).getByRole('button', { name: '+' }));
        fireEvent.change(screen.getByLabelText('差分金額'), {
            target: { value: '1000' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'キャンセル' }));

        expect(screen.queryByRole('dialog')).toBeNull();
        expect(within(firstItem).getByText('￥0')).toBeTruthy();
    });

    it('バリデーション: 空/0/負数は確定できない（disabled）', () => {
        renderBudgetItems();

        const firstPlus = screen.getAllByRole('button', { name: '+' }).at(0);
        if (!firstPlus) throw new Error('plus button not found');
        fireEvent.click(firstPlus);

        const confirm = screen.getByRole('button', {
            name: '確定',
        }) as HTMLButtonElement;
        expect(confirm.disabled).toBe(true);

        const input = screen.getByLabelText('差分金額');

        fireEvent.change(input, { target: { value: '' } });
        expect(confirm.disabled).toBe(true);

        fireEvent.change(input, { target: { value: '0' } });
        expect(confirm.disabled).toBe(true);

        fireEvent.change(input, { target: { value: '-1' } });
        expect(confirm.disabled).toBe(true);

        fireEvent.change(input, { target: { value: '1' } });
        expect(confirm.disabled).toBe(false);
    });

    it('Esc で閉じられ、入力はリセットされる', () => {
        renderBudgetItems();

        const firstPlus = screen.getAllByRole('button', { name: '+' }).at(0);
        if (!firstPlus) throw new Error('plus button not found');
        fireEvent.click(firstPlus);
        fireEvent.change(screen.getByLabelText('差分金額'), {
            target: { value: '1000' },
        });

        fireEvent.keyDown(window, { key: 'Escape' });
        expect(screen.queryByRole('dialog')).toBeNull();

        fireEvent.click(firstPlus);
        const input = screen.getByLabelText('差分金額') as HTMLInputElement;
        expect(input.value).toBe('');
    });
});
