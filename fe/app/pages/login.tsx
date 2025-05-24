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
        setAlert({
          visible: true,
          title: 'Success!',
          message: 'You have successfully signed in to RouteLead.',
          type: 'success'
        });
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
    if (alert.type === 'success') {
      router.replace('/pages/welcome');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView className="flex-1 px-5">
        <View className="items-center mt-40 mb-10">
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

        <View className="px-5">
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
            <Text className="text-text-light text-sm">Don't have an account? </Text>
            <TouchableOpacity 
              onPress={() => router.push('/pages/signup')}
              style={{ pointerEvents: 'auto' }}
            >
              <Text className="text-primary text-sm font-bold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onDismiss={handleAlertDismiss}
      />
    </KeyboardAvoidingView>
  );
} 