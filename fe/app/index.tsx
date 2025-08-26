import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../lib/auth';

export default function IndexScreen() {
  const { user, session, loading } = useAuth();

  useEffect(() => {
    console.log('🔍 Auth state check:', { 
      loading, 
      hasSession: !!session, 
      hasUser: !!user, 
      userRole: user?.role,
      sessionUser: session?.user?.id 
    });
    
    if (!loading) {
      if (session && user) {
        // User is authenticated, redirect based on role
        console.log('✅ User authenticated, redirecting based on role:', user.role);
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
        console.log('❌ User not authenticated, redirecting to login', { session: !!session, user: !!user });
        router.replace('/pages/login');
      }
    } else {
      console.log('⏳ Still loading authentication state...');
    }
  }, [loading, session, user]);

  return (
    <View className="flex-1 justify-center items-center bg-gray-100">
      <ActivityIndicator size="large" color="#F97316" />
      <Text className="mt-4 text-lg text-gray-600">Loading...</Text>
      <Text className="mt-2 text-sm text-gray-500">Checking authentication...</Text>
    </View>
  );
} 