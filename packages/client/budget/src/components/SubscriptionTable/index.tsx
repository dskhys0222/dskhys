import { useState } from 'react';
import type { Category } from '@/constants/categories';
import type { SubscriptionItem } from '@/store/subscriptionStore';

interface SubscriptionTableProps {
    title: string;
    items: SubscriptionItem[];
    categories: Record<string, Category>;
    onAdd: (item: Omit<SubscriptionItem, 'id'>) => void;
    onRemove: (id: string) => void;
    onMove?: (id: string) => void;
    moveButtonLabel?: string;
}

const tableStyles = {
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '1.5rem',
        borderRadius: '0.375rem',
        backgroundColor: 'white',
        padding: '1rem',
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    } as const,
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid #e5e7eb',
    } as const,
    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#111827',
    } as const,
    stats: {
        display: 'flex',
        gap: '1rem',
        fontSize: '0.875rem',
        color: '#374151',
    } as const,
    statsItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    } as const,
    statsLabel: {
        fontSize: '0.75rem',
        color: '#6b7280',
        fontWeight: '500',
        textTransform: 'uppercase',
    } as const,
    statsValue: {
        fontSize: '1.125rem',
        fontWeight: 'bold',
        color: '#111827',
    } as const,
    tableWrapper: {
        overflowX: 'auto',
        borderRadius: '0.375rem',
        border: '1px solid #e5e7eb',
    } as const,
    table: {
        width: '100%',
        borderCollapse: 'collapse' as const,
        fontSize: '0.875rem',
    } as const,
    th: {
        padding: '0.5rem 0.75rem',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
        fontWeight: '600',
        color: '#374151',
        textAlign: 'left' as const,
        fontSize: '0.75rem',
        textTransform: 'uppercase',
    } as const,
    td: {
        padding: '0.5rem 0.75rem',
        color: '#374151',
        borderBottom: '1px solid #f3f4f6',
    } as const,
    categoryCell: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.25rem 0.5rem',
        borderRadius: '0.25rem',
        fontSize: '0.75rem',
        fontWeight: '500',
        border: '1px solid',
        whiteSpace: 'nowrap' as const,
    } as const,
    price: {
        textAlign: 'right' as const,
    } as const,
    deleteButton: {
        padding: '0.25rem 0.5rem',
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '0.25rem',
        cursor: 'pointer',
        fontSize: '0.75rem',
        fontWeight: '500',
        marginLeft: '0.25rem',
    } as const,
    moveButton: {
        padding: '0.25rem 0.5rem',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '0.25rem',
        cursor: 'pointer',
        fontSize: '0.75rem',
        fontWeight: '500',
        marginRight: '0.25rem',
    } as const,
    addForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '0.375rem',
        border: '1px solid #e5e7eb',
    } as const,
    formRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '0.75rem',
    } as const,
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    } as const,
    label: {
        fontSize: '0.875rem',
        fontWeight: '500',
        color: '#374151',
    } as const,
    input: {
        padding: '0.25rem 0.5rem',
        border: '1px solid #d1d5db',
        borderRadius: '0.25rem',
        fontSize: '0.875rem',
    } as const,
    select: {
        padding: '0.25rem 0.5rem',
        border: '1px solid #d1d5db',
        borderRadius: '0.25rem',
        fontSize: '0.875rem',
        backgroundColor: 'white',
        cursor: 'pointer',
    } as const,
    button: {
        padding: '0.5rem 1rem',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '0.25rem',
        fontWeight: '500',
        cursor: 'pointer',
    } as const,
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        color: '#9ca3af',
        textAlign: 'center' as const,
    } as const,
} as const;

export function SubscriptionTable({
    title,
    items,
    categories,
    onAdd,
    onRemove,
    onMove,
    moveButtonLabel = '移動',
}: SubscriptionTableProps) {
    const [formData, setFormData] = useState({
        category: Object.keys(categories)[0] || '',
        name: '',
        pricePerMonth: '',
        pricePerYear: '',
        remark: '',
        renewalMonth: '',
    });

    const totalMonthly = items.reduce(
        (sum, item) => sum + item.pricePerMonth,
        0
    );
    const totalYearly = items.reduce((sum, item) => sum + item.pricePerYear, 0);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (
            !formData.name.trim() ||
            !formData.pricePerMonth ||
            !formData.pricePerYear
        ) {
            return;
        }

        onAdd({
            category: formData.category,
            name: formData.name,
            pricePerMonth: Number(formData.pricePerMonth),
            pricePerYear: Number(formData.pricePerYear),
            remark: formData.remark || undefined,
            renewalMonth: formData.renewalMonth || undefined,
        });

        setFormData({
            category: Object.keys(categories)[0] || '',
            name: '',
            pricePerMonth: '',
            pricePerYear: '',
            remark: '',
            renewalMonth: '',
        });
    };

    const getCategoryColor = (categoryKey: string) => {
        const category = categories[categoryKey];
        return category
            ? { bgColor: category.bgColor, borderColor: category.borderColor }
            : { bgColor: '#B0BEC5', borderColor: '#90A4AE' };
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY',
        }).format(price);
    };

    return (
        <div style={tableStyles.section}>
            <div style={tableStyles.sectionHeader}>
                <h2 style={tableStyles.sectionTitle}>{title}</h2>
                <div style={tableStyles.stats}>
                    <div style={tableStyles.statsItem}>
                        <span style={tableStyles.statsLabel}>月額合計</span>
                        <span style={tableStyles.statsValue}>
                            {formatPrice(totalMonthly)}
                        </span>
                    </div>
                    <div style={tableStyles.statsItem}>
                        <span style={tableStyles.statsLabel}>年額合計</span>
                        <span style={tableStyles.statsValue}>
                            {formatPrice(totalYearly)}
                        </span>
                    </div>
                    <div style={tableStyles.statsItem}>
                        <span style={tableStyles.statsLabel}>件数</span>
                        <span style={tableStyles.statsValue}>
                            {items.length}
                        </span>
                    </div>
                </div>
            </div>

            {items.length > 0 ? (
                <div style={tableStyles.tableWrapper}>
                    <table style={tableStyles.table}>
                        <thead>
                            <tr>
                                <th style={tableStyles.th}>カテゴリー</th>
                                <th style={tableStyles.th}>名前</th>
                                <th style={tableStyles.th}>月額</th>
                                <th style={tableStyles.th}>年額</th>
                                <th style={tableStyles.th}>備考</th>
                                {title.includes('契約中') && (
                                    <th style={tableStyles.th}>更新月</th>
                                )}
                                <th style={tableStyles.th}>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => {
                                const categoryColor = getCategoryColor(
                                    item.category
                                );
                                const categoryName =
                                    categories[item.category]?.name ||
                                    item.category;

                                return (
                                    <tr key={item.id}>
                                        <td style={tableStyles.td}>
                                            <div
                                                style={{
                                                    ...tableStyles.categoryCell,
                                                    backgroundColor:
                                                        categoryColor.bgColor,
                                                    borderColor:
                                                        categoryColor.borderColor,
                                                    color: '#fff',
                                                }}
                                            >
                                                {categoryName}
                                            </div>
                                        </td>
                                        <td style={tableStyles.td}>
                                            {item.name}
                                        </td>
                                        <td
                                            style={{
                                                ...tableStyles.td,
                                                ...tableStyles.price,
                                            }}
                                        >
                                            {formatPrice(item.pricePerMonth)}
                                        </td>
                                        <td
                                            style={{
                                                ...tableStyles.td,
                                                ...tableStyles.price,
                                            }}
                                        >
                                            {formatPrice(item.pricePerYear)}
                                        </td>
                                        <td style={tableStyles.td}>
                                            {item.remark ? (
                                                <span title={item.remark}>
                                                    {item.remark.length > 15
                                                        ? `${item.remark.substring(0, 15)}...`
                                                        : item.remark}
                                                </span>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        {title.includes('契約中') && (
                                            <td style={tableStyles.td}>
                                                {item.renewalMonth || '-'}
                                            </td>
                                        )}
                                        <td style={tableStyles.td}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    gap: '0.25rem',
                                                }}
                                            >
                                                {onMove && (
                                                    <button
                                                        type="button"
                                                        style={
                                                            tableStyles.moveButton
                                                        }
                                                        onClick={() =>
                                                            onMove(item.id)
                                                        }
                                                    >
                                                        {moveButtonLabel}
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    style={
                                                        tableStyles.deleteButton
                                                    }
                                                    onClick={() => {
                                                        if (
                                                            window.confirm(
                                                                `「${item.name}」を削除しますか？`
                                                            )
                                                        ) {
                                                            onRemove(item.id);
                                                        }
                                                    }}
                                                >
                                                    削除
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div style={tableStyles.emptyState}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        📭
                    </div>
                    <p>まだ{title}がありません</p>
                </div>
            )}

            <form onSubmit={handleAdd} style={tableStyles.addForm}>
                <div style={tableStyles.formRow}>
                    <div style={tableStyles.formGroup}>
                        <label htmlFor="category" style={tableStyles.label}>
                            カテゴリー
                        </label>
                        <select
                            id="category"
                            style={tableStyles.select}
                            value={formData.category}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    category: e.target.value,
                                })
                            }
                        >
                            {Object.entries(categories).map(([key, cat]) => (
                                <option key={key} value={key}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={tableStyles.formGroup}>
                        <label htmlFor="name" style={tableStyles.label}>
                            名前
                        </label>
                        <input
                            id="name"
                            type="text"
                            style={tableStyles.input}
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                            placeholder="サービス名を入力"
                        />
                    </div>
                    <div style={tableStyles.formGroup}>
                        <label
                            htmlFor="pricePerMonth"
                            style={tableStyles.label}
                        >
                            月額（¥）
                        </label>
                        <input
                            id="pricePerMonth"
                            type="number"
                            style={tableStyles.input}
                            value={formData.pricePerMonth}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    pricePerMonth: e.target.value,
                                })
                            }
                            placeholder="0"
                            min="0"
                        />
                    </div>
                    <div style={tableStyles.formGroup}>
                        <label htmlFor="pricePerYear" style={tableStyles.label}>
                            年額（¥）
                        </label>
                        <input
                            id="pricePerYear"
                            type="number"
                            style={tableStyles.input}
                            value={formData.pricePerYear}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    pricePerYear: e.target.value,
                                })
                            }
                            placeholder="0"
                            min="0"
                        />
                    </div>
                    <div style={tableStyles.formGroup}>
                        <label htmlFor="remark" style={tableStyles.label}>
                            備考
                        </label>
                        <input
                            id="remark"
                            type="text"
                            style={tableStyles.input}
                            value={formData.remark}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    remark: e.target.value,
                                })
                            }
                            placeholder="（任意）"
                        />
                    </div>
                    {title.includes('契約中') && (
                        <div style={tableStyles.formGroup}>
                            <label
                                htmlFor="expiration"
                                style={tableStyles.label}
                            >
                                更新月（任意）
                            </label>
                            <input
                                id="expiration"
                                type="text"
                                style={tableStyles.input}
                                value={formData.renewalMonth}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        renewalMonth: e.target.value,
                                    })
                                }
                                placeholder="例：1月"
                            />
                        </div>
                    )}
                </div>
                <button type="submit" style={tableStyles.button}>
                    追加
                </button>
            </form>
        </div>
    );
}
