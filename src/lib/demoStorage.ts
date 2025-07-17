// Demo storage using localStorage for when Supabase is not configured
export class DemoStorage {
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  static getUsers() {
    const users = localStorage.getItem('demo_users');
    return users ? JSON.parse(users) : [
      {
        id: 'admin-1',
        username: 'admin',
        email: 'admin@demo.com',
        role: 'admin',
        is_active: true,
        is_approved: true,
        created_at: new Date().toISOString(),
        password: 'admin' // In demo mode only
      }
    ];
  }

  static saveUsers(users: any[]) {
    localStorage.setItem('demo_users', JSON.stringify(users));
  }

  static getExpenses(userId: string) {
    const expenses = localStorage.getItem('demo_expenses');
    const allExpenses = expenses ? JSON.parse(expenses) : [];
    return allExpenses.filter((expense: any) => expense.user_id === userId);
  }

  static saveExpense(expense: any) {
    const expenses = localStorage.getItem('demo_expenses');
    const allExpenses = expenses ? JSON.parse(expenses) : [];
    const newExpense = {
      ...expense,
      id: this.generateId(),
      created_at: new Date().toISOString()
    };
    allExpenses.push(newExpense);
    localStorage.setItem('demo_expenses', JSON.stringify(allExpenses));
    return newExpense;
  }

  static deleteExpense(id: string) {
    const expenses = localStorage.getItem('demo_expenses');
    const allExpenses = expenses ? JSON.parse(expenses) : [];
    const filtered = allExpenses.filter((expense: any) => expense.id !== id);
    localStorage.setItem('demo_expenses', JSON.stringify(filtered));
  }

  static getTodos(userId: string) {
    const todos = localStorage.getItem('demo_todos');
    const allTodos = todos ? JSON.parse(todos) : [];
    return allTodos.filter((todo: any) => todo.user_id === userId);
  }

  static saveTodo(todo: any) {
    const todos = localStorage.getItem('demo_todos');
    const allTodos = todos ? JSON.parse(todos) : [];
    const newTodo = {
      ...todo,
      id: this.generateId(),
      created_at: new Date().toISOString()
    };
    allTodos.push(newTodo);
    localStorage.setItem('demo_todos', JSON.stringify(allTodos));
    return newTodo;
  }

  static updateTodo(id: string, updates: any) {
    const todos = localStorage.getItem('demo_todos');
    const allTodos = todos ? JSON.parse(todos) : [];
    const index = allTodos.findIndex((todo: any) => todo.id === id);
    if (index !== -1) {
      allTodos[index] = { ...allTodos[index], ...updates };
      localStorage.setItem('demo_todos', JSON.stringify(allTodos));
    }
  }

  static deleteTodo(id: string) {
    const todos = localStorage.getItem('demo_todos');
    const allTodos = todos ? JSON.parse(todos) : [];
    const filtered = allTodos.filter((todo: any) => todo.id !== id);
    localStorage.setItem('demo_todos', JSON.stringify(filtered));
  }

  static getReminders(userId: string) {
    const reminders = localStorage.getItem('demo_reminders');
    const allReminders = reminders ? JSON.parse(reminders) : [];
    return allReminders.filter((reminder: any) => reminder.user_id === userId);
  }

  static saveReminder(reminder: any) {
    const reminders = localStorage.getItem('demo_reminders');
    const allReminders = reminders ? JSON.parse(reminders) : [];
    const newReminder = {
      ...reminder,
      id: this.generateId(),
      created_at: new Date().toISOString()
    };
    allReminders.push(newReminder);
    localStorage.setItem('demo_reminders', JSON.stringify(allReminders));
    return newReminder;
  }

  static deleteReminder(id: string) {
    const reminders = localStorage.getItem('demo_reminders');
    const allReminders = reminders ? JSON.parse(reminders) : [];
    const filtered = allReminders.filter((reminder: any) => reminder.id !== id);
    localStorage.setItem('demo_reminders', JSON.stringify(filtered));
  }

  static getRecurringPayments(userId: string) {
    const payments = localStorage.getItem('demo_recurring_payments');
    const allPayments = payments ? JSON.parse(payments) : [];
    return allPayments.filter((payment: any) => payment.user_id === userId);
  }

  static saveRecurringPayment(payment: any) {
    const payments = localStorage.getItem('demo_recurring_payments');
    const allPayments = payments ? JSON.parse(payments) : [];
    const newPayment = {
      ...payment,
      id: this.generateId(),
      created_at: new Date().toISOString()
    };
    allPayments.push(newPayment);
    localStorage.setItem('demo_recurring_payments', JSON.stringify(allPayments));
    return newPayment;
  }

  static updateRecurringPayment(id: string, updates: any) {
    const payments = localStorage.getItem('demo_recurring_payments');
    const allPayments = payments ? JSON.parse(payments) : [];
    const index = allPayments.findIndex((payment: any) => payment.id === id);
    if (index !== -1) {
      allPayments[index] = { ...allPayments[index], ...updates };
      localStorage.setItem('demo_recurring_payments', JSON.stringify(allPayments));
    }
  }

  static deleteRecurringPayment(id: string) {
    const payments = localStorage.getItem('demo_recurring_payments');
    const allPayments = payments ? JSON.parse(payments) : [];
    const filtered = allPayments.filter((payment: any) => payment.id !== id);
    localStorage.setItem('demo_recurring_payments', JSON.stringify(filtered));
  }

  static getEMIs(userId: string) {
    const emis = localStorage.getItem('demo_emis');
    const allEMIs = emis ? JSON.parse(emis) : [];
    return allEMIs.filter((emi: any) => emi.user_id === userId);
  }

  static saveEMI(emi: any) {
    const emis = localStorage.getItem('demo_emis');
    const allEMIs = emis ? JSON.parse(emis) : [];
    const newEMI = {
      ...emi,
      id: this.generateId(),
      created_at: new Date().toISOString()
    };
    allEMIs.push(newEMI);
    localStorage.setItem('demo_emis', JSON.stringify(allEMIs));
    return newEMI;
  }

  static updateEMI(id: string, updates: any) {
    const emis = localStorage.getItem('demo_emis');
    const allEMIs = emis ? JSON.parse(emis) : [];
    const index = allEMIs.findIndex((emi: any) => emi.id === id);
    if (index !== -1) {
      allEMIs[index] = { ...allEMIs[index], ...updates };
      localStorage.setItem('demo_emis', JSON.stringify(allEMIs));
    }
  }

  static deleteEMI(id: string) {
    const emis = localStorage.getItem('demo_emis');
    const allEMIs = emis ? JSON.parse(emis) : [];
    const filtered = allEMIs.filter((emi: any) => emi.id !== id);
    localStorage.setItem('demo_emis', JSON.stringify(filtered));
  }

  static getNotificationSettings(userId: string) {
    const settings = localStorage.getItem('demo_notification_settings');
    const allSettings = settings ? JSON.parse(settings) : [];
    return allSettings.find((setting: any) => setting.user_id === userId);
  }

  static saveNotificationSettings(settings: any) {
    const allSettings = localStorage.getItem('demo_notification_settings');
    const settingsArray = allSettings ? JSON.parse(allSettings) : [];
    const existingIndex = settingsArray.findIndex((s: any) => s.user_id === settings.user_id);
    
    const newSettings = {
      ...settings,
      id: settings.id || this.generateId(),
    };

    if (existingIndex !== -1) {
      settingsArray[existingIndex] = newSettings;
    } else {
      settingsArray.push(newSettings);
    }

    localStorage.setItem('demo_notification_settings', JSON.stringify(settingsArray));
    return newSettings;
  }
}