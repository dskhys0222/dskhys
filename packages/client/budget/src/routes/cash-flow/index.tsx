import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { SubscriptionTable } from '@/components/SubscriptionTable';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/constants/categories';
import { useExpenseStore } from '@/store/expenseStore';
import { useIncomeStore } from '@/store/incomeStore';
import { styles } from '../styles';

export const Route = createFileRoute('/cash-flow/')({
    component: CashFlowPage,
});

function CashFlowPage() {
    const navigate = useNavigate();

    const incomeItems = useIncomeStore((state) => state.items);
    const removeIncomeItem = useIncomeStore((state) => state.removeItem);

    const expenseItems = useExpenseStore((state) => state.items);
    const removeExpenseItem = useExpenseStore((state) => state.removeItem);

    return (
        <div className={styles.pageStack}>
            <h1
                style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                }}
            >
                収支管理
            </h1>

            <SubscriptionTable
                title="収入"
                items={incomeItems}
                categories={INCOME_CATEGORIES}
                onAdd={() => navigate({ to: '/cash-flow/income/add' })}
                onCardClick={(id) =>
                    navigate({ to: `/cash-flow/income/${id}` })
                }
                onRemove={removeIncomeItem}
            />

            <SubscriptionTable
                title="支出"
                items={expenseItems}
                categories={EXPENSE_CATEGORIES}
                onAdd={() => navigate({ to: '/cash-flow/expense/add' })}
                onCardClick={(id) =>
                    navigate({ to: `/cash-flow/expense/${id}` })
                }
                onRemove={removeExpenseItem}
            />
        </div>
    );
}
