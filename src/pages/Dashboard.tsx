import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';  // Assuming supabase client is here
import { DashboardStats, Reminder } from '../types'; // Assuming types are defined
import { CreditCard, CheckSquare, Calculator, Bell, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  // We no longer need `isDemoMode` from the context
  const { user } = useAuth(); 
  const [stats, setStats] = useState<DashboardStats>({
    totalExpensesLast30Days: 0,
    pendingTodos: 0,
    activeEmis: 0,
    todayReminders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The effect will run when the user object is available
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // --- This block is now the ONLY data source, directly from Supabase ---
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Fetch expenses from the last 30 days
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString());

      const totalExpenses = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;

      // Fetch pending todos
      const { data: todos } = await supabase
        .from('todos')
        .select('id', { count: 'exact' }) // More efficient way to get count
        .eq('user_id', user.id)
        .eq('completed', false);

      // Fetch active EMIs
      const { data: emis } = await supabase
        .from('emis')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id);
        // Add more conditions if needed to determine "active" status

      // Fetch today's reminders
      const today = new Date();
      const startOfToday = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfToday = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const { data: reminders } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .gte('reminder_date', startOfToday)
        .lte('reminder_date', endOfToday);

      setStats({
        totalExpensesLast30Days: totalExpenses,
        pendingTodos: todos?.length || 0,
        activeEmis: emis?.length || 0,
        todayReminders: reminders || [],
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Expenses (30 days)',
      value: `$${stats.totalExpensesLast30Days.toFixed(2)}`,
      icon: CreditCard,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Pending To-Dos',
      value: stats.pendingTodos.toString(),
      icon: CheckSquare,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Active EMIs',
      value: stats.activeEmis.toString(),
      icon: Calculator,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Today\'s Reminders',
      value: stats.todayReminders.length.toString(),
      icon: Bell,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.email}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className={`${card.bgColor} rounded-xl p-6 border border-gray-200`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's Reminders */}
      {stats.todayReminders.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Today's Reminders</h2>
          </div>
          <div className="space-y-3">
            {stats.todayReminders.map((reminder) => (
              <div key={reminder.id} className="flex items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                <Bell className="w-4 h-4 text-orange-500 mr-3" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{reminder.title}</h3>
                  {reminder.description && (
                    <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
                  )}
                  <p className="text-xs text-orange-600 mt-1">
                    {format(new Date(reminder.reminder_date), 'h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
            <CreditCard className="w-5 h-5 text-blue-600 mr-3" />
            <span className="font-medium text-blue-900">Add Expense</span>
          </button>
          <button className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
            <CheckSquare className="w-5 h-5 text-green-600 mr-3" />
            <span className="font-medium text-green-900">Add To-Do</span>
          </button>
          <button className="flex items-center p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors">
            <Bell className="w-5 h-5 text-orange-600 mr-3" />
            <span className="font-medium text-orange-900">Set Reminder</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
