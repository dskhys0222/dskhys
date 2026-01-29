import { Link, useLocation } from '@tanstack/react-router';
import { styles } from './styles';

export function Header() {
    const location = useLocation();
    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };
    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                <div className={styles.title}>Budget</div>
                <nav style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link
                        to="/"
                        className={
                            isActive('/') ? styles.activeTab : styles.tab
                        }
                    >
                        ホーム
                    </Link>
                    <Link
                        to="/cash-flow"
                        className={
                            isActive('/cash-flow')
                                ? styles.activeTab
                                : styles.tab
                        }
                    >
                        収支
                    </Link>
                    <Link
                        to="/subscription"
                        className={
                            isActive('/subscription')
                                ? styles.activeTab
                                : styles.tab
                        }
                    >
                        サブスク
                    </Link>
                </nav>
            </div>
        </header>
    );
}
