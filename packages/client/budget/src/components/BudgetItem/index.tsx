import { useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { styles } from './styles';

export interface BudgetItemProps {
    name: string;
}

export function BudgetItem({ name }: BudgetItemProps) {
    const navigate = useNavigate();
    const [amount, setAmount] = useState(0);
    const [dialogMode, setDialogMode] = useState<
        'increase' | 'decrease' | null
    >(null);
    const [deltaAmountInput, setDeltaAmountInput] = useState('');
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [hasHydratedFromStorage, setHasHydratedFromStorage] = useState(false);

    const storageKey = name;
    const historyStorageKey = `budget:history:${name}`;

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

        setAmount((prev) => {
            const nextAmount =
                dialogMode === 'increase'
                    ? prev + deltaAmount
                    : prev - deltaAmount;

            appendHistoryEntry(historyStorageKey, {
                kind: dialogMode,
                delta: deltaAmount,
                after: nextAmount,
            });

            return nextAmount;
        });
        closeDialog();
    }, [canConfirm, closeDialog, deltaAmount, dialogMode, historyStorageKey]);

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
        <fieldset aria-label={name} className={styles.container}>
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
                <button
                    type="button"
                    className={styles.actionButton({
                        kind: 'history',
                    })}
                    aria-label="履歴"
                    onClick={() =>
                        navigate({ to: '/history/$name', params: { name } })
                    }
                >
                    履歴
                </button>
            </div>

            {dialogMode !== null
                ? createPortal(
                      <div className={styles.dialogOverlay}>
                          <div
                              role="dialog"
                              aria-modal="true"
                              aria-label={
                                  dialogMode === 'increase' ? '増額' : '減額'
                              }
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
                                      {dialogMode === 'increase'
                                          ? '増額'
                                          : '減額'}
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
                                              setDeltaAmountInput(
                                                  e.target.value
                                              )
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
                      </div>,
                      document.body
                  )
                : null}
        </fieldset>
    );
}

export interface HistoryEntry {
    id: string;
    at: string;
    kind: 'increase' | 'decrease';
    delta: number;
    after: number;
}

function appendHistoryEntry(
    historyStorageKey: string,
    input: Pick<HistoryEntry, 'kind' | 'delta' | 'after'>
) {
    const current = readHistoryFromLocalStorage(historyStorageKey);
    const next: HistoryEntry[] = [
        {
            id: createHistoryEntryId(),
            at: new Date().toISOString(),
            ...input,
        },
        ...current,
    ];

    writeHistoryToLocalStorage(historyStorageKey, next);
}

function createHistoryEntryId() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readHistoryFromLocalStorage(key: string): HistoryEntry[] {
    if (typeof window === 'undefined') return [];
    if (!('localStorage' in window)) return [];

    const raw = window.localStorage.getItem(key);
    if (raw === null) return [];

    try {
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(isHistoryEntry);
    } catch {
        return [];
    }
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
    if (!value || typeof value !== 'object') return false;

    const record = value as Record<string, unknown>;
    return (
        typeof record.id === 'string' &&
        typeof record.at === 'string' &&
        (record.kind === 'increase' || record.kind === 'decrease') &&
        typeof record.delta === 'number' &&
        Number.isSafeInteger(record.delta) &&
        record.delta > 0 &&
        typeof record.after === 'number' &&
        Number.isSafeInteger(record.after)
    );
}

function writeHistoryToLocalStorage(
    key: string,
    entries: HistoryEntry[]
): void {
    if (typeof window === 'undefined') return;
    if (!('localStorage' in window)) return;

    window.localStorage.setItem(key, JSON.stringify(entries));
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
