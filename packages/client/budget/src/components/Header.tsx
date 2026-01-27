import { Link, useLocation } from '@tanstack/react-router';
import { styles } from './styles';

export default function Header() {
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
                        to="/income-expense"
                        className={
                            isActive('/income-expense')
                                ? styles.activeTab
                                : styles.tab
                        }
                    >
                        収入・支出
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
