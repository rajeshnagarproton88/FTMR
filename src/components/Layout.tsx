import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  CreditCard,
  CheckSquare,
  Bell,
  Repeat,
  Calculator,
  BarChart2,
  BellRing,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/expenses', label: 'Expenses', icon: CreditCard },
  { href: '/todos', label: 'To-Dos', icon: CheckSquare },
  { href: '/reminders', label: 'Reminders', icon: Bell },
  { href: '/recurring', label: 'Recurring', icon: Repeat },
  { href: '/emis', label: 'EMIs', icon: Calculator },
  { href: '/reports', label: 'Reports', icon: BarChart2 },
  { href: '/notifications', label: 'Notifications', icon: BellRing },
  { href: '/admin', label: 'Admin Panel', icon: Settings },
];

const Sidebar: React.FC<{ isOpen: boolean; setIsOpen: (isOpen: boolean) => void }> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 w-64 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:h-auto transition-transform duration-300 ease-in-out z-30`}
      >
        <div className="p-4 flex justify-between items-center lg:justify-start">
          <h1 className="text-2xl font-bold text-blue-600">Finance Manager</h1>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500">
            <X size={24} />
          </button>
        </div>
        <nav className="mt-6">
          <ul>
            {navItems.map((item) => (
              <li key={item.href} className="px-4">
                <Link
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center p-3 my-1 rounded-lg transition-colors ${
                    location.pathname === item.href
                      ? 'bg-blue-100 text-blue-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    // The onAuthStateChange listener will handle redirecting,
    // but we can navigate for a faster user experience.
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      {/* Menu button for mobile */}
      <button onClick={onMenuClick} className="lg:hidden text-gray-600">
        <Menu size={24} />
      </button>
      
      <div className="flex-grow"></div> {/* Spacer */}

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <span>{user?.email}</span>
          <ChevronDown size={16} />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-10">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet /> {/* This is where the page content (Dashboard, Expenses, etc.) will be rendered */}
        </main>
      </div>
    </div>
  );
};

export default Layout;
