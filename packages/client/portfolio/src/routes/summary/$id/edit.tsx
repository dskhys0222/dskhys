import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useCustomAggregationsStore, useStocksStore } from '../../../stores';
import type {
    CustomAggregationAttribute,
    CustomAggregationStockAssignment,
} from '../../../types';
import { newAggregationStyles } from '../new.styles';

export const Route = createFileRoute('/summary/$id/edit')({
    component: EditCustomAggregationPage,
});

const DEFAULT_COLORS = [
    '#2E7D32', // 緑
    '#1976D2', // 青
    '#F57C00', // オレンジ
    '#7B1FA2', // 紫
    '#C62828', // 赤
    '#00838F', // シアン
    '#558B2F', // ライム
    '#6D4C41', // 茶
    '#FFD700', // 金
];

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY',
        maximumFractionDigits: 0,
    }).format(value);
}

function EditCustomAggregationPage() {
    const navigate = useNavigate();
    const { id } = Route.useParams();
    const stocks = useStocksStore((state) => state.stocks);
    const customAggregations = useCustomAggregationsStore(
        (state) => state.customAggregations
    );
    const updateCustomAggregation = useCustomAggregationsStore(
        (state) => state.updateCustomAggregation
    );

    const aggregation = customAggregations.find((a) => a.id === id);

    const [name, setName] = useState('');
    const [attributes, setAttributes] = useState<CustomAggregationAttribute[]>([
        { name: '', color: DEFAULT_COLORS[0] },
    ]);
    const [stockAssignments, setStockAssignments] = useState<
        Record<string, string>
    >({});
    const [errors, setErrors] = useState<{
        name?: string;
        attributes?: string;
    }>({});

    // 初期値を設定
    useEffect(() => {
        if (aggregation) {
            setName(aggregation.name);
            setAttributes(
                aggregation.attributes.length > 0
                    ? aggregation.attributes
                    : [{ name: '', color: DEFAULT_COLORS[0] }]
            );
            const assignments: Record<string, string> = {};
            for (const assignment of aggregation.stockAssignments) {
                assignments[assignment.stockId] = assignment.attributeName;
            }
            setStockAssignments(assignments);
        }
    }, [aggregation]);

    if (!aggregation) {
        return (
            <div className={newAggregationStyles.page}>
                <h2 className={newAggregationStyles.title}>
                    カスタム集計が見つかりません
                </h2>
                <Link
                    to="/summary"
                    className={newAggregationStyles.cancelButton}
                >
                    集計画面に戻る
                </Link>
            </div>
        );
    }

    const handleAddAttribute = () => {
        const nextColor =
            DEFAULT_COLORS[attributes.length % DEFAULT_COLORS.length];
        setAttributes([...attributes, { name: '', color: nextColor }]);
    };

    const handleRemoveAttribute = (index: number) => {
        if (attributes.length <= 1) return;
        const removedName = attributes[index].name;
        setAttributes(attributes.filter((_, i) => i !== index));
        // 削除された属性を持つ銘柄の割り当てを解除
        const newAssignments = { ...stockAssignments };
        for (const [stockId, attrName] of Object.entries(newAssignments)) {
            if (attrName === removedName) {
                delete newAssignments[stockId];
            }
        }
        setStockAssignments(newAssignments);
    };

    const handleAttributeNameChange = (index: number, newName: string) => {
        const oldName = attributes[index].name;
        const newAttributes = [...attributes];
        newAttributes[index] = { ...newAttributes[index], name: newName };
        setAttributes(newAttributes);
        // 属性名が変更された場合、割り当ても更新
        if (oldName) {
            const newAssignments = { ...stockAssignments };
            for (const [stockId, attrName] of Object.entries(newAssignments)) {
                if (attrName === oldName) {
                    newAssignments[stockId] = newName;
                }
            }
            setStockAssignments(newAssignments);
        }
    };

    const handleAttributeColorChange = (index: number, color: string) => {
        const newAttributes = [...attributes];
        newAttributes[index] = { ...newAttributes[index], color };
        setAttributes(newAttributes);
    };

    const handleStockAssignmentChange = (
        stockId: string,
        attributeName: string
    ) => {
        if (attributeName === '') {
            const newAssignments = { ...stockAssignments };
            delete newAssignments[stockId];
            setStockAssignments(newAssignments);
        } else {
            setStockAssignments({
                ...stockAssignments,
                [stockId]: attributeName,
            });
        }
    };

    const validate = (): boolean => {
        const newErrors: { name?: string; attributes?: string } = {};

        if (!name.trim()) {
            newErrors.name = '集計名を入力してください';
        }

        const validAttributes = attributes.filter((a) => a.name.trim());
        if (validAttributes.length === 0) {
            newErrors.attributes = '少なくとも1つの属性を入力してください';
        }

        // 属性名の重複チェック
        const attrNames = validAttributes.map((a) => a.name.trim());
        if (new Set(attrNames).size !== attrNames.length) {
            newErrors.attributes = '属性名が重複しています';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const validAttributes = attributes.filter((a) => a.name.trim());
        const validAssignments: CustomAggregationStockAssignment[] =
            Object.entries(stockAssignments)
                .filter(([_, attrName]) =>
                    validAttributes.some((a) => a.name === attrName)
                )
                .map(([stockId, attributeName]) => ({
                    stockId,
                    attributeName,
                }));

        updateCustomAggregation(id, {
            name: name.trim(),
            attributes: validAttributes,
            stockAssignments: validAssignments,
        });

        navigate({ to: '/summary' });
    };

    const validAttributeNames = attributes
        .filter((a) => a.name.trim())
        .map((a) => a.name);

    return (
        <div className={newAggregationStyles.page}>
            <div className={newAggregationStyles.header}>
                <h2 className={newAggregationStyles.title}>
                    カスタム集計を編集
                </h2>
            </div>

            <form onSubmit={handleSubmit} className={newAggregationStyles.form}>
                {/* 集計名 */}
                <div className={newAggregationStyles.section}>
                    <h3 className={newAggregationStyles.sectionTitle}>
                        集計名称
                    </h3>
                    <div className={newAggregationStyles.field}>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`${newAggregationStyles.input} ${errors.name ? newAggregationStyles.inputError : ''}`}
                            placeholder="例: コア・サテライト"
                        />
                        {errors.name && (
                            <span className={newAggregationStyles.error}>
                                {errors.name}
                            </span>
                        )}
                    </div>
                </div>

                {/* 属性設定 */}
                <div className={newAggregationStyles.section}>
                    <h3 className={newAggregationStyles.sectionTitle}>
                        属性設定
                    </h3>
                    <div className={newAggregationStyles.attributeList}>
                        {attributes.map((attr, index) => (
                            <div
                                // biome-ignore lint/suspicious/noArrayIndexKey: TODO: fix key
                                key={index}
                                className={newAggregationStyles.attributeItem}
                            >
                                <input
                                    type="color"
                                    value={attr.color}
                                    onChange={(e) =>
                                        handleAttributeColorChange(
                                            index,
                                            e.target.value
                                        )
                                    }
                                    className={newAggregationStyles.colorInput}
                                />
                                <input
                                    type="text"
                                    value={attr.name}
                                    onChange={(e) =>
                                        handleAttributeNameChange(
                                            index,
                                            e.target.value
                                        )
                                    }
                                    className={newAggregationStyles.input}
                                    placeholder="属性名（例: コア）"
                                    style={{ flex: 1 }}
                                />
                                <input
                                    type="number"
                                    value={attr.targetRatio ?? ''}
                                    onChange={(e) => {
                                        const newAttributes = [...attributes];
                                        newAttributes[index] = {
                                            ...newAttributes[index],
                                            targetRatio: e.target.value
                                                ? Number(e.target.value)
                                                : undefined,
                                        };
                                        setAttributes(newAttributes);
                                    }}
                                    className={newAggregationStyles.input}
                                    placeholder="理想比"
                                    min="0"
                                    step="0.1"
                                    style={{ width: '80px' }}
                                />
                                {attributes.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleRemoveAttribute(index)
                                        }
                                        className={
                                            newAggregationStyles.removeButton
                                        }
                                    >
                                        削除
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddAttribute}
                            className={newAggregationStyles.addAttributeButton}
                        >
                            + 属性を追加
                        </button>
                    </div>
                    {errors.attributes && (
                        <span className={newAggregationStyles.error}>
                            {errors.attributes}
                        </span>
                    )}
                </div>

                {/* 銘柄への属性割り当て */}
                <div className={newAggregationStyles.section}>
                    <h3 className={newAggregationStyles.sectionTitle}>
                        銘柄への属性割り当て
                    </h3>
                    {stocks.length === 0 ? (
                        <div className={newAggregationStyles.emptyState}>
                            銘柄が登録されていません
                        </div>
                    ) : (
                        <div className={newAggregationStyles.stockList}>
                            {stocks.map((stock) => (
                                <div
                                    key={stock.id}
                                    className={newAggregationStyles.stockItem}
                                >
                                    <div
                                        className={
                                            newAggregationStyles.stockInfo
                                        }
                                    >
                                        <span
                                            className={
                                                newAggregationStyles.stockTicker
                                            }
                                        >
                                            {stock.ticker}
                                        </span>
                                        <span
                                            className={
                                                newAggregationStyles.stockName
                                            }
                                        >
                                            {stock.name}
                                        </span>
                                        <span
                                            className={
                                                newAggregationStyles.stockValue
                                            }
                                        >
                                            {formatCurrency(stock.value)}
                                        </span>
                                    </div>
                                    <select
                                        value={stockAssignments[stock.id] || ''}
                                        onChange={(e) =>
                                            handleStockAssignmentChange(
                                                stock.id,
                                                e.target.value
                                            )
                                        }
                                        className={newAggregationStyles.select}
                                    >
                                        <option value="">未割り当て</option>
                                        {validAttributeNames.map((attrName) => (
                                            <option
                                                key={attrName}
                                                value={attrName}
                                            >
                                                {attrName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ボタン */}
                <div className={newAggregationStyles.buttons}>
                    <Link
                        to="/summary"
                        className={newAggregationStyles.cancelButton}
                    >
                        キャンセル
                    </Link>
                    <button
                        type="submit"
                        className={newAggregationStyles.submitButton}
                    >
                        更新
                    </button>
                </div>
            </form>
        </div>
    );
}
