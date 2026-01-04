import { styles } from './styles';

export default function Header() {
    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                <div className={styles.title}>Budget</div>
            </div>
        </header>
    );
}
