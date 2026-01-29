import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { SUBSCRIPTION_CATEGORIES } from '@/constants/categories';
import {
    useActiveSubscriptionStore,
    useSubscriptionCandidateStore,
} from '@/store/subscriptionStore';
import { styles } from '../../styles';

export const Route = createFileRoute('/subscription/$id/')({
    component: SubscriptionDetailPage,
});

function SubscriptionDetailPage() {
    const navigate = useNavigate();
    const { id } = Route.useParams();

    const activeSubItems = useActiveSubscriptionStore((state) => state.items);
    const removeActiveSubItem = useActiveSubscriptionStore(
        (state) => state.removeItem
    );

    const candidateSubItems = useSubscriptionCandidateStore(
        (state) => state.items
    );
    const removeCandidateSubItem = useSubscriptionCandidateStore(
        (state) => state.removeItem
    );

    const item = [...activeSubItems, ...candidateSubItems].find(
        (i) => i.id === id
    );

    if (!item) {
        return (
            <div className={styles.pageStack}>
                <p>サブスクが見つかりません</p>
                <button
                    type="button"
                    onClick={() => navigate({ to: '/subscription' })}
                >
                    戻る
                </button>
            </div>
        );
    }

    const isActive = activeSubItems.some((i) => i.id === id);
    const categoryName =
        SUBSCRIPTION_CATEGORIES[item.category]?.name || item.category;

    const handleDelete = () => {
        if (window.confirm('削除しますか？')) {
            if (isActive) {
                removeActiveSubItem(id);
            } else {
                removeCandidateSubItem(id);
            }
            navigate({ to: '/subscription' });
        }
    };

    const handleEdit = () => {
        navigate({ to: `/subscription/${id}/edit` });
    };

    const handleBack = () => {
        navigate({ to: '/subscription' });
    };

    return (
        <div className={styles.pageStack}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                }}
            >
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {item.name}
                </h1>
                <button type="button" onClick={handleBack}>
                    ✕
                </button>
            </div>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    marginBottom: '2rem',
                    padding: '1.5rem',
                    backgroundColor: '#fff',
                    borderRadius: '0.5rem',
                    border: '1px solid #e0e0e0',
                }}
            >
                <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                    <span style={{ color: '#666' }}>カテゴリ</span>
                    <span style={{ fontWeight: 'bold' }}>{categoryName}</span>
                </div>
                <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                    <span style={{ color: '#666' }}>月額</span>
                    <span style={{ fontWeight: 'bold' }}>
                        ¥{item.pricePerMonth.toLocaleString()}
                    </span>
                </div>
                <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                    <span style={{ color: '#666' }}>年額</span>
                    <span style={{ fontWeight: 'bold' }}>
                        ¥{item.pricePerYear.toLocaleString()}
                    </span>
                </div>
                {item.remark && (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                        }}
                    >
                        <span style={{ color: '#666' }}>備考</span>
                        <span>{item.remark}</span>
                    </div>
                )}
                {item.renewalMonth && (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                        }}
                    >
                        <span style={{ color: '#666' }}>更新月</span>
                        <span style={{ fontWeight: 'bold' }}>
                            {item.renewalMonth}月
                        </span>
                    </div>
                )}
                <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                    <span style={{ color: '#666' }}>ステータス</span>
                    <span style={{ fontWeight: 'bold' }}>
                        {isActive ? '契約中' : '追加候補'}
                    </span>
                </div>
            </div>

            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                }}
            >
                <button
                    type="button"
                    onClick={handleEdit}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        borderRadius: '0.5rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                    }}
                >
                    編集
                </button>
                <button
                    type="button"
                    onClick={handleDelete}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        borderRadius: '0.5rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                    }}
                >
                    削除
                </button>
            </div>
        </div>
    );
}
