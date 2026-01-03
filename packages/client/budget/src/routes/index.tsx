import { createFileRoute } from '@tanstack/react-router';
import { BudgetItem } from '@/components/BudgetItem';

export const Route = createFileRoute('/')({
    component: App,
});

function App() {
    return (
        <>
            <BudgetItem name="モノ" />
            <BudgetItem name="コト" />
        </>
    );
}
