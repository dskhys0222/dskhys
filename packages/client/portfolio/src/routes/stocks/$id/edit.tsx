import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { type StockFormData, stockSchema } from '../../../schemas/stock';
import { useStocksStore } from '../../../stores';
import { formStyles } from '../form.styles';

export const Route = createFileRoute('/stocks/$id/edit')({
    component: EditStockPage,
});

function EditStockPage() {
    const navigate = useNavigate();
    const { id } = Route.useParams();
    const stocks = useStocksStore((state) => state.stocks);
    const updateStock = useStocksStore((state) => state.updateStock);

    const stock = stocks.find((s) => s.id === id);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<StockFormData>({
        // biome-ignore lint/suspicious/noExplicitAny: 互換性不足らしい
        resolver: zodResolver(stockSchema as any),
        defaultValues: stock
            ? {
                  name: stock.name,
                  ticker: stock.ticker,
                  value: stock.value,
                  currentPrice: stock.currentPrice,
                  units: stock.units,
                  averageCost: stock.averageCost,
                  note: stock.note ?? '',
                  includeDividend: stock.includeDividend ?? false,
                  dividendAmount: stock.dividendAmount,
              }
            : undefined,
    });

    const onSubmit = (data: StockFormData) => {
        updateStock(id, data);
        navigate({ to: '/' });
    };

    if (!stock) {
        return (
            <div className={formStyles.page}>
                <h2 className={formStyles.title}>銘柄が見つかりません</h2>
                <Link to="/" className={formStyles.cancelButton}>
                    銘柄一覧に戻る
                </Link>
            </div>
        );
    }

    // MF由来の銘柄の場合、編集不可のフィールドがあることを警告
    const isMFStock = stock.source === 'mf';

    return (
        <div className={formStyles.page}>
            <h2 className={formStyles.title}>{stock.ticker} を編集</h2>

            {isMFStock && (
                <div
                    style={{
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        backgroundColor: '#fef3c7',
                        border: '1px solid #fcd34d',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        color: '#92400e',
                    }}
                >
                    <strong>
                        ℹ この銘柄はMoneyForwardから自動取得されています。
                    </strong>
                    <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                        ティッカーのみ変更できます。
                        評価額・基準価額・口数・平均取得単価は同期時に上書きされます。
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className={formStyles.form}>
                {/* 基本情報 */}
                <div className={formStyles.section}>
                    <h3 className={formStyles.sectionTitle}>基本情報</h3>
                    <div className={formStyles.fieldGroup}>
                        <div className={formStyles.field}>
                            <label className={formStyles.label}>
                                銘柄
                                <span className={formStyles.required}>*</span>
                                <input
                                    type="text"
                                    {...register('name')}
                                    disabled={isMFStock}
                                    className={`${formStyles.input} ${errors.name ? formStyles.inputError : ''} ${isMFStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                            </label>
                            {errors.name && (
                                <span className={formStyles.error}>
                                    {errors.name.message}
                                </span>
                            )}
                        </div>
                        <div className={formStyles.field}>
                            <label className={formStyles.label}>
                                ティッカー
                                <span className={formStyles.required}>*</span>
                                <input
                                    type="text"
                                    {...register('ticker')}
                                    className={`${formStyles.input} ${errors.ticker ? formStyles.inputError : ''}`}
                                />
                            </label>
                            {errors.ticker && (
                                <span className={formStyles.error}>
                                    {errors.ticker.message}
                                </span>
                            )}
                        </div>
                        <div className={formStyles.field}>
                            <label className={formStyles.label}>
                                評価額
                                <span className={formStyles.required}>*</span>
                                <input
                                    type="number"
                                    step="any"
                                    {...register('value', {
                                        valueAsNumber: true,
                                    })}
                                    disabled={isMFStock}
                                    className={`${formStyles.input} ${errors.value ? formStyles.inputError : ''} ${isMFStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                            </label>
                            {errors.value && (
                                <span className={formStyles.error}>
                                    {errors.value.message}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 保有情報（任意） */}
                <div className={formStyles.section}>
                    <h3 className={formStyles.sectionTitle}>
                        保有情報（任意）
                    </h3>
                    <div className={formStyles.fieldGroup}>
                        <div className={formStyles.field}>
                            <label className={formStyles.label}>
                                基準価額
                                <input
                                    type="number"
                                    step="any"
                                    {...register('currentPrice', {
                                        valueAsNumber: true,
                                    })}
                                    disabled={isMFStock}
                                    className={`${formStyles.input} ${errors.currentPrice ? formStyles.inputError : ''} ${isMFStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                            </label>
                            {errors.currentPrice && (
                                <span className={formStyles.error}>
                                    {errors.currentPrice.message}
                                </span>
                            )}
                        </div>
                        <div className={formStyles.field}>
                            <label className={formStyles.label}>
                                口数
                                <input
                                    type="number"
                                    step="any"
                                    {...register('units', {
                                        valueAsNumber: true,
                                    })}
                                    disabled={isMFStock}
                                    className={`${formStyles.input} ${errors.units ? formStyles.inputError : ''} ${isMFStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                            </label>
                            {errors.units && (
                                <span className={formStyles.error}>
                                    {errors.units.message}
                                </span>
                            )}
                        </div>
                        <div className={formStyles.field}>
                            <label className={formStyles.label}>
                                平均取得単価
                                <input
                                    type="number"
                                    step="any"
                                    {...register('averageCost', {
                                        valueAsNumber: true,
                                    })}
                                    disabled={isMFStock}
                                    className={`${formStyles.input} ${errors.averageCost ? formStyles.inputError : ''} ${isMFStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                            </label>
                            {errors.averageCost && (
                                <span className={formStyles.error}>
                                    {errors.averageCost.message}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 備考 */}
                <div className={formStyles.section}>
                    <h3 className={formStyles.sectionTitle}>備考</h3>
                    <div className={formStyles.fieldGroup}>
                        <div className={formStyles.field}>
                            <label className={formStyles.label}>
                                備考
                                <textarea
                                    {...register('note')}
                                    className={`${formStyles.textarea} ${errors.note ? formStyles.inputError : ''}`}
                                    rows={3}
                                    placeholder="自由に記入してください"
                                />
                            </label>
                            {errors.note && (
                                <span className={formStyles.error}>
                                    {errors.note.message}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 配当金情報（任意） */}
                <div className={formStyles.section}>
                    <h3 className={formStyles.sectionTitle}>
                        配当金情報（任意）
                    </h3>
                    <div className={formStyles.fieldGroup}>
                        <div className={formStyles.field}>
                            <label className={formStyles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    {...register('includeDividend')}
                                    className={formStyles.checkbox}
                                />
                                配当金集計に含める
                            </label>
                        </div>
                        <div className={formStyles.field}>
                            <label className={formStyles.label}>
                                1口あたりの年間配当金額
                                <input
                                    type="number"
                                    step="any"
                                    {...register('dividendAmount', {
                                        valueAsNumber: true,
                                    })}
                                    className={`${formStyles.input} ${errors.dividendAmount ? formStyles.inputError : ''}`}
                                    placeholder="例: 500"
                                />
                            </label>
                            {errors.dividendAmount && (
                                <span className={formStyles.error}>
                                    {errors.dividendAmount.message}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ボタン */}
                <div className={formStyles.buttons}>
                    <Link to="/" className={formStyles.cancelButton}>
                        キャンセル
                    </Link>
                    <button
                        type="submit"
                        className={formStyles.submitButton}
                        disabled={isSubmitting}
                    >
                        更新
                    </button>
                </div>
            </form>
        </div>
    );
}
