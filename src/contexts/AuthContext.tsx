import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase'; // Make sure this path is correct
import { Session, User } from '@supabase/supabase-js';

// Define the shape of the context value
interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  login: (email, password) => Promise<any>;
  signUp: (email, password) => Promise<any>;
  signOut: () => Promise<void>;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // --- ADMIN APPROVAL LOGIC TEMPORARILY DISABLED ---
  const login = async (email, password) => {
    // This now directly attempts to sign in without checking the 'profiles' table.
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { user: data.user, error };
  };

  // --- PROFILE CREATION LOGIC TEMPORARILY DISABLED ---
  const signUp = async (email, password) => {
    // This now only signs up the user without creating a corresponding profile entry.
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { user: data.user, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    loading,
    login,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
