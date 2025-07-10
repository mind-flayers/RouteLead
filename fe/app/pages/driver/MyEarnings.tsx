import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import PrimaryButton from '@/components/ui/PrimaryButton';
import PrimaryCard from '@/components/ui/PrimaryCard';
import DriverBottomNavigation from '@/components/navigation/DriverBottomNavigation';
import { useEarningsData, useDriverInfo } from '@/hooks/useEarningsData';
import { useMultipleLocationDescriptions } from '@/hooks/useLocationDescription';
import { formatCurrency, formatDateTime, getRouteDescription, EarningsHistory } from '@/services/apiService';

const MyEarnings = () => {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'PENDING' | 'AVAILABLE' | 'WITHDRAWN'>('ALL');
  
  // Get driver information and earnings data
  const { driverId } = useDriverInfo();
  const {
    summary,
    history,
    loading,
    error,
    refreshing,
    refreshData,
    updateEarningsStatus,
    getEarningsByStatus,
  } = useEarningsData(driverId);

  // Filter earnings based on selected status
  const filteredEarnings = useMemo(() => {
    if (selectedFilter === 'ALL') return history;
    return getEarningsByStatus(selectedFilter);
  }, [history, selectedFilter, getEarningsByStatus]);

  // Use geocoding hook for location descriptions
  const locationDescriptions = useMultipleLocationDescriptions(filteredEarnings);

  // Handle status update
  const handleStatusUpdate = async (earningsId: string, newStatus: 'AVAILABLE' | 'WITHDRAWN') => {
    try {
      await updateEarningsStatus(earningsId, newStatus);
      Alert.alert('Success', `Earnings status updated to ${newStatus}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update earnings status');
    }
  };

  // Handle withdrawal request
  const handleWithdrawal = (earning: EarningsHistory) => {
    Alert.alert(
      'Withdraw Earnings',
      `Are you sure you want to withdraw ${formatCurrency(earning.netAmount)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          onPress: () => {
            // Navigate to withdrawal form
            router.push('/pages/driver/WithdrawalForm');
          }
        }
      ]
    );
  };

  // Get status badge color
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return { bg: 'bg-green-100', text: 'text-green-800' };
      case 'PENDING':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
      case 'WITHDRAWN':
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  const filterOptions: { key: 'ALL' | 'PENDING' | 'AVAILABLE' | 'WITHDRAWN'; label: string; count: number }[] = [
    { key: 'ALL', label: 'All', count: history.length },
    { key: 'PENDING', label: 'Pending', count: getEarningsByStatus('PENDING').length },
    { key: 'AVAILABLE', label: 'Available', count: getEarningsByStatus('AVAILABLE').length },
    { key: 'WITHDRAWN', label: 'Withdrawn', count: getEarningsByStatus('WITHDRAWN').length },
  ];

  // Get icon for transaction type
  const getTransactionIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <View className="bg-yellow-100 p-3 rounded-full mr-3">
            <MaterialCommunityIcons name="clock-outline" size={24} color="#f59e0b" />
          </View>
        );
      case 'AVAILABLE':
        return (
          <View className="bg-green-100 p-3 rounded-full mr-3">
            <MaterialCommunityIcons name="check-circle-outline" size={24} color="#10b981" />
          </View>
        );
      case 'WITHDRAWN':
        return (
          <View className="bg-blue-100 p-3 rounded-full mr-3">
            <MaterialCommunityIcons name="bank-transfer-out" size={24} color="#3b82f6" />
          </View>
        );
      default:
        return (
          <View className="bg-blue-100 p-3 rounded-full mr-3">
            <MaterialCommunityIcons name="truck-delivery-outline" size={24} color="#3b82f6" />
          </View>
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Bar */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <Link href="/pages/driver/Notifications" className="items-center">
          <Ionicons name="notifications-outline" size={24} color="black" />
        </Link>
        <Text className="text-xl font-bold">My Earnings</Text>
        <Link href="/pages/driver/Profile" className="items-center">
          <View className="flex-row items-center">
            <Image
              source={require('../../../assets/images/profile_placeholder.jpeg')}
              className="w-8 h-8 rounded-full mr-2"
            />
          </View>
        </Link>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshData} />
        }
      >
        {/* Summary Cards */}
        {summary && (
          <View className="p-4 space-y-4">
            {/* Total Balance Card */}
            <PrimaryCard style={{ marginBottom: 12 }}>
              <Text className="text-gray-600 text-base mb-2">Your Available Balance</Text>
              <View className="flex-row items-center mb-4">
                <FontAwesome5 name="dollar-sign" size={24} color="#f97316" />
                <Text className="text-3xl font-bold ml-2 text-orange-600">
                  {formatCurrency(summary.availableBalance)}
                </Text>
              </View>
              <PrimaryButton
                title="Withdraw Funds"
                onPress={() => {
                  if (summary.availableBalance > 0) {
                    router.push('/pages/driver/WithdrawalForm');
                  } else {
                    Alert.alert('Info', 'No available balance to withdraw');
                  }
                }}
              />
            </PrimaryCard>

            {/* Additional Summary Cards */}
            <View className="flex-row space-x-4">
              <View className="flex-1 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <Text className="text-yellow-600 text-sm font-medium">Pending Amount</Text>
                <Text className="text-yellow-800 text-xl font-bold">{formatCurrency(summary.pendingAmount)}</Text>
                <Text className="text-yellow-600 text-xs mt-1">Being processed</Text>
              </View>
              <View className="flex-1 bg-green-50 p-4 rounded-lg border border-green-200">
                <Text className="text-green-600 text-sm font-medium">Weekly Earnings</Text>
                <Text className="text-green-800 text-xl font-bold">{formatCurrency(summary.weeklyEarnings)}</Text>
                <Text className="text-green-600 text-xs mt-1">This week</Text>
              </View>
            </View>
          </View>
        )}

        {/* Filter Tabs */}
        <View className="px-4 pb-4">
          <Text className="text-xl font-bold mb-4">Transaction History</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-2">
              {filterOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => setSelectedFilter(option.key)}
                  className={`px-4 py-2 rounded-full border ${
                    selectedFilter === option.key
                      ? 'bg-orange-500 border-orange-500'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      selectedFilter === option.key ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {option.label} ({option.count})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Earnings List */}
        <View className="px-4 pb-20">
          {loading ? (
            <View className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <Text className="text-gray-500 text-center">Loading earnings...</Text>
            </View>
          ) : error ? (
            <View className="bg-red-50 p-4 rounded-lg border border-red-200">
              <Text className="text-red-600 text-center">{error}</Text>
            </View>
          ) : filteredEarnings.length > 0 ? (
            <View className="space-y-3">
              {filteredEarnings.map((earning, index) => {
                const statusStyle = getStatusBadgeStyle(earning.status);
                const locationDesc = locationDescriptions[index];
                
                return (
                  <TouchableOpacity
                    key={earning.id}
                    className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                    onPress={() => {
                      Alert.alert(
                        'Earnings Details',
                        `Amount: ${formatCurrency(earning.netAmount)}\nStatus: ${earning.status}\nCustomer: ${earning.customerName || 'N/A'}`,
                        [
                          { text: 'OK' },
                          ...(earning.status === 'PENDING' ? [{
                            text: 'Mark Available',
                            onPress: () => handleStatusUpdate(earning.id, 'AVAILABLE')
                          }] : [])
                        ]
                      );
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        {getTransactionIcon(earning.status)}
                        <View className="flex-1">
                          <View className="flex-row items-center justify-between mb-1">
                            <Text className="font-semibold text-gray-800 text-lg">
                              {formatCurrency(earning.netAmount)}
                            </Text>
                            <View className={`px-3 py-1 rounded-full ${statusStyle.bg}`}>
                              <Text className={`text-xs font-medium ${statusStyle.text}`}>
                                {earning.status}
                              </Text>
                            </View>
                          </View>
                          
                          <View className="flex-row items-center">
                            <Text className="text-gray-700 mb-1 flex-1">
                              {locationDesc?.description || getRouteDescription(earning)}
                            </Text>
                            {locationDesc?.isLoading && (
                              <View className="ml-2">
                                <Ionicons name="refresh" size={12} color="#9CA3AF" />
                              </View>
                            )}
                          </View>
                          
                          <View className="flex-row items-center justify-between">
                            <Text className="text-gray-500 text-sm">
                              {formatDateTime(earning.earnedAt)}
                            </Text>
                          </View>
                          <View className="flex-row items-center justify-between mt-1">
                            <Text className="text-gray-600 text-sm">
                              Gross: {formatCurrency(earning.grossAmount)}
                            </Text>
                            <Text className="text-gray-600 text-sm">
                              Fee: {formatCurrency(earning.appFee)}
                            </Text>
                          </View>
                          
                          {earning.customerName && (
                            <Text className="text-gray-600 text-sm mt-1">
                              Customer: {earning.customerName}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row justify-end mt-3 pt-3 border-t border-gray-100 space-x-2">
                      {earning.status === 'PENDING' && (
                        <TouchableOpacity
                          onPress={() => handleStatusUpdate(earning.id, 'AVAILABLE')}
                          className="bg-green-500 px-4 py-2 rounded-lg"
                        >
                          <Text className="text-white text-sm font-medium">Mark Available</Text>
                        </TouchableOpacity>
                      )}

                      {earning.status === 'AVAILABLE' && (
                        <TouchableOpacity
                          onPress={() => handleWithdrawal(earning)}
                          className="bg-orange-500 px-4 py-2 rounded-lg"
                        >
                          <Text className="text-white text-sm font-medium">Withdraw</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <View className="items-center">
                <FontAwesome5 name="wallet" size={48} color="#d1d5db" />
                <Text className="text-gray-500 text-center mt-2">
                  No {selectedFilter.toLowerCase()} earnings found
                </Text>
                <Text className="text-gray-400 text-center text-sm">
                  {selectedFilter === 'ALL' 
                    ? 'Complete routes to start earning' 
                    : `No earnings with ${selectedFilter.toLowerCase()} status`
                  }
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <DriverBottomNavigation />
    </SafeAreaView>
  );
};

export default MyEarnings;
