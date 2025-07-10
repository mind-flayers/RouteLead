import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import PrimaryButton from '@/components/ui/PrimaryButton';
import SecondaryButton from '@/components/ui/SecondaryButton';
import PrimaryCard from '@/components/ui/PrimaryCard';
import { formatCurrency } from '@/services/apiService';
import { useEarningsData, useDriverInfo } from '@/hooks/useEarningsData';

const WithdrawalForm = () => {
  const router = useRouter();
  const { driverId } = useDriverInfo();
  const { summary, loading, error } = useEarningsData(driverId);

  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'bank' | 'mobile'>('bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  const availableBalance = useMemo(() => summary?.availableBalance ?? 0, [summary]);
  const minWithdrawal = 1000;
  const maxWithdrawal = availableBalance;

  const handleWithdrawal = () => {
    const withdrawalAmount = parseFloat(amount);
    
    if (!amount || withdrawalAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    if (withdrawalAmount < minWithdrawal) {
      Alert.alert('Error', `Minimum withdrawal amount is ${formatCurrency(minWithdrawal)}`);
      return;
    }
    
    if (withdrawalAmount > maxWithdrawal) {
      Alert.alert('Error', `Maximum withdrawal amount is ${formatCurrency(maxWithdrawal)}`);
      return;
    }
    
    if (selectedMethod === 'bank' && (!accountNumber || !bankName || !accountName)) {
      Alert.alert('Error', 'Please fill in all bank details');
      return;
    }
    
    if (selectedMethod === 'mobile' && !mobileNumber) {
      Alert.alert('Error', 'Please enter your mobile number');
      return;
    }
    
    // Navigate to success page
    router.push({
      pathname: '/pages/driver/WithdrawalSuccess',
      params: {
        amount: withdrawalAmount,
        method: selectedMethod === 'bank' ? 'Bank Transfer' : 'Mobile Money',
        accountNumber: selectedMethod === 'bank' ? `****${accountNumber.slice(-4)}` : mobileNumber,
        bankName: bankName,
        accountName: accountName,
        transactionId: 'TXN' + Date.now().toString().slice(-8),
        processingFee: selectedMethod === 'bank' ? 0 : withdrawalAmount * 0.01,
        driverId: driverId
      }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Bar */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Withdraw Funds</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#f97316" />
          <Text className="mt-4 text-gray-600">Loading balance...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-500 text-center">{error}</Text>
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          {/* Balance Card */}
          <PrimaryCard style={{ marginBottom: 24 }}>
            <Text className="text-gray-600 text-base mb-2">Available Balance</Text>
            <View className="flex-row items-center mb-4">
              <FontAwesome5 name="wallet" size={24} color="#f97316" />
              <Text className="text-3xl font-bold ml-2 text-orange-600">
                {formatCurrency(availableBalance)}
              </Text>
            </View>
            <Text className="text-gray-500 text-sm">
              Min: {formatCurrency(minWithdrawal)} • Max: {formatCurrency(maxWithdrawal)}
            </Text>
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

        {/* Payment Method Selection */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-3">Payment Method</Text>
          <View className="space-y-3">
            <TouchableOpacity
              onPress={() => setSelectedMethod('bank')}
              className={`p-4 rounded-lg border ${
                selectedMethod === 'bank' 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              <View className="flex-row items-center">
                <MaterialCommunityIcons 
                  name="bank" 
                  size={24} 
                  color={selectedMethod === 'bank' ? '#f97316' : '#6B7280'} 
                />
                <Text className={`ml-3 font-medium ${
                  selectedMethod === 'bank' ? 'text-orange-600' : 'text-gray-700'
                }`}>
                  Bank Transfer
                </Text>
                <View className="ml-auto">
                  {selectedMethod === 'bank' && (
                    <Ionicons name="checkmark-circle" size={20} color="#f97316" />
                  )}
                </View>
              </View>
              <Text className="text-gray-500 text-sm mt-1 ml-9">
                1-3 business days • Free
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedMethod('mobile')}
              className={`p-4 rounded-lg border ${
                selectedMethod === 'mobile' 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              <View className="flex-row items-center">
                <MaterialCommunityIcons 
                  name="cellphone" 
                  size={24} 
                  color={selectedMethod === 'mobile' ? '#f97316' : '#6B7280'} 
                />
                <Text className={`ml-3 font-medium ${
                  selectedMethod === 'mobile' ? 'text-orange-600' : 'text-gray-700'
                }`}>
                  Mobile Money
                </Text>
                <View className="ml-auto">
                  {selectedMethod === 'mobile' && (
                    <Ionicons name="checkmark-circle" size={20} color="#f97316" />
                  )}
                </View>
              </View>
              <Text className="text-gray-500 text-sm mt-1 ml-9">
                Instant • Small fee may apply
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Details */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-3">Payment Details</Text>
          {selectedMethod === 'bank' ? (
            <View className="space-y-3">
              <View>
                <Text className="text-gray-600 mb-2">Bank Name</Text>
                <TextInput
                  value={bankName}
                  onChangeText={setBankName}
                  placeholder="Enter bank name"
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View>
                <Text className="text-gray-600 mb-2">Account Name</Text>
                <TextInput
                  value={accountName}
                  onChangeText={setAccountName}
                  placeholder="Enter account name"
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View>
                <Text className="text-gray-600 mb-2">Account Number</Text>
                <TextInput
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  placeholder="Enter account number"
                  keyboardType="numeric"
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          ) : (
            <View>
              <Text className="text-gray-600 mb-2">Mobile Number</Text>
              <TextInput
                value={mobileNumber}
                onChangeText={setMobileNumber}
                placeholder="Enter mobile number"
                keyboardType="phone-pad"
                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          )}
        </View>

        {/* Summary */}
        {amount && parseFloat(amount) > 0 && (
          <View className="bg-gray-50 p-4 rounded-lg mb-6">
            <Text className="text-lg font-semibold mb-2">Summary</Text>
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-gray-600">Amount</Text>
              <Text className="font-semibold">{formatCurrency(parseFloat(amount))}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-gray-600">Processing Fee</Text>
              <Text className="font-semibold">
                {selectedMethod === 'bank' ? 'Free' : formatCurrency(parseFloat(amount) * 0.01)}
              </Text>
            </View>
            <View className="border-t border-gray-200 pt-2 mt-2">
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-semibold">You'll Receive</Text>
                <Text className="text-lg font-bold text-orange-600">
                  {formatCurrency(selectedMethod === 'bank' ? parseFloat(amount) : parseFloat(amount) * 0.99)}
                </Text>
              </View>
            </View>
          </View>
        )}
        </ScrollView>
      )}

      {/* Bottom Buttons */}
      <View className="p-4 border-t border-gray-200">
        <PrimaryButton
          title="Confirm Withdrawal"
          onPress={handleWithdrawal}
          style={{ marginBottom: 8 }}
        />
        <SecondaryButton
          title="Cancel"
          onPress={() => router.back()}
        />
      </View>
    </SafeAreaView>
  );
};

export default WithdrawalForm;