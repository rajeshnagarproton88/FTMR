import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  CreditCard,
  CheckSquare,
  Bell,
  RotateCcw,
  Calculator,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  User,
  ArrowLeft,
} from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout, isImpersonating, returnToAdmin, isDemoMode } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigationItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/expenses', icon: CreditCard, label: 'Expenses' },
    { path: '/todos', icon: CheckSquare, label: 'To-Dos' },
    { path: '/reminders', icon: Bell, label: 'Reminders' },
    { path: '/recurring', icon: RotateCcw, label: 'Recurring' },
    { path: '/emis', icon: Calculator, label: 'EMIs' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
    { path: '/notifications', icon: Settings, label: 'Notifications' },
  ];

  if (user?.role === 'admin') {
    navigationItems.push({ path: '/admin', icon: Shield, label: 'Admin Panel' });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="bg-orange-500 text-white px-4 py-2 text-center">
          <span className="font-medium">
            Demo Mode - Data stored in browser localStorage
          </span>
        </div>
      )}

      {/* Impersonation Banner */}
      {isImpersonating && (
        <div className="bg-orange-500 text-white px-4 py-2 text-center">
          <span className="font-medium">
            You are viewing as {user?.username}
          </span>
          <button
            onClick={returnToAdmin}
            className="ml-4 underline hover:no-underline"
          >
            Return to your Admin Account
          </button>
        </div>
      )}

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold text-gray-800">Finance Manager</h1>
            <p className="text-sm text-gray-600 mt-1">Welcome, {user?.username}</p>
          </div>

          <nav className="mt-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 w-64 p-6 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;