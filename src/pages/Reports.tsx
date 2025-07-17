import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { DemoStorage } from '../lib/demoStorage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, TrendingUp, DollarSign, PieChart as PieChartIcon } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

const Reports: React.FC = () => {
  const { user, isDemoMode } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalExpenses: 0,
    averageDaily: 0,
    highestCategory: '',
    totalTransactions: 0,
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1'];

  useEffect(() => {
    if (user) {
      loadReportData();
    }
  }, [user, dateRange]);

  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case '7days':
        return { start: subDays(now, 7), end: now };
      case '30days':
        return { start: subDays(now, 30), end: now };
      case '90days':
        return { start: subDays(now, 90), end: now };
      case 'thisMonth':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      default:
        return { start: subDays(now, 30), end: now };
    }
  };

  const loadReportData = async () => {
    if (!user) return;

    try {
      const { start, end } = getDateRange();
      let expenses: any[] = [];

      if (isDemoMode) {
        const allExpenses = DemoStorage.getExpenses(user.id);
        expenses = allExpenses.filter((expense: any) => {
          const expenseDate = new Date(expense.created_at);
          return expenseDate >= start && expenseDate <= end;
        });
      } else {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString());

        if (error) throw error;
        expenses = data || [];
      }

      // Process data for charts
      processExpenseData(expenses, start, end);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processExpenseData = (expenses: any[], start: Date, end: Date) => {
    // Category breakdown
    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const categoryData = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
    })).sort((a, b) => b.amount - a.amount);

    // Daily expenses
    const dailyTotals: { [key: string]: number } = {};
    const days = eachDayOfInterval({ start, end });
    
    days.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      dailyTotals[dayKey] = 0;
    });

    expenses.forEach(expense => {
      const dayKey = format(new Date(expense.created_at), 'yyyy-MM-dd');
      dailyTotals[dayKey] = (dailyTotals[dayKey] || 0) + expense.amount;
    });

    const dailyData = Object.entries(dailyTotals).map(([date, amount]) => ({
      date: format(new Date(date), 'MMM dd'),
      amount,
    }));

    // Monthly breakdown (for longer periods)
    const monthlyTotals: { [key: string]: number } = {};
    expenses.forEach(expense => {
      const monthKey = format(new Date(expense.created_at), 'yyyy-MM');
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + expense.amount;
    });

    const monthlyData = Object.entries(monthlyTotals).map(([month, amount]) => ({
      month: format(new Date(month + '-01'), 'MMM yyyy'),
      amount,
    }));

    // Calculate stats
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const daysDiff = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const averageDaily = totalExpenses / daysDiff;
    const highestCategory = categoryData.length > 0 ? categoryData[0].category : 'None';

    setExpenseData(dateRange === '90days' ? monthlyData : dailyData);
    setCategoryData(categoryData);
    setDailyData(dailyData);
    setStats({
      totalExpenses,
      averageDaily,
      highestCategory,
      totalTransactions: expenses.length,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">Analyze your spending patterns</p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="thisMonth">This month</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalExpenses.toFixed(2)}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Daily Average</p>
              <p className="text-2xl font-bold text-gray-900">${stats.averageDaily.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Top Category</p>
              <p className="text-lg font-bold text-gray-900">{stats.highestCategory}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <PieChartIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={expenseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={dateRange === '90days' ? 'month' : 'date'} />
              <YAxis />
              <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']} />
              <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No expense data available
            </div>
          )}
        </div>
      </div>

      {/* Category Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Details</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']} />
            <Bar dataKey="amount" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Reports;