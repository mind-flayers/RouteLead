import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { User, UserRole, AuthState } from './types';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole) => Promise<void>;
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

  const signUp = async (email: string, password: string, role: UserRole) => {
    console.log('Starting signup process with role:', role);
    const { error: signUpError, data } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          role: role
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (signUpError) throw signUpError;

    if (data.user) {
      console.log('User created successfully, updating profile...');
      try {
        // Wait a short moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update the profile with the correct role
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: role })
          .eq('id', data.user.id);

        if (updateError) {
          console.error('Failed to update profile role:', updateError);
          throw updateError;
        }

        // Verify the role was updated
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (fetchError) {
          console.error('Failed to verify profile update:', fetchError);
          throw fetchError;
        }

        console.log('Profile role successfully set to:', profile.role);
      } catch (error: any) {
        console.error('Error during profile update:', error);
        throw error;
      }
    }
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