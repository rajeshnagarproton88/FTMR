import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { DemoStorage } from '../lib/demoStorage';
import { User } from '../types';
import { Shield, Users, UserCheck, UserX, Eye, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Admin: React.FC = () => {
  const { user, isDemoMode, impersonateUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadUsers();
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      if (isDemoMode) {
        const data = DemoStorage.getUsers();
        setUsers(data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } else {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, field: 'is_approved' | 'is_active', value: boolean) => {
    try {
      if (isDemoMode) {
        const users = DemoStorage.getUsers();
        const updatedUsers = users.map((u: any) => 
          u.id === userId ? { ...u, [field]: value } : u
        );
        DemoStorage.saveUsers(updatedUsers);
      } else {
        const { error } = await supabase
          .from('users')
          .update({ [field]: value })
          .eq('id', userId);

        if (error) throw error;
      }

      const action = field === 'is_approved' ? (value ? 'approved' : 'unapproved') : (value ? 'activated' : 'deactivated');
      toast.success(`User ${action} successfully`);
      loadUsers();
    } catch (error) {
      console.error(`Error updating user ${field}:`, error);
      toast.error(`Failed to update user status`);
    }
  };

  const handleImpersonate = async (targetUser: User) => {
    if (targetUser.id === user?.id) {
      toast.error('Cannot impersonate yourself');
      return;
    }

    await impersonateUser(targetUser.id);
    setActiveDropdown(null);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-500">Access denied. Admin privileges required.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const pendingUsers = users.filter(u => !u.is_approved);
  const activeUsers = users.filter(u => u.is_approved && u.is_active);
  const inactiveUsers = users.filter(u => u.is_approved && !u.is_active);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-2">Manage users and system settings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-orange-600">{pendingUsers.length}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <UserCheck className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-green-600">{activeUsers.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive Users</p>
              <p className="text-2xl font-bold text-red-600">{inactiveUsers.length}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingUsers.map((pendingUser) => (
              <div key={pendingUser.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{pendingUser.username}</h3>
                    <p className="text-sm text-gray-600">{pendingUser.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Registered: {format(new Date(pendingUser.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateUserStatus(pendingUser.id, 'is_approved', true)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateUserStatus(pendingUser.id, 'is_active', false)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Users */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {users.map((userItem) => (
            <div key={userItem.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    !userItem.is_approved ? 'bg-orange-500' :
                    userItem.is_active ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{userItem.username}</h3>
                      {userItem.role === 'admin' && (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{userItem.email}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span>Joined: {format(new Date(userItem.created_at), 'MMM d, yyyy')}</span>
                      {userItem.last_login && (
                        <span>Last login: {format(new Date(userItem.last_login), 'MMM d, yyyy')}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {userItem.is_approved ? (
                      <button
                        onClick={() => updateUserStatus(userItem.id, 'is_approved', false)}
                        className="text-orange-600 hover:text-orange-700 text-sm"
                      >
                        Unapprove
                      </button>
                    ) : (
                      <button
                        onClick={() => updateUserStatus(userItem.id, 'is_approved', true)}
                        className="text-green-600 hover:text-green-700 text-sm"
                      >
                        Approve
                      </button>
                    )}
                    <span className="text-gray-300">|</span>
                    {userItem.is_active ? (
                      <button
                        onClick={() => updateUserStatus(userItem.id, 'is_active', false)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => updateUserStatus(userItem.id, 'is_active', true)}
                        className="text-green-600 hover:text-green-700 text-sm"
                      >
                        Activate
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === userItem.id ? null : userItem.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {activeDropdown === userItem.id && (
                      <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                        <button
                          onClick={() => handleImpersonate(userItem)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View as User
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;