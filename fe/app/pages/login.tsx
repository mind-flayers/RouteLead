import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import CustomAlert from '../../components/CustomAlert';
import { useAuth } from '../../lib/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info'
  });

  const { user } = useAuth();

  const handleLogin = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.user) {
        if (user?.role === 'CUSTOMER') {
          router.replace('/pages/customer/Dashboard');
        } else if (user?.role === 'DRIVER') {
          router.replace('/pages/driver/Dashboard');
        } else {
          router.replace('/pages/welcome');
        }
      }
    } catch (error: any) {
      setAlert({
        visible: true,
        title: 'Error',
        message: error.message || 'Failed to sign in. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAlertDismiss = () => {
    setAlert(prev => ({ ...prev, visible: false }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F6F6FA' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          className="flex-1 px-5"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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

          <View className="px-5 flex-1">
            <Text className="text-3xl font-bold text-secondary mb-2">Welcome Back!</Text>
            <Text className="text-base text-text-light mb-8">Sign in to continue</Text>

            <View className="mb-4">
              <TextInput
                className="bg-gray-100 rounded-xl p-4 text-base border border-border"
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ boxShadow: 'none' }}
              />
            </View>

            <View className="mb-4">
              <TextInput
                className="bg-gray-100 rounded-xl p-4 text-base border border-border"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={{ boxShadow: 'none' }}
              />
            </View>

            <TouchableOpacity 
              className="self-end mb-6"
              style={{ pointerEvents: 'auto' }}
            >
              <Text className="text-primary text-sm">Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-primary rounded-xl p-4 items-center mb-6"
              onPress={handleLogin}
              disabled={loading}
              style={{ pointerEvents: 'auto', opacity: loading ? 0.7 : 1 }}
            >
              <Text className="text-white text-lg font-bold">
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center items-center">
              <Text className="text-text-light text-sm"> Don&apos;t have an account? </Text>
              <TouchableOpacity 
                onPress={() => router.push('/pages/signup')}
                style={{ pointerEvents: 'auto' }}
              >
                <Text className="text-primary text-sm font-bold">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onDismiss={handleAlertDismiss}
      />
    </View>
  );
} 