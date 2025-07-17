import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { DemoStorage } from '../lib/demoStorage';
import { EMI } from '../types';
import { Plus, Trash2, Calculator, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { format, differenceInMonths } from 'date-fns';
import toast from 'react-hot-toast';

const EMIs: React.FC = () => {
  const { user, isDemoMode } = useAuth();
  const [emis, setEmis] = useState<EMI[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    loan_name: '',
    total_amount: '',
    monthly_payment: '',
    start_date: '',
  });

  useEffect(() => {
    if (user) {
      loadEMIs();
    }
  }, [user]);

  const loadEMIs = async () => {
    if (!user) return;

    try {
      if (isDemoMode) {
        const data = DemoStorage.getEMIs(user.id);
        setEmis(data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } else {
        const { data, error } = await supabase
          .from('emis')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setEmis(data || []);
      }
    } catch (error) {
      console.error('Error loading EMIs:', error);
      toast.error('Failed to load EMIs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (isDemoMode) {
        DemoStorage.saveEMI({
          user_id: user.id,
          loan_name: formData.loan_name,
          total_amount: parseFloat(formData.total_amount),
          monthly_payment: parseFloat(formData.monthly_payment),
          paid_amount: 0,
          start_date: formData.start_date,
        });
      } else {
        const { error } = await supabase
          .from('emis')
          .insert({
            user_id: user.id,
            loan_name: formData.loan_name,
            total_amount: parseFloat(formData.total_amount),
            monthly_payment: parseFloat(formData.monthly_payment),
            paid_amount: 0,
            start_date: formData.start_date,
          });

        if (error) throw error;
      }

      toast.success('EMI added successfully');
      setFormData({ loan_name: '', total_amount: '', monthly_payment: '', start_date: '' });
      setShowAddForm(false);
      loadEMIs();
    } catch (error) {
      console.error('Error adding EMI:', error);
      toast.error('Failed to add EMI');
    }
  };

  const handlePayment = async (emi: EMI) => {
    const newPaidAmount = emi.paid_amount + emi.monthly_payment;
    
    if (newPaidAmount > emi.total_amount) {
      toast.error('Payment would exceed total loan amount');
      return;
    }

    if (!confirm(`Record EMI payment of $${emi.monthly_payment.toFixed(2)} for ${emi.loan_name}?`)) return;

    try {
      // Add as expense
      if (isDemoMode) {
        DemoStorage.saveExpense({
          user_id: user!.id,
          amount: emi.monthly_payment,
          category: 'Bills & Utilities',
          description: `EMI: ${emi.loan_name}`,
        });

        // Update paid amount
        DemoStorage.updateEMI(emi.id, { paid_amount: newPaidAmount });
      } else {
        await supabase
          .from('expenses')
          .insert({
            user_id: user!.id,
            amount: emi.monthly_payment,
            category: 'Bills & Utilities',
            description: `EMI: ${emi.loan_name}`,
          });

        await supabase
          .from('emis')
          .update({ paid_amount: newPaidAmount })
          .eq('id', emi.id);
      }

      toast.success('EMI payment recorded successfully');
      loadEMIs();
    } catch (error) {
      console.error('Error recording EMI payment:', error);
      toast.error('Failed to record EMI payment');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this EMI?')) return;

    try {
      if (isDemoMode) {
        DemoStorage.deleteEMI(id);
      } else {
        const { error } = await supabase
          .from('emis')
          .delete()
          .eq('id', id);

        if (error) throw error;
      }

      toast.success('EMI deleted successfully');
      loadEMIs();
    } catch (error) {
      console.error('Error deleting EMI:', error);
      toast.error('Failed to delete EMI');
    }
  };

  const calculateProgress = (emi: EMI) => {
    return (emi.paid_amount / emi.total_amount) * 100;
  };

  const calculateRemainingMonths = (emi: EMI) => {
    const remaining = emi.total_amount - emi.paid_amount;
    return Math.ceil(remaining / emi.monthly_payment);
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
          <h1 className="text-3xl font-bold text-gray-900">EMIs</h1>
          <p className="text-gray-600 mt-2">Track your loan payments and progress</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add EMI
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New EMI</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Name
              </label>
              <input
                type="text"
                value={formData.loan_name}
                onChange={(e) => setFormData({ ...formData, loan_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Home Loan, Car Loan"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Loan Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Payment
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.monthly_payment}
                    onChange={(e) => setFormData({ ...formData, monthly_payment: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
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
                Add EMI
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

      {/* EMIs List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Active EMIs</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {emis.length === 0 ? (
            <div className="p-8 text-center">
              <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No EMIs tracked yet</p>
              <p className="text-sm text-gray-400 mt-1">Add your first EMI to start tracking</p>
            </div>
          ) : (
            emis.map((emi) => {
              const progress = calculateProgress(emi);
              const remainingMonths = calculateRemainingMonths(emi);
              const isCompleted = progress >= 100;

              return (
                <div key={emi.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-100' : 'bg-blue-100'}`}>
                        <Calculator className={`w-4 h-4 ${isCompleted ? 'text-green-600' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{emi.loan_name}</h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span>Total: ${emi.total_amount.toFixed(2)}</span>
                          <span>Monthly: ${emi.monthly_payment.toFixed(2)}</span>
                          <span>Started: {format(new Date(emi.start_date), 'MMM yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!isCompleted && (
                        <button
                          onClick={() => handlePayment(emi)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          Record Payment
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(emi.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Paid: ${emi.paid_amount.toFixed(2)}</span>
                      <span>Remaining: ${(emi.total_amount - emi.paid_amount).toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isCompleted ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{progress.toFixed(1)}% completed</span>
                      {!isCompleted && (
                        <span>{remainingMonths} months remaining</span>
                      )}
                      {isCompleted && (
                        <span className="text-green-600 font-medium">Completed!</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default EMIs;