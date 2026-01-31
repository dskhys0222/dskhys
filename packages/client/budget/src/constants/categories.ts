export interface Category {
    name: string;
    color: string;
    bgColor: string;
    borderColor: string;
}

export const INCOME_CATEGORIES: Record<string, Category> = {
    salary: {
        name: '給与',
        color: '#fff',
        bgColor: '#81C784',
        borderColor: '#66BB6A',
    },
    dividend: {
        name: '配当',
        color: '#fff',
        bgColor: '#64B5F6',
        borderColor: '#42A5F5',
    },
    tax_social: {
        name: '税金',
        color: '#fff',
        bgColor: '#7E57C2',
        borderColor: '#7C4DFF',
    },
    investment: {
        name: '投資',
        color: '#fff',
        bgColor: '#FFD54F',
        borderColor: '#FFCA28',
    },
    other: {
        name: 'その他',
        color: '#fff',
        bgColor: '#B0BEC5',
        borderColor: '#90A4AE',
    },
};

export const EXPENSE_CATEGORIES: Record<string, Category> = {
    life: {
        name: '消費',
        color: '#fff',
        bgColor: '#66BB6A',
        borderColor: '#4CAF50',
    },
    hobby: {
        name: '浪費',
        color: '#fff',
        bgColor: '#EC407A',
        borderColor: '#E91E63',
    },
    tax: {
        name: '税金',
        color: '#fff',
        bgColor: '#7E57C2',
        borderColor: '#7C4DFF',
    },
    investment: {
        name: '投資',
        color: '#fff',
        bgColor: '#FFD54F',
        borderColor: '#FFCA28',
    },
    other: {
        name: 'その他',
        color: '#fff',
        bgColor: '#B0BEC5',
        borderColor: '#90A4AE',
    },
};

export const SUBSCRIPTION_CATEGORIES: Record<string, Category> = {
    life: {
        name: '生活',
        color: '#fff',
        bgColor: '#66BB6A',
        borderColor: '#4CAF50',
    },
    travel: {
        name: '旅行',
        color: '#fff',
        bgColor: '#FF7043',
        borderColor: '#FF5722',
    },
    entertainment: {
        name: 'エンタメ',
        color: '#fff',
        bgColor: '#FFD54F',
        borderColor: '#FFCA28',
    },
    development: {
        name: '開発',
        color: '#fff',
        bgColor: '#42A5F5',
        borderColor: '#2196F3',
    },
    other: {
        name: 'その他',
        color: '#fff',
        bgColor: '#B0BEC5',
        borderColor: '#90A4AE',
    },
};
