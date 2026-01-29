import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { SubscriptionTable } from '@/components/SubscriptionTable';
import { SUBSCRIPTION_CATEGORIES } from '@/constants/categories';
import {
    useActiveSubscriptionStore,
    useSubscriptionCandidateStore,
} from '@/store/subscriptionStore';
import { styles } from '../styles';

export const Route = createFileRoute('/subscription/')({
    component: SubscriptionPage,
});

export default function SubscriptionPage() {
    const navigate = useNavigate();
    const activeSubItems = useActiveSubscriptionStore((state) => state.items);
    const removeActiveSubItem = useActiveSubscriptionStore(
        (state) => state.removeItem
    );
    const addActiveSubItem = useActiveSubscriptionStore(
        (state) => state.addItem
    );

    const candidateSubItems = useSubscriptionCandidateStore(
        (state) => state.items
    );
    const removeCandidateSubItem = useSubscriptionCandidateStore(
        (state) => state.removeItem
    );
    const addCandidateSubItem = useSubscriptionCandidateStore(
        (state) => state.addItem
    );

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
            <h1
                style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                }}
            >
                サブスクリプション管理
            </h1>
            <SubscriptionTable
                title="契約中のサブスク"
                items={activeSubItems}
                categories={SUBSCRIPTION_CATEGORIES}
                onAdd={() => navigate({ to: '/subscription/add' })}
                onCardClick={(id) => navigate({ to: `/subscription/${id}` })}
                onRemove={removeActiveSubItem}
                onMove={handleMoveToCandidate}
                moveButtonLabel="候補へ"
            />
            <SubscriptionTable
                title="サブスク追加候補"
                items={candidateSubItems}
                categories={SUBSCRIPTION_CATEGORIES}
                onAdd={() => navigate({ to: '/subscription/add' })}
                onCardClick={(id) => navigate({ to: `/subscription/${id}` })}
                onRemove={removeCandidateSubItem}
                onMove={handleMoveToActive}
                moveButtonLabel="契約へ"
            />
        </div>
    );
}
