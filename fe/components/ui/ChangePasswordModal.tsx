import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import PrimaryButton from './PrimaryButton';
import { supabase } from '@/lib/supabase';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onPasswordChanged?: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  onClose,
  onPasswordChanged,
}) => {
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [showPasswords, setShowPasswords] = useState({
    newPassword: false,
    confirmPassword: false,
  });

  const slideAnim = useState(new Animated.Value(-100))[0];

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    // New password validation
    if (!passwords.newPassword.trim()) {
      errors.newPassword = 'New password is required';
    } else if (passwords.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwords.newPassword)) {
      errors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm password validation
    if (!passwords.confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword
      });

      if (error) {
        throw error;
      }

      // Show success animation
      triggerSuccessAnimation();
      
      // Notify parent component
      if (onPasswordChanged) {
        onPasswordChanged();
      }

      // Clear form
      setPasswords({
        newPassword: '',
        confirmPassword: '',
      });

      // Close modal after animation
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to change password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const triggerSuccessAnimation = () => {
    setShowSuccess(true);
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => setShowSuccess(false));
  };

  const updatePassword = (field: keyof typeof passwords, value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleClose = () => {
    // Clear form and errors when closing
    setPasswords({
      newPassword: '',
      confirmPassword: '',
    });
    setValidationErrors({});
    setShowPasswords({
      newPassword: false,
      confirmPassword: false,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="lock-outline" size={28} color="#f97316" />
              <Text className="text-xl font-bold text-gray-800 ml-3">
                Change Password
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} className="p-2">
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-600 mt-2">
            Create a new secure password for your account
          </Text>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-6 py-6">
          <View className="space-y-6">
            {/* New Password */}
            <View>
              <Text className="text-base font-semibold text-gray-700 mb-2">
                New Password <Text className="text-red-500">*</Text>
              </Text>
              <View className="relative">
                <TextInput
                  value={passwords.newPassword}
                  onChangeText={(value) => updatePassword('newPassword', value)}
                  placeholder="Enter your new password"
                  secureTextEntry={!showPasswords.newPassword}
                  className={`bg-white border rounded-xl px-4 py-4 pr-12 text-base ${
                    validationErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => togglePasswordVisibility('newPassword')}
                  className="absolute right-4 top-4"
                >
                  <Ionicons
                    name={showPasswords.newPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {validationErrors.newPassword && (
                <Text className="text-red-500 text-sm mt-1">{validationErrors.newPassword}</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View>
              <Text className="text-base font-semibold text-gray-700 mb-2">
                Confirm New Password <Text className="text-red-500">*</Text>
              </Text>
              <View className="relative">
                <TextInput
                  value={passwords.confirmPassword}
                  onChangeText={(value) => updatePassword('confirmPassword', value)}
                  placeholder="Confirm your new password"
                  secureTextEntry={!showPasswords.confirmPassword}
                  className={`bg-white border rounded-xl px-4 py-4 pr-12 text-base ${
                    validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => togglePasswordVisibility('confirmPassword')}
                  className="absolute right-4 top-4"
                >
                  <Ionicons
                    name={showPasswords.confirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {validationErrors.confirmPassword && (
                <Text className="text-red-500 text-sm mt-1">{validationErrors.confirmPassword}</Text>
              )}
            </View>

            {/* Password Requirements */}
            <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="information-circle" size={20} color="#3b82f6" />
                <Text className="text-blue-800 font-semibold ml-2">Password Requirements</Text>
              </View>
              <Text className="text-blue-700 text-sm">
                • At least 8 characters long{'\n'}
                • Contains at least one uppercase letter{'\n'}
                • Contains at least one lowercase letter{'\n'}
                • Contains at least one number
              </Text>
            </View>

            {/* Security Note */}
            <View className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="shield-checkmark" size={20} color="#f97316" />
                <Text className="text-orange-800 font-semibold ml-2">Security Notice</Text>
              </View>
              <Text className="text-orange-700 text-sm">
                After changing your password, you will remain logged in on this device. All other sessions will be terminated for security.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View className="bg-white px-6 py-4 border-t border-gray-200">
          <View className="flex-row space-x-4">
            <TouchableOpacity
              onPress={handleClose}
              className="flex-1 bg-gray-200 py-4 rounded-xl items-center"
              disabled={saving}
            >
              <Text className="text-gray-700 font-semibold text-base">Cancel</Text>
            </TouchableOpacity>
            
            <View className="flex-1">
              <PrimaryButton
                title={saving ? "Changing..." : "Change Password"}
                onPress={handleChangePassword}
                disabled={saving || !passwords.newPassword || !passwords.confirmPassword}
                icon={saving ? <ActivityIndicator size="small" color="white" /> : undefined}
              />
            </View>
          </View>
        </View>

        {/* Success Animation */}
        {showSuccess && (
          <Animated.View
            style={{
              transform: [{ translateY: slideAnim }],
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              backgroundColor: '#10b981',
              paddingVertical: 16,
              paddingHorizontal: 20,
              zIndex: 1000,
            }}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Text className="text-white font-semibold text-base ml-2">
                Password changed successfully!
              </Text>
            </View>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
};

export default ChangePasswordModal;