import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { EXPENSE_CATEGORIES } from '@/constants/categories';
import { useExpenseStore } from '@/store/expenseStore';
import { styles } from '../../../styles';

export const Route = createFileRoute('/cash-flow/expense/$id/')({
    component: ExpenseDetailPage,
});

function ExpenseDetailPage() {
    const navigate = useNavigate();
    const { id } = Route.useParams();

    const items = useExpenseStore((state) => state.items);
    const removeItem = useExpenseStore((state) => state.removeItem);

    const item = items.find((i) => i.id === id);

    if (!item) {
        return (
            <div className={styles.pageStack}>
                <p>支出が見つかりません</p>
                <button
                    type="button"
                    onClick={() => navigate({ to: '/cash-flow' })}
                    style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                    }}
                >
                    戻る
                </button>
            </div>
        );
    }

    const category = EXPENSE_CATEGORIES[item.category];

    return (
        <div className={styles.pageStack}>
            <h1
                style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                }}
            >
                {item.name}
            </h1>

            <div
                style={{
                    padding: '1rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                }}
            >
                <div
                    style={{
                        marginBottom: '0.75rem',
                    }}
                >
                    <p
                        style={{
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            marginBottom: '0.25rem',
                        }}
                    >
                        カテゴリー
                    </p>
                    <p
                        style={{
                            fontSize: '1rem',
                            fontWeight: 'bold',
                        }}
                    >
                        {category?.name || item.category}
                    </p>
                </div>

                <div
                    style={{
                        marginBottom: '0.75rem',
                    }}
                >
                    <p
                        style={{
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            marginBottom: '0.25rem',
                        }}
                    >
                        月額
                    </p>
                    <p
                        style={{
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                        }}
                    >
                        {new Intl.NumberFormat('ja-JP', {
                            style: 'currency',
                            currency: 'JPY',
                        }).format(item.pricePerMonth)}
                    </p>
                </div>

                <div
                    style={{
                        marginBottom: '0.75rem',
                    }}
                >
                    <p
                        style={{
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            marginBottom: '0.25rem',
                        }}
                    >
                        年額
                    </p>
                    <p
                        style={{
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                        }}
                    >
                        {new Intl.NumberFormat('ja-JP', {
                            style: 'currency',
                            currency: 'JPY',
                        }).format(item.pricePerYear)}
                    </p>
                </div>

                {item.remark && (
                    <div
                        style={{
                            marginBottom: '0.75rem',
                        }}
                    >
                        <p
                            style={{
                                fontSize: '0.875rem',
                                color: '#6b7280',
                                marginBottom: '0.25rem',
                            }}
                        >
                            備考
                        </p>
                        <p
                            style={{
                                fontSize: '1rem',
                            }}
                        >
                            {item.remark}
                        </p>
                    </div>
                )}
            </div>

            <div
                style={{
                    display: 'flex',
                    gap: '0.5rem',
                }}
            >
                <button
                    type="button"
                    onClick={() =>
                        navigate({ to: `/cash-flow/expense/${id}/edit` })
                    }
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        borderRadius: '0.25rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                    }}
                >
                    編集
                </button>
                <button
                    type="button"
                    onClick={() => {
                        if (
                            window.confirm(`「${item.name}」を削除しますか？`)
                        ) {
                            removeItem(id);
                            navigate({ to: '/cash-flow' });
                        }
                    }}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        borderRadius: '0.25rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                    }}
                >
                    削除
                </button>
                <button
                    type="button"
                    onClick={() => navigate({ to: '/cash-flow' })}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        borderRadius: '0.25rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                    }}
                >
                    戻る
                </button>
            </div>
        </div>
    );
}
