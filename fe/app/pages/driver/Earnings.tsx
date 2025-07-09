import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEarningsData, useDriverInfo } from '@/hooks/useEarningsData';
import { formatCurrency, formatDateTime, EarningsHistory } from '@/services/apiService';

const EarningsPage = () => {
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
          text: 'Withdraw',
          onPress: () => handleStatusUpdate(earning.id, 'WITHDRAWN'),
          style: 'destructive'
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Earnings</Text>
        <TouchableOpacity onPress={refreshData}>
          <Ionicons name="refresh" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshData} />
        }
      >
        {/* Summary Cards */}
        {summary && (
          <View className="p-4 space-y-4">
            <View className="flex-row space-x-4">
              <View className="flex-1 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <Text className="text-blue-600 text-sm font-medium">Available Balance</Text>
                <Text className="text-blue-800 text-2xl font-bold">{formatCurrency(summary.availableBalance)}</Text>
                <Text className="text-blue-600 text-xs mt-1">Ready for withdrawal</Text>
              </View>
              <View className="flex-1 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <Text className="text-yellow-600 text-sm font-medium">Pending Amount</Text>
                <Text className="text-yellow-800 text-2xl font-bold">{formatCurrency(summary.pendingAmount)}</Text>
                <Text className="text-yellow-600 text-xs mt-1">Being processed</Text>
              </View>
            </View>
            
            <View className="bg-green-50 p-4 rounded-lg border border-green-200">
              <Text className="text-green-600 text-sm font-medium">Total Earnings (This Week)</Text>
              <Text className="text-green-800 text-3xl font-bold">{formatCurrency(summary.weeklyEarnings)}</Text>
              <Text className="text-green-600 text-xs mt-1">
                Today: {formatCurrency(summary.todayEarnings)}
              </Text>
            </View>
          </View>
        )}

        {/* Filter Tabs */}
        <View className="px-4 pb-4">
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
              {filteredEarnings.map((earning) => {
                const statusStyle = getStatusBadgeStyle(earning.status);
                return (
                  <View
                    key={earning.id}
                    className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                  >
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-800 text-lg">
                          {formatCurrency(earning.netAmount)}
                        </Text>
                        <Text className="text-gray-600 text-sm">
                          Gross: {formatCurrency(earning.grossAmount)} • Fee: {formatCurrency(earning.appFee)}
                        </Text>
                      </View>
                      <View className={`px-3 py-1 rounded-full ${statusStyle.bg}`}>
                        <Text className={`text-xs font-medium ${statusStyle.text}`}>
                          {earning.status}
                        </Text>
                      </View>
                    </View>

                    <View className="border-t border-gray-100 pt-3">
                      <Text className="font-medium text-gray-800 mb-1">
                        {earning.routeDescription || `${earning.fromLocation} → ${earning.toLocation}`}
                      </Text>
                      {earning.customerName && (
                        <Text className="text-gray-600 text-sm mb-1">
                          Customer: {earning.customerName}
                        </Text>
                      )}
                      <Text className="text-gray-500 text-sm">
                        {formatDateTime(earning.earnedAt)}
                      </Text>
                    </View>

                    {/* Action Buttons */}
                    {earning.status === 'PENDING' && (
                      <View className="flex-row justify-end mt-3 pt-3 border-t border-gray-100">
                        <TouchableOpacity
                          onPress={() => handleStatusUpdate(earning.id, 'AVAILABLE')}
                          className="bg-green-500 px-4 py-2 rounded-lg"
                        >
                          <Text className="text-white text-sm font-medium">Mark Available</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {earning.status === 'AVAILABLE' && (
                      <View className="flex-row justify-end mt-3 pt-3 border-t border-gray-100">
                        <TouchableOpacity
                          onPress={() => handleWithdrawal(earning)}
                          className="bg-orange-500 px-4 py-2 rounded-lg"
                        >
                          <Text className="text-white text-sm font-medium">Withdraw</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
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
    </SafeAreaView>
  );
};

export default EarningsPage;
