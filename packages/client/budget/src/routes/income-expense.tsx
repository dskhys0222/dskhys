import { createFileRoute } from '@tanstack/react-router';
import { SubscriptionTable } from '@/components/SubscriptionTable';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/constants/categories';
import { useExpenseStore } from '@/store/expenseStore';
import { useIncomeStore } from '@/store/incomeStore';
import { styles } from './styles';

export const Route = createFileRoute('/income-expense')({
    component: IncomeExpensePage,
});

export default function IncomeExpensePage() {
    const incomeItems = useIncomeStore((state) => state.items);
    const addIncomeItem = useIncomeStore((state) => state.addItem);
    const removeIncomeItem = useIncomeStore((state) => state.removeItem);

    const expenseItems = useExpenseStore((state) => state.items);
    const addExpenseItem = useExpenseStore((state) => state.addItem);
    const removeExpenseItem = useExpenseStore((state) => state.removeItem);

    return (
        <div className={styles.pageStack}>
            <h1
                style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                }}
            >
                収入・支出管理
            </h1>
            <SubscriptionTable
                title="収入"
                items={incomeItems}
                categories={INCOME_CATEGORIES}
                onAdd={addIncomeItem}
                onRemove={removeIncomeItem}
            />
            <SubscriptionTable
                title="支出"
                items={expenseItems}
                categories={EXPENSE_CATEGORIES}
                onAdd={addExpenseItem}
                onRemove={removeExpenseItem}
            />
        </div>
    );
}
