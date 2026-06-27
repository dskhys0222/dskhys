import { createFileRoute } from '@tanstack/react-router';
import { SyncSettings } from '@/components/SyncSettings';
import { styles } from '../styles';

export const Route = createFileRoute('/settings/')({
    component: SettingsPage,
});

function SettingsPage() {
    return (
        <div className={styles.pageStack}>
            <h1
                style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                }}
            >
                設定
            </h1>
            <SyncSettings />
        </div>
    );
}
