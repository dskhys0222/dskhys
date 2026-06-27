import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import { useBudgetSyncStore } from '@/store/budgetSyncStore';
import { css } from '../../../styled-system/css';

const loginSchema = z.object({
    email: z.string().email('有効なメールアドレスを入力してください'),
    password: z.string().min(1, 'パスワードを入力してください'),
});

type LoginForm = z.infer<typeof loginSchema>;

const styles = {
    section: css({
        display: 'flex',
        flexDirection: 'column',
        gap: '4',
        p: '6',
        bg: 'white',
        borderRadius: 'lg',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'gray.200',
    }),
    sectionTitle: css({
        fontSize: 'md',
        fontWeight: 'bold',
        color: 'gray.800',
    }),
    label: css({
        fontSize: 'sm',
        fontWeight: 'medium',
        color: 'gray.700',
    }),
    input: css({
        w: 'full',
        px: '3',
        py: '2',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'gray.300',
        borderRadius: 'md',
        fontSize: 'sm',
        outline: 'none',
        _focus: {
            borderColor: 'blue.500',
            boxShadow: '0 0 0 2px token(colors.blue.100)',
        },
    }),
    errorText: css({
        fontSize: 'xs',
        color: 'red.600',
        mt: '1',
    }),
    button: css({
        px: '4',
        py: '2',
        borderRadius: 'md',
        fontSize: 'sm',
        fontWeight: 'medium',
        cursor: 'pointer',
        transition: 'background 0.2s',
        bg: 'blue.600',
        color: 'white',
        _hover: { bg: 'blue.700' },
        _disabled: { opacity: 0.5, cursor: 'not-allowed' },
    }),
    dangerButton: css({
        px: '4',
        py: '2',
        borderRadius: 'md',
        fontSize: 'sm',
        fontWeight: 'medium',
        cursor: 'pointer',
        transition: 'background 0.2s',
        bg: 'red.600',
        color: 'white',
        _hover: { bg: 'red.700' },
    }),
    row: css({
        display: 'flex',
        flexDirection: 'column',
        gap: '1',
    }),
    buttonRow: css({
        display: 'flex',
        gap: '2',
        flexWrap: 'wrap',
    }),
    statusBadge: css({
        display: 'inline-flex',
        alignItems: 'center',
        gap: '1',
        px: '2',
        py: '0.5',
        borderRadius: 'full',
        fontSize: 'xs',
        fontWeight: 'medium',
    }),
    errorBanner: css({
        p: '3',
        bg: 'red.50',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'red.200',
        borderRadius: 'md',
        fontSize: 'sm',
        color: 'red.700',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '2',
    }),
    infoText: css({
        fontSize: 'sm',
        color: 'gray.500',
    }),
};

export function SyncSettings() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const apiUrl = useAuthStore((s) => s.apiUrl);
    const login = useAuthStore((s) => s.login);
    const logout = useAuthStore((s) => s.logout);
    const setApiUrl = useAuthStore((s) => s.setApiUrl);

    const encryptionKey = useBudgetSyncStore((s) => s.encryptionKey);
    const isSyncing = useBudgetSyncStore((s) => s.isSyncing);
    const lastSyncedAt = useBudgetSyncStore((s) => s.lastSyncedAt);
    const syncError = useBudgetSyncStore((s) => s.syncError);
    const push = useBudgetSyncStore((s) => s.push);
    const pull = useBudgetSyncStore((s) => s.pull);
    const setEncryptionKey = useBudgetSyncStore((s) => s.setEncryptionKey);
    const clearError = useBudgetSyncStore((s) => s.clearError);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

    const onLogin = async (data: LoginForm) => {
        try {
            await login(data.email, data.password);
        } catch (e) {
            setError('root', {
                message:
                    e instanceof Error ? e.message : 'ログインに失敗しました',
            });
        }
    };

    const formattedLastSync = lastSyncedAt
        ? new Date(lastSyncedAt).toLocaleString('ja-JP')
        : null;

    return (
        <div
            className={css({
                display: 'flex',
                flexDirection: 'column',
                gap: '6',
            })}
        >
            {/* API URL 設定 */}
            <div className={styles.section}>
                <div className={styles.sectionTitle}>サーバー設定</div>
                <div className={styles.row}>
                    <label className={styles.label} htmlFor="api-url">
                        API URL
                    </label>
                    <input
                        id="api-url"
                        type="url"
                        className={styles.input}
                        value={apiUrl}
                        onChange={(e) => setApiUrl(e.target.value)}
                        placeholder="https://example.com"
                        autoComplete="off"
                    />
                </div>
            </div>

            {/* ログイン / ログアウト */}
            <div className={styles.section}>
                <div className={styles.sectionTitle}>認証</div>

                {isAuthenticated ? (
                    <div
                        className={css({
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '3',
                        })}
                    >
                        <div className={styles.infoText}>ログイン中です。</div>
                        <div>
                            <button
                                type="button"
                                className={styles.dangerButton}
                                onClick={() => logout()}
                            >
                                ログアウト
                            </button>
                        </div>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit(onLogin)}
                        className={css({
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '3',
                        })}
                        noValidate
                    >
                        <div className={styles.row}>
                            <label
                                className={styles.label}
                                htmlFor="login-email"
                            >
                                メールアドレス
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                className={styles.input}
                                autoComplete="email"
                                {...register('email')}
                            />
                            {errors.email && (
                                <span className={styles.errorText}>
                                    {errors.email.message}
                                </span>
                            )}
                        </div>
                        <div className={styles.row}>
                            <label
                                className={styles.label}
                                htmlFor="login-password"
                            >
                                パスワード
                            </label>
                            <input
                                id="login-password"
                                type="password"
                                className={styles.input}
                                autoComplete="current-password"
                                {...register('password')}
                            />
                            {errors.password && (
                                <span className={styles.errorText}>
                                    {errors.password.message}
                                </span>
                            )}
                        </div>
                        {errors.root && (
                            <span className={styles.errorText}>
                                {errors.root.message}
                            </span>
                        )}
                        <div>
                            <button
                                type="submit"
                                className={styles.button}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'ログイン中...' : 'ログイン'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* 暗号化キー設定 */}
            <div className={styles.section}>
                <div className={styles.sectionTitle}>暗号化キー</div>
                <div className={styles.row}>
                    <label className={styles.label} htmlFor="encryption-key">
                        暗号化キー
                    </label>
                    <input
                        id="encryption-key"
                        type="password"
                        className={styles.input}
                        value={encryptionKey}
                        onChange={(e) => setEncryptionKey(e.target.value)}
                        placeholder="任意の文字列（複数デバイスで共有するキー）"
                        autoComplete="off"
                    />
                    <span className={styles.infoText}>
                        データはこのキーでE2E暗号化されてサーバーに保存されます。
                    </span>
                </div>
            </div>

            {/* 同期操作 */}
            <div className={styles.section}>
                <div className={styles.sectionTitle}>同期</div>

                {syncError && (
                    <div className={styles.errorBanner}>
                        <span>{syncError}</span>
                        <button
                            type="button"
                            onClick={clearError}
                            className={css({
                                fontSize: 'xs',
                                color: 'red.700',
                                fontWeight: 'medium',
                                cursor: 'pointer',
                                flexShrink: 0,
                            })}
                        >
                            閉じる
                        </button>
                    </div>
                )}

                {formattedLastSync && (
                    <div className={styles.infoText}>
                        最終同期: {formattedLastSync}
                    </div>
                )}

                <div className={styles.buttonRow}>
                    <button
                        type="button"
                        className={styles.button}
                        disabled={
                            isSyncing || !isAuthenticated || !encryptionKey
                        }
                        onClick={() => push()}
                    >
                        {isSyncing ? '同期中...' : '今すぐ同期（アップロード）'}
                    </button>
                    <button
                        type="button"
                        className={css({
                            px: '4',
                            py: '2',
                            borderRadius: 'md',
                            fontSize: 'sm',
                            fontWeight: 'medium',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            bg: 'gray.100',
                            color: 'gray.800',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: 'gray.300',
                            _hover: { bg: 'gray.200' },
                            _disabled: {
                                opacity: 0.5,
                                cursor: 'not-allowed',
                            },
                        })}
                        disabled={
                            isSyncing || !isAuthenticated || !encryptionKey
                        }
                        onClick={() => pull()}
                    >
                        {isSyncing ? '同期中...' : 'サーバーから復元'}
                    </button>
                </div>
            </div>
        </div>
    );
}
