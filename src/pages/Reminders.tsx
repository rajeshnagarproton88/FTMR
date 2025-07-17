import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { DemoStorage } from '../lib/demoStorage';
import { Reminder } from '../types';
import { Plus, Trash2, Bell, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Reminders: React.FC = () => {
  const { user, isDemoMode } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reminder_date: '',
    reminder_time: '',
  });

  useEffect(() => {
    if (user) {
      loadReminders();
    }
  }, [user]);

  const loadReminders = async () => {
    if (!user) return;

    try {
      if (isDemoMode) {
        const data = DemoStorage.getReminders(user.id);
        setReminders(data.sort((a: any, b: any) => new Date(a.reminder_date).getTime() - new Date(b.reminder_date).getTime()));
      } else {
        const { data, error } = await supabase
          .from('reminders')
          .select('*')
          .eq('user_id', user.id)
          .order('reminder_date', { ascending: true });

        if (error) throw error;
        setReminders(data || []);
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
      toast.error('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const reminderDateTime = `${formData.reminder_date}T${formData.reminder_time}:00`;
      
      if (isDemoMode) {
        DemoStorage.saveReminder({
          user_id: user.id,
          title: formData.title,
          description: formData.description || null,
          reminder_date: reminderDateTime,
        });
      } else {
        const { error } = await supabase
          .from('reminders')
          .insert({
            user_id: user.id,
            title: formData.title,
            description: formData.description || null,
            reminder_date: reminderDateTime,
          });

        if (error) throw error;
      }

      toast.success('Reminder added successfully');
      setFormData({ title: '', description: '', reminder_date: '', reminder_time: '' });
      setShowAddForm(false);
      loadReminders();
    } catch (error) {
      console.error('Error adding reminder:', error);
      toast.error('Failed to add reminder');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    try {
      if (isDemoMode) {
        DemoStorage.deleteReminder(id);
      } else {
        const { error } = await supabase
          .from('reminders')
          .delete()
          .eq('id', id);

        if (error) throw error;
      }

      toast.success('Reminder deleted successfully');
      loadReminders();
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast.error('Failed to delete reminder');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const now = new Date();
  const upcomingReminders = reminders.filter(reminder => new Date(reminder.reminder_date) >= now);
  const pastReminders = reminders.filter(reminder => new Date(reminder.reminder_date) < now);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reminders</h1>
          <p className="text-gray-600 mt-2">Never forget important tasks and events</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Reminder
        </button>
      </div>

      {/* Add Reminder Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Reminder</h2>
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
                placeholder="What should I remind you about?"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Additional details..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.reminder_date}
                    onChange={(e) => setFormData({ ...formData, reminder_date: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="time"
                    value={formData.reminder_time}
                    onChange={(e) => setFormData({ ...formData, reminder_time: e.target.value })}
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
                Add Reminder
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

      {/* Upcoming Reminders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Upcoming Reminders ({upcomingReminders.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {upcomingReminders.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No upcoming reminders</p>
              <p className="text-sm text-gray-400 mt-1">Add a reminder to stay organized</p>
            </div>
          ) : (
            upcomingReminders.map((reminder) => (
              <div key={reminder.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg mt-1">
                      <Bell className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{reminder.title}</h3>
                      {reminder.description && (
                        <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {format(new Date(reminder.reminder_date), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {format(new Date(reminder.reminder_date), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(reminder.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Past Reminders */}
      {pastReminders.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Past Reminders ({pastReminders.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {pastReminders.map((reminder) => (
              <div key={reminder.id} className="p-6 hover:bg-gray-50 transition-colors opacity-75">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="bg-gray-100 p-2 rounded-lg mt-1">
                      <Bell className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{reminder.title}</h3>
                      {reminder.description && (
                        <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {format(new Date(reminder.reminder_date), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {format(new Date(reminder.reminder_date), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(reminder.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reminders;