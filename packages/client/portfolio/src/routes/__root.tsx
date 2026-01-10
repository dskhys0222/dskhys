import { createRootRoute, Outlet } from '@tanstack/react-router';
import Header from '../components/Header';
import { styles } from './styles';

export const Route = createRootRoute({
    component: () => (
        <div className={styles.app}>
            <Header />
            <main className={styles.main}>
                <Outlet />
            </main>
        </div>
    ),
});
