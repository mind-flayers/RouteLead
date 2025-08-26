import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { WithdrawalHistory } from '../../services/withdrawalService';

interface WithdrawalHistoryCardProps {
  withdrawal: WithdrawalHistory;
  onRetry?: (withdrawalId: string) => void;
}

const WithdrawalHistoryCard: React.FC<WithdrawalHistoryCardProps> = ({
  withdrawal,
  onRetry,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleExpanded = () => {
    const toValue = expanded ? 0 : 1;
    setExpanded(!expanded);
    
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-100';
      case 'PROCESSING':
        return 'text-yellow-600 bg-yellow-100';
      case 'PENDING':
        return 'text-blue-600 bg-blue-100';
      case 'FAILED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'checkmark-circle';
      case 'PROCESSING':
        return 'time';
      case 'PENDING':
        return 'hourglass';
      case 'FAILED':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;
  };

  const expandedHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200], // Adjust based on content
  });

  return (
    <View className="bg-white rounded-xl border border-gray-200 mb-3 overflow-hidden">
      {/* Main Card Content */}
      <TouchableOpacity onPress={toggleExpanded} className="p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <View className={`px-3 py-1 rounded-full ${getStatusColor(withdrawal.status).split(' ')[1]}`}>
                <View className="flex-row items-center">
                  <Ionicons 
                    name={getStatusIcon(withdrawal.status) as any} 
                    size={16} 
                    color={getStatusColor(withdrawal.status).includes('green') ? '#16a34a' : 
                          getStatusColor(withdrawal.status).includes('yellow') ? '#ca8a04' :
                          getStatusColor(withdrawal.status).includes('blue') ? '#2563eb' : '#dc2626'} 
                  />
                  <Text className={`text-sm font-semibold ml-1 ${getStatusColor(withdrawal.status).split(' ')[0]}`}>
                    {withdrawal.status}
                  </Text>
                </View>
              </View>
            </View>
            
            <Text className="text-lg font-bold text-gray-800 mb-1">
              {formatCurrency(withdrawal.amount)}
            </Text>
            
            <Text className="text-sm text-gray-600">
              {formatDate(withdrawal.createdAt)}
            </Text>
            
            {withdrawal.bankDetails && (
              <Text className="text-sm text-gray-500 mt-1">
                {withdrawal.bankDetails.bankName} • ****{withdrawal.bankDetails.accountNumber?.slice(-4)}
              </Text>
            )}
          </View>

          <View className="items-center">
            <Ionicons 
              name={expanded ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#666" 
            />
          </View>
        </View>
      </TouchableOpacity>

      {/* Expanded Content */}
      <Animated.View style={{ height: expandedHeight, overflow: 'hidden' }}>
        <View className="px-4 pb-4 border-t border-gray-100">
          <View className="py-3 space-y-3">
            {/* Transaction ID */}
            {withdrawal.transactionId && (
              <View className="flex-row justify-between">
                <Text className="text-gray-600 font-medium">Transaction ID:</Text>
                <Text className="text-gray-800 font-mono text-sm">{withdrawal.transactionId}</Text>
              </View>
            )}

            {/* Bank Details */}
            {withdrawal.bankDetails && (
              <>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600 font-medium">Bank:</Text>
                  <Text className="text-gray-800">{withdrawal.bankDetails.bankName}</Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-gray-600 font-medium">Account:</Text>
                  <Text className="text-gray-800">{withdrawal.bankDetails.accountName}</Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-gray-600 font-medium">Account Number:</Text>
                  <Text className="text-gray-800 font-mono">
                    ****{withdrawal.bankDetails.accountNumber?.slice(-4)}
                  </Text>
                </View>
              </>
            )}

            {/* Processed Date */}
            {withdrawal.processedAt && (
              <View className="flex-row justify-between">
                <Text className="text-gray-600 font-medium">Processed:</Text>
                <Text className="text-gray-800">{formatDate(withdrawal.processedAt)}</Text>
              </View>
            )}

            {/* Retry Button for Failed Withdrawals */}
            {withdrawal.status === 'FAILED' && onRetry && (
              <View className="mt-4 pt-3 border-t border-gray-100">
                <TouchableOpacity
                  onPress={() => onRetry(withdrawal.id)}
                  className="bg-orange-500 py-3 px-4 rounded-lg flex-row items-center justify-center"
                >
                  <MaterialCommunityIcons name="refresh" size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">Retry Withdrawal</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Help for Failed Status */}
            {withdrawal.status === 'FAILED' && (
              <View className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="information-circle" size={16} color="#dc2626" />
                  <Text className="text-red-800 font-semibold ml-1 text-sm">Why did this fail?</Text>
                </View>
                <Text className="text-red-700 text-xs">
                  Withdrawals can fail due to incorrect bank details, insufficient balance, or bank system issues. Please verify your payment preferences and try again.
                </Text>
              </View>
            )}

            {/* Processing Info */}
            {withdrawal.status === 'PROCESSING' && (
              <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="time" size={16} color="#ca8a04" />
                  <Text className="text-yellow-800 font-semibold ml-1 text-sm">Processing</Text>
                </View>
                <Text className="text-yellow-700 text-xs">
                  Your withdrawal is being processed. It typically takes 1-3 business days to complete.
                </Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default WithdrawalHistoryCard;
