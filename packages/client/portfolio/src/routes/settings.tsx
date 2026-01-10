import { createFileRoute } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { useSettingsStore, useStocksStore } from '../stores';
import { exportToJSON, importFromJSON } from '../utils/storage';
import { settingsStyles } from './settings.styles';

export const Route = createFileRoute('/settings')({
    component: SettingsPage,
});

function SettingsPage() {
    const stocks = useStocksStore((state) => state.stocks);
    const settings = useSettingsStore((state) => state.settings);
    const [message, setMessage] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        try {
            const data = {
                stocks,
                settings,
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
                }>(json);

                if (data.stocks && Array.isArray(data.stocks)) {
                    useStocksStore.setState({ stocks: data.stocks });
                    useStocksStore.getState().saveStocks();
                }

                if (data.settings) {
                    useSettingsStore.setState({ settings: data.settings });
                    useSettingsStore.getState().saveSettings();
                }

                setMessage({
                    type: 'success',
                    text: `${data.stocks?.length || 0}件の銘柄データをインポートしました。`,
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
            setMessage({
                type: 'success',
                text: 'すべてのデータを削除しました。',
            });
        }
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
