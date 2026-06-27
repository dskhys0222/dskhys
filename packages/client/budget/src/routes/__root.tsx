import { TanStackDevtools } from '@tanstack/react-devtools';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

import { Header } from '@/components/Header';
import { useAutoSync } from '@/hooks/useAutoSync';
import { styles } from './styles';

function RootComponent() {
    useAutoSync();
    return (
        <div className={styles.app}>
            <Header />
            <main className={styles.main}>
                <Outlet />
            </main>
            <TanStackDevtools
                config={{
                    position: 'bottom-right',
                }}
                plugins={[
                    {
                        name: 'Tanstack Router',
                        render: <TanStackRouterDevtoolsPanel />,
                    },
                ]}
            />
        </div>
    );
}

export const Route = createRootRoute({
    component: RootComponent,
});
