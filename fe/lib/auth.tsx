import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { User, UserRole, AuthState } from './types';

interface SignUpData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole, data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: () => boolean;
  isDriver: () => boolean;
  isCustomer: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setState(prev => ({ ...prev, session, loading: false }));
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(prev => ({ ...prev, session, loading: false }));
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return;
    }

    setState(prev => ({
      ...prev,
      user: {
        id: userId,
        email: data.email,
        role: data.role,
        firstName: data.first_name,
        lastName: data.last_name,
        phoneNumber: data.phone_number,
      },
    }));
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, role: UserRole, data: SignUpData) => {
    console.log('Starting signup process with role:', role);
    console.log('Signup data being sent to Supabase:', {
      email,
      password: '***', // masked for security
      options: {
        data: {
          role: role,
          first_name: data.firstName,
          last_name: data.lastName,
          phone_number: data.phoneNumber
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    const { error: signUpError, data: authData } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          role: role,
          first_name: data.firstName,
          last_name: data.lastName,
          phone_number: data.phoneNumber
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    console.log('Full Supabase Auth Raw Response:', authData);

    if (signUpError) {
      console.error('Supabase signup error details:', {
        message: signUpError.message,
        status: signUpError.status,
        name: signUpError.name
      });
      throw signUpError;
    }

    console.log('Auth response from Supabase:', {
      user: authData.user ? {
        id: authData.user.id,
        email: authData.user.email,
        metadata: authData.user.user_metadata
      } : null,
      session: authData.session ? 'Session created' : 'No session'
    });

    // Removed immediate profile verification. The handle_new_user trigger in the database is responsible for creating the profile.
    // The frontend should only attempt to fetch the profile after the user has successfully authenticated (e.g., after email confirmation and login).
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setState({ user: null, session: null, loading: false });
  };

  const isAdmin = () => state.user?.role === UserRole.ADMIN;
  const isDriver = () => state.user?.role === UserRole.DRIVER;
  const isCustomer = () => state.user?.role === UserRole.CUSTOMER;

  const value = {
    ...state,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isDriver,
    isCustomer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 