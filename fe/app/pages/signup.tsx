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

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = () => {
    // TODO: Implement signup logic
    router.replace('/(tabs)');
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
          <Text className="text-3xl font-bold text-secondary mb-2">Create Account</Text>
          <Text className="text-base text-text-light mb-8">Sign up to get started</Text>

          <View className="mb-4">
            <TextInput
              className="bg-gray-100 rounded-xl p-4 text-base border border-border"
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              style={{ boxShadow: 'none' }}
            />
          </View>

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

          <View className="mb-4">
            <TextInput
              className="bg-gray-100 rounded-xl p-4 text-base border border-border"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={{ boxShadow: 'none' }}
            />
          </View>

          <TouchableOpacity 
            className="bg-primary rounded-xl p-4 items-center mb-6"
            onPress={handleSignup}
            style={{ pointerEvents: 'auto' }}
          >
            <Text className="text-white text-lg font-bold">Sign Up</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center items-center">
            <Text className="text-text-light text-sm">Already have an account? </Text>
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{ pointerEvents: 'auto' }}
            >
              <Text className="text-primary text-sm font-bold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 