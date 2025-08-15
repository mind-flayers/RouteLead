import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../lib/auth';

export default function WelcomeScreen() {
  const { user, signOut } = useAuth();

  useEffect(() => {
    // Immediately redirect based on role so this page is not shown post-login
    if (user?.role === 'CUSTOMER') {
      router.replace('/pages/customer/Dashboard');
    } else if (user?.role === 'DRIVER') {
      router.replace('/pages/driver/Dashboard');
    }
  }, [user]);

  const getWelcomeMessage = () => {
    if (!user) return 'Welcome!';
    switch (user.role) {
      case 'ADMIN':
        return `Welcome, Admin ${user.firstName || ''}!`;
      case 'DRIVER':
        return `Welcome, Driver ${user.firstName || ''}!`;
      case 'CUSTOMER':
        return `Welcome, ${user.firstName || 'Customer'}!`;
      default:
        return 'Welcome!';
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/pages/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View className="flex-1 bg-background p-5">
      <View className="items-center mt-20 mb-10">
        <Image
          source={require('../../assets/images/logo_vehicle.png')}
          className="w-36 h-24"
          resizeMode="contain"
        />
        <Image
          source={require('../../assets/images/logo_text.png')}
          className="w-48 h-12 mb-2.5"
          resizeMode="contain"
        />
      </View>

      <View className="flex-1 justify-center items-center">
        <Text className="text-3xl font-bold text-secondary mb-4">
          {getWelcomeMessage()}
        </Text>
        <Text className="text-base text-text-light text-center mb-8">
          You have successfully signed in to RouteLead.
        </Text>

        <TouchableOpacity
          className="bg-primary rounded-xl p-4 w-full mb-4"
          onPress={() => router.push('/(tabs)/explore')}
        >
          <Text className="text-white text-lg font-bold text-center">
            Go to Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-200 rounded-xl p-4 w-full"
          onPress={handleSignOut}
        >
          <Text className="text-gray-700 text-lg font-bold text-center">
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 