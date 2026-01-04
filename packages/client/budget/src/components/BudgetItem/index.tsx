import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { styles } from './styles';

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
    const [hasHydratedFromStorage, setHasHydratedFromStorage] = useState(false);

    const storageKey = name;

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
        setHasHydratedFromStorage(false);
        const storedAmount = readAmountFromLocalStorage(storageKey);
        setAmount(storedAmount ?? 0);
        setHasHydratedFromStorage(true);
    }, [storageKey]);

    useEffect(() => {
        if (!hasHydratedFromStorage) return;
        writeAmountToLocalStorage(storageKey, amount);
    }, [amount, hasHydratedFromStorage, storageKey]);

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
        <div className={styles.container}>
            <div className={styles.headerRow}>
                <div className={styles.name}>{name}</div>
                <div className={styles.amount}>{formatCurrency(amount)}</div>
            </div>
            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.actionButton({
                        kind: 'increase',
                    })}
                    onClick={() => setDialogMode('increase')}
                >
                    +
                </button>
                <button
                    type="button"
                    className={styles.actionButton({
                        kind: 'decrease',
                    })}
                    onClick={() => setDialogMode('decrease')}
                >
                    -
                </button>
            </div>

            {dialogMode !== null ? (
                <div className={styles.dialogOverlay}>
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label={dialogMode === 'increase' ? '増額' : '減額'}
                        className={styles.dialog}
                    >
                        <form
                            className={styles.form}
                            onSubmit={(e) => {
                                e.preventDefault();
                                confirm();
                            }}
                        >
                            <h2 className={styles.dialogTitle}>
                                {dialogMode === 'increase' ? '増額' : '減額'}
                            </h2>
                            <div className={styles.field}>
                                <label
                                    className={styles.label}
                                    htmlFor={`${name}-delta-amount`}
                                >
                                    差分金額
                                </label>
                                <input
                                    ref={inputRef}
                                    id={`${name}-delta-amount`}
                                    name="deltaAmount"
                                    type="number"
                                    inputMode="numeric"
                                    step={1}
                                    min={1}
                                    value={deltaAmountInput}
                                    className={styles.input}
                                    onChange={(e) =>
                                        setDeltaAmountInput(e.target.value)
                                    }
                                />
                            </div>
                            <div className={styles.footer}>
                                <button
                                    type="button"
                                    className={styles.footerButton({
                                        intent: 'ghost',
                                    })}
                                    onClick={closeDialog}
                                >
                                    キャンセル
                                </button>
                                <button
                                    type="submit"
                                    className={styles.footerButton({
                                        intent: 'primary',
                                    })}
                                    disabled={!canConfirm}
                                >
                                    確定
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function formatCurrency(value: number) {
    return `￥${value.toLocaleString()}`;
}

function readAmountFromLocalStorage(key: string): number | null {
    if (typeof window === 'undefined') return null;
    if (!('localStorage' in window)) return null;

    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;

    const parsed = Number(raw);
    if (!Number.isSafeInteger(parsed)) return null;
    return parsed;
}

function writeAmountToLocalStorage(key: string, amount: number): void {
    if (typeof window === 'undefined') return;
    if (!('localStorage' in window)) return;

    window.localStorage.setItem(key, String(amount));
}
