import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BudgetItem, type HistoryEntry } from '@/components/BudgetItem';

const { navigateMock } = vi.hoisted(() => ({
    navigateMock: vi.fn(),
}));

vi.mock('@tanstack/react-router', async (importOriginal) => {
    const actual =
        await importOriginal<typeof import('@tanstack/react-router')>();
    return {
        ...actual,
        useNavigate: () => navigateMock,
    };
});

afterEach(() => {
    localStorage.clear();
    cleanup();
    navigateMock.mockReset();
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
    it('Enter で確定できる', async () => {
        renderBudgetItems();

        const firstItem = screen.getByRole('group', { name: 'モノ' });
        fireEvent.click(within(firstItem).getByRole('button', { name: '+' }));

        const input = screen.getByLabelText('差分金額') as HTMLInputElement;
        await waitFor(() => expect(document.activeElement).toBe(input));

        fireEvent.change(input, { target: { value: '1000' } });
        fireEvent.submit(input);

        expect(screen.queryByRole('dialog')).toBeNull();
        expect(screen.getAllByText('￥1,000').length).toBe(1);
    });

    it('永続化: localStorage から初期金額を復元する（キーは name）', () => {
        localStorage.setItem('モノ', '1234');

        renderBudgetItems();

        const firstItem = screen.getByRole('group', { name: 'モノ' });
        expect(within(firstItem).getByText('￥1,234')).toBeTruthy();
    });

    it('永続化: 確定後に localStorage へ保存する（キーは name）', () => {
        renderBudgetItems();

        const firstItem = screen.getByRole('group', { name: 'モノ' });

        fireEvent.click(within(firstItem).getByRole('button', { name: '+' }));
        fireEvent.change(screen.getByLabelText('差分金額'), {
            target: { value: '1000' },
        });
        fireEvent.click(screen.getByRole('button', { name: '確定' }));

        expect(localStorage.getItem('モノ')).toBe('1000');
    });

    it('履歴: 確定後に localStorage へ履歴を 1 件追加する（キーは budget:history:$name）', () => {
        renderBudgetItems();

        const firstItem = screen.getByRole('group', { name: 'モノ' });

        fireEvent.click(within(firstItem).getByRole('button', { name: '+' }));
        fireEvent.change(screen.getByLabelText('差分金額'), {
            target: { value: '1000' },
        });
        fireEvent.click(screen.getByRole('button', { name: '確定' }));

        const raw = localStorage.getItem('budget:history:モノ');
        expect(raw).not.toBeNull();

        const parsed = JSON.parse(raw ?? 'null') as unknown;
        expect(Array.isArray(parsed)).toBe(true);

        const firstEntry = (parsed as Array<HistoryEntry>)[0];
        expect(firstEntry.kind).toBe('increase');
        expect(firstEntry.delta).toBe(1000);
        expect(firstEntry.after).toBe(1000);
        expect(typeof firstEntry.at).toBe('string');
        expect(typeof firstEntry.id).toBe('string');
    });

    it('履歴: モノとコトで独立して保存される', () => {
        renderBudgetItems();

        const mono = screen.getByRole('group', { name: 'モノ' });
        const koto = screen.getByRole('group', { name: 'コト' });

        fireEvent.click(within(mono).getByRole('button', { name: '+' }));
        fireEvent.change(screen.getByLabelText('差分金額'), {
            target: { value: '1000' },
        });
        fireEvent.click(screen.getByRole('button', { name: '確定' }));

        fireEvent.click(within(koto).getByRole('button', { name: '+' }));
        fireEvent.change(screen.getByLabelText('差分金額'), {
            target: { value: '2000' },
        });
        fireEvent.click(screen.getByRole('button', { name: '確定' }));

        const monoRaw = localStorage.getItem('budget:history:モノ');
        const kotoRaw = localStorage.getItem('budget:history:コト');
        expect(monoRaw).not.toBeNull();
        expect(kotoRaw).not.toBeNull();

        const monoParsed = JSON.parse(monoRaw ?? 'null') as Array<HistoryEntry>;
        const kotoParsed = JSON.parse(kotoRaw ?? 'null') as Array<HistoryEntry>;

        expect(monoParsed[0].after).toBe(1000);
        expect(kotoParsed[0].after).toBe(2000);
    });

    it('履歴: 履歴ボタンで履歴ページへ遷移できる', async () => {
        renderBudgetItems();

        const firstItem = screen.getByRole('group', { name: 'モノ' });
        fireEvent.click(
            within(firstItem).getByRole('button', { name: '履歴' })
        );

        await waitFor(() =>
            expect(navigateMock).toHaveBeenCalledWith({
                to: '/history/$name',
                params: { name: 'モノ' },
            })
        );
    });

    it('増額: + -> ダイアログ -> 入力 -> 確定で金額が増える', async () => {
        renderBudgetItems();

        const firstItem = screen.getByRole('group', { name: 'モノ' });
        fireEvent.click(within(firstItem).getByRole('button', { name: '+' }));

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

        const firstItem = screen.getByRole('group', { name: 'モノ' });

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

        const firstItem = screen.getByRole('group', { name: 'モノ' });

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

        const firstItem = screen.getByRole('group', { name: 'モノ' });
        const firstPlus = within(firstItem).getByRole('button', { name: '+' });

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
