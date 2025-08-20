import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Config } from '../constants/Config';

interface PayHereAuthorizeFormProps {
  paymentData: {
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
    custom_1: string; // bidId
    custom_2: string; // requestId
    custom_3: string; // userId
    custom_4: string; // paymentMethod
    hash: string;
  };
  onSuccess: (data: any) => void;
  onCancel: () => void;
  onError: (error: string) => void;
}

export default function PayHereAuthorizeForm({ 
  paymentData, 
  onSuccess, 
  onCancel, 
  onError 
}: PayHereAuthorizeFormProps) {
  const [loading, setLoading] = useState(false);
  // No card details needed for Checkout API - PayHere handles this

  const processPayment = async () => {
    // No validation needed for Checkout API - PayHere handles validation

    setLoading(true);
    try {
      console.log('💳 Processing payment with PayHere Checkout API...');
      console.log('📋 Payment data received:', paymentData);
      
      const requestBody = {
        bidId: paymentData.custom_1, // bidId is stored in custom_1
        requestId: paymentData.custom_2, // requestId is stored in custom_2
        userId: paymentData.custom_3, // userId is stored in custom_3
        amount: paymentData.amount,
        paymentMethod: paymentData.custom_4 // paymentMethod is stored in custom_4
      };
      
      console.log('📤 Sending request body:', requestBody);
      
      const response = await fetch(`${Config.API_BASE}/payments/payhere/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

              console.log('📡 Checkout API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data = await response.json();
              console.log('📋 Checkout API response:', data);

      if (data.success) {
                  console.log('✅ Payment processed successfully via Checkout API');
        onSuccess(data.data);
      } else {
        console.error('❌ Payment failed:', data.message);
        onError(data.message || 'Payment failed');
      }
    } catch (error) {
      console.error('❌ Payment processing error:', error);
      onError(error instanceof Error ? error.message : 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PayHere Secure Payment</Text>
      <Text style={styles.subtitle}>You will be redirected to PayHere&apos;s secure payment page</Text>
      
      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>Amount to Pay:</Text>
        <Text style={styles.amount}>LKR {paymentData.amount.toLocaleString()}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          • Your payment will be processed securely by PayHere{'\n'}
          • You can use test card: 4242424242424242{'\n'}
          • Expiry: 12/25, CVV: 404{'\n'}
          • No card details are stored on our servers
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.payButton, loading && styles.disabledButton]}
          onPress={processPayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>Pay LKR {paymentData.amount.toLocaleString()}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  amountContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  infoContainer: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fafafa',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  testCardInfo: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  testCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 5,
  },
  testCardText: {
    fontSize: 12,
    color: '#1976D2',
    marginBottom: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  payButton: {
    backgroundColor: '#FFA726',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
