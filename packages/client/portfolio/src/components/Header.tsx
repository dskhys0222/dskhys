import { Link, useLocation } from '@tanstack/react-router';
import { headerStyles } from './Header.styles';

export default function Header() {
    const location = useLocation();

    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    const getLinkClass = (path: string) => {
        return `${headerStyles.link} ${isActive(path) ? headerStyles.activeLink : ''}`;
    };

    return (
        <header className={headerStyles.header}>
            <div className={headerStyles.container}>
                <h1 className={headerStyles.title}>Portfolio</h1>
                <nav className={headerStyles.nav}>
                    <Link to="/" className={getLinkClass('/')}>
                        ホーム
                    </Link>
                    <Link to="/summary" className={getLinkClass('/summary')}>
                        集計
                    </Link>
                    <Link to="/settings" className={getLinkClass('/settings')}>
                        設定
                    </Link>
                </nav>
            </div>
        </header>
    );
}
