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

  const login = async (email, password) => {
    // 1. First, attempt to sign in the user with their credentials
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    // If the email/password is wrong, return the standard auth error
    if (authError) {
      return { user: null, error: authError };
    }

    // 2. If the credentials are correct, check the user's approval status in the 'profiles' table
    if (authData.user) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('is_approved')
        .eq('id', authData.user.id)
        .single();

      // If there's an error fetching the profile, sign the user out and return an error
      if (profileError) {
        await supabase.auth.signOut();
        return { user: null, error: new Error("Could not find user profile.") };
      }

      // 3. If the profile exists and 'is_approved' is true, the login is successful
      if (profileData && profileData.is_approved) {
        return { user: authData.user, error: null };
      } else {
        // 4. If 'is_approved' is false, sign the user out immediately and return our custom approval error
        await supabase.auth.signOut();
        const approvalError = new Error("Your account has not been approved by an administrator.");
        return { user: null, error: approvalError };
      }
    }

    // Fallback for any other unknown issues
    return { user: null, error: new Error("An unknown error occurred during login.") };
  };

  const signUp = async (email, password) => {
    // Sign up the new user
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    
    if (authError) {
      return { user: null, error: authError };
    }

    // If signup is successful, create a corresponding profile entry
    if (authData.user) {
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({ id: authData.user.id, email: authData.user.email });

        if (profileError) {
            // If profile creation fails, you might want to handle this, e.g., delete the user
            console.error("Failed to create user profile:", profileError);
            return { user: null, error: profileError };
        }
    }

    return { user: authData.user, error: null };
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
