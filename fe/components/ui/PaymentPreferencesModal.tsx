import React, { useState, useEffect } from 'react';
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
import { BankDetails, BankDetailsAPI } from '../../services/withdrawalService';

interface PaymentPreferencesModalProps {
  visible: boolean;
  onClose: () => void;
  driverId: string;
  onBankDetailsUpdated?: (bankDetails: BankDetails) => void;
}

const PaymentPreferencesModal: React.FC<PaymentPreferencesModalProps> = ({
  visible,
  onClose,
  driverId,
  onBankDetailsUpdated,
}) => {
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bankName: '',
    accountName: '',
    accountNumber: '',
    branchCode: '',
    swiftCode: '',
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const slideAnim = useState(new Animated.Value(-100))[0];

  useEffect(() => {
    if (visible) {
      loadBankDetails();
    }
  }, [visible, driverId]);

  const loadBankDetails = async () => {
    setLoading(true);
    try {
      const details = await BankDetailsAPI.getBankDetails(driverId);
      if (details) {
        setBankDetails({
          bankName: details.bankName || '',
          accountName: details.accountName || '',
          accountNumber: details.accountNumber || '',
          branchCode: details.branchCode || '',
          swiftCode: details.swiftCode || '',
        });
      }
    } catch (error) {
      console.error('Error loading bank details:', error);
      Alert.alert('Error', 'Failed to load bank details');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!bankDetails.bankName.trim()) {
      errors.bankName = 'Bank name is required';
    }

    if (!bankDetails.accountName.trim()) {
      errors.accountName = 'Account holder name is required';
    }

    if (!bankDetails.accountNumber.trim()) {
      errors.accountNumber = 'Account number is required';
    } else if (bankDetails.accountNumber.length < 8) {
      errors.accountNumber = 'Account number must be at least 8 digits';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const updatedDetails = await BankDetailsAPI.updateBankDetails(driverId, bankDetails);
      
      // Show success animation
      triggerSuccessAnimation();
      
      // Notify parent component
      if (onBankDetailsUpdated) {
        onBankDetailsUpdated(updatedDetails);
      }

      // Close modal after animation
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error saving bank details:', error);
      Alert.alert('Error', 'Failed to save bank details. Please try again.');
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

  const updateBankDetail = (field: keyof BankDetails, value: string) => {
    setBankDetails(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="bank" size={28} color="#f97316" />
              <Text className="text-xl font-bold text-gray-800 ml-3">
                Payment Preferences
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-600 mt-2">
            Add or update your bank account details for withdrawals
          </Text>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-6 py-6">
          {loading ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color="#f97316" />
              <Text className="text-gray-600 mt-4">Loading bank details...</Text>
            </View>
          ) : (
            <View className="space-y-6">
              {/* Bank Name */}
              <View>
                <Text className="text-base font-semibold text-gray-700 mb-2">
                  Bank Name <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  value={bankDetails.bankName}
                  onChangeText={(value) => updateBankDetail('bankName', value)}
                  placeholder="e.g., Commercial Bank of Ceylon"
                  className={`bg-white border rounded-xl px-4 py-4 text-base ${
                    validationErrors.bankName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  autoCapitalize="words"
                />
                {validationErrors.bankName && (
                  <Text className="text-red-500 text-sm mt-1">{validationErrors.bankName}</Text>
                )}
              </View>

              {/* Account Holder Name */}
              <View>
                <Text className="text-base font-semibold text-gray-700 mb-2">
                  Account Holder Name <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  value={bankDetails.accountName}
                  onChangeText={(value) => updateBankDetail('accountName', value)}
                  placeholder="Full name as per bank account"
                  className={`bg-white border rounded-xl px-4 py-4 text-base ${
                    validationErrors.accountName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  autoCapitalize="words"
                />
                {validationErrors.accountName && (
                  <Text className="text-red-500 text-sm mt-1">{validationErrors.accountName}</Text>
                )}
              </View>

              {/* Account Number */}
              <View>
                <Text className="text-base font-semibold text-gray-700 mb-2">
                  Account Number <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  value={bankDetails.accountNumber}
                  onChangeText={(value) => updateBankDetail('accountNumber', value)}
                  placeholder="Enter account number"
                  className={`bg-white border rounded-xl px-4 py-4 text-base ${
                    validationErrors.accountNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  keyboardType="numeric"
                />
                {validationErrors.accountNumber && (
                  <Text className="text-red-500 text-sm mt-1">{validationErrors.accountNumber}</Text>
                )}
              </View>

              {/* Branch Code */}
              <View>
                <Text className="text-base font-semibold text-gray-700 mb-2">
                  Branch Code (Optional)
                </Text>
                <TextInput
                  value={bankDetails.branchCode}
                  onChangeText={(value) => updateBankDetail('branchCode', value)}
                  placeholder="Enter branch code"
                  className="bg-white border border-gray-300 rounded-xl px-4 py-4 text-base"
                />
              </View>

              {/* SWIFT Code */}
              <View>
                <Text className="text-base font-semibold text-gray-700 mb-2">
                  SWIFT Code (Optional)
                </Text>
                <TextInput
                  value={bankDetails.swiftCode}
                  onChangeText={(value) => updateBankDetail('swiftCode', value)}
                  placeholder="Enter SWIFT code"
                  className="bg-white border border-gray-300 rounded-xl px-4 py-4 text-base"
                  autoCapitalize="characters"
                />
              </View>

              {/* Security Note */}
              <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="shield-checkmark" size={20} color="#3b82f6" />
                  <Text className="text-blue-800 font-semibold ml-2">Security Notice</Text>
                </View>
                <Text className="text-blue-700 text-sm">
                  Your bank details are encrypted and stored securely. This information will only be used for processing your withdrawal requests.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View className="bg-white px-6 py-4 border-t border-gray-200">
          <View className="flex-row space-x-4">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-gray-200 py-4 rounded-xl items-center"
              disabled={saving}
            >
              <Text className="text-gray-700 font-semibold text-base">Cancel</Text>
            </TouchableOpacity>
            
            <View className="flex-1">
              <PrimaryButton
                title={saving ? "Saving..." : "Save Details"}
                onPress={handleSave}
                disabled={loading || saving}
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
                Bank details saved successfully!
              </Text>
            </View>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
};

export default PaymentPreferencesModal;
