import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Config } from '../../../constants/Config';
import PayHereCheckout from '../../../components/PayHereCheckout';
import PayHereAuthorizeForm from '../../../components/PayHereAuthorizeForm';

interface PayHereConfig {
  merchantId: string;
  merchantSecret: string;
  currency: string;
  sandboxUrl: string;
  liveUrl: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

interface PayHerePaymentData {
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  order_id: string;
  items: string;
  currency: string;
  amount: string;
  custom_1: string;
  custom_2: string;
  custom_3: string;
  custom_4: string;
  hash: string;
}

export default function Payment() {
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);
  const [payHereConfig, setPayHereConfig] = useState<PayHereConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [showPayHereCheckout, setShowPayHereCheckout] = useState(false);
  const [showAuthorizeForm, setShowAuthorizeForm] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get the amount from navigation params
  const amount = params.amount ? parseFloat(params.amount as string) : 3080;
  const bidId = params.bidId as string || '';
  const requestId = params.requestId as string || '';
  const userId = params.userId as string || '';

  console.log('🎯 Payment component initialized with params:', {
    amount,
    bidId,
    requestId,
    userId,
    hasAmount: !!params.amount,
    hasBidId: !!bidId,
    hasRequestId: !!requestId,
    hasUserId: !!userId
  });

  const cards = [
    {
      icon: <MaterialCommunityIcons name="credit-card-outline" size={28} color="#7C3AED" />,
      label: 'Credit Card',
      method: 'CREDIT_CARD',
    },
    {
      icon: <MaterialCommunityIcons name="credit-card-outline" size={28} color="#06B6D4" />,
      label: 'Debit Card',
      method: 'DEBIT_CARD',
    },
    {
      icon: <MaterialCommunityIcons name="bank" size={28} color="#6366F1" />,
      label: 'Bank Transfer',
      method: 'BANK_TRANSFER',
    },
  ];

  // Fetch PayHere configuration
  useEffect(() => {
    console.log('🚀 Payment component mounted, fetching PayHere config...');
    fetchPayHereConfig();
  }, []);

  // Validate amount only
  useEffect(() => {
    if (amount <= 0) {
      console.warn('⚠️ Invalid amount detected:', amount);
      Alert.alert('Invalid Amount', 'Payment amount must be greater than 0.');
    }
  }, [amount]);

  const fetchPayHereConfig = async () => {
    console.log('🔧 Fetching PayHere configuration...');
    setConfigLoading(true);
    setConfigError(null);
    
    try {
      const response = await fetch(`${Config.API_BASE}/payments/payhere/config`);
      console.log('📡 PayHere config response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📋 PayHere config response:', data);
      
      if (data.success) {
        setPayHereConfig(data.data);
        setConfigError(null);
        console.log('✅ PayHere configuration loaded successfully');
      } else {
        const errorMsg = data.message || 'Failed to load payment configuration';
        console.error('❌ PayHere config failed:', errorMsg);
        setConfigError(errorMsg);
        Alert.alert('Configuration Error', errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error fetching PayHere config:', error);
      console.error('🔍 Error details:', {
        message: errorMsg,
        stack: error instanceof Error ? error.stack : undefined
      });
      setConfigError(errorMsg);
      Alert.alert('Network Error', 'Unable to connect to payment service. Please check your internet connection.');
    } finally {
      setConfigLoading(false);
    }
  };

  const generatePayHereHash = async (paymentData: PayHerePaymentData): Promise<string> => {
    try {
      console.log('🔐 Generating hash via backend API...');
      
      const response = await fetch(`${Config.API_BASE}/payments/payhere/generate-hash`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          order_id: paymentData.order_id,
          amount: paymentData.amount,
          currency: paymentData.currency,
          first_name: paymentData.first_name,
          last_name: paymentData.last_name,
          email: paymentData.email,
          phone: paymentData.phone,
          address: paymentData.address,
          city: paymentData.city,
          country: paymentData.country,
          items: paymentData.items
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('🔐 Hash generated successfully:', data.hash);
        return data.hash;
      } else {
        throw new Error(data.message || 'Failed to generate hash');
      }
    } catch (error) {
      console.error('❌ Error generating hash:', error);
      throw error;
    }
  };

  const initializePayment = async () => {
    console.log('💳 Initializing PayHere Sri Lanka payment...');
    console.log('📊 Payment details:', {
      bidId,
      requestId,
      userId,
      amount,
      paymentMethod: cards[selected].method
    });

    // Validate required parameters
    if (!bidId || !requestId || !userId) {
      console.error('❌ Missing required payment parameters:', { bidId, requestId, userId });
      Alert.alert('Error', 'Missing required payment information. Please try again.');
      return;
    }

    if (!payHereConfig) {
      console.error('❌ PayHere configuration not loaded');
      Alert.alert('Error', 'Payment configuration not available. Please try again.');
      return;
    }

    setLoading(true);
    try {
      const paymentMethod = cards[selected].method;
      const formData = new FormData();
      formData.append('bidId', bidId);
      formData.append('requestId', requestId);
      formData.append('userId', userId);
      formData.append('amount', amount.toString());
      formData.append('paymentMethod', paymentMethod);
      
      console.log('📤 Sending payment initialization request...');
      console.log('🔗 Request URL:', `${Config.API_BASE}/payments/initialize`);
      
      const response = await fetch(`${Config.API_BASE}/payments/initialize`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'RouteLead-Mobile-App'
        },
        body: formData
      });

      console.log('📡 Payment initialization response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data = await response.json();
      console.log('📋 Payment initialization response:', data);
      
      if (data.success) {
        console.log('✅ Payment initialized successfully');
        console.log('📋 Payment data:', data.data);
        
        // Prepare PayHere Sri Lanka payment data
        const payHereData = data.data;
        const paymentData: PayHerePaymentData = {
          merchant_id: payHereConfig.merchantId,
          return_url: payHereConfig.returnUrl,
          cancel_url: payHereConfig.cancelUrl,
          notify_url: payHereConfig.notifyUrl,
          first_name: payHereData.firstName,
          last_name: payHereData.lastName,
          email: payHereData.email,
          phone: payHereData.phone,
          address: payHereData.address,
          city: payHereData.city,
          country: payHereData.country,
          order_id: payHereData.orderId,
          items: payHereData.items,
          currency: payHereData.currency,
          amount: payHereData.amount.toString(),
          custom_1: payHereData.custom1,
          custom_2: payHereData.custom2,
          custom_3: payHereData.custom3,
          custom_4: payHereData.custom4,
          hash: '' // Will be generated below
        };

        // Generate hash for PayHere Sri Lanka
        const hash = await generatePayHereHash(paymentData);
        paymentData.hash = hash;

        console.log('🔐 Generated PayHere hash:', hash);

        // Create form data for PayHere Sri Lanka
        const payHereFormData = new FormData();
        Object.entries(paymentData).forEach(([key, value]) => {
          payHereFormData.append(key, value);
        });

        // Use sandbox URL for testing
        const payHereUrl = payHereConfig.sandboxUrl;
        
        console.log('🌐 Redirecting to PayHere Sri Lanka:', payHereUrl);
        console.log('📝 PayHere form data:', paymentData);

        // Use the PayHereCheckout component for proper form submission
        console.log('🔗 PayHere form data:', paymentData);
        console.log('📝 Using PayHereCheckout component for secure payment');
        console.log('🔗 PayHere URL:', payHereConfig.sandboxUrl);
        
        // Debug: Log all payment parameters
        console.log('📋 Payment Parameters:');
        Object.entries(paymentData).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
        
        // Store payment data for PayHere checkout
        setPaymentData(paymentData);
        
        // Use Checkout API for one-time payments
        console.log('🔄 Using PayHere Checkout API for one-time payment...');
        setPaymentData(paymentData);
        setShowPayHereCheckout(true);
        
      } else {
        console.error('❌ Payment initialization failed:', data.message);
        Alert.alert('Payment Error', data.message || 'Failed to initialize payment. Please try again.');
      }
    } catch (error) {
      console.error('❌ Payment initialization error:', error);
      console.error('🔍 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      Alert.alert('Network Error', 'Failed to initialize payment. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
      console.log('🏁 Payment initialization process completed');
    }
  };

  // Handle PayHere checkout callbacks
  const handlePaymentSuccess = (data: any) => {
    console.log('✅ Payment successful:', data);
    
    // Extract payment details from the response data
    const paymentAmount = data.amount || amount;
    const transactionId = data.transactionId || '';
    const orderId = data.orderId || '';
    const paymentStatus = data.paymentStatus || 'COMPLETED';
    
    console.log('🚀 Navigating to PaymentSuccess with params:', {
      amount: paymentAmount.toString(),
      bidId: bidId,
      requestId: requestId,
      paymentStatus: paymentStatus,
      transactionId: transactionId,
      orderId: orderId
    });
    
    router.push({
      pathname: '/pages/customer/PaymentSuccess',
      params: {
        amount: paymentAmount.toString(),
        bidId: bidId,
        requestId: requestId,
        paymentStatus: paymentStatus,
        transactionId: transactionId,
        orderId: orderId
      }
    });
  };

  const handlePaymentCancel = () => {
    console.log('❌ Payment cancelled');
    setShowPayHereCheckout(false);
    setShowAuthorizeForm(false);
    Alert.alert('Payment Cancelled', 'Your payment was cancelled. You can try again.');
  };

  const handlePaymentError = (error: string) => {
    console.log('❌ Payment error:', error);
    setShowPayHereCheckout(false);
    setShowAuthorizeForm(false);
    Alert.alert('Payment Error', `Payment failed: ${error}`);
  };

  // Show PayHere Authorize form if payment data is ready
  if (showAuthorizeForm && paymentData) {
    return (
      <PayHereAuthorizeForm
        paymentData={paymentData}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
        onError={handlePaymentError}
      />
    );
  }

  // Show PayHere checkout if payment data is ready (fallback)
  if (showPayHereCheckout && paymentData && payHereConfig) {
    return (
      <PayHereCheckout
        paymentData={paymentData}
        payHereUrl={payHereConfig.sandboxUrl}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
        onError={handlePaymentError}
        onBypass={handlePaymentSuccess}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F6F6FA]" edges={['bottom', 'left', 'right']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 bg-white shadow">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secure Payment</Text>
        <View style={{ width: 24 }} /> {/* Placeholder for alignment */}
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View className="items-center mt-8">
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalAmount}>LKR {amount ? amount.toLocaleString() : '0'}</Text>
          {bidId && (
            <Text style={styles.bidInfo}>Winning Bid Amount</Text>
          )}
        </View>

        {/* Payment Methods */}
        <View className="mx-6">
          {cards.map((card, idx) => (
            <TouchableOpacity
              key={idx}
              className={`flex-row items-center px-4 py-4 mb-4 rounded-xl border ${selected === idx ? 'border-[#FFA726] bg-[#FFF8E1]' : 'border-gray-200 bg-white'}`}
              onPress={() => setSelected(idx)}
              activeOpacity={0.8}
            >
              {card.icon}
              <Text style={styles.cardLabel}>{card.label}</Text>
              <Ionicons
                name={selected === idx ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={selected === idx ? '#FFA726' : '#BDBDBD'}
              />
            </TouchableOpacity>
          ))}
        </View>

         {/* Pay Now Button */}
        <TouchableOpacity
          className={`mx-6 py-4 rounded-md flex-row items-center justify-center mt-2 ${
            loading || configLoading || configError ? 'bg-gray-400' : 'bg-[#FFA726]'
          }`}
          onPress={initializePayment}
          disabled={loading || configLoading || !!configError}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
          <Ionicons name="lock-closed-outline" size={20} color="#fff" />
          )}
          <Text style={styles.buttonText}>
            {loading ? 'Processing...' : 
             configLoading ? 'Loading...' :
             configError ? 'Configuration Error' :
             `Pay LKR ${amount.toLocaleString()}`}
          </Text>
        </TouchableOpacity>

        {/* Configuration Error Display */}
        {configError && (
          <View className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <Text className="text-sm font-medium text-red-700 mb-2">Configuration Error:</Text>
            <Text className="text-xs text-red-600 mb-2">{configError}</Text>
            <TouchableOpacity
              className="bg-red-600 py-2 px-4 rounded-md"
              onPress={fetchPayHereConfig}
            >
              <Text className="text-white text-sm font-medium text-center">Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginLeft: -24,
  },
  totalLabel: {
    color: '#6B7280',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 32,
  },
  bidInfo: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '500',
    marginTop: -20,
    marginBottom: 20,
  },
  cardLabel: {
    marginLeft: 16,
    flex: 1,
    fontSize: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});