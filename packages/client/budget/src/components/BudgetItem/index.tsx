import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface BudgetItemProps {
    name: string;
}

export function BudgetItem({ name }: BudgetItemProps) {
    const [amount, setAmount] = useState(0);
    const [dialogMode, setDialogMode] = useState<
        'increase' | 'decrease' | null
    >(null);
    const [deltaAmountInput, setDeltaAmountInput] = useState('');
    const inputRef = useRef<HTMLInputElement | null>(null);

    const deltaAmount = useMemo(() => {
        if (!/^\d+$/.test(deltaAmountInput)) return null;
        const value = Number(deltaAmountInput);
        if (!Number.isSafeInteger(value)) return null;
        return value;
    }, [deltaAmountInput]);

    const canConfirm = deltaAmount !== null && deltaAmount > 0;

    const closeDialog = useCallback(() => {
        setDialogMode(null);
        setDeltaAmountInput('');
    }, []);

    const confirm = useCallback(() => {
        if (!dialogMode) return;
        if (!canConfirm || deltaAmount === null) return;

        setAmount((prev) =>
            dialogMode === 'increase' ? prev + deltaAmount : prev - deltaAmount
        );
        closeDialog();
    }, [canConfirm, closeDialog, deltaAmount, dialogMode]);

    useEffect(() => {
        if (!dialogMode) return;

        inputRef.current?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                closeDialog();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [closeDialog, dialogMode]);

    return (
        <div>
            <div>{name}</div>
            <div>{formatCurrency(amount)}</div>
            <div>
                <button type="button" onClick={() => setDialogMode('increase')}>
                    +
                </button>
                <button type="button" onClick={() => setDialogMode('decrease')}>
                    -
                </button>
            </div>

            {dialogMode !== null ? (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={dialogMode === 'increase' ? '増額' : '減額'}
                >
                    <h2>{dialogMode === 'increase' ? '増額' : '減額'}</h2>
                    <div>
                        <label htmlFor={`${name}-delta-amount`}>差分金額</label>
                        <input
                            ref={inputRef}
                            id={`${name}-delta-amount`}
                            name="deltaAmount"
                            type="number"
                            inputMode="numeric"
                            step={1}
                            min={1}
                            value={deltaAmountInput}
                            onChange={(e) =>
                                setDeltaAmountInput(e.target.value)
                            }
                        />
                    </div>
                    <div>
                        <button type="button" onClick={closeDialog}>
                            キャンセル
                        </button>
                        <button
                            type="button"
                            onClick={confirm}
                            disabled={!canConfirm}
                        >
                            確定
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function formatCurrency(value: number) {
    return `￥${value.toLocaleString()}`;
}
