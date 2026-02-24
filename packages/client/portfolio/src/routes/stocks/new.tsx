import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { type StockFormData, stockSchema } from '../../schemas/stock';
import { useStocksStore } from '../../stores';
import { formStyles } from './form.styles';

export const Route = createFileRoute('/stocks/new')({
    component: NewStockPage,
});

function NewStockPage() {
    const navigate = useNavigate();
    const addStock = useStocksStore((state) => state.addStock);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<StockFormData>({
        // biome-ignore lint/suspicious/noExplicitAny: 互換性不足らしい
        resolver: zodResolver(stockSchema as any),
        defaultValues: {
            name: '',
            ticker: '',
            value: 0,
            currentPrice: undefined,
            units: undefined,
            averageCost: undefined,
            note: '',
            includeDividend: false,
            dividendAmount: undefined,
        },
    });

    const onSubmit = (data: StockFormData) => {
        addStock({ ...data, source: 'manual' });
        navigate({ to: '/' });
    };

    return (
        <div className={formStyles.page}>
            <h2 className={formStyles.title}>銘柄を追加</h2>

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
                                    className={`${formStyles.input} ${errors.name ? formStyles.inputError : ''}`}
                                    placeholder="例: Vanguard Total Stock Market ETF"
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
                                    placeholder="例: VTI"
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
                                    className={`${formStyles.input} ${errors.value ? formStyles.inputError : ''}`}
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
                                    className={`${formStyles.input} ${errors.currentPrice ? formStyles.inputError : ''}`}
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
                                    className={`${formStyles.input} ${errors.units ? formStyles.inputError : ''}`}
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
                                    className={`${formStyles.input} ${errors.averageCost ? formStyles.inputError : ''}`}
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
                        追加
                    </button>
                </div>
            </form>
        </div>
    );
}
