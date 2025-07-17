import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { DemoStorage } from '../lib/demoStorage';
import { RecurringPayment } from '../types';
import { Plus, Trash2, RotateCcw, Calendar, DollarSign } from 'lucide-react';
import { format, addDays, addWeeks, addMonths, addYears } from 'date-fns';
import toast from 'react-hot-toast';

const Recurring: React.FC = () => {
  const { user, isDemoMode } = useAuth();
  const [payments, setPayments] = useState<RecurringPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    next_due_date: '',
  });

  useEffect(() => {
    if (user) {
      loadRecurringPayments();
    }
  }, [user]);

  const loadRecurringPayments = async () => {
    if (!user) return;

    try {
      if (isDemoMode) {
        const data = DemoStorage.getRecurringPayments(user.id);
        setPayments(data.sort((a: any, b: any) => new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime()));
      } else {
        const { data, error } = await supabase
          .from('recurring_payments')
          .select('*')
          .eq('user_id', user.id)
          .order('next_due_date', { ascending: true });

        if (error) throw error;
        setPayments(data || []);
      }
    } catch (error) {
      console.error('Error loading recurring payments:', error);
      toast.error('Failed to load recurring payments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (isDemoMode) {
        DemoStorage.saveRecurringPayment({
          user_id: user.id,
          title: formData.title,
          amount: parseFloat(formData.amount),
          frequency: formData.frequency,
          next_due_date: formData.next_due_date,
        });
      } else {
        const { error } = await supabase
          .from('recurring_payments')
          .insert({
            user_id: user.id,
            title: formData.title,
            amount: parseFloat(formData.amount),
            frequency: formData.frequency,
            next_due_date: formData.next_due_date,
          });

        if (error) throw error;
      }

      toast.success('Recurring payment added successfully');
      setFormData({ title: '', amount: '', frequency: 'monthly', next_due_date: '' });
      setShowAddForm(false);
      loadRecurringPayments();
    } catch (error) {
      console.error('Error adding recurring payment:', error);
      toast.error('Failed to add recurring payment');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recurring payment?')) return;

    try {
      if (isDemoMode) {
        DemoStorage.deleteRecurringPayment(id);
      } else {
        const { error } = await supabase
          .from('recurring_payments')
          .delete()
          .eq('id', id);

        if (error) throw error;
      }

      toast.success('Recurring payment deleted successfully');
      loadRecurringPayments();
    } catch (error) {
      console.error('Error deleting recurring payment:', error);
      toast.error('Failed to delete recurring payment');
    }
  };

  const processPayment = async (payment: RecurringPayment) => {
    if (!confirm(`Process payment of $${payment.amount.toFixed(2)} for ${payment.title}?`)) return;

    try {
      // Add as expense
      if (isDemoMode) {
        DemoStorage.saveExpense({
          user_id: user!.id,
          amount: payment.amount,
          category: 'Bills & Utilities',
          description: `Recurring: ${payment.title}`,
        });
      } else {
        await supabase
          .from('expenses')
          .insert({
            user_id: user!.id,
            amount: payment.amount,
            category: 'Bills & Utilities',
            description: `Recurring: ${payment.title}`,
          });
      }

      // Update next due date
      const currentDate = new Date(payment.next_due_date);
      let nextDate: Date;

      switch (payment.frequency) {
        case 'daily':
          nextDate = addDays(currentDate, 1);
          break;
        case 'weekly':
          nextDate = addWeeks(currentDate, 1);
          break;
        case 'monthly':
          nextDate = addMonths(currentDate, 1);
          break;
        case 'yearly':
          nextDate = addYears(currentDate, 1);
          break;
        default:
          nextDate = addMonths(currentDate, 1);
      }

      if (isDemoMode) {
        DemoStorage.updateRecurringPayment(payment.id, {
          next_due_date: nextDate.toISOString().split('T')[0],
        });
      } else {
        await supabase
          .from('recurring_payments')
          .update({ next_due_date: nextDate.toISOString().split('T')[0] })
          .eq('id', payment.id);
      }

      toast.success('Payment processed and next due date updated');
      loadRecurringPayments();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'weekly':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'monthly':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'yearly':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Recurring Payments</h1>
          <p className="text-gray-600 mt-2">Manage your recurring bills and subscriptions</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Recurring Payment
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Recurring Payment</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Netflix Subscription"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Next Due Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.next_due_date}
                    onChange={(e) => setFormData({ ...formData, next_due_date: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Add Payment
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payments List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recurring Payments</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {payments.length === 0 ? (
            <div className="p-8 text-center">
              <RotateCcw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recurring payments set up</p>
              <p className="text-sm text-gray-400 mt-1">Add your first recurring payment to get started</p>
            </div>
          ) : (
            payments.map((payment) => (
              <div key={payment.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <RotateCcw className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{payment.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-lg font-semibold text-gray-900">
                          ${payment.amount.toFixed(2)}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getFrequencyColor(payment.frequency)}`}>
                          {payment.frequency}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Next due: {format(new Date(payment.next_due_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => processPayment(payment)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      Process Payment
                    </button>
                    <button
                      onClick={() => handleDelete(payment.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Recurring;