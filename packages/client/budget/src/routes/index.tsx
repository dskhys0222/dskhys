import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { BudgetItem } from '@/components/BudgetItem';
import {
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES,
    SUBSCRIPTION_CATEGORIES,
} from '@/constants/categories';
import type { BudgetStore } from '@/store/budgetStore';
import { useBudgetStore } from '@/store/budgetStore';
import { useExpenseStore } from '@/store/expenseStore';
import { useIncomeStore } from '@/store/incomeStore';
import {
    useActiveSubscriptionStore,
    useSubscriptionCandidateStore,
} from '@/store/subscriptionStore';
import { styles } from './styles';

export const Route = createFileRoute('/')({
    component: App,
});

interface TouchState {
    startX: number;
    startTime: number;
}

function App() {
    // Budget Store (既存の「モノ」「コト」管理)
    const budgetItems = useBudgetStore((state: BudgetStore) => state.items);
    const addBudgetItem = useBudgetStore((state: BudgetStore) => state.addItem);
    const removeBudgetItem = useBudgetStore(
        (state: BudgetStore) => state.removeItem
    );

    // Income Store
    const incomeItems = useIncomeStore((state) => state.items);
    const addIncomeItem = useIncomeStore((state) => state.addItem);
    const removeIncomeItem = useIncomeStore((state) => state.removeItem);

    // Expense Store
    const expenseItems = useExpenseStore((state) => state.items);
    const addExpenseItem = useExpenseStore((state) => state.addItem);
    const removeExpenseItem = useExpenseStore((state) => state.removeItem);

    // Active Subscription Store
    const activeSubItems = useActiveSubscriptionStore((state) => state.items);
    const addActiveSubItem = useActiveSubscriptionStore(
        (state) => state.addItem
    );
    const removeActiveSubItem = useActiveSubscriptionStore(
        (state) => state.removeItem
    );

    // Subscription Candidate Store
    const candidateSubItems = useSubscriptionCandidateStore(
        (state) => state.items
    );
    const addCandidateSubItem = useSubscriptionCandidateStore(
        (state) => state.addItem
    );
    const removeCandidateSubItem = useSubscriptionCandidateStore(
        (state) => state.removeItem
    );

    const [inputValue, setInputValue] = useState('');
    const [touchState, setTouchState] = useState<TouchState | null>(null);
    const [swipingId, setSwipingId] = useState<string | null>(null);
    const [swipeOffset, setSwipeOffset] = useState<number>(0);
    const [isTouch, setIsTouch] = useState(false);

    // デバイスタイプ判定
    useEffect(() => {
        setIsTouch('ontouchstart' in window);
    }, []);

    const handleAdd = () => {
        if (inputValue.trim()) {
            addBudgetItem(inputValue);
            setInputValue('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAdd();
        }
    };

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`「${name}」を削除しますか？`)) {
            removeBudgetItem(id);
        }
        setSwipingId(null);
        setSwipeOffset(0);
    };

    const handleTouchStart = (id: string, e: React.TouchEvent) => {
        setTouchState({
            startX: e.touches[0].clientX,
            startTime: Date.now(),
        });
        setSwipingId(id);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchState && swipingId) {
            const currentX = e.touches[0].clientX;
            const offset = currentX - touchState.startX;
            // 左方向のみ許可（負の値）
            if (offset < 0) {
                setSwipeOffset(offset);
            }
        }
    };

    const handleTouchEnd = (e: React.TouchEvent, id: string, name: string) => {
        if (!touchState) return;

        const endX = e.changedTouches[0].clientX;
        const distance = touchState.startX - endX;
        const duration = Date.now() - touchState.startTime;

        // 左スワイプ: 50px以上、400ms以内
        if (distance > 50 && duration < 400) {
            handleDelete(id, name);
        } else {
            // スワイプ解除
            setSwipingId(null);
            setSwipeOffset(0);
        }

        setTouchState(null);
    };

    const handleMoveToCandidate = (id: string) => {
        const item = activeSubItems.find((i) => i.id === id);
        if (item) {
            removeActiveSubItem(id);
            const { id: _, ...rest } = item;
            addCandidateSubItem(rest);
        }
    };

    const handleMoveToActive = (id: string) => {
        const item = candidateSubItems.find((i) => i.id === id);
        if (item) {
            removeCandidateSubItem(id);
            const { id: _, ...rest } = item;
            addActiveSubItem(rest);
        }
    };

    return (
        <div className={styles.pageStack}>
            <div className={styles.addItemForm}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="管理対象を入力"
                />
                <button type="button" onClick={handleAdd}>
                    追加
                </button>
            </div>

            {/* ホーム画面のリンク削除。既存の「モノ」「コト」管理のみ表示 */}
            {budgetItems.map((item: { id: string; name: string }) => (
                <div
                    key={item.id}
                    className={
                        isTouch
                            ? styles.itemWrapperContainer
                            : styles.itemWrapperDesktop
                    }
                >
                    {isTouch && (
                        <>
                            <div className={styles.deleteBackground}>🗑️</div>
                            <div
                                className={styles.itemWrapper}
                                onTouchStart={(e) =>
                                    handleTouchStart(item.id, e)
                                }
                                onTouchMove={handleTouchMove}
                                onTouchEnd={(e) =>
                                    handleTouchEnd(e, item.id, item.name)
                                }
                                style={{
                                    transform:
                                        swipingId === item.id
                                            ? `translateX(${swipeOffset}px)`
                                            : 'translateX(0)',
                                    transition:
                                        swipingId === item.id
                                            ? 'none'
                                            : 'transform 0.3s ease',
                                }}
                            >
                                <BudgetItem name={item.name} />
                            </div>
                        </>
                    )}
                    {!isTouch && (
                        <>
                            <div className={styles.itemWrapperPcContainer}>
                                <BudgetItem name={item.name} />
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDelete(item.id, item.name)
                                    }
                                    className={styles.deleteButton}
                                >
                                    削除
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}
