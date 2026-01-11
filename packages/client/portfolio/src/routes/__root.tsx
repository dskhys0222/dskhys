import { createRootRoute, Outlet } from '@tanstack/react-router';
import Header from '../components/Header';
import { styles } from './styles';

function NotFound() {
    return (
        <div className={styles.notFound}>
            <p>ページが見つかりません</p>
        </div>
    );
}

export const Route = createRootRoute({
    component: () => (
        <div className={styles.app}>
            <Header />
            <main className={styles.main}>
                <Outlet />
            </main>
        </div>
    ),
    notFoundComponent: NotFound,
});
