import { createFileRoute } from '@tanstack/react-router';
import { BudgetItem } from '@/components/BudgetItem';
import { styles } from './styles';

export const Route = createFileRoute('/')({
    component: App,
});

function App() {
    return (
        <div className={styles.pageStack}>
            <BudgetItem name="モノ" />
            <BudgetItem name="コト" />
        </div>
    );
}
