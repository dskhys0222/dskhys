import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { INCOME_CATEGORIES } from '@/constants/categories';
import { useIncomeStore } from '@/store/incomeStore';
import { styles } from '../../styles';

export const Route = createFileRoute('/cash-flow/income/add')({
    component: IncomeAddPage,
});

interface FormState {
    category: string;
    name: string;
    pricePerMonth: number;
    pricePerYear: number;
    remark: string;
}

const initialFormState: FormState = {
    category: '',
    name: '',
    pricePerMonth: 0,
    pricePerYear: 0,
    remark: '',
};

function IncomeAddPage() {
    const navigate = useNavigate();
    const addIncomeItem = useIncomeStore((state) => state.addItem);
    const [form, setForm] = useState<FormState>(initialFormState);

    const handleSubmit = () => {
        if (form.name && form.category) {
            addIncomeItem({
                category: form.category,
                name: form.name,
                pricePerMonth: form.pricePerMonth,
                pricePerYear: form.pricePerYear,
                remark: form.remark,
            });
            navigate({ to: '/cash-flow' });
        }
    };

    return (
        <div className={styles.pageStack}>
            <h1
                style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                }}
            >
                収入を追加
            </h1>
            <div
                style={{
                    padding: '1rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.5rem',
                }}
            >
                <select
                    value={form.category}
                    onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                    }
                    style={{
                        width: '100%',
                        marginBottom: '1rem',
                        padding: '0.5rem',
                        borderRadius: '0.25rem',
                        border: '1px solid #d1d5db',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                    }}
                >
                    <option value="">カテゴリーを選択</option>
                    {Object.entries(INCOME_CATEGORIES).map(([key, cat]) => (
                        <option key={key} value={key}>
                            {cat.name}
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="名称"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={{
                        width: '100%',
                        marginBottom: '1rem',
                        padding: '0.5rem',
                        borderRadius: '0.25rem',
                        border: '1px solid #d1d5db',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                    }}
                />
                <input
                    type="number"
                    placeholder="月額"
                    value={form.pricePerMonth}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            pricePerMonth: Number(e.target.value),
                        })
                    }
                    style={{
                        width: '100%',
                        marginBottom: '1rem',
                        padding: '0.5rem',
                        borderRadius: '0.25rem',
                        border: '1px solid #d1d5db',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                    }}
                />
                <input
                    type="number"
                    placeholder="年額"
                    value={form.pricePerYear}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            pricePerYear: Number(e.target.value),
                        })
                    }
                    style={{
                        width: '100%',
                        marginBottom: '1rem',
                        padding: '0.5rem',
                        borderRadius: '0.25rem',
                        border: '1px solid #d1d5db',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                    }}
                />
                <input
                    type="text"
                    placeholder="備考"
                    value={form.remark}
                    onChange={(e) =>
                        setForm({ ...form, remark: e.target.value })
                    }
                    style={{
                        width: '100%',
                        marginBottom: '1rem',
                        padding: '0.5rem',
                        borderRadius: '0.25rem',
                        border: '1px solid #d1d5db',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                    }}
                />
                <div
                    style={{
                        display: 'flex',
                        gap: '0.5rem',
                    }}
                >
                    <button
                        type="button"
                        onClick={handleSubmit}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            backgroundColor: '#10b981',
                            color: 'white',
                            borderRadius: '0.25rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                        }}
                    >
                        追加
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate({ to: '/cash-flow' })}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            borderRadius: '0.25rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                        }}
                    >
                        キャンセル
                    </button>
                </div>
            </div>
        </div>
    );
}
