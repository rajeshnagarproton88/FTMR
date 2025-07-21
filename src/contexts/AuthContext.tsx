import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DemoStorage } from '../lib/demoStorage';
import { User } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  impersonateUser: (userId: string) => Promise<void>;
  returnToAdmin: () => Promise<void>;
  isImpersonating: boolean;
  originalAdminUser: User | null;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [originalAdminUser, setOriginalAdminUser] = useState<User | null>(null);
  const isDemoMode = !supabase;

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      if (isDemoMode) {
        // Check for demo user in localStorage
        const currentUser = localStorage.getItem('demo_current_user');
        if (currentUser) {
          setUser(JSON.parse(currentUser));
        }
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userData && userData.is_active && userData.is_approved) {
            setUser(userData);
          }
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      if (isDemoMode) {
        // Demo mode login
        const users = DemoStorage.getUsers();
        const user = users.find((u: any) => u.username === username && u.password === password);
        
        if (!user) {
          toast.error('Invalid username or password');
          return false;
        }

        if (!user.is_approved) {
          toast.error('Your account is pending approval');
          return false;
        }

        if (!user.is_active) {
          toast.error('Your account has been deactivated');
          return false;
        }

        // Update last login
        user.last_login = new Date().toISOString();
        const updatedUsers = users.map((u: any) => u.id === user.id ? user : u);
        DemoStorage.saveUsers(updatedUsers);

        setUser(user);
        localStorage.setItem('demo_current_user', JSON.stringify(user));
        toast.success('Login successful (Demo Mode)');
        return true;
      } else {
        // Supabase login
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .single();

        if (!userData) {
          toast.error('Invalid username or password');
          return false;
        }

        if (!userData.is_approved) {
          toast.error('Your account is pending approval');
          return false;
        }

        if (!userData.is_active) {
          toast.error('Your account has been deactivated');
          return false;
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: userData.email,
          password: password,
        });

        if (error) {
          toast.error('Invalid username or password');
          return false;
        }

        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', userData.id);

        setUser(userData);
        toast.success('Login successful');
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      if (isDemoMode) {
        // Demo mode registration
        const users = DemoStorage.getUsers();
        const existingUser = users.find((u: any) => u.username === username || u.email === email);

        if (existingUser) {
          toast.error('Username or email already exists');
          return false;
        }

        const newUser = {
          id: Date.now().toString(),
          username,
          email,
          password,
          role: 'user',
          is_active: true,
          is_approved: false,
          created_at: new Date().toISOString(),
        };

        users.push(newUser);
        DemoStorage.saveUsers(users);
        toast.success('Registration successful! Please wait for admin approval. (Demo Mode)');
        return true;
      } else {
        // Supabase registration
        const { data: existingUser } = await supabase
          .from('users')
          .select('username')
          .eq('username', username)
          .single();

        if (existingUser) {
          toast.error('Username already exists');
          return false;
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) {
          toast.error(authError.message);
          return false;
        }

        if (authData.user) {
          const { error: userError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              username,
              email,
              role: 'user',
              is_active: true,
              is_approved: false,
            });

          if (userError) {
            toast.error('Registration failed');
            return false;
          }

          toast.success('Registration successful! Please wait for admin approval.');
          return true;
        }

        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed');
      return false;
    }
  };

  const logout = async () => {
    if (isDemoMode) {
      localStorage.removeItem('demo_current_user');
    } else {
      await supabase.auth.signOut();
    }
    
    setUser(null);
    setIsImpersonating(false);
    setOriginalAdminUser(null);
    toast.success('Logged out successfully');
  };

  const impersonateUser = async (userId: string) => {
    if (!user || user.role !== 'admin') return;

    try {
      if (isDemoMode) {
        const users = DemoStorage.getUsers();
        const targetUser = users.find((u: any) => u.id === userId);
        
        if (targetUser) {
          setOriginalAdminUser(user);
          setUser(targetUser);
          setIsImpersonating(true);
          localStorage.setItem('demo_current_user', JSON.stringify(targetUser));
          toast.success(`Now viewing as ${targetUser.username} (Demo Mode)`);
        }
      } else {
        const { data: targetUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (targetUser) {
          setOriginalAdminUser(user);
          setUser(targetUser);
          setIsImpersonating(true);
          toast.success(`Now viewing as ${targetUser.username}`);
        }
      }
    } catch (error) {
      console.error('Impersonation error:', error);
      toast.error('Failed to impersonate user');
    }
  };

  const returnToAdmin = async () => {
    if (originalAdminUser) {
      setUser(originalAdminUser);
      setOriginalAdminUser(null);
      setIsImpersonating(false);
      
      if (isDemoMode) {
        localStorage.setItem('demo_current_user', JSON.stringify(originalAdminUser));
      }
      
      toast.success('Returned to admin account');
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    impersonateUser,
    returnToAdmin,
    isImpersonating,
    originalAdminUser,
    isDemoMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};