export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
  last_login?: string;
  ip_whitelist?: string[];
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  description?: string;
  created_at: string;
}

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  completed: boolean;
  created_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  reminder_date: string;
  created_at: string;
}

export interface RecurringPayment {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_due_date: string;
  created_at: string;
}

export interface EMI {
  id: string;
  user_id: string;
  loan_name: string;
  total_amount: number;
  monthly_payment: number;
  paid_amount: number;
  start_date: string;
  created_at: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  discord_webhook_url?: string;
  notifications_enabled: boolean;
  morning_briefing_time?: string;
  evening_summary_time?: string;
}

export interface DashboardStats {
  totalExpensesLast30Days: number;
  pendingTodos: number;
  activeEmis: number;
  todayReminders: Reminder[];
}