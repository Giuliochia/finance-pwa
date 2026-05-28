export type TransactionType = 'income' | 'expense'
export type RecurringFrequency = 'monthly' | 'quarterly' | 'yearly'
export type AuditAction = 'kept' | 'dismissed' | 'removed'

export interface Profile {
  id: string
  display_name: string | null
  currency: string
  savings_target: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string | null
  name: string
  type: TransactionType
  icon: string | null
  color: string | null
  is_system: boolean
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  category_id: string | null
  type: TransactionType
  amount: number
  description: string | null
  notes: string | null
  transaction_date: string
  created_at: string
  updated_at: string
  category?: Category
}

export interface RecurringExpense {
  id: string
  user_id: string
  category_id: string | null
  name: string
  amount: number
  billing_day: number
  frequency: RecurringFrequency
  is_active: boolean
  start_date: string
  end_date: string | null
  last_audit_at: string | null
  next_audit_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
  category?: Category
}

export interface MonthlySummary {
  id: string
  user_id: string
  year: number
  month: number
  total_income: number
  total_expense: number
  balance: number
  savings_target: number
  savings_gap: number
  computed_at: string
}

export interface AuditNotification {
  id: string
  user_id: string
  recurring_expense_id: string
  shown_at: string
  action: AuditAction
}
