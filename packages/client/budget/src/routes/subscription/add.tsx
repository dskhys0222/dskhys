import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { SUBSCRIPTION_CATEGORIES } from '@/constants/categories';
import {
    useActiveSubscriptionStore,
    useSubscriptionCandidateStore,
} from '@/store/subscriptionStore';
import { styles } from '../styles';

export const Route = createFileRoute('/subscription/add')({
    component: SubscriptionAddPage,
});

function SubscriptionAddPage() {
    const navigate = useNavigate();
    // デフォルトは追加候補
    const isActive = false;

    const addActiveSubItem = useActiveSubscriptionStore(
        (state) => state.addItem
    );
    const addCandidateSubItem = useSubscriptionCandidateStore(
        (state) => state.addItem
    );

    const [formData, setFormData] = useState({
        category: Object.keys(SUBSCRIPTION_CATEGORIES)[0],
        name: '',
        pricePerMonth: '',
        pricePerYear: '',
        remark: '',
        renewalMonth: '',
    });

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !formData.name.trim() ||
            !formData.pricePerMonth ||
            !formData.pricePerYear
        ) {
            return;
        }

        const newItem = {
            category: formData.category,
            name: formData.name,
            pricePerMonth: Number(formData.pricePerMonth),
            pricePerYear: Number(formData.pricePerYear),
            remark: formData.remark || undefined,
            renewalMonth: formData.renewalMonth || undefined,
        };

        if (isActive) {
            addActiveSubItem(newItem);
        } else {
            addCandidateSubItem(newItem);
        }

        navigate({ to: '/subscription' });
    };

    const handleCancel = () => {
        navigate({ to: '/subscription' });
    };

    return (
        <div className={styles.pageStack}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                }}
            >
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>追加</h1>
                <button type="button" onClick={handleCancel}>
                    ✕
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        marginBottom: '2rem',
                    }}
                >
                    <div>
                        <label
                            htmlFor="category"
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: 'bold',
                            }}
                        >
                            カテゴリ
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #ddd',
                            }}
                        >
                            {Object.entries(SUBSCRIPTION_CATEGORIES).map(
                                ([key, category]) => (
                                    <option key={key} value={key}>
                                        {category.name}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="name"
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: 'bold',
                            }}
                        >
                            サービス名 *
                        </label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #ddd',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="pricePerMonth"
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: 'bold',
                            }}
                        >
                            月額 (¥) *
                        </label>
                        <input
                            id="pricePerMonth"
                            type="number"
                            name="pricePerMonth"
                            value={formData.pricePerMonth}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #ddd',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="pricePerYear"
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: 'bold',
                            }}
                        >
                            年額 (¥) *
                        </label>
                        <input
                            id="pricePerYear"
                            type="number"
                            name="pricePerYear"
                            value={formData.pricePerYear}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #ddd',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="remark"
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: 'bold',
                            }}
                        >
                            備考
                        </label>
                        <textarea
                            id="remark"
                            name="remark"
                            value={formData.remark}
                            onChange={handleChange}
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #ddd',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="renewalMonth"
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: 'bold',
                            }}
                        >
                            更新月
                        </label>
                        <input
                            id="renewalMonth"
                            type="number"
                            name="renewalMonth"
                            min="1"
                            max="12"
                            value={formData.renewalMonth}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #ddd',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        type="submit"
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                        }}
                    >
                        追加
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            backgroundColor: '#9ca3af',
                            color: 'white',
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                        }}
                    >
                        キャンセル
                    </button>
                </div>
            </form>
        </div>
    );
}
