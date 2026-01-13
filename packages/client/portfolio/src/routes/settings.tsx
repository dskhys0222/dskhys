import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import {
    useCustomAggregationsStore,
    useMFDataStore,
    useSettingsStore,
    useStocksStore,
} from '../stores';
import { exportToJSON, importFromJSON } from '../utils/storage';
import { settingsStyles } from './settings.styles';

export const Route = createFileRoute('/settings')({
    component: SettingsPage,
});

function SettingsPage() {
    const stocks = useStocksStore((state) => state.stocks);
    const settings = useSettingsStore((state) => state.settings);
    const customAggregations = useCustomAggregationsStore(
        (state) => state.customAggregations
    );
    const [message, setMessage] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // MF同期設定
    const encryptionKey = useMFDataStore((state) => state.encryptionKey);
    const syncConfig = useMFDataStore((state) => state.syncConfig);
    const mfData = useMFDataStore((state) => state.mfData);
    const isLoading = useMFDataStore((state) => state.isLoading);
    const accessToken = useMFDataStore((state) => state.accessToken);
    const setEncryptionKey = useMFDataStore((state) => state.setEncryptionKey);
    const saveSyncConfig = useMFDataStore((state) => state.saveSyncConfig);
    const loadEncryptionKey = useMFDataStore(
        (state) => state.loadEncryptionKey
    );
    const loadSyncConfig = useMFDataStore((state) => state.loadSyncConfig);
    const loadTokens = useMFDataStore((state) => state.loadTokens);
    const login = useMFDataStore((state) => state.login);
    const logout = useMFDataStore((state) => state.logout);

    const [mfApiUrl, setMfApiUrl] = useState('');
    const [mfEncryptionKey, setMfEncryptionKey] = useState('');
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    useEffect(() => {
        loadEncryptionKey();
        loadSyncConfig();
        loadTokens();
    }, [loadEncryptionKey, loadSyncConfig, loadTokens]);

    useEffect(() => {
        setMfApiUrl(syncConfig.apiUrl);
        setMfEncryptionKey(encryptionKey);
    }, [syncConfig.apiUrl, encryptionKey]);

    const handleExport = () => {
        try {
            const data = {
                stocks,
                settings,
                customAggregations,
                exportedAt: new Date().toISOString(),
                version: '1.0.0',
            };
            const json = exportToJSON(data);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setMessage({
                type: 'success',
                text: 'データをエクスポートしました。',
            });
        } catch (_error) {
            setMessage({
                type: 'error',
                text: 'エクスポートに失敗しました。',
            });
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = e.target?.result as string;
                const data = importFromJSON<{
                    stocks: typeof stocks;
                    settings: typeof settings;
                    customAggregations: typeof customAggregations;
                }>(json);

                if (data.stocks && Array.isArray(data.stocks)) {
                    useStocksStore.setState({ stocks: data.stocks });
                    useStocksStore.getState().saveStocks();
                }

                if (data.settings) {
                    useSettingsStore.setState({ settings: data.settings });
                    useSettingsStore.getState().saveSettings();
                }

                if (
                    data.customAggregations &&
                    Array.isArray(data.customAggregations)
                ) {
                    useCustomAggregationsStore.setState({
                        customAggregations: data.customAggregations,
                    });
                    useCustomAggregationsStore
                        .getState()
                        .saveCustomAggregations();
                }

                setMessage({
                    type: 'success',
                    text: `${data.stocks?.length || 0}件の銘柄データと${data.customAggregations?.length || 0}件のカスタム集計をインポートしました。`,
                });
            } catch (_error) {
                setMessage({
                    type: 'error',
                    text: 'インポートに失敗しました。ファイル形式を確認してください。',
                });
            }
        };
        reader.readAsText(file);

        // ファイル選択をリセット
        event.target.value = '';
    };

    const handleClearData = () => {
        if (
            confirm('すべてのデータを削除しますか？この操作は取り消せません。')
        ) {
            useStocksStore.setState({ stocks: [] });
            useStocksStore.getState().saveStocks();
            useSettingsStore.setState({
                settings: {
                    version: '2.0.0',
                },
            });
            useSettingsStore.getState().saveSettings();
            useCustomAggregationsStore.setState({ customAggregations: [] });
            useCustomAggregationsStore.getState().saveCustomAggregations();
            setMessage({
                type: 'success',
                text: 'すべてのデータを削除しました。',
            });
        }
    };

    const handleSaveMFConfig = () => {
        saveSyncConfig({ apiUrl: mfApiUrl });
        setEncryptionKey(mfEncryptionKey);
        setMessage({
            type: 'success',
            text: 'マネーフォワード同期設定を保存しました。',
        });
    };

    const handleLogin = async () => {
        const success = await login(
            syncConfig.apiUrl,
            loginEmail,
            loginPassword
        );
        if (success) {
            setLoginPassword('');
            setMessage({
                type: 'success',
                text: 'ログインしました。',
            });
        } else {
            setMessage({
                type: 'error',
                text: 'ログインに失敗しました。',
            });
        }
    };

    const handleLogout = () => {
        logout();
        setMessage({
            type: 'success',
            text: 'ログアウトしました。',
        });
    };

    return (
        <div className={settingsStyles.page}>
            <h2 className={settingsStyles.title}>設定</h2>

            {/* データ管理 */}
            <div className={settingsStyles.section}>
                <h3 className={settingsStyles.sectionTitle}>データ管理</h3>
                <p className={settingsStyles.sectionDescription}>
                    ポートフォリオデータのバックアップと復元ができます。
                </p>

                <div className={settingsStyles.buttonGroup}>
                    <button
                        type="button"
                        onClick={handleExport}
                        className={`${settingsStyles.button} ${settingsStyles.exportButton}`}
                    >
                        📤 エクスポート
                    </button>
                    <button
                        type="button"
                        onClick={handleImportClick}
                        className={`${settingsStyles.button} ${settingsStyles.importButton}`}
                    >
                        📥 インポート
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className={settingsStyles.fileInput}
                    />
                </div>

                <div className={settingsStyles.info}>
                    <p>
                        <span className={settingsStyles.infoLabel}>
                            登録銘柄数:
                        </span>{' '}
                        {stocks.length}件
                    </p>
                    <p>
                        <span className={settingsStyles.infoLabel}>
                            カスタム集計数:
                        </span>{' '}
                        {customAggregations.length}個
                    </p>
                </div>

                {message && (
                    <div
                        className={
                            message.type === 'success'
                                ? settingsStyles.successMessage
                                : settingsStyles.errorMessage
                        }
                    >
                        {message.text}
                    </div>
                )}
            </div>

            {/* マネーフォワード同期設定 */}
            <div className={settingsStyles.section}>
                <h3 className={settingsStyles.sectionTitle}>
                    マネーフォワード同期
                </h3>
                <p className={settingsStyles.sectionDescription}>
                    マネーフォワードからデータを取得するための設定を行います。
                </p>

                {/* 最終更新情報 */}
                {mfData && (
                    <div className={settingsStyles.mfDataInfo}>
                        <p className={settingsStyles.mfDataInfoPrimary}>
                            <strong>最終更新:</strong>{' '}
                            {new Date(mfData.scrapedAt).toLocaleString()}
                        </p>
                        <p className={settingsStyles.mfDataInfoSecondary}>
                            <strong>登録銘柄数:</strong> {mfData.stocks.length}
                        </p>
                    </div>
                )}

                {/* ログイン・ログアウト */}
                {accessToken ? (
                    <div className={settingsStyles.mfLoginInfo}>
                        <div className={settingsStyles.mfLoginStatus}>
                            ✓ ログイン済み
                        </div>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className={settingsStyles.mfLogoutButton}
                        >
                            ログアウト
                        </button>
                    </div>
                ) : (
                    <div className={settingsStyles.mfLoginForm}>
                        <div className={settingsStyles.mfFormGroup}>
                            <label
                                htmlFor="login-email"
                                className={settingsStyles.mfLabel}
                            >
                                メールアドレス
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                placeholder="user@example.com"
                                className={settingsStyles.mfInput}
                            />
                        </div>
                        <div className={settingsStyles.mfFormGroup}>
                            <label
                                htmlFor="login-password"
                                className={settingsStyles.mfLabel}
                            >
                                パスワード
                            </label>
                            <input
                                id="login-password"
                                type="password"
                                value={loginPassword}
                                onChange={(e) =>
                                    setLoginPassword(e.target.value)
                                }
                                placeholder="パスワード"
                                className={settingsStyles.mfInput}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleLogin}
                            disabled={
                                isLoading || !loginEmail || !loginPassword
                            }
                            className={settingsStyles.mfLoginButton}
                        >
                            {isLoading ? 'ログイン中...' : 'ログイン'}
                        </button>
                    </div>
                )}

                <div className={settingsStyles.mfConfigForm}>
                    <div className={settingsStyles.mfConfigGroup}>
                        <label
                            htmlFor="mf-api-url"
                            className={settingsStyles.mfConfigLabel}
                        >
                            API URL
                        </label>
                        <input
                            id="mf-api-url"
                            type="url"
                            value={mfApiUrl}
                            onChange={(e) => setMfApiUrl(e.target.value)}
                            placeholder="https://example.com"
                            className={settingsStyles.mfConfigInput}
                        />
                    </div>

                    <div className={settingsStyles.mfConfigGroup}>
                        <label
                            htmlFor="mf-api-username"
                            className={settingsStyles.mfConfigLabel}
                        >
                            暗号化キー
                        </label>
                        <input
                            id="mf-encryption-key"
                            type="password"
                            value={mfEncryptionKey}
                            onChange={(e) => setMfEncryptionKey(e.target.value)}
                            placeholder="暗号化キーを入力"
                            className={settingsStyles.mfConfigInput}
                        />
                        <p className={settingsStyles.mfConfigNote}>
                            バッチ処理で使用しているのと同じ暗号化キーを入力してください。
                        </p>
                    </div>

                    <div>
                        <button
                            type="button"
                            onClick={handleSaveMFConfig}
                            className={`${settingsStyles.button} ${settingsStyles.exportButton}`}
                        >
                            💾 設定を保存
                        </button>
                    </div>
                </div>
            </div>

            {/* 危険な操作 */}
            <div className={settingsStyles.section}>
                <h3 className={settingsStyles.sectionTitle}>データの削除</h3>
                <p className={settingsStyles.sectionDescription}>
                    すべてのデータを削除します。この操作は取り消せません。
                </p>

                <div className={settingsStyles.buttonGroup}>
                    <button
                        type="button"
                        onClick={handleClearData}
                        className={`${settingsStyles.button} ${settingsStyles.dangerButton}`}
                    >
                        🗑️ すべてのデータを削除
                    </button>
                </div>
            </div>

            {/* アプリ情報 */}
            <div className={settingsStyles.section}>
                <h3 className={settingsStyles.sectionTitle}>アプリ情報</h3>
                <div className={settingsStyles.info}>
                    <p>
                        <span className={settingsStyles.infoLabel}>
                            アプリ名:
                        </span>{' '}
                        Portfolio
                    </p>
                    <p>
                        <span className={settingsStyles.infoLabel}>
                            バージョン:
                        </span>{' '}
                        1.0.0
                    </p>
                    <p>
                        <span className={settingsStyles.infoLabel}>
                            データ保存先:
                        </span>{' '}
                        ローカルストレージ（このデバイスのみ）
                    </p>
                </div>
            </div>
        </div>
    );
}
