import type { BudgetItem } from '@/store/budgetStore';
import type { ExpenseItem } from '@/store/expenseStore';
import type { IncomeItem } from '@/store/incomeStore';
import type { SubscriptionItem } from '@/store/subscriptionStore';

export interface BudgetSnapshot {
    version: number;
    budgetItems: BudgetItem[];
    expenseItems: ExpenseItem[];
    incomeItems: IncomeItem[];
    activeSubscriptions: SubscriptionItem[];
    subscriptionCandidates: SubscriptionItem[];
    exportedAt: string;
}
