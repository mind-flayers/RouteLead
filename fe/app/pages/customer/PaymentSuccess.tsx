import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomerFooter from '../../../components/navigation/CustomerFooter';

export default function PaymentSuccess() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  console.log('🎉 PaymentSuccess page loaded with params:', params);
  
  // Get payment details from navigation params
  const amount = params.amount ? parseFloat(params.amount as string) : 0;
  const bidId = params.bidId as string || '';
  const requestId = params.requestId as string || '';
  const paymentStatus = params.paymentStatus as string || 'COMPLETED';
  const transactionId = params.transactionId as string || '';
  const orderId = params.orderId as string || '';
  
  console.log('📊 Payment details:', {
    amount,
    bidId,
    requestId,
    paymentStatus,
    transactionId,
    orderId
  });

  // Animation values
  const scaleAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Animate the success icon and content
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatAmount = (amount: number) => {
    return `LKR ${amount.toLocaleString()}`;
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Payment Success</Text>
        </View>

        {/* Animated Success Icon */}
        <Animated.View 
          style={[styles.iconContainer, {
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          }]}
        >
          <View style={styles.iconBackground}>
            <Ionicons name="checkmark-circle" size={80} color="#059669" />
          </View>
        </Animated.View>

        {/* Success Message */}
        <Animated.View style={[styles.messageContainer, { opacity: fadeAnim }]}>
          <Text style={styles.successTitle}>
            Payment Successful!
          </Text>
          <Text style={styles.successMessage}>
            Your payment has been processed successfully. Your delivery booking is now confirmed and ready to go!
          </Text>
        </Animated.View>

        {/* Payment Details Card */}
        <Animated.View 
          style={[styles.paymentCard, { opacity: fadeAnim }]}
        >
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="credit-card-check" size={24} color="#059669" />
            <Text style={styles.cardTitle}>Payment Details</Text>
          </View>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount Paid</Text>
              <Text style={styles.amountText}>{formatAmount(amount)}</Text>
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Status</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{paymentStatus}</Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID</Text>
              <Text style={styles.detailValue}>{transactionId}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order ID</Text>
              <Text style={styles.detailValue}>{orderId}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>{getCurrentDateTime()}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Next Steps Card */}
        <Animated.View 
          style={[styles.nextStepsCard, { opacity: fadeAnim }]}
        >
          <View style={styles.nextStepsHeader}>
            <Ionicons name="information-circle" size={24} color="#2563EB" />
            <Text style={styles.nextStepsTitle}>What's Next?</Text>
          </View>
          
          <View style={styles.stepsContainer}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Your driver will be notified and will contact you shortly</Text>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>You can track your delivery in real-time from your dashboard</Text>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>Chat with your driver for any special instructions</Text>
            </View>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View style={[styles.buttonsContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/pages/customer/MyBids')}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="list" size={20} color="white" />
              <Text style={styles.primaryButtonText}>View My Bids</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/pages/customer/TrackingDelivery')}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="location" size={20} color="white" />
              <Text style={styles.secondaryButtonText}>Track Delivery</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.tertiaryButton}
            onPress={() => router.push('/pages/customer/Dashboard')}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="home" size={20} color="#374151" />
              <Text style={styles.tertiaryButtonText}>Back to Home</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
      <CustomerFooter activeTab="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4', // Light green background
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBackground: {
    width: 96,
    height: 96,
    backgroundColor: '#DCFCE7',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  messageContainer: {
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#1F2937',
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    color: '#4B5563',
  },
  paymentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  amountText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  statusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#059669',
    fontWeight: '600',
    fontSize: 12,
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontFamily: 'monospace',
  },
  nextStepsCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  nextStepsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  nextStepsTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  stepsContainer: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  buttonsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tertiaryButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tertiaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
