import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, session, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (session && user) {
        // User is authenticated, redirect based on role
        if (user.role === 'CUSTOMER') {
          router.replace('/pages/customer/Dashboard');
        } else if (user.role === 'DRIVER') {
          router.replace('/pages/driver/Dashboard');
        } else {
          // Default fallback for other roles
          router.replace('/(tabs)/explore');
        }
      } else {
        // User is not authenticated, redirect to login
        router.replace('/pages/login');
      }
    }
  }, [loading, session, user]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#F97316" />
        <Text className="mt-4 text-lg text-gray-600">Loading...</Text>
      </View>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
