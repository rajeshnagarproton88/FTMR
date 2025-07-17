import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { DemoStorage } from '../lib/demoStorage';
import { NotificationSettings } from '../types';
import { Bell, Clock, MessageSquare, Save, TestTube } from 'lucide-react';
import toast from 'react-hot-toast';

const Notifications: React.FC = () => {
  const { user, isDemoMode } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    id: '',
    user_id: user?.id || '',
    discord_webhook_url: '',
    notifications_enabled: false,
    morning_briefing_time: '09:00',
    evening_summary_time: '18:00',
  });

  useEffect(() => {
    if (user) {
      loadNotificationSettings();
    }
  }, [user]);

  const loadNotificationSettings = async () => {
    if (!user) return;

    try {
      if (isDemoMode) {
        const data = DemoStorage.getNotificationSettings(user.id);
        if (data) {
          setSettings(data);
        } else {
          setSettings(prev => ({ ...prev, user_id: user.id }));
        }
      } else {
        const { data, error } = await supabase
          .from('notification_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setSettings(data);
        } else {
          setSettings(prev => ({ ...prev, user_id: user.id }));
        }
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
      toast.error('Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    try {
      if (isDemoMode) {
        DemoStorage.saveNotificationSettings({
          ...settings,
          user_id: user.id,
        });
      } else {
        const { error } = await supabase
          .from('notification_settings')
          .upsert({
            ...settings,
            user_id: user.id,
          });

        if (error) throw error;
      }

      toast.success('Notification settings saved successfully');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const testWebhook = async () => {
    if (!settings.discord_webhook_url) {
      toast.error('Please enter a Discord webhook URL first');
      return;
    }

    try {
      const testMessage = {
        content: '🧪 **Test Notification**',
        embeds: [{
          title: 'Finance Manager Test',
          description: 'This is a test notification from your Finance Manager app!',
          color: 3447003,
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Finance Manager'
          }
        }]
      };

      const response = await fetch(settings.discord_webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testMessage),
      });

      if (response.ok) {
        toast.success('Test notification sent successfully!');
      } else {
        throw new Error('Failed to send webhook');
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast.error('Failed to send test notification. Please check your webhook URL.');
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
        <p className="text-gray-600 mt-2">Configure your notification preferences</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Bell className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Enable Notifications</label>
                <p className="text-sm text-gray-500">Receive daily briefings and summaries</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications_enabled}
                  onChange={(e) => setSettings({ ...settings, notifications_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Discord Integration */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <MessageSquare className="w-5 h-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Discord Integration</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discord Webhook URL
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={settings.discord_webhook_url || ''}
                  onChange={(e) => setSettings({ ...settings, discord_webhook_url: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://discord.com/api/webhooks/..."
                />
                <button
                  type="button"
                  onClick={testWebhook}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Test
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Create a webhook in your Discord server settings to receive notifications
              </p>
            </div>
          </div>
        </div>

        {/* Timing Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Clock className="w-5 h-5 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Timing Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Morning Briefing Time
              </label>
              <input
                type="time"
                value={settings.morning_briefing_time || '09:00'}
                onChange={(e) => setSettings({ ...settings, morning_briefing_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Daily summary of pending tasks and reminders
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evening Summary Time
              </label>
              <input
                type="time"
                value={settings.evening_summary_time || '18:00'}
                onChange={(e) => setSettings({ ...settings, evening_summary_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Daily recap of expenses and completed tasks
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Information Panel */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">How to set up Discord notifications:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
          <li>Go to your Discord server settings</li>
          <li>Navigate to Integrations → Webhooks</li>
          <li>Click "New Webhook" and choose a channel</li>
          <li>Copy the webhook URL and paste it above</li>
          <li>Click "Test" to verify the connection</li>
        </ol>
      </div>
    </div>
  );
};

export default Notifications;