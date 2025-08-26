import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import PrimaryButton from '@/components/ui/PrimaryButton';
import SecondaryButton from '@/components/ui/SecondaryButton';
import PrimaryCard from '@/components/ui/PrimaryCard';
import PaymentPreferencesModal from '@/components/ui/PaymentPreferencesModal';
import { formatCurrency } from '@/services/apiService';
import { useDriverInfo } from '@/hooks/useEarningsData';
import { 
  WithdrawalAPI, 
  BankDetailsAPI, 
  BankDetails, 
  WithdrawalRequest, 
  AvailableBalanceResponse 
} from '@/services/withdrawalService';

const WithdrawalForm = () => {
  const router = useRouter();
  const { driverId } = useDriverInfo();

  const [amount, setAmount] = useState('');
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bankDetailsLoading, setBankDetailsLoading] = useState(false);
  
  // Success animation
  const [showSuccess, setShowSuccess] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-100));

  const minWithdrawal = 1000;
  const maxWithdrawal = availableBalance;

  useEffect(() => {
    if (driverId) {
      loadInitialData();
    }
  }, [driverId]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load available balance and bank details in parallel
      const [balanceResult, bankDetailsResult] = await Promise.all([
        WithdrawalAPI.getAvailableBalance(driverId),
        BankDetailsAPI.getBankDetails(driverId)
      ]);

      setAvailableBalance(balanceResult.availableBalance);
      setBankDetails(bankDetailsResult);
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Error', 'Failed to load account information');
    } finally {
      setLoading(false);
    }
  };

  const loadBankDetails = async () => {
    setBankDetailsLoading(true);
    try {
      const details = await BankDetailsAPI.getBankDetails(driverId);
      setBankDetails(details);
    } catch (error) {
      console.error('Error loading bank details:', error);
      Alert.alert('Error', 'Failed to load bank details');
    } finally {
      setBankDetailsLoading(false);
    }
  };

  const validateWithdrawal = (): boolean => {
    const withdrawalAmount = parseFloat(amount);
    
    if (!amount || withdrawalAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }
    
    if (withdrawalAmount < minWithdrawal) {
      Alert.alert('Error', `Minimum withdrawal amount is ${formatCurrency(minWithdrawal)}`);
      return false;
    }
    
    if (withdrawalAmount > maxWithdrawal) {
      Alert.alert('Error', `Maximum withdrawal amount is ${formatCurrency(maxWithdrawal)}`);
      return false;
    }
    
    if (!bankDetails) {
      Alert.alert('Bank Details Required', 'Please add your bank details first');
      return false;
    }

    return true;
  };

  const handleWithdrawal = async () => {
    if (!validateWithdrawal()) {
      return;
    }

    setSubmitting(true);
    try {
      const withdrawalRequest: WithdrawalRequest = {
        driverId,
        amount: parseFloat(amount),
        bankDetails: bankDetails!,
      };

      const result = await WithdrawalAPI.createWithdrawal(withdrawalRequest);
      
      // Show success animation
      triggerSuccessAnimation();
      
      // Navigate to success page after animation
      setTimeout(() => {
        router.push({
          pathname: '/pages/driver/WithdrawalSuccess',
          params: {
            amount: amount,
            transactionId: result.id,
            bankName: bankDetails!.bankName,
            accountNumber: bankDetails!.accountNumber,
          },
        });
      }, 2000);

    } catch (error) {
      console.error('Error creating withdrawal:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to process withdrawal');
    } finally {
      setSubmitting(false);
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

  const handleBankDetailsUpdated = (updatedDetails: BankDetails) => {
    setBankDetails(updatedDetails);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f97316" />
          <Text className="text-gray-600 mt-4">Loading account information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Withdraw Funds</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        {/* Available Balance Card */}
        <PrimaryCard className="mb-6">
          <View className="items-center">
            <Text className="text-sm text-gray-500 mb-1">Available Balance</Text>
            <Text className="text-3xl font-bold text-gray-800 mb-2">
              {formatCurrency(availableBalance)}
            </Text>
            <Text className="text-gray-500 text-sm">
              Min: {formatCurrency(minWithdrawal)} • Max: {formatCurrency(maxWithdrawal)}
            </Text>
          </View>
        </PrimaryCard>

        {/* Amount Input */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-3">Withdrawal Amount</Text>
          <View className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              keyboardType="numeric"
              className="text-2xl font-bold text-center"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View className="flex-row justify-between mt-2">
            <TouchableOpacity
              onPress={() => setAmount((availableBalance * 0.25).toString())}
              className="bg-orange-100 px-3 py-1 rounded-full"
            >
              <Text className="text-orange-600 text-sm font-medium">25%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setAmount((availableBalance * 0.5).toString())}
              className="bg-orange-100 px-3 py-1 rounded-full"
            >
              <Text className="text-orange-600 text-sm font-medium">50%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setAmount((availableBalance * 0.75).toString())}
              className="bg-orange-100 px-3 py-1 rounded-full"
            >
              <Text className="text-orange-600 text-sm font-medium">75%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setAmount(availableBalance.toString())}
              className="bg-orange-100 px-3 py-1 rounded-full"
            >
              <Text className="text-orange-600 text-sm font-medium">Max</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bank Details Section */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold">Bank Details</Text>
            <TouchableOpacity 
              onPress={() => setShowPaymentModal(true)}
              className="flex-row items-center"
            >
              <MaterialCommunityIcons name="pencil" size={16} color="#f97316" />
              <Text className="text-orange-500 ml-1 font-medium">
                {bankDetails ? 'Edit' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>

          {bankDetailsLoading ? (
            <View className="bg-white rounded-lg p-4 items-center">
              <ActivityIndicator size="small" color="#f97316" />
              <Text className="text-gray-600 mt-2">Loading bank details...</Text>
            </View>
          ) : bankDetails ? (
            <View className="bg-white rounded-lg border border-gray-200 p-4">
              <View className="flex-row items-center mb-3">
                <MaterialCommunityIcons name="bank" size={24} color="#f97316" />
                <Text className="text-gray-800 font-semibold ml-2">{bankDetails.bankName}</Text>
              </View>
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Account Name:</Text>
                  <Text className="text-gray-800 font-medium">{bankDetails.accountName}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Account Number:</Text>
                  <Text className="text-gray-800 font-mono">
                    ****{bankDetails.accountNumber.slice(-4)}
                  </Text>
                </View>
                {bankDetails.branchCode && (
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Branch Code:</Text>
                    <Text className="text-gray-800">{bankDetails.branchCode}</Text>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              onPress={() => setShowPaymentModal(true)}
              className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 items-center"
            >
              <MaterialCommunityIcons name="bank-plus" size={48} color="#9CA3AF" />
              <Text className="text-gray-600 font-medium mt-2">Add Bank Details</Text>
              <Text className="text-gray-400 text-sm text-center mt-1">
                Tap to add your bank account for withdrawals
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Summary Section */}
        {amount && parseFloat(amount) > 0 && (
          <PrimaryCard className="mb-6">
            <Text className="text-lg font-semibold mb-4">Withdrawal Summary</Text>
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Withdrawal Amount:</Text>
                <Text className="font-semibold">{formatCurrency(parseFloat(amount))}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Processing Fee:</Text>
                <Text className="font-semibold">Free</Text>
              </View>
              <View className="border-t border-gray-200 pt-3">
                <View className="flex-row justify-between">
                  <Text className="text-gray-800 font-semibold">You'll Receive:</Text>
                  <Text className="font-bold text-green-600">{formatCurrency(parseFloat(amount))}</Text>
                </View>
              </View>
            </View>
          </PrimaryCard>
        )}

        {/* Processing Info */}
        <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={20} color="#3b82f6" />
            <Text className="text-blue-800 font-semibold ml-2">Processing Information</Text>
          </View>
          <Text className="text-blue-700 text-sm">
            • Withdrawals are processed within 1-3 business days{'\n'}
            • You'll receive a confirmation once processing begins{'\n'}
            • Ensure your bank details are correct to avoid delays
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="bg-white px-6 py-4 border-t border-gray-200">
        <View className="flex-row space-x-4">
          <View className="flex-1">
            <SecondaryButton
              title="Cancel"
              onPress={() => router.back()}
              disabled={submitting}
            />
          </View>
          <View className="flex-1">
            <PrimaryButton
              title={submitting ? "Processing..." : "Confirm Withdrawal"}
              onPress={handleWithdrawal}
              disabled={!amount || !bankDetails || submitting || parseFloat(amount || '0') <= 0}
              icon={submitting ? <ActivityIndicator size="small" color="white" /> : undefined}
            />
          </View>
        </View>
      </View>

      {/* Payment Preferences Modal */}
      <PaymentPreferencesModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        driverId={driverId}
        onBankDetailsUpdated={handleBankDetailsUpdated}
      />

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
              Withdrawal request submitted successfully!
            </Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

export default WithdrawalForm;